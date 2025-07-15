"use client";

import { Dispatch } from "redux";
import {
  removeFromCart,
  updateQuantity,
  setCartItems,
} from "@/redux/cartSlice";
import { cartService } from "@/services/cartService";
import { X, Plus, Minus, ArrowRight } from "lucide-react";
import Image from "next/image";
import { THEMES } from "./CartPage";
import { useState } from "react";

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: any;
  paymentPreference?: string;
  scoopPoints?: number;
};

type CouponType = {
  code: string;
  discount_percentage: number;
};

const CartItems = ({
  cartItems,
  user,
  subtotal,
  total,
  appliedCoupon,
  couponCode,
  setCouponCode,
  setAppliedCoupon,
  setCheckoutStep,
  setErrorMessage,
  setSuccessMessage,
  dispatch,
  theme,
  scoopPointsToRedeem,
  setScoopPointsToRedeem,
  availableScoopPoints,
}: {
  cartItems: CartItem[];
  user: User | null;
  subtotal: number;
  total: number;
  appliedCoupon: CouponType | null;
  couponCode: string;
  setCouponCode: (code: string) => void;
  setAppliedCoupon: (coupon: CouponType | null) => void;
  setCheckoutStep: (step: 1 | 2 | 3) => void;
  setErrorMessage: (message: string) => void;
  setSuccessMessage: (message: string) => void;
  dispatch: Dispatch;
  theme: "light";
  scoopPointsToRedeem: number;
  setScoopPointsToRedeem: (points: number) => void;
  availableScoopPoints: number;
}) => {
  const [scoopPointsInput, setScoopPointsInput] = useState("");

  const handleRemoveItem = async (id: number) => {
    if (!user?.id) return setErrorMessage("Please log in.");
    try {
      dispatch(removeFromCart(id));
      await cartService.removeFromCart(user.id, id);
    } catch (error) {
      console.error("Error removing item:", error);
      setErrorMessage("Failed to remove item.");
      await cartService
        .getUserCart(user.id)
        .then((cart) => dispatch(setCartItems(cart)));
    }
  };

  const handleQuantityChange = async (id: number, delta: number) => {
    if (!user?.id) return setErrorMessage("Please log in.");
    const item = cartItems.find((i) => i.id === id);
    if (!item || item.quantity + delta > 10 || item.quantity + delta < 1)
      return;
    const newQuantity = item.quantity + delta;
    try {
      dispatch(updateQuantity({ id, quantity: newQuantity }));
      await cartService.updateCartQuantity(user.id, id, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
      setErrorMessage("Failed to update quantity.");
      await cartService
        .getUserCart(user.id)
        .then((cart) => dispatch(setCartItems(cart)));
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return setErrorMessage("Please enter a coupon code.");
    try {
      const coupon = await cartService.getCoupon(couponCode);
      if (coupon) {
        setAppliedCoupon(coupon);
        setSuccessMessage(
          `Coupon "${coupon.code}" applied! ${coupon.discount_percentage}% off.`
        );
        setCouponCode("");
      } else {
        setErrorMessage("Invalid coupon code.");
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      setErrorMessage("Failed to apply coupon.");
    }
  };

  const handleRedeemScoopPoints = () => {
    const points = parseInt(scoopPointsInput || "0");
    if (isNaN(points) || points < 0) {
      setErrorMessage("Please enter a valid number of scoop points.");
      return;
    }
    if (points > availableScoopPoints) {
      setErrorMessage("You don’t have enough scoop points.");
      return;
    }
    setScoopPointsToRedeem(points);
    setSuccessMessage(
      `Redeemed ${points} scoop points for ₹${points} discount.`
    );
    setScoopPointsInput("");
  };

  const couponDiscount = appliedCoupon
    ? subtotal * (appliedCoupon.discount_percentage / 100)
    : 0;

  return (
    <div className="space-y-4">
      {cartItems.map((item) => (
        <div
          key={item.id}
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between ${THEMES[theme].border} border-b py-4 sm:py-6`}
        >
          <div className="flex items-center space-x-3 sm:space-x-4 w-full">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
              <Image
                src={item.image || "/placeholder-image.jpg"}
                unoptimized={true}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 64px, 80px"
                className="object-cover rounded"
                onError={(e) =>
                  (e.currentTarget.src = "/placeholder-image.jpg")
                }
              />
            </div>
            <div className="flex-1">
              <h3
                className={`text-sm sm:text-base font-semibold ${THEMES[theme].text.primary} line-clamp-2`}
              >
                {item.name}
              </h3>
              <p className={`text-sm ${THEMES[theme].text.primary}`}>
                ₹{item.price.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 mt-3 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
            <div
              className={`flex items-center space-x-1 sm:space-x-2 ${THEMES[theme].background.secondary} ${THEMES[theme].border} rounded`}
            >
              <button
                onClick={() => handleQuantityChange(item.id, -1)}
                className={`p-1 sm:p-2 ${THEMES[theme].text.primary}`}
                disabled={item.quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <span
                className={`px-2 sm:px-3 text-sm ${THEMES[theme].text.primary}`}
              >
                {item.quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(item.id, 1)}
                className={`p-1 sm:p-2 ${THEMES[theme].text.primary}`}
                disabled={item.quantity >= 10}
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <button
              onClick={() => handleRemoveItem(item.id)}
              className="text-red-500 hover:text-red-600"
              aria-label="Remove item"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      ))}
      <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Enter coupon code"
            className={`p-2 rounded ${THEMES[theme].border} ${THEMES[theme].background.secondary} ${THEMES[theme].text.primary} w-full sm:w-48`}
          />
          <button
            onClick={handleApplyCoupon}
            className={`px-3 sm:px-4 py-2 rounded bg-yellow-500 text-black hover:bg-yellow-600 w-full sm:w-auto text-sm sm:text-base`}
          >
            Apply Coupon
          </button>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <input
            type="number"
            value={scoopPointsInput}
            onChange={(e) => setScoopPointsInput(e.target.value)}
            min="0"
            max={availableScoopPoints}
            placeholder={`Redeem scoop points (max ${availableScoopPoints})`}
            className={`p-2 rounded ${THEMES[theme].border} ${THEMES[theme].background.secondary} ${THEMES[theme].text.primary} w-full sm:w-48`}
          />
          <button
            onClick={handleRedeemScoopPoints}
            className={`px-3 sm:px-4 py-2 rounded bg-yellow-500 text-black hover:bg-yellow-600 w-full sm:w-auto text-sm sm:text-base`}
          >
            Redeem Points
          </button>
        </div>
      </div>
      <div className="text-right mt-4 sm:mt-6">
        <p className={`text-base sm:text-lg ${THEMES[theme].text.secondary}`}>
          Subtotal: ₹{subtotal.toFixed(2)}
        </p>
        {appliedCoupon && (
          <p className={`text-base sm:text-lg ${THEMES[theme].text.secondary}`}>
            Coupon Discount ({appliedCoupon.discount_percentage}%): -₹
            {couponDiscount.toFixed(2)}
          </p>
        )}
        {scoopPointsToRedeem > 0 && (
          <p className={`text-base sm:text-lg ${THEMES[theme].text.secondary}`}>
            Scoop Points Discount: -₹{scoopPointsToRedeem.toFixed(2)}
          </p>
        )}
        <p
          className={`text-lg sm:text-xl font-bold ${THEMES[theme].text.primary}`}
        >
          Total: ₹{total.toFixed(2)}
        </p>
        <button
          onClick={() => setCheckoutStep(2)}
          disabled={cartItems.length === 0}
          className={`mt-3 sm:mt-4 px-4 sm:px-6 py-2 rounded bg-yellow-500 text-black hover:bg-yellow-600 text-sm sm:text-base ${cartItems.length === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          Proceed to Delivery{" "}
          <ArrowRight className="inline-block ml-1 sm:ml-2 w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CartItems;