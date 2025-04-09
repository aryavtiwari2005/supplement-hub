import { useState } from "react";
import { Order } from "@/types/orders"; // Import from your types file

interface OrderTableProps {
  orders: Order[];
  onUpdateStatus: (userId: number, orderId: string, newStatus: string) => void;
}

export default function OrderTable({
  orders,
  onUpdateStatus,
}: OrderTableProps) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusInput, setStatusInput] = useState<{ [key: string]: string }>({});
  const [statusError, setStatusError] = useState<{ [key: string]: string }>({});

  const handleStatusChange = (
    orderId: string,
    userId: number,
    newStatus: string
  ) => {
    if (newStatus.trim() === "") {
      setStatusError((prev) => ({
        ...prev,
        [orderId]: "Status cannot be empty",
      }));
      return;
    }
    setStatusError((prev) => ({ ...prev, [orderId]: "" }));
    onUpdateStatus(userId, orderId, newStatus.trim().toLowerCase());
  };

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "text-yellow-600";
      case "shipped":
        return "text-blue-600";
      case "delivered":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Order ID
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              User Email
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Total
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Date
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <>
              <tr key={order.order_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.order_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.user_email ?? "N/A"}{" "}
                  {/* Handle undefined user_email */}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{order.total.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={statusInput[order.order_id] ?? order.status}
                      onChange={(e) =>
                        setStatusInput({
                          ...statusInput,
                          [order.order_id]: e.target.value,
                        })
                      }
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        order.user_id &&
                        handleStatusChange(
                          order.order_id,
                          order.user_id,
                          statusInput[order.order_id] ?? order.status
                        )
                      }
                      className={`border rounded-md p-1 w-32 ${getStatusStyles(
                        statusInput[order.order_id] ?? order.status
                      )}`}
                      placeholder="Type status"
                    />
                    <button
                      onClick={() =>
                        order.user_id &&
                        handleStatusChange(
                          order.order_id,
                          order.user_id,
                          statusInput[order.order_id] ?? order.status
                        )
                      }
                      className="px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Save
                    </button>
                  </div>
                  {statusError[order.order_id] && (
                    <p className="text-red-500 text-xs mt-1">
                      {statusError[order.order_id]}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() =>
                      setExpandedOrder(
                        expandedOrder === order.order_id ? null : order.order_id
                      )
                    }
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    aria-expanded={expandedOrder === order.order_id}
                  >
                    {expandedOrder === order.order_id
                      ? "Hide Details"
                      : "View Details"}
                  </button>
                </td>
              </tr>
              {expandedOrder === order.order_id && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">
                          Items:
                        </h4>
                        <ul className="space-y-4">
                          {order.items.map((item) => (
                            <li
                              key={item.id}
                              className="text-sm text-gray-600 flex items-center gap-4"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-20 h-20 object-cover rounded-md"
                              />
                              <div>
                                <p>{item.name}</p>
                                {item.selectedVariant && (
                                  <p className="text-gray-500">
                                    Variant: {item.selectedVariant}
                                  </p>
                                )}
                                <p>
                                  Qty: {item.quantity} @ ₹
                                  {item.price.toFixed(2)}
                                </p>
                                <p className="font-medium">
                                  Total: ₹
                                  {(item.price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">
                          Order Details:
                        </h4>
                        <p className="text-sm text-gray-600">
                          <strong>Subtotal:</strong> ₹
                          {order.subtotal.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Discount:</strong> ₹
                          {order.discount.toFixed(2)}
                          {order.coupon_code && ` (${order.coupon_code})`}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Total:</strong> ₹{order.total.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Payment Method:</strong>{" "}
                          {order.payment_method}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Transaction ID:</strong>{" "}
                          {order.transaction_id}
                        </p>
                        <h4 className="font-semibold text-gray-700 mt-4 mb-2">
                          Shipping Address:
                        </h4>
                        <p className="text-sm text-gray-600">
                          {order.address.street}, {order.address.city},{" "}
                          {order.address.state} {order.address.zipCode}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
