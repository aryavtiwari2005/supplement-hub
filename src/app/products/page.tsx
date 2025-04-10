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

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(products.length / productsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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

        <motion.div
          variants={dividerVariants}
          className={`h-1 mx-auto mb-12 ${
            theme === "light" ? "bg-yellow-500" : "bg-yellow-400"
          } rounded-full max-w-md`}
        />

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.6 } }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-fr">
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

          {products.length === 0 && (
            <div className="text-center my-12">
              <p
                className={`text-xl ${
                  theme === "light" ? "text-gray-700" : "text-gray-300"
                }`}
              >
                No products found. Check back soon!
              </p>
            </div>
          )}
        </motion.div>

        {products.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.6, delay: 0.4 } }}
            className="flex justify-center mt-8 mb-12"
          >
            <nav className="flex items-center">
              <button
                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 mx-1 rounded-md ${
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
                      className={`w-10 h-10 mx-1 rounded-md flex items-center justify-center transition-colors duration-300 ${
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
                      className={`w-10 h-10 mx-1 flex items-center justify-center ${
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
                className={`px-4 py-2 mx-1 rounded-md ${
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
