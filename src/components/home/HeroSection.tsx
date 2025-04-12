"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, ShoppingCart } from "lucide-react";
import { useSelector } from "react-redux";
import { selectTheme } from "@/redux/themeSlice";
import { supabase } from "@/utils/supabase";
import Link from "next/link";

interface SummerHealthProduct {
  id: number;
  product_id: number;
  added_at: string;
  products: Product;
}

interface FeaturedBrand {
  id: number;
  brand_name: string;
  added_at: string;
}

interface Banner {
  id: number;
  image_url: string;
  created_at: string;
}

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  image: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  rating: number;
  description?: string;
}

export default function HeroSection() {
  const theme = useSelector(selectTheme);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [banners, setBanners] = useState<string[]>([]);
  const [summerProducts, setSummerProducts] = useState<Product[]>([]);
  const [brandProducts, setBrandProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch banners
      const { data: bannerData, error: bannerError } = await supabase
        .from("banners")
        .select("image_url")
        .order("created_at", { ascending: true });
      if (bannerError) console.error("Error fetching banners:", bannerError);
      setBanners(
        bannerData?.map((b: { image_url: string }) => b.image_url) || []
      );

      // Fetch Summer Health products
      const { data: summerData, error: summerError } = await supabase
        .from("summer_health_products")
        .select(
          `
          products!summer_health_products_product_id_fkey (
            id,
            name,
            brand,
            category,
            subcategory,
            image,
            price,
            original_price,
            discount_percentage,
            rating,
            description
          )
        `
        )
        .limit(4);
      if (summerError)
        console.error("Error fetching summer products:", summerError);
      setSummerProducts(
        (summerData as unknown as { products: Product }[])?.map(
          (sh) => sh.products
        ) || []
      );

      // Fetch Featured Brands and one product per brand
      const { data: brandData, error: brandError } = await supabase
        .from("featured_brands")
        .select("brand_name")
        .order("added_at", { ascending: true })
        .limit(6);
      if (brandError) console.error("Error fetching brands:", brandError);
      if (brandData) {
        const brandNames = brandData.map(
          (b: { brand_name: string }) => b.brand_name
        );
        console.log("Fetched brand names:", brandNames);

        // Alternative using raw SQL for better control
        const { data: productsDataRaw, error: rawError } = await supabase.rpc(
          "get_one_product_per_brand",
          { brand_names: brandNames }
        );
        if (rawError) console.error("Error fetching brand products:", rawError);
        console.log("Brand products data:", productsDataRaw);
        setBrandProducts((productsDataRaw as Product[]) || []);
      }
    };

    fetchData();

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="mt-16 sm:mt-20">
        <div className="relative mx-auto max-w-6xl rounded-lg overflow-hidden">
          <div className="relative w-full" style={{ paddingTop: "40%" }}>
            {banners.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: currentSlide === index ? 1 : 0 }}
                transition={{ opacity: { duration: 0.5 } }}
                className="absolute inset-0"
                style={{ zIndex: currentSlide === index ? 1 : 0 }}
              >
                <img
                  src={image}
                  alt={`Banner ${index + 1}`}
                  className="w-full h-full object-contain"
                />
              </motion.div>
            ))}
          </div>

          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/40 text-white p-1 rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/40 text-white p-1 rounded-full"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center space-x-1.5">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentSlide === index
                    ? "bg-white"
                    : "bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div
        className={`w-full py-10 px-4 ${
          theme === "light" ? "bg-gray-50" : "bg-gray-900"
        }`}
      >
        <div className="container mx-auto max-w-6xl">
          {/* Categories and Values Section - unchanged */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 ${
              theme === "light" ? "text-gray-800" : "text-gray-200"
            }`}
          >
            {/* ... unchanged premium quality, science-backed, fast delivery sections ... */}
          </div>

          <div
            className={`mt-10 p-6 rounded-xl ${
              theme === "light"
                ? "bg-gradient-to-r from-yellow-50 to-orange-50"
                : "bg-gradient-to-r from-gray-800 to-gray-700"
            }`}
          >
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-6 md:mb-0">
                <h2
                  className={`text-2xl font-bold mb-3 ${
                    theme === "light" ? "text-gray-800" : "text-white"
                  }`}
                >
                  Summer Health Special
                </h2>
                <p
                  className={`mb-6 ${
                    theme === "light" ? "text-gray-600" : "text-gray-300"
                  }`}
                >
                  Boost your fitness journey with our curated summer health
                  bundle.
                </p>
                <Link href="/products">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-2 px-6 rounded-md"
                  >
                    Explore Bundle
                  </motion.button>
                </Link>
              </div>
              <div className="md:w-1/2 md:pl-8">
                <div className="grid grid-cols-2 gap-4">
                  {summerProducts.map((product, index) => (
                    <div
                      key={index}
                      className={`rounded-lg p-3 ${
                        theme === "light" ? "bg-white shadow-sm" : "bg-gray-800"
                      }`}
                    >
                      <div className="h-28 sm:h-32 flex items-center justify-center mb-2 overflow-hidden rounded-md">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-center font-medium text-sm">
                        {product.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <h2
              className={`text-xl font-bold mb-6 text-center ${
                theme === "light" ? "text-gray-800" : "text-white"
              }`}
            >
              Shop By Brand
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {brandProducts.map((product, index) => (
                <a
                  href={`/brands/${product.brand
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  key={index}
                  className={`block rounded-lg overflow-hidden shadow-sm ${
                    theme === "light" ? "bg-white" : "bg-gray-800"
                  }`}
                >
                  <div className="h-32 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.brand}
                      className="w-full h-full object-contain transition-transform duration-500 hover:scale-110"
                    />
                  </div>
                  <div className="p-3 text-center">
                    <h3 className="font-medium text-sm">{product.brand}</h3>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
