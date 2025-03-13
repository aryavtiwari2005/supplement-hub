import { motion } from "framer-motion";

interface CouponFormState {
  code: string;
  discountPercentage: string;
  isActive: boolean;
  expiresAt: string;
}

interface CouponFormProps {
  couponForm: CouponFormState;
  setCouponForm: (form: CouponFormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const formVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

export default function CouponForm({
  couponForm,
  setCouponForm,
  onSubmit,
  onClose,
}: CouponFormProps) {
  return (
    <motion.div
      variants={formVariants}
      initial="hidden"
      animate="visible"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add Coupon</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Coupon Code</label>
            <input
              type="text"
              value={couponForm.code}
              onChange={(e) =>
                setCouponForm({ ...couponForm, code: e.target.value })
              }
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Discount Percentage</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={couponForm.discountPercentage}
              onChange={(e) =>
                setCouponForm({
                  ...couponForm,
                  discountPercentage: e.target.value,
                })
              }
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Active</label>
            <input
              type="checkbox"
              checked={couponForm.isActive}
              onChange={(e) =>
                setCouponForm({ ...couponForm, isActive: e.target.checked })
              }
              className="h-5 w-5 text-blue-600"
            />
          </div>
          <div>
            <label className="block text-gray-700">Expires At (Optional)</label>
            <input
              type="datetime-local"
              value={couponForm.expiresAt}
              onChange={(e) =>
                setCouponForm({ ...couponForm, expiresAt: e.target.value })
              }
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Add Coupon
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
