"use client";

import { useSelector, useDispatch } from "react-redux";
import { selectCartItems, setCartItems } from "@/redux/cartSlice";
import { cartService } from "@/services/cartService";
import { useEffect, useState, Dispatch, SetStateAction } from "react";
import StepIndicator from "./StepIndicator";
import Messages from "./Messages";
import CartItems from "./CartItems";
import DeliveryAddress from "./DeliveryAddress";
import PaymentMethod from "./PaymentMethod";
import LoadingState from "./LoadingState";
import LoginPrompt from "./LoginPrompt";
import EmptyCart from "./EmptyCart";
import { useRouter } from "next/navigation";

export const THEMES = {
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
  scoopPoints?: number; // Added
};

type UserAddress = {
  street: string;
  landmark?: string;
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

export const NOIDA_PIN_CODES = [
  "201301",
  "201304",
  "201305",
  "201306",
  "201307",
  "201309",
];

const CartPage = () => {
  const [theme] = useState<"light">("light");
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponType | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);
  const [address, setAddress] = useState<UserAddress>({
    street: "",
    landmark: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"phonePe" | "cod">(
    "phonePe"
  );
  const [scoopPointsToRedeem, setScoopPointsToRedeem] = useState(0); // New state

  const fetchUserAndCart = async () => {
    try {
      const res = await fetch("/api/user", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user data");
      const { user: fetchedUser } = await res.json();
      setUser(fetchedUser);

      if (fetchedUser?.id) {
        const cart = await cartService.getUserCart(fetchedUser.id);
        dispatch(setCartItems(cart));
        if (fetchedUser.address) setAddress(fetchedUser.address);
        if (fetchedUser.paymentPreference)
          setPaymentMethod(fetchedUser.paymentPreference);
      }
    } catch (error) {
      console.error("Failed to fetch user or cart:", error);
      setErrorMessage("Error loading cart. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAndCart();
  }, [dispatch]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const couponDiscount = appliedCoupon
    ? subtotal * (appliedCoupon.discount_percentage / 100)
    : 0;
  const scoopPointsDiscount = scoopPointsToRedeem; // 1 point = ₹1
  const total = Math.max(0, subtotal - couponDiscount - scoopPointsDiscount);

  const isNoidaDelivery = NOIDA_PIN_CODES.includes(address.zipCode);

  return (
    <div
      className={`container mx-auto p-4 ${THEMES[theme].background.primary}`}
    >
      <h1 className={`text-2xl font-bold mb-6 ${THEMES[theme].text.primary}`}>
        Checkout
      </h1>
      <StepIndicator checkoutStep={checkoutStep} theme={theme} />
      <Messages
        errorMessage={errorMessage}
        successMessage={successMessage}
        theme={theme}
      />
      {isLoading ? (
        <LoadingState theme={theme} />
      ) : !user ? (
        <LoginPrompt router={router} theme={theme} />
      ) : cartItems.length === 0 && checkoutStep === 1 ? (
        <EmptyCart theme={theme} />
      ) : (
        <div className="mt-6">
          {checkoutStep === 1 && (
            <CartItems
              cartItems={cartItems}
              user={user}
              subtotal={subtotal}
              total={total}
              appliedCoupon={appliedCoupon}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              setAppliedCoupon={setAppliedCoupon}
              setCheckoutStep={setCheckoutStep}
              setErrorMessage={setErrorMessage}
              setSuccessMessage={setSuccessMessage}
              dispatch={dispatch}
              theme={theme}
              scoopPointsToRedeem={scoopPointsToRedeem}
              setScoopPointsToRedeem={setScoopPointsToRedeem}
              availableScoopPoints={user.scoopPoints || 0}
            />
          )}
          {checkoutStep === 2 && (
            <DeliveryAddress
              address={address}
              setAddress={setAddress}
              setCheckoutStep={setCheckoutStep}
              setErrorMessage={setErrorMessage}
              setSuccessMessage={setSuccessMessage}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
              user={user}
              theme={theme}
              isNoidaDelivery={isNoidaDelivery}
            />
          )}
          {checkoutStep === 3 && (
            <PaymentMethod
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              cartItems={cartItems}
              total={total}
              appliedCoupon={appliedCoupon}
              address={address}
              user={user}
              setCheckoutStep={setCheckoutStep}
              setErrorMessage={setErrorMessage}
              setSuccessMessage={setSuccessMessage}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
              dispatch={dispatch}
              router={router}
              theme={theme}
              scoopPointsToRedeem={scoopPointsToRedeem}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default CartPage;
