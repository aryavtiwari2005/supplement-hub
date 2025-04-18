"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { setCartItems } from "@/redux/cartSlice";

export default function PaymentStatus() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [status, setStatus] = useState<
    "success" | "failure" | "pending" | "loading"
  >("loading");
  const [orderId, setOrderId] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const orderId = searchParams.get("orderId");
      const transactionId = searchParams.get("transactionId");

      if (!orderId || !transactionId) {
        setStatus("failure");
        setErrorMessage("Missing order information");
        return;
      }

      setOrderId(orderId);
      setTransactionId(transactionId);

      const pollStatus = async () => {
        try {
          const response = await fetch(
            `/api/verify-payment?orderId=${orderId}&transactionId=${transactionId}`,
            {
              method: "GET",
              credentials: "include",
            }
          );
          const data = await response.json();

          if (!response.ok) {
            setStatus("failure");
            setErrorMessage(data.error || "Failed to verify payment");
            return;
          }

          if (data.paymentStatus === "success") {
            setStatus("success");
            dispatch(setCartItems([])); // Clear cart only on success
          } else if (retryCount < 10) {
            setStatus("pending");
            setTimeout(() => setRetryCount((prev) => prev + 1), 3000);
          } else {
            setStatus("failure");
            setErrorMessage("Payment verification timed out");
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          setStatus("failure");
          setErrorMessage("Failed to verify payment status");
        }
      };

      pollStatus();
    };

    checkPaymentStatus();
  }, [searchParams, retryCount, dispatch]);

  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-6">Payment Status</h1>
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-16 w-16 text-yellow-500 animate-spin mb-4" />
            <p className="text-gray-600">Verifying payment status...</p>
          </div>
        )}
        {status === "pending" && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-16 w-16 text-yellow-500 animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-yellow-600 mb-2">
              Payment Processing
            </h2>
            <p className="text-gray-600 mb-6">
              Please wait while we confirm your payment...
            </p>
            <p className="text-gray-800 mb-6">Order ID: {orderId}</p>
          </div>
        )}
        {status === "success" && (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold text-green-600 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your order has been placed successfully.
            </p>
            <p className="text-gray-800 mb-6">Order ID: {orderId}</p>
            <div className="flex space-x-4">
              <Link
                href="/profile/orders"
                className="px-6 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600"
              >
                View Order
              </Link>
              <Link
                href="/products"
                className="px-6 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
        {status === "failure" && (
          <div className="flex flex-col items-center justify-center py-8">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Payment Failed
            </h2>
            <p className="text-gray-600 mb-6">
              {errorMessage || "We couldn't complete your payment."}
            </p>
            {orderId && (
              <p className="text-gray-800 mb-6">Order ID: {orderId}</p>
            )}
            <div className="flex space-x-4">
              <Link
                href="/cart"
                className="px-6 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600"
              >
                Return to Cart
              </Link>
              <Link
                href="/help"
                className="px-6 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
              >
                Get Help
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
