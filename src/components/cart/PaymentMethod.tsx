import { Dispatch } from "redux";
import { setCartItems } from "@/redux/cartSlice";
import { ArrowLeft, CreditCard } from "lucide-react";
import { THEMES } from "./CartPage";

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type UserAddress = {
  street: string;
  landmark?: string;
  city: string;
  state: string;
  zipCode: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: UserAddress;
  paymentPreference?: string;
  scoopPoints?: number;
};

type CouponType = {
  code: string;
  discount_percentage: number;
};

const PHONEPE_DISCOUNT = 0.03;

const PaymentMethod = ({
  paymentMethod,
  setPaymentMethod,
  cartItems,
  total,
  appliedCoupon,
  address,
  user,
  setCheckoutStep,
  setErrorMessage,
  setSuccessMessage,
  isProcessing,
  setIsProcessing,
  dispatch,
  router,
  theme,
  scoopPointsToRedeem,
}: {
  paymentMethod: "phonePe" | "cod";
  setPaymentMethod: (method: "phonePe" | "cod") => void;
  cartItems: CartItem[];
  total: number;
  appliedCoupon: CouponType | null;
  address: UserAddress;
  user: User | null;
  setCheckoutStep: (step: 1 | 2 | 3) => void;
  setErrorMessage: (message: string) => void;
  setSuccessMessage: (message: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  dispatch: Dispatch;
  router: any;
  theme: "light";
  scoopPointsToRedeem: number;
}) => {
  const phonePeDiscount =
    paymentMethod === "phonePe" ? total * PHONEPE_DISCOUNT : 0;
  const finalTotal = total - phonePeDiscount;

  const handleCheckout = async () => {
    if (!user?.id || !cartItems.length)
      return setErrorMessage("Cart is empty or user not logged in.");
    setIsProcessing(true);
    setErrorMessage("");
    setSuccessMessage("");

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
            amount: finalTotal,
            userId: user.id,
            address,
            couponCode: appliedCoupon?.code,
            orderId,
            scoopPointsToRedeem,
            phonePeDiscount,
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
        const codResponse = await fetch("/api/create-cod-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cartItems,
            amount: total,
            userId: user.id,
            address,
            couponCode: appliedCoupon?.code,
            scoopPointsToRedeem,
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
        setTimeout(() => router.push("/profile/orders"), 2000);
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      setErrorMessage(error.message || "Checkout failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={`p-2 sm:p-4 rounded-lg ${THEMES[theme].background.secondary} ${THEMES[theme].border} border`}
    >
      <h2
        className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 ${THEMES[theme].text.primary}`}
      >
        <CreditCard className="inline-block mr-1 sm:mr-2 mb-1 w-4 sm:w-5 h-4 sm:h-5" />{" "}
        Payment Method
      </h2>
      <div className="space-y-3 sm:space-y-4">
        <div
          className={`p-3 sm:p-4 rounded-lg ${
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
              <span
                className={`font-medium text-sm sm:text-base ${THEMES[theme].text.primary}`}
              >
                PhonePe Gateway
              </span>
              <p className={`text-xs sm:text-sm ${THEMES[theme].text.muted}`}>
                Pay securely using UPI (3% discount applied)
              </p>
            </div>
          </label>
        </div>
        <div
          className={`p-3 sm:p-4 rounded-lg ${
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
              <span
                className={`font-medium text-sm sm:text-base ${THEMES[theme].text.primary}`}
              >
                Cash on Delivery
              </span>
              <p className={`text-xs sm:text-sm ${THEMES[theme].text.muted}`}>
                Pay with cash when delivered
              </p>
            </div>
          </label>
        </div>
        <div
          className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg ${THEMES[theme].border} border`}
        >
          <h3
            className={`font-medium mb-2 text-sm sm:text-base ${THEMES[theme].text.primary}`}
          >
            Order Summary
          </h3>
          <div className={`text-xs sm:text-sm ${THEMES[theme].text.secondary}`}>
            <p>
              Items: {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            </p>
            <p>
              Subtotal: ₹
              {cartItems
                .reduce((sum, item) => sum + item.price * item.quantity, 0)
                .toFixed(2)}
            </p>
            {appliedCoupon && (
              <p>
                Coupon Discount: -₹
                {(
                  cartItems.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                  ) *
                  (appliedCoupon.discount_percentage / 100)
                ).toFixed(2)}
              </p>
            )}
            {scoopPointsToRedeem > 0 && (
              <p>Scoop Points Discount: -₹{scoopPointsToRedeem.toFixed(2)}</p>
            )}
            {phonePeDiscount > 0 && (
              <p>PhonePe Discount (3%): -₹{phonePeDiscount.toFixed(2)}</p>
            )}
            <p
              className={`font-bold mt-2 text-sm sm:text-base ${THEMES[theme].text.primary}`}
            >
              Total: ₹{finalTotal.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between pt-3 sm:pt-4 space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => setCheckoutStep(2)}
            className={`px-3 sm:px-4 py-2 rounded ${THEMES[theme].border} ${THEMES[theme].background.primary} ${THEMES[theme].text.primary} text-sm sm:text-base w-full sm:w-auto`}
          >
            <ArrowLeft className="inline-block mr-1 sm:mr-2 w-4 h-4" /> Back to
            Address
          </button>
          <button
            onClick={handleCheckout}
            disabled={isProcessing}
            className={`px-4 sm:px-6 py-2 rounded bg-yellow-500 text-black hover:bg-yellow-600 text-sm sm:text-base w-full sm:w-auto ${
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
};

export default PaymentMethod;
