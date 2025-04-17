"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PRODUCTS } from "@/utils/constants";
import { useSelector } from "react-redux";
import { selectTheme } from "@/redux/themeSlice";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/products/ProductCard";

export default function ProductsPage() {
  const theme = useSelector(selectTheme);
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(""); // State for search input
  const [selectedCategory, setSelectedCategory] = useState("all"); // State for category filter
  const productsPerPage = 40;

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

  // Filter products based on search query and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter dropdown
  const categories = [
    "all",
    ...Array.from(new Set(products.map((product) => product.category))),
  ];

  // Pagination logic for filtered products
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

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
        <div className="container mx-auto px-4 py-8 text-center">
          <p
            className={`${
              theme === "light" ? "text-gray-700" : "text-gray-300"
            } text-sm sm:text-base`}
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
      <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12">
        <motion.h1
          variants={titleVariants}
          className={`text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-4 sm:mb-6 ${
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
          className={`text-center text-sm sm:text-base md:text-lg mb-8 sm:mb-12 ${
            theme === "light" ? "text-gray-600" : "text-gray-300"
          }`}
        >
          Premium quality products to fuel your fitness journey
        </motion.p>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
          className="mb-6 sm:mb-8 flex flex-col gap-3 sm:gap-4"
        >
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-3 py-2 text-sm sm:text-base rounded-md border ${
              theme === "light"
                ? "bg-white border-gray-300 text-gray-800 placeholder-gray-400"
                : "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`w-full px-3 py-2 text-sm sm:text-base rounded-md border ${
              theme === "light"
                ? "bg-white border-gray-300 text-gray-800"
                : "bg-gray-800 border-gray-600 text-white"
            } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>
        </motion.div>

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
            {currentProducts.map((product, index) => (
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
                  product={product}
                  showCategory={true}
                  theme={theme}
                />
              </motion.div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center my-8 sm:my-12">
              <p
                className={`text-base sm:text-xl ${
                  theme === "light" ? "text-gray-700" : "text-gray-300"
                }`}
              >
                No products match your search or filter criteria.
              </p>
            </div>
          )}
        </motion.div>

        {filteredProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.6, delay: 0.4 } }}
            className="flex justify-center mt-6 sm:mt-8 mb-8 sm:mb-12"
          >
            <nav className="flex items-center flex-wrap gap-1 sm:gap-2">
              <button
                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 mx-1 rounded-md text-sm sm:text-base ${
                  currentPage === 1
                    ? `${
                        theme === "light"
                          ? "bg-gray-200 text-gray-500"
                          : "bg-gray-700 text-gray-400"
                      } cursor-not-allowed`
                    : `${
                        theme === "light"
                          ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                      }`
                } transition-colors duration-300`}
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 &&
                    pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => paginate(pageNumber)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 mx-1 rounded-md flex items-center justify-center text-sm sm:text-base transition-colors duration-300 ${
                        currentPage === pageNumber
                          ? `${
                              theme === "light"
                                ? "bg-yellow-500 text-white"
                                : "bg-yellow-600 text-white"
                            }`
                          : `${
                              theme === "light"
                                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                            }`
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                if (
                  (pageNumber === 2 && currentPage > 3) ||
                  (pageNumber === totalPages - 1 &&
                    currentPage < totalPages - 2)
                ) {
                  return (
                    <span
                      key={pageNumber}
                      className={`w-8 h-8 sm:w-10 sm:h-10 mx-1 flex items-center justify-center text-sm sm:text-base ${
                        theme === "light" ? "text-gray-700" : "text-gray-300"
                      }`}
                    >
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                onClick={() =>
                  currentPage < totalPages && paginate(currentPage + 1)
                }
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 mx-1 rounded-md text-sm sm:text-base ${
                  currentPage === totalPages
                    ? `${
                        theme === "light"
                          ? "bg-gray-200 text-gray-500"
                          : "bg-gray-700 text-gray-400"
                      } cursor-not-allowed`
                    : `${
                        theme === "light"
                          ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                      }`
                } transition-colors duration-300`}
              >
                Next
              </button>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
