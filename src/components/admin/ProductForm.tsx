// components/admin/ProductForm.tsx
import { useState } from "react";
import { motion } from "framer-motion";

const formVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

interface ProductFormState {
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  image: File | null;
  imageUrl: string | null; // For preview
  imagePath: string; // For URL input
  price: string;
  originalPrice: string;
  discountPercentage: string;
  rating: string;
  description: string;
}

interface ProductFormProps {
  productForm: ProductFormState;
  setProductForm: (form: ProductFormState) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isEditing: boolean;
}

export default function ProductForm({
  productForm,
  setProductForm,
  onSubmit,
  onClose,
  isEditing,
}: ProductFormProps) {
  const [imageInputType, setImageInputType] = useState<"upload" | "url">(
    "upload"
  );

  return (
    <motion.div
      variants={formVariants}
      initial="hidden"
      animate="visible"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">
            {isEditing ? "Edit Product" : "Add Product"}
          </h2>
        </div>

        <div className="overflow-y-auto p-6 space-y-6 flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1 */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand *
                </label>
                <input
                  type="text"
                  value={productForm.brand}
                  onChange={(e) =>
                    setProductForm({ ...productForm, brand: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm({ ...productForm, category: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory *
                </label>
                <input
                  type="text"
                  value={productForm.subcategory}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      subcategory: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm({ ...productForm, price: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Original Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={productForm.originalPrice}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      originalPrice: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Percentage
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={productForm.discountPercentage}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      discountPercentage: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating (0-5) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={productForm.rating}
                  onChange={(e) =>
                    setProductForm({ ...productForm, rating: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Full width fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image Source
            </label>
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => setImageInputType("upload")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  imageInputType === "upload"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Upload Image
              </button>
              <button
                type="button"
                onClick={() => setImageInputType("url")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  imageInputType === "url"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Use URL
              </button>
            </div>

            {imageInputType === "upload" ? (
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setProductForm({
                      ...productForm,
                      image: file,
                      imageUrl: file
                        ? URL.createObjectURL(file)
                        : productForm.imageUrl,
                      imagePath: "",
                    });
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                {productForm.imageUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-1">Preview:</p>
                    <img
                      src={productForm.imageUrl}
                      alt="Preview"
                      className="max-h-40 object-contain border rounded-lg"
                    />
                  </div>
                )}
              </div>
            ) : (
              <input
                type="text"
                value={productForm.imagePath}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    imagePath: e.target.value,
                    image: null,
                  })
                }
                placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={productForm.description}
              onChange={(e) =>
                setProductForm({ ...productForm, description: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
              rows={4}
            />
          </div>
        </div>

        {/* Form actions */}
        <div className="p-4 border-t flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={onSubmit}
            className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isEditing ? "Update" : "Add"} Product
          </button>
        </div>
      </div>
    </motion.div>
  );
}
