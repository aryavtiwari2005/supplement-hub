"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { StarIcon, ShoppingCartIcon } from "@heroicons/react/24/solid";
import { fetchBestSellers, Product } from "@/utils/constants";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { selectTheme } from "@/redux/themeSlice";
import { addToCart, removeFromCart } from "@/redux/cartSlice";
import { cartService } from "@/services/cartService";
import { useRouter } from "next/navigation";

export default function BestSellers() {
  const theme = useSelector(selectTheme);
  const dispatch = useDispatch();
  const router = useRouter();
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState<{
    [key: number]: boolean;
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartPopup, setCartPopup] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        const userRes = await fetch("/api/user", { credentials: "include" });
        if (userRes.ok) {
          const userData = await userRes.json();
          setUserId(userData.user?.id);
        }

        const data = await fetchBestSellers();
        console.log("Fetched best sellers:", data);
        if (!data || data.length === 0) {
          setError("No best-selling products available.");
        } else {
          setBestSellers(data.slice(0, 4)); // Limit to 4 products
        }
      } catch (error) {
        console.error("Error fetching best sellers or user:", error);
        setError(
          "Failed to load best-selling products. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserAndData();
  }, []);

  const handleAddToCart = async (product: Product) => {
    if (!userId) {
      router.push("/login");
      return;
    }

    setIsAddingToCart((prev) => ({ ...prev, [product.id]: true }));

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    };

    try {
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

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
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

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid md:grid-cols-4 gap-8"
      >
        {bestSellers.slice(0, 4).map((product) => {
          // Limit to 4 products in render
          const priceInINR = product.price;
          const originalPriceInINR = product.originalPrice || undefined;

          return (
            <motion.div
              key={product.id}
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 10px 20px rgba(0,0,0,0.2)",
              }}
              className={`p-6 rounded-2xl text-center relative overflow-hidden group ${
                theme === "light"
                  ? "bg-gray-100 text-black"
                  : "bg-gray-800 text-white"
              }`}
            >
              <div
                className={`absolute inset-0 ${
                  theme === "light"
                    ? "bg-gradient-to-br from-transparent to-yellow-100/20"
                    : "bg-gradient-to-br from-transparent to-yellow-600/10"
                } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              ></div>

              <div className="relative z-10 mb-6">
                <Image
                  src={product.image}
                  alt={product.name}
                  unoptimized={true}
                  width={200}
                  height={200}
                  className="mx-auto h-48 object-contain transition-transform group-hover:scale-110 duration-300"
                />
              </div>

              <div className="relative z-10">
                <h3
                  className={`text-xl font-bold mb-2 ${
                    theme === "light" ? "text-black" : "text-white"
                  }`}
                >
                  {product.name}
                </h3>
                <p
                  className={`mb-3 ${
                    theme === "light" ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  {product.brand}
                </p>

                <div className="flex justify-center items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating)
                            ? "text-yellow-500"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span
                      className={`ml-2 ${
                        theme === "light" ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      ({product.rating})
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center relative">
                  <div>
                    <span
                      className={`text-2xl font-bold mr-2 ${
                        theme === "light" ? "text-black" : "text-white"
                      }`}
                    >
                      ₹{priceInINR}
                    </span>
                    {originalPriceInINR && (
                      <span
                        className={`line-through ${
                          theme === "light" ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        ₹{originalPriceInINR}
                      </span>
                    )}
                  </div>

                  <motion.button
                    variants={buttonVariants}
                    initial="initial"
                    animate={isAddingToCart[product.id] ? "animate" : "initial"}
                    onClick={() => handleAddToCart(product)}
                    disabled={isAddingToCart[product.id]}
                    className={`p-2 rounded-full ${
                      theme === "light"
                        ? "bg-yellow-500 text-white hover:bg-yellow-600"
                        : "bg-yellow-600 text-white hover:bg-yellow-700"
                    } transition-colors ${
                      isAddingToCart[product.id]
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <ShoppingCartIcon className="h-6 w-6" />
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
          );
        })}
      </motion.div>
    </section>
  );
}
