"use client";

import { useSelector } from "react-redux";
import { selectTheme } from "@/redux/themeSlice";
import ProductCard from "@/components/products/ProductCard";
import { motion } from "framer-motion";

const formatBrandName = (slug: string) => {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function BrandsPage() {
  const theme = useSelector(selectTheme);
  const brands = [
    {
      id: 1,
      slug: "muscleblaze",
      name: formatBrandName("muscleblaze"),
      image: "/brands/muscleblaze.png",
    },
    {
      id: 2,
      slug: "optimum-nutrition",
      name: formatBrandName("optimum-nutrition"),
      image: "/brands/optimum-nutrition.png",
    },
    {
      id: 3,
      slug: "myprotein",
      name: formatBrandName("myprotein"),
      image: "/brands/myprotein.png",
    },
    {
      id: 4,
      slug: "dymatize",
      name: formatBrandName("dymatize"),
      image: "/brands/dymatize.png",
    },
  ];

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
      <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12">
        <motion.h1
          variants={titleVariants}
          className={`text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-4 sm:mb-6 ${
            theme === "light" ? "text-gray-800" : "text-white"
          }`}
        >
          Shop by{" "}
          <span
            className={`${
              theme === "light" ? "text-yellow-600" : "text-yellow-400"
            }`}
          >
            Brand
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.6, delay: 0.3 } }}
          className={`text-center text-sm sm:text-base md:text-lg mb-8 sm:mb-12 ${
            theme === "light" ? "text-gray-600" : "text-gray-300"
          }`}
        >
          Discover top supplement brands for your fitness journey
        </motion.p>

        <motion.div
          variants={dividerVariants}
          className={`h-1 mx-auto mb-8 sm:mb-12 ${
            theme === "light" ? "bg-yellow-500" : "bg-yellow-400"
          } rounded-full max-w-xs sm:max-w-md`}
        />

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.6 } }}
          className="mb-12 sm:mb-16"
        >
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 auto-rows-fr">
            {brands.map((brand) => (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.4 },
                }}
                className="h-full"
              >
                <a href={`/brands/${brand.slug}`}>
                  <ProductCard
                    product={{
                      id: brand.id,
                      name: brand.name,
                      image: brand.image || "/placeholder.jpg",
                      price: 0, // No price for brand card
                      category: "Brand", // Optional category
                    }}
                    showCategory={false}
                    theme={theme}
                  />
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
