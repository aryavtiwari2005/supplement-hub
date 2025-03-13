// app/brands/[brand]/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, ShoppingCart } from "lucide-react";
import { Product, PRODUCTS } from "@/utils/constants";
import { useSelector } from "react-redux";
import { selectTheme } from "@/redux/themeSlice";
import { useAppDispatch } from "@/redux/hooks";
import { addToCart, removeFromCart } from "@/redux/cartSlice";
import { cartService } from "@/services/cartService";
import { useRouter, useParams } from "next/navigation";

// Utility to format the brand name (e.g., "muscleblaze" -> "MuscleBlaze")
const formatBrandName = (slug: string) => {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function BrandPage() {
  const theme = useSelector(selectTheme);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams(); // Get dynamic params from URL
  const brandSlug = params.brand as string; // e.g., "muscleblaze", "optimum-nutrition"

  // Format the brand name for display
  const brandName = formatBrandName(brandSlug);

  const [brandProducts, setBrandProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState<{
    [key: number]: boolean;
  }>({});
  const [cartPopup, setCartPopup] = useState<{ [key: number]: boolean }>({});

  // Brand-specific descriptions
  const brandDescriptions: { [key: string]: string } = {
    muscleblaze: `
      MuscleBlaze is India's leading sports nutrition brand, renowned for its high-quality, affordable protein supplements tailored for fitness enthusiasts and bodybuilders. Since its inception in 2012, MuscleBlaze has offered a range of whey protein products—concentrates, isolates, and blends—designed to support muscle growth, recovery, and overall performance. With rigorous quality checks, certifications from Labdoor USA and Informed Choice UK, and a focus on enhanced absorption through digestive enzymes, MuscleBlaze proteins deliver exceptional value and efficacy. Whether you’re aiming to build lean muscle or boost endurance, MuscleBlaze has a protein for every goal.
    `,
    "optimum-nutrition": `
      Optimum Nutrition is a globally recognized leader in sports nutrition, known for its premium quality supplements since 1986. Famous for its Gold Standard 100% Whey Protein, Optimum Nutrition offers a wide range of products, including protein powders, pre-workouts, and recovery formulas. Trusted by athletes worldwide, their products are formulated to support muscle growth, enhance performance, and aid recovery, with a commitment to rigorous testing and high standards.
    `,
    // Add more brand descriptions as needed
  };

  useEffect(() => {
    const loadBrandProducts = async () => {
      try {
        const data = await PRODUCTS();
        if (!data || data.length === 0) {
          console.warn("No products found in Supabase.");
        }
        // Filter products by brand (case-insensitive)
        const filteredProducts = data.filter((product: Product) => {
          return (
            product.brand &&
            product.brand.toLowerCase() ===
              formatBrandName(brandSlug).toLowerCase()
          );
        });
        setBrandProducts(filteredProducts);
      } catch (err) {
        console.error(`Error fetching ${brandName} products:`, err);
      } finally {
        setIsLoading(false);
      }
    };
    loadBrandProducts();
  }, [brandSlug, brandName]);

  const handleAddToCart = async (product: Product) => {
    try {
      const res = await fetch("/api/user", { credentials: "include" });
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      const userId = data.user?.id;

      setIsAddingToCart((prev) => ({ ...prev, [product.id]: true }));

      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
      };

      dispatch(addToCart(cartItem));
      await cartService.addToCart(userId, cartItem);
      setCartPopup((prev) => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setCartPopup((prev) => ({ ...prev, [product.id]: false }));
      }, 2000);
    } catch (error) {
      console.error("Failed to add product to cart:", error);
      dispatch(removeFromCart(product.id));
    } finally {
      setIsAddingToCart((prev) => ({ ...prev, [product.id]: false }));
    }
  };

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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const buttonVariants = {
    initial: { scale: 1 },
    animate: { scale: [1, 1.2, 1], transition: { duration: 0.3 } },
  };

  const popupVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
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
            Loading {brandName} products...
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
          {brandName}{" "}
          <span
            className={`${
              theme === "light" ? "text-yellow-600" : "text-yellow-400"
            }`}
          >
            Protein Collection
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.6, delay: 0.3 } }}
          className={`text-center text-lg mb-8 ${
            theme === "light" ? "text-gray-600" : "text-gray-300"
          }`}
        >
          Explore premium {brandName} proteins designed for your fitness goals.
        </motion.p>

        {/* Animated Divider */}
        <motion.div
          variants={dividerVariants}
          className={`h-1 mx-auto mb-12 ${
            theme === "light" ? "bg-yellow-500" : "bg-yellow-400"
          } rounded-full max-w-md`}
        />

        {/* Brand Description */}
        <section className="mb-12 text-center">
          <h2
            className={`text-3xl font-bold mb-4 ${
              theme === "light" ? "text-gray-800" : "text-white"
            }`}
          >
            About {brandName} Proteins
          </h2>
          <p
            className={`text-lg max-w-3xl mx-auto ${
              theme === "light" ? "text-gray-600" : "text-gray-300"
            }`}
          >
            {brandDescriptions[brandSlug.toLowerCase()] ||
              `Explore a wide range of high-quality protein products from ${brandName}, designed to support your fitness journey.`}
          </p>
        </section>

        {/* Brand Products in a Flat Grid */}
        {brandProducts.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16"
          >
            {brandProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={cardVariants}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)",
                }}
                className={`relative overflow-hidden rounded-xl ${
                  theme === "light" ? "bg-white" : "bg-gray-700"
                } shadow-md transition-all duration-300`}
              >
                {product.discountPercentage && (
                  <div
                    className={`absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold z-10 shadow`}
                  >
                    {product.discountPercentage}% OFF
                  </div>
                )}

                <div className="relative w-full h-64 bg-gradient-to-b from-gray-100 to-gray-200">
                  <Image
                    src={product.image || "/placeholder.jpg"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain p-4 transition-transform duration-300 hover:scale-105"
                    unoptimized={true}
                    priority={false}
                    onError={() =>
                      console.log(`Image failed to load: ${product.image}`)
                    }
                  />
                </div>

                <div className="p-5">
                  <h3
                    className={`text-lg font-bold ${
                      theme === "light" ? "text-gray-800" : "text-white"
                    } mb-1 truncate`}
                  >
                    {product.name}
                  </h3>
                  <p
                    className={`text-sm ${
                      theme === "light" ? "text-gray-600" : "text-gray-300"
                    } mb-2`}
                  >
                    {product.brand}
                  </p>
                  <div className="flex justify-center items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating || 0)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span
                        className={`ml-1 text-sm ${
                          theme === "light" ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        ({product.rating || 0})
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center relative">
                    <div>
                      <span
                        className={`text-xl font-semibold ${
                          theme === "light" ? "text-gray-800" : "text-white"
                        }`}
                      >
                        ₹{(product.price || 0).toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span
                          className={`ml-2 text-sm line-through ${
                            theme === "light"
                              ? "text-gray-500"
                              : "text-gray-400"
                          }`}
                        >
                          ₹{product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <motion.button
                      variants={buttonVariants}
                      initial="initial"
                      animate={
                        isAddingToCart[product.id] ? "animate" : "initial"
                      }
                      onClick={() => handleAddToCart(product)}
                      disabled={isAddingToCart[product.id]}
                      className={`p-2 rounded-full ${
                        theme === "light"
                          ? "bg-yellow-500 hover:bg-yellow-600"
                          : "bg-yellow-600 hover:bg-yellow-700"
                      } text-white transition-colors shadow-md ${
                        isAddingToCart[product.id]
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <ShoppingCart className="h-5 w-5" />
                    </motion.button>

                    {cartPopup[product.id] && (
                      <motion.div
                        variants={popupVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className={`absolute top-[-40px] left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-lg shadow-lg z-20`}
                      >
                        Item added to cart!
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <p
            className={`text-center text-lg ${
              theme === "light" ? "text-gray-600" : "text-gray-400"
            }`}
          >
            No {brandName} products available at this time.
          </p>
        )}

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
