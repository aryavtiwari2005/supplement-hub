import { Product } from "@/utils/constants";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

export default function ProductTable({
  products,
  onEdit,
  onDelete,
}: ProductTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow-md">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-gray-700">ID</th>
            <th className="px-4 py-3 text-left text-gray-700">Name</th>
            <th className="px-4 py-3 text-left text-gray-700">Brand</th>
            <th className="px-4 py-3 text-left text-gray-700">Category</th>
            <th className="px-4 py-3 text-left text-gray-700">Sub Category</th>
            <th className="px-4 py-3 text-left text-gray-700">Price</th>
            <th className="px-4 py-3 text-left text-gray-700">Rating</th>
            <th className="px-4 py-3 text-left text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
              <td className="border-t px-4 py-3">{product.id}</td>
              <td className="border-t px-4 py-3">{product.name}</td>
              <td className="border-t px-4 py-3">{product.brand || "N/A"}</td>
              <td className="border-t px-4 py-3">{product.category}</td>
              <td className="border-t px-4 py-3">
                {product.subcategory || "N/A"}
              </td>
              <td className="border-t px-4 py-3">
                ₹{product.price.toFixed(2)}
              </td>
              <td className="border-t px-4 py-3">{product.rating || "N/A"}</td>
              <td className="border-t px-4 py-3 space-x-2">
                <button
                  onClick={() => onEdit(product)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(product.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
