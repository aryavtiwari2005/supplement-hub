"use client";

import { useSelector, useDispatch } from "react-redux";
import {
  selectCartItems,
  removeFromCart,
  updateQuantity,
  setCartItems,
} from "@/redux/cartSlice";
import { cartService } from "@/services/cartService";
import { useEffect, useState } from "react";
import { X, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

const THEMES = {
  light: {
    background: { primary: "bg-white", secondary: "bg-yellow-50" },
    text: {
      primary: "text-black",
      secondary: "text-gray-700",
      muted: "text-gray-500",
    },
    border: "border-gray-200",
    dropdown: {
      background: "bg-yellow-50",
      text: "text-gray-800",
      hover: "hover:bg-yellow-100",
    },
  },
  dark: {
    background: { primary: "bg-black", secondary: "bg-gray-900" },
    text: {
      primary: "text-white",
      secondary: "text-gray-300",
      muted: "text-gray-500",
    },
    border: "border-gray-800",
    dropdown: {
      background: "bg-gray-900",
      text: "text-gray-300",
      hover: "hover:bg-gray-800",
    },
  },
};

const CartPage = () => {
  const [theme] = useState<"light" | "dark">("light");
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{
    id: number;
    name: string;
    email: string;
  } | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount_percentage: number;
  } | null>(null);

  const fetchCartData = async (userId: number) => {
    try {
      const cart = await cartService.getUserCart(userId);
      dispatch(setCartItems(cart));
    } catch (error) {
      console.error("Error fetching cart:", error);
      setErrorMessage("Failed to load cart from server. Showing local cart.");
    }
  };

  useEffect(() => {
    const fetchUserAndCart = async () => {
      try {
        const res = await fetch("/api/user", { credentials: "include" });
        if (!res.ok) {
          if (res.status === 401) {
            setErrorMessage("Please log in to view your cart");
          } else if (res.status === 404) {
            setErrorMessage("User not found");
          } else {
            setErrorMessage("Error fetching user data");
          }
          setIsLoading(false);
          return;
        }

        const data = await res.json();
        const fetchedUser = data.user;
        setUser(fetchedUser);

        if (fetchedUser?.id) {
          await fetchCartData(fetchedUser.id);
        }
      } catch (error) {
        console.error("Failed to fetch user or cart:", error);
        setErrorMessage("Error loading cart. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndCart();
  }, [dispatch]);

  const handleRemoveItem = async (id: number) => {
    if (!user?.id) return setErrorMessage("Please log in to manage your cart.");

    try {
      dispatch(removeFromCart(id));
      await cartService.removeFromCart(user.id, id);
    } catch (error) {
      console.error("Error removing item:", error);
      setErrorMessage("Failed to remove item.");
      await fetchCartData(user.id);
    }
  };

  const handleQuantityChange = async (id: number, delta: number) => {
    if (!user?.id) return setErrorMessage("Please log in to manage your cart.");

    const item = cartItems.find((i) => i.id === id);
    if (!item) return;

    const newQuantity = Math.max(1, item.quantity + delta);
    try {
      dispatch(updateQuantity({ id, quantity: newQuantity }));
      await cartService.updateCartQuantity(user.id, id, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
      setErrorMessage("Failed to update quantity.");
      await fetchCartData(user.id);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      setErrorMessage("Please enter a coupon code.");
      return;
    }

    try {
      const coupon = await cartService.getCoupon(couponCode);
      if (coupon) {
        setAppliedCoupon({
          code: coupon.code,
          discount_percentage: coupon.discount_percentage,
        });
        setSuccessMessage(
          `Coupon "${coupon.code}" applied! ${coupon.discount_percentage}% off.`
        );
        setCouponCode(""); // Clear input after successful apply
      } else {
        setErrorMessage("Invalid or expired coupon code.");
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      setErrorMessage("Failed to apply coupon. Please try again.");
      setAppliedCoupon(null);
    }
  };

  const handleCheckout = async () => {
    if (!user?.id) return setErrorMessage("Please log in to checkout.");
    if (!cartItems.length) return setErrorMessage("Your cart is empty!");

    setIsCheckingOut(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems,
          userId: user.id,
          couponCode: appliedCoupon?.code, // Pass coupon code if applied
        }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to create Razorpay order");

      const { orderId } = await response.json();

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
          amount: calculateTotalWithDiscount() * 100, // Use discounted total
          currency: "INR",
          name: "Your Store Name",
          description: "Payment for your order",
          order_id: orderId,
          handler: async (response: any) => {
            await cartService.checkout(user.id, cartItems);
            setSuccessMessage("Payment successful! Order placed.");
            dispatch(setCartItems([]));
            setAppliedCoupon(null); // Clear coupon after checkout
          },
          prefill: {
            name: user.name,
            email: user.email,
            contact: "9999999999",
          },
          theme: { color: "#F37254" },
          modal: {
            ondismiss: () => setErrorMessage("Payment cancelled."),
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
    } catch (error) {
      console.error("Checkout error:", error);
      setErrorMessage("Checkout failed. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const calculateTotalWithDiscount = () => {
    if (!appliedCoupon) return subtotal;
    const discount = subtotal * (appliedCoupon.discount_percentage / 100);
    return Math.max(0, subtotal - discount); // Ensure total doesn't go negative
  };
  const total = calculateTotalWithDiscount();

  if (isLoading) {
    return (
      <div
        className={`container mx-auto p-4 ${THEMES[theme].background.primary}`}
      >
        <h1 className={`text-2xl font-bold mb-6 ${THEMES[theme].text.primary}`}>
          Shopping Cart
        </h1>
        <div className="min-h-[200px] flex items-center justify-center">
          <p className={THEMES[theme].text.muted}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className={`container mx-auto p-4 ${THEMES[theme].background.primary}`}
      >
        <h1 className={`text-2xl font-bold mb-6 ${THEMES[theme].text.primary}`}>
          Shopping Cart
        </h1>
        <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          {errorMessage || "Please log in to view your cart"}
        </div>
        <div className="text-center py-8">
          <button
            onClick={() => router.push("/login")}
            className="px-5 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`container mx-auto p-4 ${THEMES[theme].background.primary}`}
    >
      <h1 className={`text-2xl font-bold mb-6 ${THEMES[theme].text.primary}`}>
        Shopping Cart
      </h1>
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      {cartItems.length === 0 ? (
        <div className={`text-center py-8 ${THEMES[theme].text.muted}`}>
          <p>Your cart is empty</p>
          <Link
            href="/products"
            className="text-yellow-500 hover:text-yellow-600"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between ${THEMES[theme].border} border-b py-6`}
            >
              <div className="flex items-center space-x-4">
                <div className="relative w-20 h-20">
                  <Image
                    src={item.image || "/placeholder-image.jpg"}
                    unoptimized={true}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover rounded"
                    onError={(e) =>
                      (e.currentTarget.src = "/placeholder-image.jpg")
                    }
                  />
                </div>
                <div className="flex-1 py-2">
                  <h3 className={`font-semibold ${THEMES[theme].text.primary}`}>
                    {item.name}
                  </h3>
                  <p className={THEMES[theme].text.primary}>
                    ${item.price.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div
                  className={`flex items-center space-x-2 ${THEMES[theme].background.secondary} ${THEMES[theme].border} rounded`}
                >
                  <button
                    onClick={() => handleQuantityChange(item.id, -1)}
                    className={`p-2 ${THEMES[theme].text.primary} hover:${THEMES[theme].dropdown.hover}`}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className={`px-3 ${THEMES[theme].text.primary}`}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item.id, 1)}
                    className={`p-2 ${THEMES[theme].text.primary} hover:${THEMES[theme].dropdown.hover}`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))}
          {/* Coupon Code Section */}
          <div className="mt-6 flex items-center space-x-4">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter coupon code"
              className={`p-2 rounded ${THEMES[theme].border} ${THEMES[theme].background.secondary} ${THEMES[theme].text.primary} w-64`}
            />
            <button
              onClick={handleApplyCoupon}
              className={`px-4 py-2 rounded ${
                theme === "light"
                  ? "bg-yellow-500 text-black hover:bg-yellow-600"
                  : "bg-yellow-600 text-white hover:bg-yellow-700"
              }`}
            >
              Apply Coupon
            </button>
          </div>
          {/* Total Section */}
          <div className="text-right mt-6">
            <p className={`text-lg ${THEMES[theme].text.secondary}`}>
              Subtotal: ${subtotal.toFixed(2)}
            </p>
            {appliedCoupon && (
              <p className={`text-lg ${THEMES[theme].text.secondary}`}>
                Discount ({appliedCoupon.discount_percentage}%): -$
                {(subtotal - total).toFixed(2)}
              </p>
            )}
            <p className={`text-xl font-bold ${THEMES[theme].text.primary}`}>
              Total: ${total.toFixed(2)}
            </p>
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className={`mt-4 px-6 py-2 rounded ${
                theme === "light"
                  ? "bg-yellow-500 text-black hover:bg-yellow-600"
                  : "bg-yellow-600 text-white hover:bg-yellow-700"
              } ${isCheckingOut ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
