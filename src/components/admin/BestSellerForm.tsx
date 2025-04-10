"use client";

import { useState } from "react";
import { Product } from "@/utils/constants";

interface BestSellerFormProps {
  products: Product[];
  onSubmit: (productId: number, salesCount: number) => Promise<void>;
  onClose: () => void;
}

export default function BestSellerForm({
  products,
  onSubmit,
  onClose,
}: BestSellerFormProps) {
  const [selectedProductId, setSelectedProductId] = useState<number | "">("");
  const [salesCount, setSalesCount] = useState<string>("0");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!selectedProductId) {
      setError("Please select a product");
      return;
    }
    const count = parseInt(salesCount);
    if (isNaN(count) || count < 0) {
      setError("Sales count must be a non-negative number");
      return;
    }
    try {
      await onSubmit(selectedProductId as number, count);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to add best seller");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add Best Seller</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Select Product
            </label>
            <select
              value={selectedProductId}
              onChange={(e) =>
                setSelectedProductId(parseInt(e.target.value) || "")
              }
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">-- Select a Product --</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.brand})
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Sales Count (optional)
            </label>
            <input
              type="number"
              value={salesCount}
              onChange={(e) => setSalesCount(e.target.value)}
              min="0"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="Enter sales count"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
