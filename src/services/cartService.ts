// services/cartService.ts
import { supabase } from "@/utils/supabase";
import { CartItem } from "@/types";

interface Coupon {
  code: string;
  discount_percentage: number;
  is_active: boolean;
  expires_at?: string | null;
}

type UserAddress = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
};

export const cartService = {
  async getCoupon(code: string): Promise<Coupon | null> {
    const { data, error } = await supabase
      .from("coupons")
      .select("code, discount_percentage, is_active, expires_at")
      .eq("code", code.toUpperCase()) // Case-insensitive codes
      .eq("is_active", true)
      .single();

    if (error || !data) {
      console.error(
        "Error fetching coupon:",
        error?.message || "No coupon found"
      );
      return null;
    }

    // Check if coupon is expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      console.log(`Coupon ${code} has expired`);
      return null;
    }

    return data;
  },

  async getUserCart(userId: number): Promise<CartItem[]> {
    if (!userId) {
      console.error("getUserCart called with empty userId");
      throw new Error("Invalid user ID");
    }

    const { data, error } = await supabase
      .from("users_onescoop")
      .select("cart")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching cart:", error.message);
      throw new Error(`Failed to fetch cart: ${error.message}`);
    }

    return data?.cart || [];
  },

  async addToCart(userId: number, item: CartItem): Promise<void> {
    if (!userId) {
      console.error("addToCart called with empty userId");
      throw new Error("Invalid user ID");
    }

    const currentCart = await this.getUserCart(userId);
    const existingItemIndex = currentCart.findIndex(
      (cartItem) => cartItem.id === item.id
    );

    let updatedCart: CartItem[];
    if (existingItemIndex >= 0) {
      updatedCart = currentCart.map((cartItem, index) =>
        index === existingItemIndex
          ? {
              ...cartItem,
              quantity: Math.min(10, cartItem.quantity + item.quantity),
            } // Cap at 10
          : cartItem
      );
    } else {
      updatedCart = [
        ...currentCart,
        { ...item, quantity: Math.min(item.quantity, 10) },
      ];
    }

    const { error } = await supabase
      .from("users_onescoop")
      .update({ cart: updatedCart })
      .eq("id", userId);

    if (error) {
      console.error("Supabase error in addToCart:", error.message);
      throw new Error(`Failed to add item to cart: ${error.message}`);
    }
  },

  async removeFromCart(userId: number, productId: number): Promise<void> {
    if (!userId) {
      console.error("removeFromCart called with empty userId");
      throw new Error("Invalid user ID");
    }

    const currentCart = await this.getUserCart(userId);
    const updatedCart = currentCart.filter((item) => item.id !== productId);

    const { error } = await supabase
      .from("users_onescoop")
      .update({ cart: updatedCart })
      .eq("id", userId);

    if (error) {
      console.error("Supabase error in removeFromCart:", error.message);
      throw new Error(`Failed to remove item from cart: ${error.message}`);
    }
  },

  async updateCartQuantity(
    userId: number,
    productId: number,
    quantity: number
  ): Promise<void> {
    if (!userId) {
      console.error("updateCartQuantity called with empty userId");
      throw new Error("Invalid user ID");
    }

    const currentCart = await this.getUserCart(userId);
    const updatedCart = currentCart
      .map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, Math.min(10, quantity)) } // Enforce 1-10 range
          : item
      )
      .filter((item) => item.quantity > 0);

    const { error } = await supabase
      .from("users_onescoop")
      .update({ cart: updatedCart })
      .eq("id", userId);

    if (error) {
      console.error("Supabase error in updateCartQuantity:", error.message);
      throw new Error(`Failed to update cart quantity: ${error.message}`);
    }
  },

  async checkout(
    userId: number,
    cartItems: CartItem[],
    address: UserAddress,
    paymentMethod: "phonePe" | "cod",
    couponCode?: string
  ): Promise<{ orderId: string }> {
    if (!userId) throw new Error("Invalid user ID");
    if (!cartItems.length) throw new Error("Cart is empty");

    // Validate address
    if (
      !address.street ||
      !address.city ||
      !address.state ||
      !address.zipCode
    ) {
      throw new Error("Incomplete address provided");
    }

    // Calculate total
    let subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    let discount = 0;

    // Apply coupon if valid
    if (couponCode) {
      const coupon = await this.getCoupon(couponCode);
      if (coupon) {
        discount = subtotal * (coupon.discount_percentage / 100);
      }
    }
    const total = subtotal - discount;

    // Generate order ID
    const orderId = `order-${Date.now()}`;

    // Create order object
    const newOrder = {
      order_id: orderId,
      items: cartItems,
      total,
      subtotal,
      discount,
      status: paymentMethod === "cod" ? "pending" : "awaiting_payment",
      payment_method: paymentMethod,
      address,
      coupon_code: couponCode || null,
      created_at: new Date().toISOString(),
    };

    // Get current orders
    const { data: userData, error: fetchError } = await supabase
      .from("users_onescoop")
      .select("orders")
      .eq("id", userId)
      .single();

    if (fetchError)
      throw new Error(`Failed to fetch user orders: ${fetchError.message}`);

    // Update orders array
    const currentOrders = userData?.orders || [];
    const updatedOrders = [...currentOrders, newOrder];

    // Update user record
    const { error: updateError } = await supabase
      .from("users_onescoop")
      .update({
        orders: updatedOrders,
        cart: [], // Clear cart
      })
      .eq("id", userId);

    if (updateError)
      throw new Error(`Failed to update orders: ${updateError.message}`);

    return { orderId };
  },
};
