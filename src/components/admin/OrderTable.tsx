import { Order } from "@/types/orders"; // Adjust path based on your project structure
import { useState } from "react";

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

  const handleStatusChange = (
    orderId: string,
    userId: number,
    newStatus: string
  ) => {
    if (newStatus.trim() === "") return;
    onUpdateStatus(userId, orderId, newStatus.trim().toLowerCase());
    setStatusInput((prev) => ({ ...prev, [orderId]: "" }));
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                  {order.user_email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${order.total.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                    className="border rounded-md p-1 w-32"
                    placeholder="Type status"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() =>
                      setExpandedOrder(
                        expandedOrder === order.order_id ? null : order.order_id
                      )
                    }
                    className="text-blue-600 hover:text-blue-800"
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-700">Items:</h4>
                        <ul className="list-disc pl-5">
                          {order.items.map((item) => (
                            <li key={item.id} className="text-sm text-gray-600">
                              {item.name} (Qty: {item.quantity}) - $
                              {item.price.toFixed(2)}
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 object-cover inline-block ml-2"
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700">
                          Order Details:
                        </h4>
                        <p className="text-sm text-gray-600">
                          <strong>Subtotal:</strong> $
                          {order.subtotal.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Discount:</strong> $
                          {order.discount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Total:</strong> ${order.total.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Payment Method:</strong>{" "}
                          {order.payment_method}
                        </p>
                        {order.transaction_id && (
                          <p className="text-sm text-gray-600">
                            <strong>Transaction ID:</strong>{" "}
                            {order.transaction_id}
                          </p>
                        )}
                        {order.coupon_code && (
                          <p className="text-sm text-gray-600">
                            <strong>Coupon Code:</strong> {order.coupon_code}
                          </p>
                        )}
                        <h4 className="font-semibold text-gray-700 mt-2">
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
