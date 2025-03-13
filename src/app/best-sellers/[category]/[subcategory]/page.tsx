// app/best-sellers/[category]/[subcategory]/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, ShoppingCart } from "lucide-react";
import { Product, PRODUCTS } from "@/utils/constants";
import { useSelector } from "react-redux";
import { selectTheme } from "@/redux/themeSlice";
import { useAppDispatch } from "@/redux/hooks";
import { addToCart, removeFromCart } from "@/redux/cartSlice";
import { cartService } from "@/services/cartService";
import { useRouter, useParams } from "next/navigation";

// Utility to convert URL slug to readable title (e.g., "sport-nutrition" -> "Sport Nutrition")
const formatTitle = (slug: string) => {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function BestSellersSubcategoryPage() {
  const theme = useSelector(selectTheme);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams(); // Get dynamic params from URL
  const category = params.category as string; // e.g., "sport-nutrition"
  const subcategory = params.subcategory as string; // e.g., "protein-powder"

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState<{
    [key: number]: boolean;
  }>({});
  const [cartPopup, setCartPopup] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await PRODUCTS();
        if (!data || data.length === 0) {
          console.warn("No products found in Supabase.");
        }

        const filteredProducts = data.filter(
          (product: Product) =>
            product.category &&
            product.subcategory &&
            product.category.toLowerCase() ===
              formatTitle(category).toLowerCase() &&
            product.subcategory.toLowerCase() ===
              formatTitle(subcategory).toLowerCase()
        );
        setProducts(filteredProducts);
      } catch (err) {
        console.error(
          `Error fetching products for ${category}/${subcategory}:`,
          err
        );
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, [category, subcategory]);

  const handleAddToCart = async (product: Product) => {
    try {
      const res = await fetch("/api/user", { credentials: "include" });
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      const userId = data.user?.id;

      setIsAddingToCart((prev) => ({ ...prev, [product.id]: true }));

      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
      };

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

  const pageVariants = {
    initial: { opacity: 0, y: 50 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -50, transition: { duration: 0.5 } },
  };

  const titleVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, delay: 0.2 },
    },
  };

  const dividerVariants = {
    initial: { width: 0 },
    animate: { width: "100%", transition: { duration: 1, delay: 0.4 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
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

  if (isLoading) {
    return (
      <div
        className={`min-h-screen ${
          theme === "light" ? "bg-white" : "bg-gray-900"
        }`}
      >
        <div className="container mx-auto px-4 py-16 text-center">
          <p
            className={`${
              theme === "light" ? "text-gray-700" : "text-gray-300"
            }`}
          >
            Loading {formatTitle(subcategory)} in {formatTitle(category)}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`min-h-screen ${
        theme === "light" ? "bg-gray-50" : "bg-gray-900"
      }`}
    >
      <div className="container mx-auto px-4 py-16">
        {/* Page Title */}
        <motion.h1
          variants={titleVariants}
          className={`text-5xl font-extrabold text-center mb-6 ${
            theme === "light" ? "text-gray-800" : "text-white"
          }`}
        >
          Best{" "}
          <span
            className={`${
              theme === "light" ? "text-yellow-600" : "text-yellow-400"
            }`}
          >
            {formatTitle(subcategory)}
          </span>{" "}
          in {formatTitle(category)}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.6, delay: 0.3 } }}
          className={`text-center text-lg mb-8 ${
            theme === "light" ? "text-gray-600" : "text-gray-300"
          }`}
        >
          Discover our top-rated {formatTitle(subcategory).toLowerCase()}{" "}
          products in the {formatTitle(category)} category, loved by fitness
          enthusiasts.
        </motion.p>

        {/* Animated Divider */}
        <motion.div
          variants={dividerVariants}
          className={`h-1 mx-auto mb-12 ${
            theme === "light" ? "bg-yellow-500" : "bg-yellow-400"
          } rounded-full max-w-md`}
        />

        {/* Subcategory Description */}
        <section className="mb-12 text-center">
          <h2
            className={`text-3xl font-bold mb-4 ${
              theme === "light" ? "text-gray-800" : "text-white"
            }`}
          >
            About {formatTitle(subcategory)} in {formatTitle(category)}
          </h2>
          <p
            className={`text-lg max-w-3xl mx-auto ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            Our {formatTitle(subcategory)} products in the{" "}
            {formatTitle(category)} category are among the best-selling
            supplements, curated for their effectiveness and popularity. Whether
            you're looking to enhance muscle growth, improve recovery, or
            support overall health, these products from top brands are designed
            to deliver proven results for athletes and health-conscious
            individuals alike.
          </p>
        </section>

        {/* Products in a Flat Grid */}
        {products.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16"
          >
            {products.map((product) => (
              <motion.div
                key={product.id}
                variants={cardVariants}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)",
                }}
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
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain p-4 transition-transform duration-300 hover:scale-105"
                    unoptimized={true}
                    priority={false}
                    onError={() =>
                      console.log(`Image failed to load: ${product.image}`)
                    }
                  />
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
                    {product.brand || "N/A"}
                  </p>
                  <div className="flex justify-center items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating || 0)
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
                        ({product.rating || 0})
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
                        ₹{(product.price || 0).toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span
                          className={`ml-2 text-sm line-through ${
                            theme === "light"
                              ? "text-gray-500"
                              : "text-gray-400"
                          }`}
                        >
                          ₹{product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <motion.button
                      variants={buttonVariants}
                      initial="initial"
                      animate={
                        isAddingToCart[product.id] ? "animate" : "initial"
                      }
                      onClick={() => handleAddToCart(product)}
                      disabled={isAddingToCart[product.id]}
                      className={`p-2 rounded-full ${
                        theme === "light"
                          ? "bg-yellow-500 hover:bg-yellow-600"
                          : "bg-yellow-600 hover:bg-yellow-700"
                      } text-white transition-colors shadow-md ${
                        isAddingToCart[product.id]
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
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
            ))}
          </motion.div>
        ) : (
          <p
            className={`text-center text-lg ${
              theme === "light" ? "text-gray-600" : "text-gray-400"
            }`}
          >
            No {formatTitle(subcategory)} products in {formatTitle(category)}{" "}
            available at this time.
          </p>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: { duration: 0.6, delay: 0.2 },
          }}
          className="text-center mt-12"
        >
          <button
            onClick={() => router.push("/cart")}
            className={`px-8 py-3 rounded-full text-lg font-semibold ${
              theme === "light"
                ? "bg-yellow-500 text-black hover:bg-yellow-600"
                : "bg-yellow-600 text-white hover:bg-yellow-700"
            } transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer`}
          >
            View Full Cart
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
