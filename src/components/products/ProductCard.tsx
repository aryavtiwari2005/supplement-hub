"use client";
import React from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "@/redux/cartSlice";
import { ShoppingCart, Star, CheckCircle } from "lucide-react";
import { cartService } from "@/services/cartService";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
    category?: string;
    rating?: number;
    variants?: string[];
    discount?: number;
    description?: string;
  };
  showCategory?: boolean;
  theme?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showCategory = false,
  theme = "light",
}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = React.useState(
    product.variants?.[0] || ""
  );
  const [userId, setUserId] = React.useState<number | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isHovered, setIsHovered] = React.useState(false);
  const [showAddedAnimation, setShowAddedAnimation] = React.useState(false);

  const discountedPrice = product.discount
    ? product.price - product.price * (product.discount / 100)
    : null;

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

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;
    if (!userId) {
      router.push("/login");
      return;
    }
    const cartItem = {
      id: product.id,
      name: product.name,
      price: discountedPrice || product.price,
      quantity: 1,
      selectedVariant,
      image: product.image,
    };
    try {
      dispatch(addToCart(cartItem));
      await cartService.addToCart(userId, cartItem);
      setShowAddedAnimation(true);
      setTimeout(() => setShowAddedAnimation(false), 1500);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const handleProductClick = () => {
    router.push(`/products/${product.id}`);
  };

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={handleProductClick}
      className={`cursor-pointer p-0 rounded-lg overflow-hidden shadow-md transition-all duration-300 h-full flex flex-col ${
        isHovered
          ? `shadow-xl ${theme === "light" ? "bg-white" : "bg-gray-800"}`
          : `${theme === "light" ? "bg-white" : "bg-gray-800"}`
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-64 w-full flex-shrink-0 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-500"
          style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
        />
        {product.discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {product.discount}% OFF
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        {showCategory && product.category && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded mb-2 inline-block ${
              theme === "light"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-yellow-900 text-yellow-200"
            }`}
          >
            {product.category}
          </span>
        )}

        <div className="flex justify-between items-start mb-2">
          <h3
            className={`font-semibold text-lg ${
              theme === "light" ? "text-black" : "text-white"
            }`}
          >
            {product.name}
          </h3>
          {product.rating && (
            <div className="flex items-center">
              <Star size={16} className="text-yellow-400 fill-yellow-400" />
              <span
                className={`ml-1 text-sm ${
                  theme === "light" ? "text-gray-700" : "text-gray-300"
                }`}
              >
                {product.rating}
              </span>
            </div>
          )}
        </div>

        {product.description && (
          <p
            className={`text-sm mb-3 line-clamp-2 flex-grow ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            {product.description}
          </p>
        )}

        <div className="mt-2 mb-3">
          {discountedPrice ? (
            <div className="flex items-center">
              <span
                className={`font-bold text-lg ${
                  theme === "light" ? "text-black" : "text-white"
                }`}
              >
                ₹{discountedPrice.toFixed(2)}
              </span>
              <span
                className={`ml-2 text-sm line-through ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                ₹{product.price.toFixed(2)}
              </span>
            </div>
          ) : (
            <span
              className={`font-bold text-lg ${
                theme === "light" ? "text-black" : "text-white"
              }`}
            >
              ₹{product.price.toFixed(2)}
            </span>
          )}
        </div>

        {product.variants && product.variants.length > 0 && (
          <select
            value={selectedVariant}
            onChange={(e) => {
              e.stopPropagation();
              setSelectedVariant(e.target.value);
            }}
            className={`w-full p-2 rounded text-sm mb-3 ${
              theme === "light"
                ? "bg-gray-100 text-gray-800 border border-gray-200"
                : "bg-gray-700 text-white border border-gray-600"
            }`}
          >
            {product.variants.map((variant) => (
              <option key={variant} value={variant}>
                {variant}
              </option>
            ))}
          </select>
        )}

        <div className="relative mt-auto">
          <AnimatePresence>
            {showAddedAnimation ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`absolute inset-0 flex items-center justify-center rounded-md ${
                  theme === "light" ? "bg-green-500" : "bg-green-600"
                } text-white`}
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Added to Cart!
              </motion.div>
            ) : null}
          </AnimatePresence>

          <motion.button
            onClick={handleAddToCart}
            disabled={isLoading}
            whileTap={{ scale: 0.95 }}
            className={`mt-2 flex items-center justify-center w-full py-2.5 rounded-md transition-colors duration-300 ${
              isLoading
                ? `${
                    theme === "light"
                      ? "bg-gray-300 text-gray-500"
                      : "bg-gray-700 text-gray-400"
                  } cursor-not-allowed`
                : `${
                    theme === "light"
                      ? "bg-yellow-500 text-black hover:bg-yellow-600"
                      : "bg-yellow-600 text-white hover:bg-yellow-700"
                  }`
            }`}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {isLoading ? "Loading..." : "Add to Cart"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
