// src/app/products/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProductCarousel from "@/components/products/ProductCarousel";
import { PRODUCTS } from "@/utils/constants"; // Removed PRODUCT_CATEGORIES
import { useSelector } from "react-redux";
import { selectTheme } from "@/redux/themeSlice";
import { useRouter } from "next/navigation";

export default function ProductsPage() {
  const theme = useSelector(selectTheme);
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]); // Using any[] since Product type might not be needed here
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await PRODUCTS();
        console.log("Fetched products:", data);
        if (!data || data.length === 0) {
          console.warn("No products found in Supabase.");
        }
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

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
            Loading products...
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
          Discover Our{" "}
          <span
            className={`${
              theme === "light" ? "text-yellow-600" : "text-yellow-400"
            }`}
          >
            Supplement Collection
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.6, delay: 0.3 } }}
          className={`text-center text-lg mb-12 ${
            theme === "light" ? "text-gray-600" : "text-gray-300"
          }`}
        >
          Premium quality products to fuel your fitness journey
        </motion.p>

        {/* Animated Divider */}
        <motion.div
          variants={dividerVariants}
          className={`h-1 mx-auto mb-12 ${
            theme === "light" ? "bg-yellow-500" : "bg-yellow-400"
          } rounded-full max-w-md`}
        />

        {/* Single Product Carousel for All Categories */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.6 } }}
          className="mb-16"
        >
          <ProductCarousel /> {/* No category prop needed */}
        </motion.div>

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
            } transition-all duration-300 shadow-lg hover:shadow-xl`}
          >
            View Full Cart
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
