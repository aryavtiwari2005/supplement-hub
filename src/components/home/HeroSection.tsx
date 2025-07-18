"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { ChevronRight, ChevronLeft, Package } from "lucide-react";
import { useSelector } from "react-redux";
import { selectTheme } from "@/redux/themeSlice";
import { supabase } from "@/utils/supabase";
import Link from "next/link";

// Updated Banner interface to include an optional mobile image URL
interface Banner {
  id: number;
  image_url: string;
  mobile_image_url?: string | null;
}

interface FeaturedBrand {
  id: number;
  brand_name: string;
  added_at: string;
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [brandProducts, setBrandProducts] = useState<Product[]>([]);
  const [featuredBrandNames, setFeaturedBrandNames] = useState<string[]>([]);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch both desktop (image_url) and mobile (mobile_image_url) banner URLs
      const { data: bannerData, error: bannerError } = await supabase
        .from("banners")
        .select("id, image_url, mobile_image_url")
        .order("created_at", { ascending: true });

      if (bannerError) console.error("Error fetching banners:", bannerError);
      setBanners(bannerData || []);

      // Fetch Featured Brands
      const { data: brandData, error: brandError } = await supabase
        .from("featured_brands")
        .select("brand_name")
        .order("added_at", { ascending: true });
      if (brandError) console.error("Error fetching brands:", brandError);

      if (brandData) {
        const allBrandNames = brandData.map((b) => b.brand_name);
        setFeaturedBrandNames(allBrandNames);

        const { data: productsDataRaw, error: rawError } = await supabase.rpc(
          "get_one_product_per_brand",
          { brand_names: allBrandNames }
        );
        if (rawError) console.error("Error fetching brand products:", rawError);
        setBrandProducts((productsDataRaw as Product[]) || []);
      }
    };

    fetchData();

    const interval = setInterval(() => {
      if (banners.length > 0) {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const nextSlide = () => {
    if (banners.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }
  };

  const prevSlide = () => {
    if (banners.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const swipeDistance = touchStartX.current - touchEndX.current;
      const swipeThreshold = 50;
      if (swipeDistance > swipeThreshold) {
        nextSlide();
      } else if (swipeDistance < -swipeThreshold) {
        prevSlide();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const BrandCard = ({ brandName }: { brandName: string }) => {
    const product = brandProducts.find((p) => p.brand === brandName);
    return (
      <Link
        href={`/brands/${brandName.toLowerCase().replace(/\s+/g, "-")}`}
        className="flex-shrink-0 w-36 md:w-auto"
      >
        <div
          className={`block rounded-lg overflow-hidden shadow-sm h-full ${theme === "light" ? "bg-white" : "bg-gray-800"
            }`}
        >
          <div className="h-32 overflow-hidden flex items-center justify-center">
            {product ? (
              <img
                src={product.image}
                alt={product.brand}
                className="w-full h-full object-contain transition-transform duration-500 hover:scale-110"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <Package size={32} />
                <span className="text-xs font-semibold">No Image</span>
              </div>
            )}
          </div>
          <div className="p-3 text-center">
            <h3 className="font-medium text-sm truncate">{brandName}</h3>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <>
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>

      <div className="flex flex-col w-full">
        <div className="sm:mt-4">
          <div
            className="relative mx-auto w-full sm:w-[95vw] sm:max-w-[1440px] sm:rounded-lg overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* UPDATED: Replaced inline style with responsive Tailwind classes for aspect ratio */}
            <div className="relative w-full aspect-[2/1] sm:aspect-[4/1]">
              {banners.map((banner, index) => (
                <motion.div
                  key={banner.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: currentSlide === index ? 1 : 0 }}
                  transition={{ opacity: { duration: 0.5 } }}
                  className="absolute inset-0"
                  style={{ zIndex: currentSlide === index ? 1 : 0 }}
                >
                  <picture>
                    <source
                      srcSet={banner.mobile_image_url || banner.image_url}
                      media="(max-width: 640px)"
                    />
                    <img
                      src={banner.image_url}
                      alt={`Banner ${index + 1}`}
                      className="w-full h-full object-cover"
                      width={1440}
                      height={360}
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                  </picture>
                </motion.div>
              ))}
            </div>

            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/40 text-white p-1 rounded-full"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/40 text-white p-1 rounded-full"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="flex absolute bottom-3 left-0 right-0 z-10 justify-center space-x-1.5">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${currentSlide === index
                      ? "bg-white"
                      : "bg-white/30 hover:bg-white/50"
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          className={`w-full py-2 ${theme === "light" ? "bg-gray-50" : "bg-gray-900"
            }`}
        >
          <div className="container mx-auto max-w-6xl">
            <div className="mt-10">
              <h2
                className={`text-xl font-bold mb-6 text-center ${theme === "light" ? "text-gray-800" : "text-white"
                  }`}
              >
                Shop By Brand
              </h2>
              <div className="group relative w-full overflow-hidden md:overflow-visible">
                <div className="flex gap-4 md:grid md:grid-cols-6 md:animate-none group-hover:[animation-play-state:paused]">
                  <div className="flex gap-4 animate-marquee md:hidden">
                    {featuredBrandNames.map((brandName) => (
                      <BrandCard key={`${brandName}-1`} brandName={brandName} />
                    ))}
                    {featuredBrandNames.map((brandName) => (
                      <BrandCard key={`${brandName}-2`} brandName={brandName} />
                    ))}
                  </div>
                  <div className="hidden md:contents">
                    {featuredBrandNames.map((brandName) => (
                      <BrandCard key={brandName} brandName={brandName} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}