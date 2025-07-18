"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Product, PRODUCTS } from "@/utils/constants";
import { useSelector } from "react-redux";
import { selectTheme } from "@/redux/themeSlice";
import { useRouter, useParams } from "next/navigation";
import ProductCard from "@/components/products/ProductCard";

const formatTitle = (slug: string) => {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function BestSellersSubcategoryPage() {
  const theme = useSelector(selectTheme);
  const router = useRouter();
  const params = useParams();
  const category = params.category as string;
  const subcategory = params.subcategory as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        className={`min-h-screen ${theme === "light" ? "bg-white" : "bg-gray-900"
          }`}
      >
        <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12 text-center">
          <p
            className={`text-sm sm:text-base ${theme === "light" ? "text-gray-700" : "text-gray-300"
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
      className={`min-h-screen ${theme === "light" ? "bg-gray-50" : "bg-gray-900"
        }`}
    >
      <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12">
        <motion.h1
          variants={titleVariants}
          className={`text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-4 sm:mb-6 ${theme === "light" ? "text-gray-800" : "text-white"
            }`}
        >
          Best{" "}
          <span
            className={`${theme === "light" ? "text-yellow-600" : "text-yellow-400"
              }`}
          >
            {formatTitle(subcategory)}
          </span>{" "}
          in {formatTitle(category)}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.6, delay: 0.3 } }}
          className={`text-center text-sm sm:text-base md:text-lg mb-8 sm:mb-12 ${theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
        >
          Discover our top-rated {formatTitle(subcategory).toLowerCase()}{" "}
          products in the {formatTitle(category)} category, loved by fitness
          enthusiasts.
        </motion.p>

        <motion.div
          variants={dividerVariants}
          className={`h-1 mx-auto mb-8 sm:mb-12 ${theme === "light" ? "bg-yellow-500" : "bg-yellow-400"
            } rounded-full max-w-xs sm:max-w-md`}
        />

        <section className="mb-8 sm:mb-12 text-center">
          <h2
            className={`text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 ${theme === "light" ? "text-gray-800" : "text-white"
              }`}
          >
            About {formatTitle(subcategory)} in {formatTitle(category)}
          </h2>
          <p
            className={`text-sm sm:text-base max-w-3xl mx-auto ${theme === "light" ? "text-gray-600" : "text-gray-300"
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

        {products.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.6 } }}
            className="mb-12 sm:mb-16"
          >
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 auto-rows-fr">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.4, delay: index * 0.05 },
                  }}
                  className="h-full"
                >
                  <ProductCard
                    product={{
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image || "/placeholder.jpg",
                      category: product.category,
                      rating: product.rating,
                      discount: product.discountPercentage,
                    }}
                    showCategory={true}
                    theme={theme}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <p
            className={`text-center text-base sm:text-lg ${theme === "light" ? "text-gray-600" : "text-gray-400"
              }`}
          >
            No {formatTitle(subcategory)} products in {formatTitle(category)}{" "}
            available at this time.
          </p>
        )}
      </div>
    </motion.div>
  );
}
