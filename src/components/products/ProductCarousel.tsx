// components/products/ProductCarousel.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, ShoppingCart } from "lucide-react";
import { Product, PRODUCTS } from "@/utils/constants";
import { useAppDispatch } from "@/redux/hooks";
import { addToCart, removeFromCart } from "@/redux/cartSlice";
import { useSelector } from "react-redux";
import { selectTheme } from "@/redux/themeSlice";
import { cartService } from "@/services/cartService";
import { useRouter } from "next/navigation";

interface ProductCarouselProps {
  products?: Product[]; // Optional prop to pass pre-filtered products (e.g., from MuscleBlazePage)
}

export default function ProductCarousel({
  products: propProducts,
}: ProductCarouselProps) {
  const theme = useSelector(selectTheme);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState<{
    [key: number]: boolean;
  }>({});
  const [cartPopup, setCartPopup] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const loadProductsAndUser = async () => {
      try {
        const res = await fetch("/api/user", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUserId(data.user?.id);
        }

        if (propProducts) {
          // Use pre-filtered products if provided (e.g., from MuscleBlazePage)
          setProducts(propProducts);
        } else {
          // Otherwise, fetch all products from Supabase
          const data = await PRODUCTS();
          setProducts(data);
        }
      } catch (err) {
        console.error("Error fetching products or user:", err);
      }
    };
    loadProductsAndUser();
  }, [propProducts]);

  // Group products by category, including all products (no limit)
  const groupedProducts = products.reduce((acc, product) => {
    const cat = product.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product); // Add every product, no limit or duplicate check
    return acc;
  }, {} as { [key: string]: Product[] });

  const categories = Object.keys(groupedProducts);

  const handleAddToCart = async (product: Product) => {
    if (!userId) {
      router.push("/login");
      return;
    }

    setIsAddingToCart((prev) => ({ ...prev, [product.id]: true }));

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    };

    try {
      dispatch(addToCart(cartItem));
      await cartService.addToCart(userId, cartItem);
      setCartPopup((prev) => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setCartPopup((prev) => ({ ...prev, [product.id]: false }));
      }, 2000);
    } catch (error) {
      console.error("Failed to add product to cart:", error);
      dispatch(removeFromCart(product.id));
    } finally {
      setIsAddingToCart((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    animate: { scale: [1, 1.2, 1], transition: { duration: 0.3 } },
  };

  const popupVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
  };

  const carouselVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div
      className={`container mx-auto px-4 ${
        theme === "light" ? "bg-gray-50" : "bg-gray-900"
      }`}
    >
      {categories.length === 0 ? (
        <p
          className={`text-center text-lg ${
            theme === "light" ? "text-gray-600" : "text-gray-400"
          }`}
        >
          No products available.
        </p>
      ) : (
        categories.map((cat, index) => (
          <motion.section
            key={cat}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.2 }}
            className={`mb-20 rounded-xl ${
              theme === "light"
                ? "bg-gradient-to-b from-white to-gray-100"
                : "bg-gradient-to-b from-gray-800 to-gray-700"
            }`}
          >
            <div className="mb-8 text-center p-10">
              <h2
                className={`text-4xl font-extrabold ${
                  theme === "light" ? "text-gray-800" : "text-white"
                } tracking-tight`}
              >
                {cat}
              </h2>
              <p
                className={`mt-2 text-lg ${
                  theme === "light" ? "text-gray-600" : "text-gray-300"
                }`}
              >
                Discover our top {cat.toLowerCase()} products
              </p>
            </div>
            <motion.div
              variants={carouselVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 pb-10"
            >
              {groupedProducts[cat].map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  handleAddToCart={handleAddToCart}
                  buttonVariants={buttonVariants}
                  popupVariants={popupVariants}
                  isAddingToCart={isAddingToCart}
                  cartPopup={cartPopup}
                />
              ))}
            </motion.div>
          </motion.section>
        ))
      )}
    </div>
  );
}

function ProductCard({
  product,
  handleAddToCart,
  buttonVariants,
  popupVariants,
  isAddingToCart,
  cartPopup,
}: {
  product: Product;
  handleAddToCart: (product: Product) => void;
  buttonVariants: any;
  popupVariants: any;
  isAddingToCart: { [key: number]: boolean };
  cartPopup: { [key: number]: boolean };
}) {
  const theme = useSelector(selectTheme);
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => setImageError(true);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)" }}
      className={`relative overflow-hidden rounded-xl ${
        theme === "light" ? "bg-white" : "bg-gray-700"
      } shadow-md transition-all duration-300`}
    >
      {product.discountPercentage && (
        <div
          className={`absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold z-10 shadow`}
        >
          {product.discountPercentage}% OFF
        </div>
      )}

      <div className="relative w-full h-64 bg-gradient-to-b from-gray-100 to-gray-200">
        {!imageError ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-4 transition-transform duration-300 hover:scale-105"
            onError={handleImageError}
            unoptimized={true}
            priority={false}
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center ${
              theme === "light" ? "bg-gray-200" : "bg-gray-600"
            } text-gray-400 text-sm`}
          >
            Image Not Available
          </div>
        )}
      </div>

      <div className="p-5">
        <h3
          className={`text-lg font-bold ${
            theme === "light" ? "text-gray-800" : "text-white"
          } mb-1 truncate`}
        >
          {product.name}
        </h3>
        <p
          className={`text-sm ${
            theme === "light" ? "text-gray-600" : "text-gray-300"
          } mb-2`}
        >
          {product.brand}
        </p>
        <div className="flex justify-center items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span
              className={`ml-1 text-sm ${
                theme === "light" ? "text-gray-600" : "text-gray-400"
              }`}
            >
              ({product.rating})
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center relative">
          <div>
            <span
              className={`text-xl font-semibold ${
                theme === "light" ? "text-gray-800" : "text-white"
              }`}
            >
              ₹{product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span
                className={`ml-2 text-sm line-through ${
                  theme === "light" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                ₹{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <motion.button
            variants={buttonVariants}
            initial="initial"
            animate={isAddingToCart[product.id] ? "animate" : "initial"}
            onClick={() => handleAddToCart(product)}
            disabled={isAddingToCart[product.id]}
            className={`p-2 rounded-full ${
              theme === "light"
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-yellow-600 hover:bg-yellow-700"
            } text-white transition-colors shadow-md ${
              isAddingToCart[product.id] ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
          </motion.button>

          {cartPopup[product.id] && (
            <motion.div
              variants={popupVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className={`absolute top-[-40px] left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-lg shadow-lg z-20`}
            >
              Item added to cart!
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
