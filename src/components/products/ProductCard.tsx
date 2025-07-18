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

  const cardBg = theme === "light" ? "bg-white" : "bg-gray-800";
  const textPrimary = theme === "light" ? "text-gray-800" : "text-white";
  const buttonColor =
    theme === "light"
      ? "bg-yellow-500 hover:bg-yellow-600 text-black"
      : "bg-yellow-600 hover:bg-yellow-700 text-white";
  const discountBadgeColor = "bg-red-500 text-white";

  return (
    <motion.div
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      onClick={handleProductClick}
      className={`cursor-pointer rounded-xl overflow-hidden shadow-lg transition-all duration-300 h-full flex flex-col ${isHovered ? `shadow-2xl ${cardBg} transform-gpu` : `${cardBg} shadow-md`
        }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 md:h-56 w-full flex-shrink-0 overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-500"
          style={{ transform: isHovered ? "scale(1.1)" : "scale(1)" }}
        />
        {product.discount && (
          <div
            className={`absolute top-2 left-2 ${discountBadgeColor} text-sm font-bold px-2 py-1 rounded-full`}
          >
            {product.discount}% OFF
          </div>
        )}
      </div>

      {/* The 'flex-grow' class is removed from this div, fixing the layout */}
      <div className="p-4 flex flex-col h-full">
        <div className="mb-2 flex items-start justify-between">
          <div className="flex-grow">
            {showCategory && product.category && (
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full mb-1 inline-block ${theme === "light"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-yellow-900 text-yellow-200"
                  }`}
              >
                {product.category}
              </span>
            )}
            <h3
              className={`font-bold text-base md:text-lg line-clamp-2 ${textPrimary}`}
            >
              {product.name}
            </h3>
          </div>

          {product.rating && (
            <div className="flex items-center flex-shrink-0 ml-2 bg-yellow-100 px-1.5 py-0.5 rounded-full">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="ml-0.5 text-xs font-medium text-yellow-800">
                {product.rating}
              </span>
            </div>
          )}
        </div>

        {/* This empty div pushes the price and button to the bottom */}
        <div className="flex-grow"></div>

        <div className="mb-3">
          {discountedPrice ? (
            <div className="flex items-center space-x-2">
              <span className={`font-bold text-lg md:text-xl ${textPrimary}`}>
                ₹{discountedPrice.toFixed(2)}
              </span>
              <span
                className={`text-sm line-through ${theme === "light" ? "text-gray-600" : "text-gray-300"
                  }`}
              >
                ₹{product.price.toFixed(2)}
              </span>
            </div>
          ) : (
            <span className={`font-bold text-lg md:text-xl ${textPrimary}`}>
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
            className={`w-full p-2 rounded-md text-sm mb-3 ${theme === "light"
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
            {showAddedAnimation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 flex items-center justify-center rounded-lg bg-green-600 text-white text-sm font-medium"
              >
                <CheckCircle className="w-5 h-5 mr-1" />
                Added to Cart!
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={handleAddToCart}
            disabled={isLoading}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            className={`mt-1 flex items-center justify-center w-full py-3 rounded-lg transition-all duration-300 text-base font-medium ${isLoading
                ? `${theme === "light"
                  ? "bg-gray-300 text-gray-500"
                  : "bg-gray-700 text-gray-400"
                } cursor-not-allowed`
                : `${buttonColor} shadow-md hover:shadow-lg`
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