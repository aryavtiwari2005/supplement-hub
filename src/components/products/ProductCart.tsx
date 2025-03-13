// components/products/ProductCard.tsx
"use client";

import React from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/cartSlice";
import { ShoppingCart } from "lucide-react";
import { cartService } from "@/services/cartService";
import { useRouter } from "next/navigation";

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
  const dispatch = useDispatch();
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = React.useState(
    product.variants?.[0] || ""
  );
  const [userId, setUserId] = React.useState<number | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUserId(data.user?.id);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleAddToCart = async () => {
    if (isLoading) return; // Wait until user fetch completes
    if (!userId) {
      router.push("/login"); // Redirect to login if not authenticated
      return;
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      selectedVariant,
      image: product.image,
    };

    try {
      dispatch(addToCart(cartItem));
      await cartService.addToCart(userId, cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <div className="p-4 rounded-lg bg-white">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover rounded-lg mb-4"
      />
      <h3 className="font-semibold text-black">{product.name}</h3>
      <p className="text-gray-600">${product.price.toFixed(2)}</p>
      {product.variants && (
        <select
          value={selectedVariant}
          onChange={(e) => setSelectedVariant(e.target.value)}
          className="mt-2 p-2 rounded bg-gray-100"
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
        disabled={isLoading}
        className={`mt-4 flex items-center justify-center w-full py-2 rounded ${
          isLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-yellow-500 text-black hover:bg-yellow-600"
        }`}
      >
        <ShoppingCart className="w-5 h-5 mr-2" />
        {isLoading ? "Loading..." : "Add to Cart"}
      </button>
    </div>
  );
};

export default ProductCard;
