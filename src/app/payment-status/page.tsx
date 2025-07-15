"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { useDispatch } from "react-redux";
import { setCartItems } from "@/redux/cartSlice";

export default function PaymentStatus() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [status, setStatus] = useState<
    "success" | "failure" | "pending" | "cancelled" | "expired" | "loading"
  >("loading");
  const [orderId, setOrderId] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 15;
  const retryInterval = 4000;

  useEffect(() => {
    const checkPaymentStatus = async () => {
      let orderId: string | null = searchParams.get("orderId") || searchParams.get("order_id");
      let transactionId: string | null = searchParams.get("orderToken") || searchParams.get("order_id");

      console.log("Query parameters:", {
        orderId,
        transactionId,
        query: Object.fromEntries(searchParams),
      });

      if (!orderId || !transactionId) {
        console.warn("Missing orderId or transactionId, attempting fallback...");
        try {
          const response = await fetch("/api/get-latest-transaction", {
            method: "GET",
            credentials: "include",
          });
          const data = await response.json();

          if (response.ok && data.transaction) {
            orderId = data.transaction.order_id;
            transactionId = data.transaction.transaction_id;
            console.log("Fallback transaction found:", { orderId, transactionId });
          } else {
            console.error("Fallback failed:", data.error || "No recent transactions");
            setStatus("failure");
            setErrorMessage("Missing order information. Please check your order status or contact support.");
            return;
          }
        } catch (error) {
          console.error("Fallback fetch error:", error);
          setStatus("failure");
          setErrorMessage("Failed to retrieve order information. Please contact support.");
          return;
        }
      }

      // Ensure orderId and transactionId are strings before setting state
      setOrderId(orderId || "");
      setTransactionId(transactionId || "");

      const pollStatus = async () => {
        // Skip polling if orderId or transactionId is empty (fallback failed)
        if (!orderId || !transactionId) {
          setStatus("failure");
          setErrorMessage("Invalid order information. Please contact support.");
          return;
        }

        try {
          console.log(`Polling attempt ${retryCount + 1}/${maxRetries}`, {
            orderId,
            transactionId,
          });
          const response = await fetch(
            `/api/verify-payment?orderId=${orderId}&orderToken=${transactionId}`,
            {
              method: "GET",
              credentials: "include",
            }
          );
          const data = await response.json();

          if (!response.ok) {
            console.error("Verify payment failed:", data);
            setStatus("failure");
            setErrorMessage(data.error || "Failed to verify payment status");
            return;
          }

          console.log("Verify payment response:", data);

          switch (data.paymentStatus) {
            case "success":
              setStatus("success");
              dispatch(setCartItems([]));
              break;
            case "failed":
            case "cancelled":
            case "expired":
              setStatus(data.paymentStatus);
              setErrorMessage(data.failureReason || `Payment ${data.paymentStatus}`);
              break;
            default:
              if (retryCount < maxRetries) {
                setStatus("pending");
                setTimeout(() => setRetryCount((prev) => prev + 1), retryInterval);
              } else {
                setStatus("failure");
                setErrorMessage("Payment verification timed out. Please check your order status.");
              }
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          setStatus("failure");
          setErrorMessage("Failed to verify payment status. Please try again or contact support.");
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
              Please wait while we confirm your payment... (Attempt {retryCount + 1}/{maxRetries})
            </p>
            {orderId && <p className="text-gray-800 mb-6">Order ID: {orderId}</p>}
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
            {orderId && <p className="text-gray-800 mb-6">Order ID: {orderId}</p>}
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
            {orderId && <p className="text-gray-800 mb-6">Order ID: {orderId}</p>}
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
        {status === "cancelled" && (
          <div className="flex flex-col items-center justify-center py-8">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
            <h2 className="text-xl font-semibold text-yellow-600 mb-2">
              Payment Cancelled
            </h2>
            <p className="text-gray-600 mb-6">
              {errorMessage || "You cancelled the payment process."}
            </p>
            {orderId && <p className="text-gray-800 mb-6">Order ID: {orderId}</p>}
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
        {status === "expired" && (
          <div className="flex flex-col items-center justify-center py-8">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
            <h2 className="text-xl font-semibold text-yellow-600 mb-2">
              Order Expired
            </h2>
            <p className="text-gray-600 mb-6">
              {errorMessage || "Your payment session has expired."}
            </p>
            {orderId && <p className="text-gray-800 mb-6">Order ID: {orderId}</p>}
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