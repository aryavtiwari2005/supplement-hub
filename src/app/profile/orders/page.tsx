"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

interface OrderItem {
  id: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  selectedVariant: string;
}

interface Address {
  city: string;
  state: string;
  street: string;
  zipCode: string;
}

interface Order {
  order_id: string;
  items: OrderItem[];
  total: number;
  status: string;
  created_at: string;
  address: Address;
  discount: number;
  subtotal: number;
  coupon_code: string | null;
  payment_method: string;
  transaction_id: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/user", { credentials: "include" });
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setOrders(data.user.orders || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch orders");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [router]);

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) newSet.delete(orderId);
      else newSet.add(orderId);
      return newSet;
    });
  };

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="p-8 rounded-lg shadow-md bg-white animate-pulse">
          <p className="text-lg text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="p-8 rounded-lg shadow-md bg-white">
          <p className="text-red-500 font-medium">{error}</p>
          <Link
            href="/login"
            className="mt-2 inline-block text-amber-600 hover:underline"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-amber-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/profile"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-amber-600 transition-colors mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profile
        </Link>

        <h1 className="text-3xl font-bold text-amber-900 mb-8">Your Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 text-lg mb-4">No orders found</p>
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.order_id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-amber-900">
                      Order #{order.order_id}
                    </h2>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                      <button
                        onClick={() => toggleOrderDetails(order.order_id)}
                        className="text-amber-600 hover:text-amber-800"
                      >
                        {expandedOrders.has(order.order_id) ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-600">
                        Placed on:{" "}
                        {new Date(order.created_at).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                      <p className="text-gray-600">
                        Payment: {order.payment_method} ({order.transaction_id})
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">
                        Subtotal: ₹{order.subtotal.toFixed(2)}
                      </p>
                      <p className="text-gray-600">
                        Discount: ₹{order.discount.toFixed(2)}
                        {order.coupon_code && ` (${order.coupon_code})`}
                      </p>
                      <p className="text-amber-900 font-semibold">
                        Total: ₹{order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-amber-100 pt-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-4 py-2 border-b border-amber-50 last:border-0"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium">
                            {item.name}
                          </p>
                          {item.selectedVariant && (
                            <p className="text-sm text-gray-500">
                              Variant: {item.selectedVariant}
                            </p>
                          )}
                          <p className="text-gray-600">
                            ₹{item.price.toFixed(2)} x {item.quantity}
                          </p>
                        </div>
                        <p className="text-gray-800 font-medium">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {expandedOrders.has(order.order_id) && (
                    <div className="mt-4 pt-4 border-t border-amber-100">
                      <h3 className="text-lg font-semibold text-amber-800 mb-2">
                        Shipping Address
                      </h3>
                      <p className="text-gray-600">
                        {order.address.street}, {order.address.city},
                        {order.address.state} - {order.address.zipCode}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
