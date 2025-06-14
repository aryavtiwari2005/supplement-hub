"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { selectTheme } from "@/redux/themeSlice";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/products/ProductCard";
import { createClient } from "@supabase/supabase-js";

// Define Product interface to match ProductCardProps
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category?: string;
  rating?: number;
  discount?: number;
  description?: string;
  variants?: string[];
}

// Define type for Supabase query response
interface BestSellerProduct {
  product_id: number;
  sales_count: number;
  products: {
    id: number;
    name: string;
    price: number;
    image: string;
    category: string | null;
    rating: number | null;
    discount_percentage: number | null;
    description: string | null;
  };
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function BestSellingProteinsPage() {
  const theme = useSelector(selectTheme);
  const router = useRouter();
  const [bestSellingProteins, setBestSellingProteins] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBestSellingProteins = async () => {
      try {
        // Fetch best-selling products
        const { data, error } = await supabase
          .from("best_seller_products")
          .select(`
            product_id,
            sales_count,
            products (
              id,
              name,
              price,
              image,
              category,
              rating,
              discount_percentage,
              description
            )
          `)
          .order("sales_count", { ascending: false })
          .returns<BestSellerProduct[]>(); // Explicitly type the response

        if (error) {
          throw error;
        }

        console.log("Raw Supabase data:", data);

        if (!data || data.length === 0) {
          console.warn("No best-selling products found in Supabase.");
          setBestSellingProteins([]);
          return;
        }

        // Map data to Product interface
        const products: Product[] = data.map((item) => {
          console.log("Mapping item:", item);
          return {
            id: item.products.id,
            name: item.products.name,
            price: item.products.price,
            image: item.products.image || "/placeholder.jpg",
            category: item.products.category ?? undefined,
            rating: item.products.rating ?? undefined,
            discount: item.products.discount_percentage ?? undefined,
            description: item.products.description ?? undefined,
            variants: [], // Placeholder for variants
          };
        });

        console.log("Mapped products:", products);
        setBestSellingProteins(products);
      } catch (err) {
        console.error("Error fetching Best Selling Proteins:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadBestSellingProteins();
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
        className={`min-h-screen ${theme === "light" ? "bg-white" : "bg-gray-900"
          }`}
      >
        <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12 text-center">
          <p
            className={`text-sm sm:text-base ${theme === "light" ? "text-gray-700" : "text-gray-300"
              }`}
          >
            Loading Best Selling Proteins...
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
          Best Selling{" "}
          <span
            className={`${theme === "light" ? "text-yellow-600" : "text-yellow-400"
              }`}
          >
            Proteins
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.6, delay: 0.3 } }}
          className={`text-center text-sm sm:text-base md:text-lg mb-8 sm:mb-12 ${theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
        >
          Explore our top-performing protein supplements loved by fitness
          enthusiasts
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
            About Best Selling Proteins
          </h2>
          <p
            className={`text-sm sm:text-base max-w-3xl mx-auto ${theme === "light" ? "text-gray-600" : "text-gray-300"
              }`}
          >
            Our Best Selling Proteins category features the most popular and
            highly effective protein supplements in the market. Curated based on
            customer demand and performance, these products include top-tier
            whey proteins, isolates, and blends from leading brands. Designed to
            maximize muscle growth, enhance recovery, and support daily
            nutrition, these proteins have earned their spot as favorites among
            gym-goers, athletes, and health-conscious individuals.
          </p>
        </section>

        {bestSellingProteins.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.6 } }}
            className="mb-12 sm:mb-16"
          >
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 auto-rows-fr">
              {bestSellingProteins.map((product, index) => (
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
          </motion.div>
        ) : (
          <p
            className={`text-center text-base sm:text-lg ${theme === "light" ? "text-gray-600" : "text-gray-400"
              }`}
          >
            No Best Selling Proteins available at this time.
          </p>
        )}
      </div>
    </motion.div>
  );
}