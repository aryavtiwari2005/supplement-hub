"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchBestSellers, Product } from "@/utils/constants";
import { useSelector } from "react-redux";
import { selectTheme } from "@/redux/themeSlice";
import ProductCard from "../products/ProductCard";

export default function BestSellers() {
  const theme = useSelector(selectTheme);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchBestSellers();
        console.log("Fetched best sellers:", data);
        if (!data || data.length === 0) {
          setError("No best-selling products available.");
        } else {
          setBestSellers(data);
        }
      } catch (error) {
        console.error("Error fetching best sellers:", error);
        setError(
          "Failed to load best-selling products. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  if (isLoading) {
    return (
      <section
        id="best-selling-supplements"
        className={`container mx-auto mt-12 px-4 py-16 mb-12 ${
          theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"
        }`}
      >
        <h2
          className={`text-4xl font-bold text-center mb-12 ${
            theme === "light" ? "text-black" : "text-white"
          }`}
        >
          Best Selling{" "}
          <span
            className={`${
              theme === "light" ? "text-yellow-600" : "text-yellow-400"
            }`}
          >
            Supplements
          </span>
        </h2>
        <div className="text-center">
          <p>Loading best sellers...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        id="best-selling-supplements"
        className={`container mx-auto mt-12 px-4 py-16 mb-12 ${
          theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"
        }`}
      >
        <h2
          className={`text-4xl font-bold text-center mb-12 ${
            theme === "light" ? "text-black" : "text-white"
          }`}
        >
          Best Selling{" "}
          <span
            className={`${
              theme === "light" ? "text-yellow-600" : "text-yellow-400"
            }`}
          >
            Supplements
          </span>
        </h2>
        <div className="text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="best-selling-supplements"
      className={`container mx-auto mt-12 px-4 py-16 mb-12 ${
        theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2
          className={`text-4xl font-bold text-center mb-12 ${
            theme === "light" ? "text-black" : "text-white"
          }`}
        >
          Best Selling{" "}
          <span
            className={`${
              theme === "light" ? "text-yellow-600" : "text-yellow-400"
            }`}
          >
            Supplements
          </span>
        </h2>
      </motion.div>

      {bestSellers.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-4 gap-8"
        >
          {bestSellers.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                category: product.category,
                rating: product.rating,
                discount: product.discountPercentage || undefined,
                description: product.description || undefined,
              }}
              showCategory={true}
              theme={theme}
            />
          ))}
        </motion.div>
      ) : (
        <div className="text-center">
          <p>No best-selling products available at this time.</p>
        </div>
      )}
    </section>
  );
}
