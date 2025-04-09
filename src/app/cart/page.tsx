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
import {
  X,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  CreditCard,
  MapPin,
} from "lucide-react";
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
};

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: UserAddress;
  paymentPreference?: string;
};

type UserAddress = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
};

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type CouponType = {
  code: string;
  discount_percentage: number;
};

const CartPage = () => {
  const [theme] = useState<"light">("light");
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponType | null>(null);
  const [loadingSavedAddress, setLoadingSavedAddress] = useState(false);

  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);
  const [address, setAddress] = useState<UserAddress>({
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"phonePe" | "cod">(
    "phonePe"
  );

  const fetchCartData = async (userId: number) => {
    try {
      const cart = await cartService.getUserCart(userId);
      dispatch(setCartItems(cart));
    } catch (error) {
      console.error("Error fetching cart:", error);
      setErrorMessage("Failed to load cart from server.");
    }
  };

  useEffect(() => {
    const fetchUserAndCart = async () => {
      setLoadingSavedAddress(true);
      try {
        const res = await fetch("/api/user", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();
        const fetchedUser = data.user;
        setUser(fetchedUser);

        if (fetchedUser?.id) {
          await fetchCartData(fetchedUser.id);
          if (fetchedUser.address) setAddress(fetchedUser.address);
          if (fetchedUser.paymentPreference)
            setPaymentMethod(fetchedUser.paymentPreference);
        }
      } catch (error) {
        console.error("Failed to fetch user or cart:", error);
        setErrorMessage("Error loading cart. Please try again.");
      } finally {
        setIsLoading(false);
        setLoadingSavedAddress(false);
      }
    };

    fetchUserAndCart();
  }, [dispatch]);

  const handleRemoveItem = async (id: number) => {
    if (!user?.id) return setErrorMessage("Please log in.");
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
      await fetchCartData(user.id);
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

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAddress = async () => {
    if (!user?.id) return;
    const requiredFields = ["street", "city", "state", "zipCode"];
    if (requiredFields.some((field) => !address[field as keyof UserAddress])) {
      setErrorMessage("Please fill in all address fields.");
      return;
    }
    setIsProcessing(true);
    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save-address", address }),
        credentials: "include",
      });
      if (response.ok) {
        setSuccessMessage("Address saved successfully");
        setCheckoutStep(3);
      } else throw new Error("Failed to save address");
    } catch (error) {
      console.error("Error saving address:", error);
      setErrorMessage("An error occurred while saving your address");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckout = async () => {
    if (!user?.id || !cartItems.length)
      return setErrorMessage("Cart is empty or user not logged in.");
    setIsProcessing(true);
    setErrorMessage("");
    setSuccessMessage("");

    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const total = appliedCoupon
      ? Math.max(
          0,
          subtotal - subtotal * (appliedCoupon.discount_percentage / 100)
        )
      : subtotal;

    try {
      if (
        !address.street ||
        !address.city ||
        !address.state ||
        !address.zipCode
      ) {
        throw new Error("Please provide a complete shipping address");
      }

      await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save-payment-preference",
          paymentPreference: paymentMethod,
        }),
        credentials: "include",
      });

      if (paymentMethod === "phonePe") {
        const orderId = `order-${Date.now()}`;
        const response = await fetch("/api/create-phonepe-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cartItems,
            amount: total,
            userId: user.id,
            address,
            couponCode: appliedCoupon?.code,
            orderId,
          }),
          credentials: "include",
        });

        const paymentData = await response.json();
        if (!response.ok)
          throw new Error(
            paymentData.error || "Failed to initiate PhonePe payment"
          );

        window.location.href = paymentData.paymentUrl;
      } else {
        // COD handling remains unchanged
        const codResponse = await fetch("/api/create-cod-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cartItems,
            amount: total,
            userId: user.id,
            address,
            couponCode: appliedCoupon?.code,
          }),
          credentials: "include",
        });

        const codData = await codResponse.json();
        if (!codResponse.ok)
          throw new Error(codData.error || "Failed to create COD order");

        setSuccessMessage(
          `Order placed successfully! Your order ID is ${codData.orderId}`
        );
        dispatch(setCartItems([]));
        setAppliedCoupon(null);
        setTimeout(() => router.push("/profile/orders"), 2000);
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      setErrorMessage(error.message || "Checkout failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = appliedCoupon
    ? Math.max(
        0,
        subtotal - subtotal * (appliedCoupon.discount_percentage / 100)
      )
    : subtotal;

  const renderStepIndicator = () => (
    <div className="flex w-full mb-8 items-center">
      {[1, 2, 3].map((step) => (
        <div
          key={step}
          className={`flex flex-col items-center w-1/3 ${
            checkoutStep >= step ? "text-yellow-500" : THEMES[theme].text.muted
          }`}
        >
          <div
            className={`w-8 h-8 flex items-center justify-center rounded-full ${
              checkoutStep >= step
                ? "bg-yellow-500 text-white"
                : `bg-gray-200 ${THEMES[theme].text.muted}`
            }`}
          >
            {step}
          </div>
          <span className="text-sm mt-1">
            {["Cart", "Address", "Payment"][step - 1]}
          </span>
          {step < 3 && (
            <div
              className={`h-1 w-full ${
                checkoutStep > step ? "bg-yellow-500" : "bg-gray-200"
              }`}
            ></div>
          )}
        </div>
      ))}
    </div>
  );

  const renderCartItems = () => (
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
                ₹{item.price.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center space-x-2 ${THEMES[theme].background.secondary} ${THEMES[theme].border} rounded`}
            >
              <button
                onClick={() => handleQuantityChange(item.id, -1)}
                className={`p-2 ${THEMES[theme].text.primary}`}
                disabled={item.quantity <= 1}
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className={`px-3 ${THEMES[theme].text.primary}`}>
                {item.quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(item.id, 1)}
                className={`p-2 ${THEMES[theme].text.primary}`}
                disabled={item.quantity >= 10}
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
          className={`px-4 py-2 rounded bg-yellow-500 text-black hover:bg-yellow-600`}
        >
          Apply Coupon
        </button>
      </div>
      <div className="text-right mt-6">
        <p className={`text-lg ${THEMES[theme].text.secondary}`}>
          Subtotal: ₹{subtotal.toFixed(2)}
        </p>
        {appliedCoupon && (
          <p className={`text-lg ${THEMES[theme].text.secondary}`}>
            Discount ({appliedCoupon.discount_percentage}%): -₹
            {(subtotal - total).toFixed(2)}
          </p>
        )}
        <p className={`text-xl font-bold ${THEMES[theme].text.primary}`}>
          Total: ₹{total.toFixed(2)}
        </p>
        <button
          onClick={() => setCheckoutStep(2)}
          disabled={cartItems.length === 0}
          className={`mt-4 px-6 py-2 rounded bg-yellow-500 text-black hover:bg-yellow-600 ${
            cartItems.length === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Proceed to Delivery{" "}
          <ArrowRight className="inline-block ml-2 w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderDeliveryAddress = () => (
    <div
      className={`p-4 rounded-lg ${THEMES[theme].background.secondary} ${THEMES[theme].border} border`}
    >
      <h2 className={`text-xl font-bold mb-4 ${THEMES[theme].text.primary}`}>
        <MapPin className="inline-block mr-2 mb-1" /> Delivery Address
      </h2>
      {loadingSavedAddress ? (
        <div className="flex justify-center py-6">
          <p className={THEMES[theme].text.muted}>Loading saved address...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label
              className={`block mb-1 ${THEMES[theme].text.secondary}`}
              htmlFor="street"
            >
              Street Address
            </label>
            <input
              type="text"
              id="street"
              name="street"
              value={address.street}
              onChange={handleAddressChange}
              placeholder="123 Main St"
              className={`w-full p-2 rounded ${THEMES[theme].border} ${THEMES[theme].background.primary} ${THEMES[theme].text.primary}`}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className={`block mb-1 ${THEMES[theme].text.secondary}`}
                htmlFor="city"
              >
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={address.city}
                onChange={handleAddressChange}
                placeholder="Mumbai"
                className={`w-full p-2 rounded ${THEMES[theme].border} ${THEMES[theme].background.primary} ${THEMES[theme].text.primary}`}
                required
              />
            </div>
            <div>
              <label
                className={`block mb-1 ${THEMES[theme].text.secondary}`}
                htmlFor="state"
              >
                State
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={address.state}
                onChange={handleAddressChange}
                placeholder="Maharashtra"
                className={`w-full p-2 rounded ${THEMES[theme].border} ${THEMES[theme].background.primary} ${THEMES[theme].text.primary}`}
                required
              />
            </div>
          </div>
          <div>
            <label
              className={`block mb-1 ${THEMES[theme].text.secondary}`}
              htmlFor="zipCode"
            >
              PIN Code
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={address.zipCode}
              onChange={handleAddressChange}
              placeholder="400001"
              className={`w-full p-2 rounded ${THEMES[theme].border} ${THEMES[theme].background.primary} ${THEMES[theme].text.primary}`}
              required
            />
          </div>
          <div className="flex justify-between pt-4">
            <button
              onClick={() => setCheckoutStep(1)}
              className={`px-4 py-2 rounded ${THEMES[theme].border} ${THEMES[theme].background.primary} ${THEMES[theme].text.primary}`}
            >
              <ArrowLeft className="inline-block mr-2 w-4 h-4" /> Back to Cart
            </button>
            <button
              onClick={handleSaveAddress}
              disabled={isProcessing}
              className={`px-6 py-2 rounded bg-yellow-500 text-black hover:bg-yellow-600 ${
                isProcessing ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isProcessing ? "Saving..." : "Continue to Payment"}{" "}
              <ArrowRight className="inline-block ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderPaymentMethod = () => (
    <div
      className={`p-4 rounded-lg ${THEMES[theme].background.secondary} ${THEMES[theme].border} border`}
    >
      <h2 className={`text-xl font-bold mb-4 ${THEMES[theme].text.primary}`}>
        <CreditCard className="inline-block mr-2 mb-1" /> Payment Method
      </h2>
      <div className="space-y-4">
        <div
          className={`p-4 rounded-lg ${
            THEMES[theme].border
          } border cursor-pointer ${
            paymentMethod === "phonePe" ? "border-yellow-500 bg-yellow-50" : ""
          }`}
          onClick={() => setPaymentMethod("phonePe")}
        >
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              checked={paymentMethod === "phonePe"}
              onChange={() => setPaymentMethod("phonePe")}
              className="mr-2"
            />
            <div>
              <span className={`font-medium ${THEMES[theme].text.primary}`}>
                PhonePe Gateway
              </span>
              <p className={`text-sm ${THEMES[theme].text.muted}`}>
                Pay securely using UPI
              </p>
            </div>
          </label>
        </div>
        <div
          className={`p-4 rounded-lg ${
            THEMES[theme].border
          } border cursor-pointer ${
            paymentMethod === "cod" ? "border-yellow-500 bg-yellow-50" : ""
          }`}
          onClick={() => setPaymentMethod("cod")}
        >
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              checked={paymentMethod === "cod"}
              onChange={() => setPaymentMethod("cod")}
              className="mr-2"
            />
            <div>
              <span className={`font-medium ${THEMES[theme].text.primary}`}>
                Cash on Delivery
              </span>
              <p className={`text-sm ${THEMES[theme].text.muted}`}>
                Pay with cash when delivered
              </p>
            </div>
          </label>
        </div>
        <div className={`mt-6 p-4 rounded-lg ${THEMES[theme].border} border`}>
          <h3 className={`font-medium mb-2 ${THEMES[theme].text.primary}`}>
            Order Summary
          </h3>
          <div className={`text-sm ${THEMES[theme].text.secondary}`}>
            <p>
              Items: {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            </p>
            <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
            {appliedCoupon && (
              <p>Discount: -₹{(subtotal - total).toFixed(2)}</p>
            )}
            <p className={`font-bold mt-2 ${THEMES[theme].text.primary}`}>
              Total: ₹{total.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="flex justify-between pt-4">
          <button
            onClick={() => setCheckoutStep(2)}
            className={`px-4 py-2 rounded ${THEMES[theme].border} ${THEMES[theme].background.primary} ${THEMES[theme].text.primary}`}
          >
            <ArrowLeft className="inline-block mr-2 w-4 h-4" /> Back to Address
          </button>
          <button
            onClick={handleCheckout}
            disabled={isProcessing}
            className={`px-6 py-2 rounded bg-yellow-500 text-black hover:bg-yellow-600 ${
              isProcessing ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isProcessing
              ? "Processing..."
              : paymentMethod === "cod"
              ? "Place Order"
              : "Proceed to Payment"}
          </button>
        </div>
      </div>
    </div>
  );

  if (isLoading)
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
  if (!user)
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
  if (cartItems.length === 0 && checkoutStep === 1)
    return (
      <div
        className={`container mx-auto p-4 ${THEMES[theme].background.primary}`}
      >
        <h1 className={`text-2xl font-bold mb-6 ${THEMES[theme].text.primary}`}>
          Shopping Cart
        </h1>
        <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Your cart is empty
        </div>
        <div className="text-center py-8">
          <Link
            href="/products"
            className="px-5 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );

  return (
    <div
      className={`container mx-auto p-4 ${THEMES[theme].background.primary}`}
    >
      <h1 className={`text-2xl font-bold mb-6 ${THEMES[theme].text.primary}`}>
        Checkout
      </h1>
      {renderStepIndicator()}
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
      <div className="mt-6">
        {checkoutStep === 1
          ? renderCartItems()
          : checkoutStep === 2
          ? renderDeliveryAddress()
          : renderPaymentMethod()}
      </div>
    </div>
  );
};

export default CartPage;
