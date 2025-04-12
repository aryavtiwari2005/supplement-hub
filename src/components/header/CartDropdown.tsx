"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCartItems,
  selectCartQuantity,
  removeFromCart,
  updateQuantity,
} from "@/redux/cartSlice";
import { useTheme } from "../ThemeProvider";

const dropdownVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export default function CartDropdown() {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const cartQuantity = useSelector(selectCartQuantity);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleQuantityChange = (id: number, quantity: number) => {
    dispatch(updateQuantity({ id, quantity }));
  };

  const handleRemoveItem = (id: number) => {
    dispatch(removeFromCart(id));
  };

  return (
    <div className="relative">
      <button
        className={`flex items-center space-x-2 ${
          theme === "light" ? "text-black" : "text-white"
        } hover:text-yellow-500 transition-colors px-2 sm:px-3 py-2 rounded-md ${
          theme === "light" ? "bg-yellow-50" : "bg-gray-900"
        }`}
        onClick={() => setIsCartOpen(!isCartOpen)}
      >
        <ShoppingCart className="w-5 sm:w-6 h-5 sm:h-6" />
        <span className="text-sm font-medium hidden sm:inline">Cart</span>
        {cartQuantity > 0 && (
          <span className="bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
            {cartQuantity}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`absolute right-0 top-full mt-2 w-72 sm:w-80 md:w-96 max-w-[90vw] max-h-[80vh] overflow-y-auto overflow-x-hidden ${
              theme === "light" ? "bg-yellow-50" : "bg-gray-900"
            } rounded-lg shadow-xl border ${
              theme === "light" ? "border-gray-200" : "border-gray-800"
            } z-50`}
          >
            <div className="p-4 sm:p-6">
              <h3
                className={`${
                  theme === "light" ? "text-black" : "text-white"
                } font-semibold text-base sm:text-lg mb-4 whitespace-nowrap`}
              >
                Shopping Cart ({cartQuantity})
              </h3>
              {cartItems.length === 0 ? (
                <div
                  className={`${
                    theme === "light" ? "text-gray-500" : "text-gray-500"
                  } text-center py-6`}
                >
                  <p>Your cart is empty</p>
                  <Link
                    href="/products"
                    className="mt-2 inline-block text-yellow-500 hover:text-yellow-600 font-medium"
                    onClick={() => setIsCartOpen(false)}
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-4 sm:space-y-6">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-3 sm:space-x-4 border-b pb-3 sm:pb-4"
                      >
                        <div className="flex-1 min-w-0">
                          <p
                            className={`${
                              theme === "light" ? "text-black" : "text-white"
                            } font-medium text-sm sm:text-base truncate`}
                          >
                            {item.name}
                          </p>
                          {item.selectedVariant && (
                            <p
                              className={`${
                                theme === "light"
                                  ? "text-gray-500"
                                  : "text-gray-500"
                              } text-xs sm:text-sm truncate`}
                            >
                              Variant: {item.selectedVariant}
                            </p>
                          )}
                          <p
                            className={`${
                              theme === "light" ? "text-black" : "text-white"
                            } text-xs sm:text-sm whitespace-nowrap`}
                          >
                            ₹{(item.price * item.quantity).toFixed(2)} (₹
                            {item.price} x {item.quantity})
                          </p>
                        </div>
                        <select
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.id,
                              Number(e.target.value)
                            )
                          }
                          className={`p-1 text-sm rounded ${
                            theme === "light" ? "bg-yellow-50" : "bg-gray-900"
                          } border ${
                            theme === "light"
                              ? "border-gray-200"
                              : "border-gray-800"
                          }`}
                        >
                          {[...Array(10)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-600 flex-shrink-0"
                        >
                          <X className="w-4 sm:w-5 h-4 sm:h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 sm:mt-6 border-t pt-4">
                    <p
                      className={`${
                        theme === "light" ? "text-black" : "text-white"
                      } font-semibold text-sm sm:text-base whitespace-nowrap`}
                    >
                      Subtotal: ₹
                      {cartItems
                        .reduce(
                          (sum, item) => sum + item.price * item.quantity,
                          0
                        )
                        .toFixed(2)}
                    </p>
                    <Link
                      href="/cart"
                      className={`mt-3 sm:mt-4 block text-center py-2 sm:py-3 rounded w-full ${
                        theme === "light"
                          ? "bg-yellow-500 text-black hover:bg-yellow-600"
                          : "bg-yellow-600 text-white hover:bg-yellow-700"
                      } transition-colors font-semibold text-sm sm:text-base`}
                      onClick={() => setIsCartOpen(false)}
                    >
                      View Cart & Checkout
                    </Link>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
