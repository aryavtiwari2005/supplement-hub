// components/products/ProductCard.tsx
"use client";

import React from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/cartSlice";
import { ShoppingCart } from "lucide-react";
import { useTheme } from "@/components/Header";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
    variants?: string[];
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const [selectedVariant, setSelectedVariant] = React.useState(
    product.variants?.[0] || ""
  );

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        selectedVariant,
      })
    );
  };

  return (
    <div
      className={`p-4 rounded-lg ${
        theme === "light" ? "bg-white" : "bg-gray-900"
      }`}
    >
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover rounded-lg mb-4"
      />
      <h3
        className={`font-semibold ${
          theme === "light" ? "text-black" : "text-white"
        }`}
      >
        {product.name}
      </h3>
      <p
        className={`${
          theme === "light" ? "text-gray-600" : "text-gray-400"
        }`}
      >
        ${product.price.toFixed(2)}
      </p>
      {product.variants && (
        <select
          value={selectedVariant}
          onChange={(e) => setSelectedVariant(e.target.value)}
          className={`mt-2 p-2 rounded ${
            theme === "light" ? "bg-gray-100" : "bg-gray-800"
          }`}
        >
          {product.variants.map((variant) => (
            <option key={variant} value={variant}>
              {variant}
            </option>
          ))}
        </select>
      )}
      <button
        onClick={handleAddToCart}
        className={`mt-4 flex items-center justify-center w-full py-2 rounded ${
          theme === "light"
            ? "bg-yellow-500 text-black hover:bg-yellow-600"
            : "bg-yellow-600 text-white hover:bg-yellow-700"
        }`}
      >
        <ShoppingCart className="w-5 h-5 mr-2" />
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;