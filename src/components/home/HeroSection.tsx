"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Play,
  ChevronRight,
  ChevronLeft,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useSelector } from "react-redux";
import { selectTheme } from "@/redux/themeSlice";

export default function HeroSection() {
  const theme = useSelector(selectTheme);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Background images array
  const backgroundImages = [
    "/images/hero/1.png",
    "/images/hero/2.png",
    "/images/hero/3.png",
  ];

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const scrollToBestSellers = () => {
    const bestSellersSection = document.getElementById(
      "best-selling-supplements"
    );
    if (bestSellersSection) {
      bestSellersSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + backgroundImages.length) % backgroundImages.length
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
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

  return (
    <div className="relative w-full min-h-screen">
      {/* Background carousel container */}
      <div className="absolute inset-0 overflow-hidden">
        {backgroundImages.map((image, index) => (
          <motion.div
            key={image}
            initial={{ opacity: 0 }}
            animate={{
              opacity: currentSlide === index ? 1 : 0,
              scale: currentSlide === index ? [1, 1.05, 1] : 1,
            }}
            transition={{
              opacity: { duration: 1.5 },
              scale: {
                duration: 10,
                repeat: Infinity,
                repeatType: "loop",
              },
            }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url("${image}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              zIndex: currentSlide === index ? 1 : 0,
            }}
          />
        ))}

        {/* Theme-based overlay */}
        <div
          className={`absolute inset-0 z-10 ${
            theme === "light"
              ? "bg-gradient-to-r from-yellow-100/30 to-yellow-200/40"
              : "bg-gradient-to-r from-gray-800/30 to-gray-900/40"
          }`}
        />
      </div>

      {/* Carousel navigation buttons */}
      <div className="absolute inset-y-0 left-4 z-20 flex items-center">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={prevSlide}
          className={`p-2 rounded-full ${
            theme === "light"
              ? "bg-white/30 hover:bg-white/50 text-black"
              : "bg-black/30 hover:bg-black/50 text-white"
          }`}
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-8 w-8" />
        </motion.button>
      </div>

      <div className="absolute inset-y-0 right-4 z-20 flex items-center">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={nextSlide}
          className={`p-2 rounded-full ${
            theme === "light"
              ? "bg-white/30 hover:bg-white/50 text-black"
              : "bg-black/30 hover:bg-black/50 text-white"
          }`}
          aria-label="Next slide"
        >
          <ChevronRight className="h-8 w-8" />
        </motion.button>
      </div>

      {/* Carousel indicators */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center space-x-2">
        {backgroundImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              currentSlide === index
                ? theme === "light"
                  ? "bg-yellow-500"
                  : "bg-yellow-600"
                : theme === "light"
                ? "bg-gray-300"
                : "bg-gray-600"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Content Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-20 container mx-auto flex flex-col items-center justify-center min-h-screen px-6 py-24"
      >
        {/* Glass Effect Container */}
        <motion.div
          variants={itemVariants}
          className={`
            backdrop-blur-md rounded-3xl p-8 md:p-12
            ${
              theme === "light"
                ? "bg-white/20 shadow-lg border border-white/30"
                : "bg-black/20 shadow-lg border border-gray-600/30"
            }
          `}
        >
          {/* Text Content */}
          <motion.div variants={itemVariants} className="space-y-6 max-w-3xl">
            <motion.h1
              variants={itemVariants}
              className={`
                text-5xl md:text-6xl font-bold leading-tight
                ${theme === "light" ? "text-black" : "text-white"}
              `}
            >
              Transform Your <br />
              <span
                className={`
                  ${theme === "light" ? "text-yellow-600" : "text-yellow-400"}
                `}
              >
                Fitness
              </span>{" "}
              Journey
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className={`
                text-xl max-w-xl mx-auto
                ${theme === "light" ? "text-gray-700" : "text-gray-300"}
              `}
            >
              Unlock your potential with premium, scientifically-formulated
              supplements designed to elevate your performance and wellness.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row justify-center gap-4 sm:space-x-4"
            >
              <motion.button
                onClick={scrollToBestSellers}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  px-8 py-3 rounded-full font-semibold flex items-center justify-center space-x-2 group
                  ${
                    theme === "light"
                      ? "bg-yellow-500 text-black hover:bg-yellow-600"
                      : "bg-yellow-600 text-white hover:bg-yellow-700"
                  }
                `}
              >
                <span>Shop Now</span>
                <ChevronRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsVideoPlaying(true)}
                className={`
                  px-8 py-3 rounded-full flex items-center justify-center space-x-2 group
                  ${
                    theme === "light"
                      ? "bg-gray-200 text-black hover:bg-gray-300"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }
                `}
              >
                <Play
                  className={`
                    h-6 w-6 
                    ${theme === "light" ? "text-yellow-600" : "text-yellow-400"}
                    group-hover:animate-pulse
                  `}
                />
                <span>Watch Promo</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Video Modal */}
      {isVideoPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`
            fixed inset-0 z-50 
            ${theme === "light" ? "bg-black/80" : "bg-black/90"}
            flex justify-center items-center
          `}
          onClick={() => setIsVideoPlaying(false)}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-4xl w-full aspect-video"
          >
            <video
              controls
              autoPlay
              className="w-full h-full rounded-2xl shadow-2xl"
            >
              <source src="/videos/supplement-promo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
