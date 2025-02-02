"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase"; // Import your Supabase client
import { Product } from "@/utils/constants";

// Admin Panel Component
export default function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Fetch products from Supabase
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;

      setProducts(data as Product[]);
    } catch (err) {
      setError("Failed to fetch products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Edit Product Functionality (updated for all fields)
  const editProduct = async (product: Product) => {
    // Prompt for all editable fields
    const newName = prompt("Enter new name:", product.name);
    const newBrand = prompt("Enter new brand:", product.brand);
    const newCategory = prompt("Enter new category:", product.category);
    const newImage = prompt("Enter new image URL:", product.image);
    const newPrice = prompt("Enter new price:", product.price.toString());
    const newOriginalPrice = prompt(
      "Enter original price (optional):",
      product.originalPrice?.toString() || ""
    );
    const newDiscountPercentage = prompt(
      "Enter discount percentage (optional):",
      product.discountPercentage?.toString() || ""
    );
    const newRating = prompt("Enter new rating:", product.rating.toString());
    const newDescription = prompt(
      "Enter new description (optional):",
      product.description || ""
    );

    // If all necessary fields are filled, update the product in Supabase
    if (
      newName &&
      newBrand &&
      newCategory &&
      newImage &&
      newPrice &&
      newRating
    ) {
      try {
        const updatedData = {
          name: newName,
          brand: newBrand,
          category: newCategory,
          image: newImage,
          price: parseFloat(newPrice),
          original_price: newOriginalPrice
            ? parseFloat(newOriginalPrice)
            : null,
          discount_percentage: newDiscountPercentage
            ? parseFloat(newDiscountPercentage)
            : null,
          rating: parseFloat(newRating),
          description: newDescription || null,
        };

        const { data, error } = await supabase
          .from("products")
          .update(updatedData)
          .eq("id", product.id);

        if (error) throw error;

        fetchProducts(); // Refresh the product list
      } catch (err) {
        console.error("Error updating product:", err);
      }
    }
  };

  // Delete Product Functionality
  const deleteProduct = async (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const { error } = await supabase.from("products").delete().eq("id", id);

        if (error) throw error;

        fetchProducts(); // Refresh the product list
      } catch (err) {
        console.error("Error deleting product:", err);
      }
    }
  };

  // Add Product Functionality
  const addProduct = async () => {
    const name = prompt("Enter product name:");
    const brand = prompt("Enter product brand:");
    const category = prompt("Enter product category:");
    const image = prompt("Enter product image URL:");
    const price = prompt("Enter product price:");
    const originalPrice = prompt("Enter original price (optional):");
    const discountPercentage = prompt("Enter discount percentage (optional):");
    const rating = prompt("Enter product rating:");
    const description = prompt("Enter product description (optional):");

    if (name && brand && category && image && price && rating) {
      try {
        const { error } = await supabase.from("products").insert([
          {
            name,
            brand,
            category,
            image,
            price: parseFloat(price),
            original_price: originalPrice ? parseFloat(originalPrice) : null,
            discount_percentage: discountPercentage
              ? parseFloat(discountPercentage)
              : null,
            rating: parseFloat(rating),
            description: description || null,
          },
        ]);

        if (error) throw error;

        fetchProducts(); // Refresh the product list
      } catch (err) {
        console.error("Error adding product:", err);
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

      {/* Add Product Button */}
      <button
        className="bg-green-500 text-white px-4 py-2 rounded mb-4"
        onClick={addProduct}
      >
        Add Product
      </button>

      {/* Loading & Error States */}
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Product Table */}
      {!loading && !error && (
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Brand</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Rating</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product: Product) => (
              <tr key={product.id}>
                <td className="border px-4 py-2">{product.id}</td>
                <td className="border px-4 py-2">{product.name}</td>
                <td className="border px-4 py-2">{product.brand}</td>
                <td className="border px-4 py-2">{product.category}</td>
                <td className="border px-4 py-2">{product.price}</td>
                <td className="border px-4 py-2">{product.rating}</td>
                <td className="border px-4 py-2">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => editProduct(product)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded ml-2"
                    onClick={() => deleteProduct(product.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
