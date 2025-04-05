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
import { X } from "lucide-react";
import Link from "next/link";
import { FC } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Define CartItem interface
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

// Define UserAddress interface (NEW)
interface UserAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

// Define props interface
interface CartPageProps {
  userId: string;
}

// Define THEMES object
const THEMES = {
  light: {
    background: {
      primary: "bg-white",
      secondary: "bg-yellow-50",
    },
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
    background: {
      primary: "bg-black",
      secondary: "bg-gray-900",
    },
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

const CartPage: FC<CartPageProps> = ({ userId }) => {
  const [theme] = useState<"light" | "dark">("light");
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems) as CartItem[];
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  // NEW: Added state for address and payment method
  const [address, setAddress] = useState<UserAddress>({
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"phonePe" | "cod">("cod");
  const router = useRouter();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const numericUserId = Number(userId);
        if (isNaN(numericUserId)) {
          throw new Error("Invalid user ID");
        }
        const cart = await cartService.getUserCart(numericUserId);
        dispatch(setCartItems(cart || []));
      } catch (error) {
        console.error("Error fetching cart:", error);
        setErrorMessage("Failed to load your cart. Please refresh the page.");
      }
    };
    fetchCart();
  }, [dispatch, userId]);

  const handleRemoveItem = async (id: number) => {
    try {
      dispatch(removeFromCart(id));
      const numericUserId = Number(userId);
      if (isNaN(numericUserId)) throw new Error("Invalid user ID");
      await cartService.removeFromCart(numericUserId, id);
    } catch (error) {
      console.error("Error removing item:", error);
      setErrorMessage("Failed to remove item. Please try again.");
    }
  };

  const handleQuantityChange = async (id: number, quantity: number) => {
    try {
      dispatch(updateQuantity({ id, quantity }));
      const numericUserId = Number(userId);
      if (isNaN(numericUserId)) throw new Error("Invalid user ID");
      await cartService.updateCartQuantity(numericUserId, id, quantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
      setErrorMessage("Failed to update quantity. Please try again.");
    }
  };

  const handleCheckout = async () => {
    if (!cartItems.length) {
      setErrorMessage("Your cart is empty!");
      return;
    }

    // NEW: Validate address
    if (
      !address.street ||
      !address.city ||
      !address.state ||
      !address.zipCode
    ) {
      setErrorMessage("Please provide a complete shipping address");
      return;
    }

    setIsCheckingOut(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const numericUserId = Number(userId);
      if (isNaN(numericUserId)) throw new Error("Invalid user ID");
      // CHANGED: Added address and paymentMethod to checkout call
      await cartService.checkout(
        numericUserId,
        cartItems,
        address,
        paymentMethod
      );
      setSuccessMessage("Checkout successful!");
      // NEW: Clear cart and redirect
      dispatch(setCartItems([]));
      setTimeout(() => router.push("/orders"), 2000);
    } catch (error: any) {
      // CHANGED: Added type assertion for better error handling
      console.error("Error during checkout:", error);
      setErrorMessage(error.message || "Checkout failed. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

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

      {/* NEW: Address Form */}
      <div className={`mb-6 p-4 ${THEMES[theme].background.secondary} rounded`}>
        <h2
          className={`text-lg font-semibold ${THEMES[theme].text.primary} mb-2`}
        >
          Shipping Address
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Street"
            value={address.street}
            onChange={(e) => setAddress({ ...address, street: e.target.value })}
            className={`p-2 rounded ${THEMES[theme].border} ${THEMES[theme].background.primary} ${THEMES[theme].text.primary}`}
          />
          <input
            type="text"
            placeholder="City"
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
            className={`p-2 rounded ${THEMES[theme].border} ${THEMES[theme].background.primary} ${THEMES[theme].text.primary}`}
          />
          <input
            type="text"
            placeholder="State"
            value={address.state}
            onChange={(e) => setAddress({ ...address, state: e.target.value })}
            className={`p-2 rounded ${THEMES[theme].border} ${THEMES[theme].background.primary} ${THEMES[theme].text.primary}`}
          />
          <input
            type="text"
            placeholder="Zip Code"
            value={address.zipCode}
            onChange={(e) =>
              setAddress({ ...address, zipCode: e.target.value })
            }
            className={`p-2 rounded ${THEMES[theme].border} ${THEMES[theme].background.primary} ${THEMES[theme].text.primary}`}
          />
        </div>
      </div>

      {/* NEW: Payment Method Selection */}
      <div className={`mb-6 p-4 ${THEMES[theme].background.secondary} rounded`}>
        <h2
          className={`text-lg font-semibold ${THEMES[theme].text.primary} mb-2`}
        >
          Payment Method
        </h2>
        <select
          value={paymentMethod}
          onChange={(e) =>
            setPaymentMethod(e.target.value as "phonePe" | "cod")
          }
          className={`p-2 rounded ${THEMES[theme].border} ${THEMES[theme].background.primary} ${THEMES[theme].text.primary}`}
        >
          <option value="cod">Cash on Delivery</option>
          <option value="phonePe">PhonePe</option>
        </select>
      </div>

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
              className={`flex items-center justify-between ${THEMES[theme].border} border-b py-4`}
            >
              <div className="flex items-center space-x-4">
                <div className="relative w-20 h-20">
                  <Image
                    src={item.imageUrl || "/placeholder-image.jpg"}
                    alt={item.name}
                    fill
                    className="object-cover rounded"
                    sizes="80px"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder-image.jpg";
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${THEMES[theme].text.primary}`}>
                    {item.name}
                  </h3>
                  <p className={THEMES[theme].text.primary}>
                    ${item.price.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(item.id, Number(e.target.value))
                  }
                  className={`p-1 rounded ${THEMES[theme].border} ${THEMES[theme].background.secondary} ${THEMES[theme].text.primary}`}
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          <div className="text-right">
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
