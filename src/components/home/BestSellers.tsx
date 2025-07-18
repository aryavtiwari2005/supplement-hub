"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchBestSellers, Product } from "@/utils/constants";
import { useSelector } from "react-redux";
import { selectTheme } from "@/redux/themeSlice";
import ProductCard from "../products/ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link"; // Import the Link component

export default function BestSellers() {
  const theme = useSelector(selectTheme);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for the current visible item/page index
  const [currentIndex, setCurrentIndex] = useState(0);

  // State to hold the products in "pages" of 4 for desktop
  const [pages, setPages] = useState<Product[][]>([]);

  // Effect to fetch data and create pages for the desktop carousel
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchBestSellers();
        if (!data || data.length === 0) {
          setError("No best-selling products available.");
        } else {
          setBestSellers(data);
          // Group products into pages of 4 for the desktop carousel
          const chunkSize = 4;
          const newPages = [];
          for (let i = 0; i < data.length; i += chunkSize) {
            newPages.push(data.slice(i, i + chunkSize));
          }
          setPages(newPages);
        }
      } catch (error) {
        console.error("Error fetching best sellers:", error);
        setError("Failed to load best-selling products.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Navigation handlers
  const handleNext = (itemCount: number) => {
    setCurrentIndex((prev) => (prev + 1) % itemCount);
  };

  const handlePrev = (itemCount: number) => {
    setCurrentIndex((prev) => (prev - 1 + itemCount) % itemCount);
  };

  // Loading and Error states
  if (isLoading || error) {
    return (
      <section
        id="best-selling-supplements"
        className="container mx-auto mt-8 px-4 py-12"
      >
        <h2 className="text-3xl font-bold text-center mb-8">Best Sellers</h2>
        <div className="text-center">
          <p>{isLoading ? "Loading..." : error}</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="best-selling-supplements"
      className={`container mx-auto mt-8 sm:mt-12 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 mb-8 sm:mb-12 ${theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"
        }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2
          className={`text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 ${theme === "light" ? "text-black" : "text-white"
            }`}
        >
          Best Selling{" "}
          <span
            className={`${theme === "light" ? "text-yellow-600" : "text-yellow-400"
              }`}
          >
            Supplements
          </span>
        </h2>
      </motion.div>

      {bestSellers.length > 0 && (
        <>
          {/* --- MOBILE CAROUSEL (1 item at a time) --- */}
          <div className="md:hidden relative">
            <div className="w-full max-w-sm mx-auto overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="w-full h-full"
                >
                  <ProductCard
                    product={bestSellers[currentIndex % bestSellers.length]}
                    showCategory={true}
                    theme={theme}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            <button
              onClick={() => handlePrev(bestSellers.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full z-10"
              aria-label="Previous product"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => handleNext(bestSellers.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full z-10"
              aria-label="Next product"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* --- DESKTOP CAROUSEL (4 items at a time) --- */}
          <div className="hidden md:block relative">
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full"
                >
                  <div className="grid grid-cols-4 gap-8">
                    {pages[currentIndex % pages.length]?.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        showCategory={true}
                        theme={theme}
                      />
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            <button
              onClick={() => handlePrev(pages.length)}
              className="absolute -left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full z-10"
              aria-label="Previous page"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              onClick={() => handleNext(pages.length)}
              className="absolute -right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full z-10"
              aria-label="Next page"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          {/* --- VIEW ALL PRODUCTS BUTTON --- */}
          <div className="text-center mt-12">
            <Link
              href="/products"
              className={`inline-block px-8 py-3 rounded-lg font-semibold transition-transform duration-300 hover:scale-105 ${theme === "light"
                  ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                  : "bg-yellow-600 hover:bg-yellow-700 text-white"
                }`}
            >
              View All Products
            </Link>
          </div>
        </>
      )}
    </section>
  );
}