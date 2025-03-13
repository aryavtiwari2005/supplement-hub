// src/app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { Product } from "@/utils/constants";
import { motion } from "framer-motion";

interface Coupon {
  id: string;
  code: string;
  discount_percentage: number;
  is_active: boolean;
  expires_at?: string;
}

interface ProductFormState {
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  image: string;
  price: string;
  originalPrice: string;
  discountPercentage: string;
  rating: string;
  description: string;
}

export default function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"products" | "coupons">(
    "products"
  );
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [productForm, setProductForm] = useState<ProductFormState>({
    name: "",
    brand: "",
    category: "",
    subcategory: "",
    image: "",
    price: "",
    originalPrice: "",
    discountPercentage: "",
    rating: "",
    description: "",
  });

  const [couponForm, setCouponForm] = useState({
    code: "",
    discountPercentage: "",
    isActive: true,
    expiresAt: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*");
      if (productError)
        throw new Error(`Product fetch error: ${productError.message}`);
      setProducts(productData as Product[]);

      const { data: couponData, error: couponError } = await supabase
        .from("coupons")
        .select("*");
      if (couponError)
        throw new Error(`Coupon fetch error: ${couponError.message}`);
      setCoupons(couponData as Coupon[]);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    try {
      const productData = {
        name: productForm.name.trim(),
        brand: productForm.brand.trim(),
        category: productForm.category.trim(),
        subcategory: productForm.subcategory.trim(),
        image: productForm.image.trim(),
        price: parseFloat(productForm.price),
        original_price: productForm.originalPrice
          ? parseFloat(productForm.originalPrice)
          : null,
        discount_percentage: productForm.discountPercentage
          ? parseFloat(productForm.discountPercentage)
          : null,
        rating: parseFloat(productForm.rating),
        description: productForm.description.trim() || null,
      };

      // Validate numeric fields
      if (isNaN(productData.price) || isNaN(productData.rating)) {
        throw new Error("Price and Rating must be valid numbers.");
      }
      if (
        productData.discount_percentage &&
        (productData.discount_percentage < 0 ||
          productData.discount_percentage > 100)
      ) {
        throw new Error("Discount percentage must be between 0 and 100.");
      }

      let result;
      if (editingProduct) {
        result = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);
      } else {
        result = await supabase.from("products").insert([productData]);
      }

      if (result.error) {
        throw new Error(`Insert/Update error: ${result.error.message}`);
      }

      setProductForm({
        name: "",
        brand: "",
        category: "",
        subcategory: "",
        image: "",
        price: "",
        originalPrice: "",
        discountPercentage: "",
        rating: "",
        description: "",
      });
      setEditingProduct(null);
      setShowProductForm(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to save product");
      console.error("Error saving product:", err);
    }
  };

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const couponData = {
        code: couponForm.code.toUpperCase().trim(),
        discount_percentage: parseFloat(couponForm.discountPercentage),
        is_active: couponForm.isActive,
        expires_at: couponForm.expiresAt || null,
      };

      if (
        isNaN(couponData.discount_percentage) ||
        couponData.discount_percentage < 0 ||
        couponData.discount_percentage > 100
      ) {
        throw new Error(
          "Discount percentage must be a number between 0 and 100."
        );
      }

      const { error } = await supabase.from("coupons").insert([couponData]);
      if (error) throw new Error(`Insert error: ${error.message}`);

      setCouponForm({
        code: "",
        discountPercentage: "",
        isActive: true,
        expiresAt: "",
      });
      setShowCouponForm(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to save coupon");
      console.error("Error saving coupon:", err);
    }
  };

  const deleteProduct = async (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) throw new Error(`Delete error: ${error.message}`);
        fetchData();
      } catch (err: any) {
        setError(err.message || "Failed to delete product");
        console.error("Error deleting product:", err);
      }
    }
  };

  const editProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || "",
      brand: product.brand || "",
      category: product.category || "",
      subcategory: product.subcategory || "",
      image: product.image || "",
      price: product.price ? product.price.toString() : "0",
      originalPrice: product.originalPrice
        ? product.originalPrice.toString()
        : "",
      discountPercentage: product.discountPercentage
        ? product.discountPercentage.toString()
        : "",
      rating: product.rating ? product.rating.toString() : "0",
      description: product.description || "",
    });
    setShowProductForm(true);
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
  };

  const formVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="container mx-auto p-6 bg-gray-100 min-h-screen"
    >
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2 rounded-lg font-semibold ${
            activeTab === "products"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          } transition-colors`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab("coupons")}
          className={`px-4 py-2 rounded-lg font-semibold ${
            activeTab === "coupons"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          } transition-colors`}
        >
          Coupons
        </button>
      </div>

      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {activeTab === "products" && !loading && (
        <>
          <button
            onClick={() => {
              setEditingProduct(null);
              setProductForm({
                name: "",
                brand: "",
                category: "",
                subcategory: "",
                image: "",
                price: "",
                originalPrice: "",
                discountPercentage: "",
                rating: "",
                description: "",
              });
              setShowProductForm(true);
            }}
            className="bg-green-600 text-white px-6 py-2 rounded-lg mb-6 hover:bg-green-700 transition-colors"
          >
            Add New Product
          </button>

          {showProductForm && (
            <motion.div
              variants={formVariants}
              initial="hidden"
              animate="visible"
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
                <h2 className="text-xl font-semibold mb-4">
                  {editingProduct ? "Edit Product" : "Add Product"}
                </h2>
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-700">Name</label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) =>
                        setProductForm({ ...productForm, name: e.target.value })
                      }
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Brand</label>
                    <input
                      type="text"
                      value={productForm.brand}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          brand: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Category</label>
                    <input
                      type="text"
                      value={productForm.category}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          category: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Sub Category</label>
                    <input
                      type="text"
                      value={productForm.subcategory}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          subcategory: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Image URL</label>
                    <input
                      type="text"
                      value={productForm.image}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          image: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          price: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">
                      Original Price (Optional)
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
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">
                      Discount Percentage (Optional)
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
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Rating (0-5)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={productForm.rating}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          rating: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">
                      Description (Optional)
                    </label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowProductForm(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      {editingProduct ? "Update" : "Add"} Product
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-md">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-700">ID</th>
                  <th className="px-4 py-3 text-left text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-gray-700">Brand</th>
                  <th className="px-4 py-3 text-left text-gray-700">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-gray-700">
                    Sub Category
                  </th>
                  <th className="px-4 py-3 text-left text-gray-700">Price</th>
                  <th className="px-4 py-3 text-left text-gray-700">Rating</th>
                  <th className="px-4 py-3 text-left text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="border-t px-4 py-3">{product.id}</td>
                    <td className="border-t px-4 py-3">{product.name}</td>
                    <td className="border-t px-4 py-3">
                      {product.brand || "N/A"}
                    </td>
                    <td className="border-t px-4 py-3">{product.category}</td>
                    <td className="border-t px-4 py-3">
                      {product.subcategory || "N/A"}
                    </td>
                    <td className="border-t px-4 py-3">
                      ₹{product.price.toFixed(2)}
                    </td>
                    <td className="border-t px-4 py-3">
                      {product.rating || "N/A"}
                    </td>
                    <td className="border-t px-4 py-3 space-x-2">
                      <button
                        onClick={() => editProduct(product)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
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
        </>
      )}

      {activeTab === "coupons" && !loading && !error && (
        <>
          <button
            onClick={() => setShowCouponForm(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg mb-6 hover:bg-green-700 transition-colors"
          >
            Add New Coupon
          </button>

          {/* Coupon Form */}
          {showCouponForm && (
            <motion.div
              variants={formVariants}
              initial="hidden"
              animate="visible"
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Add Coupon</h2>
                <form onSubmit={handleCouponSubmit} className="space-y-4">
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
                    <label className="block text-gray-700">
                      Discount Percentage
                    </label>
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
                        setCouponForm({
                          ...couponForm,
                          isActive: e.target.checked,
                        })
                      }
                      className="h-5 w-5 text-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">
                      Expires At (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={couponForm.expiresAt}
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          expiresAt: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowCouponForm(false)}
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
          )}

          {/* Coupon Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-md">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-700">ID</th>
                  <th className="px-4 py-3 text-left text-gray-700">Code</th>
                  <th className="px-4 py-3 text-left text-gray-700">
                    Discount %
                  </th>
                  <th className="px-4 py-3 text-left text-gray-700">Active</th>
                  <th className="px-4 py-3 text-left text-gray-700">
                    Expires At
                  </th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr
                    key={coupon.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
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
        </>
      )}
    </motion.div>
  );
}
