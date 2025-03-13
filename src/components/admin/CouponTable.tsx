interface Coupon {
  id: string;
  code: string;
  discount_percentage: number;
  is_active: boolean;
  expires_at?: string;
}

interface CouponTableProps {
  coupons: Coupon[];
}

export default function CouponTable({ coupons }: CouponTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow-md">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-gray-700">ID</th>
            <th className="px-4 py-3 text-left text-gray-700">Code</th>
            <th className="px-4 py-3 text-left text-gray-700">Discount %</th>
            <th className="px-4 py-3 text-left text-gray-700">Active</th>
            <th className="px-4 py-3 text-left text-gray-700">Expires At</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((coupon) => (
            <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
              <td className="border-t px-4 py-3">{coupon.id}</td>
              <td className="border-t px-4 py-3">{coupon.code}</td>
              <td className="border-t px-4 py-3">
                {coupon.discount_percentage}%
              </td>
              <td className="border-t px-4 py-3">
                {coupon.is_active ? "Yes" : "No"}
              </td>
              <td className="border-t px-4 py-3">
                {coupon.expires_at || "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
