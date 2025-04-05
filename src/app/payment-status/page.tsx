// app/payment-status/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function PaymentStatus() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<
    "success" | "failure" | "pending" | "loading"
  >("loading");
  const [orderId, setOrderId] = useState<string>("");

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        const orderId = searchParams.get("orderId");
        const transactionId = searchParams.get("transactionId");

        if (!orderId || !transactionId) {
          setStatus("failure");
          return;
        }

        setOrderId(orderId);

        // Verify payment status from our backend
        const response = await fetch(
          `/api/verify-payment?orderId=${orderId}&transactionId=${transactionId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          setStatus("failure");
          return;
        }

        const data = await response.json();
        setStatus(
          data.status === "paid"
            ? "success"
            : data.status === "payment_pending"
            ? "pending"
            : "failure"
        );
      } catch (error) {
        console.error("Error fetching payment status:", error);
        setStatus("failure");
      }
    };

    fetchPaymentStatus();
  }, [searchParams]);

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
              <Link href="/orders">
                <div className="px-6 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600">
                  View Order
                </div>
              </Link>
              <Link href="/products">
                <div className="px-6 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200">
                  Continue Shopping
                </div>
              </Link>
            </div>
          </div>
        )}

        {status === "pending" && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-16 w-16 text-yellow-500 mb-4" />
            <h2 className="text-xl font-semibold text-yellow-600 mb-2">
              Payment Processing
            </h2>
            <p className="text-gray-600 mb-6">
              Your payment is being processed. Please wait...
            </p>
            <p className="text-gray-800 mb-6">Order ID: {orderId}</p>
            <p className="text-sm text-gray-500 mb-4">
              This may take a few moments. You'll receive an email once the
              payment is confirmed.
            </p>
            <Link href="/orders">
              <div className="px-6 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600">
                Check Order Status
              </div>
            </Link>
          </div>
        )}

        {status === "failure" && (
          <div className="flex flex-col items-center justify-center py-8">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Payment Failed
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't complete your payment. Please try again.
            </p>
            {orderId && (
              <p className="text-gray-800 mb-6">Order ID: {orderId}</p>
            )}
            <div className="flex space-x-4">
              <Link href="/cart">
                <div className="px-6 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-600">
                  Return to Cart
                </div>
              </Link>
              <Link href="/help">
                <div className="px-6 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200">
                  Get Help
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
