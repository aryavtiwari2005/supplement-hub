// services/cartService.ts
import { supabase } from "@/utils/supabase";
import { CartItem } from "@/types";

interface Coupon {
  code: string;
  discount_percentage: number;
  is_active: boolean;
  expires_at?: string | null;
}

export const cartService = {
  async getCoupon(code: string): Promise<Coupon | null> {
    const { data, error } = await supabase
      .from("coupons")
      .select("code, discount_percentage, is_active, expires_at")
      .eq("code", code.toUpperCase()) // Case-insensitive codes
      .eq("is_active", true)
      .single();

    if (error || !data) {
      console.error("Error fetching coupon:", error);
      return null;
    }

    // Check if coupon is expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
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
      console.error("Error fetching cart:", error);
      throw error;
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
          ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
          : cartItem
      );
    } else {
      updatedCart = [...currentCart, item];
    }

    const { error } = await supabase
      .from("users_onescoop")
      .update({ cart: updatedCart })
      .eq("id", userId);

    if (error) {
      console.error("Supabase error in addToCart:", error);
      throw error;
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

    if (error) throw error;
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
      .map((item) => (item.id === productId ? { ...item, quantity } : item))
      .filter((item) => item.quantity > 0);

    const { error } = await supabase
      .from("users_onescoop")
      .update({ cart: updatedCart })
      .eq("id", userId);

    if (error) throw error;
  },

  async checkout(userId: number, cartItems: CartItem[]): Promise<void> {
    if (!userId) {
      console.error("checkout called with empty userId");
      throw new Error("Invalid user ID");
    }

    if (!cartItems.length) {
      throw new Error("Cart is empty");
    }

    const orderDetails = {
      user_id: userId,
      items: cartItems,
      total: cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
      status: "pending",
      created_at: new Date().toISOString(),
    };

    const { error: orderError } = await supabase
      .from("orders")
      .insert(orderDetails);

    if (orderError) throw orderError;

    const { error: clearCartError } = await supabase
      .from("users_onescoop")
      .update({ cart: [] })
      .eq("id", userId);

    if (clearCartError) throw clearCartError;
  },
};
