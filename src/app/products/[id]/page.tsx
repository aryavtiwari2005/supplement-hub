// src/app/products/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { selectTheme } from "@/redux/themeSlice";
import { addToCart } from "@/redux/cartSlice";
import { cartService } from "@/services/cartService";
import {
  ShoppingCart,
  Star,
  ChevronLeft,
  Share2,
  CheckCircle,
} from "lucide-react";

export default function ProductDetailPage() {
  const { id } = useParams();
  const theme = useSelector(selectTheme);
  const router = useRouter();
  const dispatch = useDispatch();

  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [userId, setUserId] = useState<number | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [showAddedAnimation, setShowAddedAnimation] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  // State for the share button text
  const [shareText, setShareText] = useState("Share");

  useEffect(() => {
    const fetchProductAndUser = async () => {
      try {
        // Fetch product details
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const productData = await res.json();
        setProduct(productData);

        if (productData.variants && productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
        }

        // Fetch related products in the same category
        const relatedRes = await fetch(
          `/api/products?category=${productData.category}&limit=4&exclude=${id}`
        );
        if (relatedRes.ok) {
          const relatedData = await relatedRes.json();
          setRelatedProducts(relatedData);
        }

        // Fetch user
        const userRes = await fetch("/api/user", { credentials: "include" });
        if (userRes.ok) {
          const userData = await userRes.json();
          setUserId(userData.user?.id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProductAndUser();
    }
  }, [id]);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const discountedPrice = product?.discount_percentage
    ? product.price - product.price * (product.discount_percentage / 100)
    : null;

  const handleAddToCart = async () => {
    if (isLoading || !product) return;
    if (!userId) {
      router.push("/login");
      return;
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      price: discountedPrice || product.price,
      quantity: quantity,
      selectedVariant: selectedVariant,
      image: product.image,
    };

    try {
      dispatch(addToCart(cartItem));
      await cartService.addToCart(userId, cartItem);
      setShowAddedAnimation(true);
      setTimeout(() => setShowAddedAnimation(false), 2000);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const goBack = () => {
    router.back();
  };

  // --- NEW: Function to handle sharing ---
  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out this product: ${product.name}`,
      url: window.location.href, // This gets the current page URL
    };

    // Use the Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareText("Link Copied!");
        setTimeout(() => setShareText("Share"), 2000); // Reset text after 2 seconds
      } catch (error) {
        console.error("Failed to copy link:", error);
        alert("Failed to copy link to clipboard.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme === "light" ? "bg-gray-50" : "bg-gray-900"}`}>
        <div className="container mx-auto px-4 py-16 flex justify-center items-center">
          <p className={`${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`min-h-screen ${theme === "light" ? "bg-gray-50" : "bg-gray-900"}`}>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className={`text-3xl font-bold mb-4 ${theme === "light" ? "text-gray-800" : "text-white"}`}>
            Product Not Found
          </h1>
          <p className={`mb-8 ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={goBack}
            className={`px-4 py-2 rounded-md ${theme === "light"
                ? "bg-yellow-500 text-black hover:bg-yellow-600"
                : "bg-yellow-600 text-white hover:bg-yellow-700"
              } transition-colors duration-300`}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`min-h-screen ${theme === "light" ? "bg-gray-50" : "bg-gray-900"
        }`}
    >
      <div className="container mx-auto px-4 py-8 md:py-16">
        <button
          onClick={goBack}
          className={`flex items-center mb-6 ${theme === "light"
              ? "text-gray-700 hover:text-gray-900"
              : "text-gray-300 hover:text-white"
            } transition-colors`}
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Products
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.5 } }}
            className="relative overflow-hidden rounded-lg shadow-lg"
          >
            <div
              className="h-[500px] w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${product.image})` }}
            />
            {product.discount_percentage && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded">
                {product.discount_percentage}% OFF
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{
              opacity: 1,
              x: 0,
              transition: { duration: 0.5, delay: 0.1 },
            }}
          >
            <div className="flex items-center mb-3">
              <span className={`text-sm font-medium px-2 py-0.5 rounded mr-2 ${theme === "light" ? "bg-yellow-100 text-yellow-800" : "bg-yellow-900 text-yellow-200"}`}>
                {product.category}
              </span>
              {product.subcategory && (
                <span className={`text-sm px-2 py-0.5 rounded ${theme === "light" ? "bg-gray-100 text-gray-800" : "bg-gray-800 text-gray-200"}`}>
                  {product.subcategory}
                </span>
              )}
            </div>

            <h1 className={`text-3xl font-bold mb-2 ${theme === "light" ? "text-gray-900" : "text-white"}`}>
              {product.name}
            </h1>

            <p className={`text-lg mb-4 ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>
              By <span className="font-medium">{product.brand}</span>
            </p>

            {product.rating && (
              <div className="flex items-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} className={i < Math.floor(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                ))}
                <span className={`ml-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                  {product.rating} out of 5
                </span>
              </div>
            )}

            <div className="mb-6">
              {discountedPrice ? (
                <div className="flex items-center">
                  <span className={`text-3xl font-bold ${theme === "light" ? "text-gray-900" : "text-white"}`}>
                    ₹{discountedPrice.toFixed(2)}
                  </span>
                  <span className={`ml-3 text-lg line-through ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                    ₹{product.price.toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className={`text-3xl font-bold ${theme === "light" ? "text-gray-900" : "text-white"}`}>
                  ₹{product.price.toFixed(2)}
                </span>
              )}
            </div>

            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <label className={`block mb-2 font-medium ${theme === "light" ? "text-gray-700" : "text-gray-200"}`}>
                  Options
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant: string) => (
                    <button key={variant} onClick={() => setSelectedVariant(variant)} className={`px-4 py-2 rounded-md border transition-colors ${selectedVariant === variant ? `${theme === "light" ? "border-yellow-500 bg-yellow-50 text-yellow-700" : "border-yellow-600 bg-yellow-900 bg-opacity-20 text-yellow-300"}` : `${theme === "light" ? "border-gray-300 text-gray-700 hover:border-gray-400" : "border-gray-700 text-gray-300 hover:border-gray-500"}`}`}>
                      {variant}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8">
              <label className={`block mb-2 font-medium ${theme === "light" ? "text-gray-700" : "text-gray-200"}`}>
                Quantity
              </label>
              <div className="flex items-center">
                <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} className={`w-10 h-10 flex items-center justify-center rounded-l-md ${theme === "light" ? "bg-gray-100 text-gray-700 border border-gray-300" : "bg-gray-800 text-gray-300 border border-gray-700"} ${quantity <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                  -
                </button>
                <div className={`w-14 h-10 flex items-center justify-center ${theme === "light" ? "bg-white border-y border-gray-300 text-gray-900" : "bg-gray-800 border-y border-gray-700 text-white"}`}>
                  {quantity}
                </div>
                <button onClick={() => handleQuantityChange(1)} disabled={quantity >= 10} className={`w-10 h-10 flex items-center justify-center rounded-r-md ${theme === "light" ? "bg-gray-100 text-gray-700 border border-gray-300" : "bg-gray-800 text-gray-300 border border-gray-700"} ${quantity >= 10 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                  +
                </button>
              </div>
            </div>

            <div className="relative mb-8">
              {showAddedAnimation ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`absolute inset-0 flex items-center justify-center rounded-md ${theme === "light" ? "bg-green-500" : "bg-green-600"} text-white`}>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Added to Cart!
                </motion.div>
              ) : (
                <button onClick={handleAddToCart} className={`w-full py-3 rounded-md transition-colors flex items-center justify-center ${theme === "light" ? "bg-yellow-500 text-black hover:bg-yellow-600" : "bg-yellow-600 text-white hover:bg-yellow-700"}`}>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </button>
              )}
            </div>

            {/* UPDATED: Action Button with onClick handler */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={handleShare}
                className={`flex items-center px-4 py-2 rounded-md transition-all duration-200 ${theme === "light"
                    ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    : "bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700"
                  }`}
              >
                <Share2 className="w-5 h-5 mr-2" />
                {shareText}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Rest of the component is unchanged */}
        <div className="mb-16">
          <div className="flex border-b mb-6">
            {["description", "details", "reviews"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-medium capitalize transition-colors ${activeTab === tab ? `${theme === "light" ? "text-yellow-600 border-b-2 border-yellow-500" : "text-yellow-400 border-b-2 border-yellow-500"}` : `${theme === "light" ? "text-gray-600 hover:text-gray-900" : "text-gray-400 hover:text-white"}`}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className={theme === "light" ? "text-gray-700" : "text-gray-300"}>
            {activeTab === "description" && (
              <div>
                <h3 className={`text-xl font-semibold mb-4 ${theme === "light" ? "text-gray-900" : "text-white"}`}>
                  Product Description
                </h3>
                <p className="mb-4 leading-relaxed">
                  {product.description || "No description available for this product."}
                </p>
              </div>
            )}
            {activeTab === "details" && (
              <div>
                <h3 className={`text-xl font-semibold mb-4 ${theme === "light" ? "text-gray-900" : "text-white"}`}>
                  Product Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${theme === "light" ? "bg-white shadow" : "bg-gray-800"}`}>
                    <p className="text-sm font-medium mb-2">Brand</p>
                    <p className="mb-3">{product.brand}</p>
                    <p className="text-sm font-medium mb-2">Category</p>
                    <p className="mb-3">{product.category}</p>
                    {product.subcategory && (
                      <>
                        <p className="text-sm font-medium mb-2">Subcategory</p>
                        <p className="mb-3">{product.subcategory}</p>
                      </>
                    )}
                  </div>
                  <div className={`p-4 rounded-lg ${theme === "light" ? "bg-white shadow" : "bg-gray-800"}`}>
                    <p className="text-sm font-medium mb-2">Product ID</p>
                    <p className="mb-3">#{product.id}</p>
                    {product.variants && product.variants.length > 0 && (
                      <>
                        <p className="text-sm font-medium mb-2">Available Options</p>
                        <p className="mb-3">{product.variants.join(", ")}</p>
                      </>
                    )}
                    <p className="text-sm font-medium mb-2">Rating</p>
                    <p className="mb-3">{product.rating} / 5</p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "reviews" && (
              <div>
                <h3 className={`text-xl font-semibold mb-4 ${theme === "light" ? "text-gray-900" : "text-white"}`}>
                  Customer Reviews
                </h3>
                <p>Review functionality coming soon.</p>
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div>
            <h2 className={`text-2xl font-bold mb-6 ${theme === "light" ? "text-gray-900" : "text-white"}`}>
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <motion.div key={relatedProduct.id} whileHover={{ y: -5, transition: { duration: 0.2 } }} className={`cursor-pointer rounded-lg overflow-hidden shadow-md ${theme === "light" ? "bg-white" : "bg-gray-800"}`} onClick={() => router.push(`/products/${relatedProduct.id}`)}>
                  <div className="h-48 relative overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 hover:scale-105" style={{ backgroundImage: `url(${relatedProduct.image})` }} />
                  </div>
                  <div className="p-4">
                    <h3 className={`font-semibold text-lg mb-1 ${theme === "light" ? "text-black" : "text-white"}`}>
                      {relatedProduct.name}
                    </h3>
                    <p className={`text-sm mb-2 ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>
                      {relatedProduct.brand}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${theme === "light" ? "text-black" : "text-white"}`}>
                        ₹{relatedProduct.price.toFixed(2)}
                      </span>
                      {relatedProduct.rating && (
                        <div className="flex items-center">
                          <Star size={16} className="text-yellow-400 fill-yellow-400" />
                          <span className={`ml-1 text-sm ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                            {relatedProduct.rating}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}