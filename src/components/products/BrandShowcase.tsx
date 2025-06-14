"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useSelector } from "react-redux";
import { selectTheme } from "@/redux/themeSlice";

// Define 10 premium fitness supplement brands
const BRANDS = [
  { name: "Optimum Nutrition", logo: "/images/products/brands/on.png" },
  { name: "GNC", logo: "/images/products/brands/gnc.png" },
  { name: "Muscleblaze", logo: "/images/products/brands/muscleblaze.png" },
  { name: "Isopure", logo: "/images/products/brands/isopure.png" },
  { name: "Animal", logo: "/images/products/brands/animal.jpg" },
];

export default function BrandShowcase() {
  const theme = useSelector(selectTheme);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 120,
      },
    },
    hover: {
      scale: 1.08,
      rotate: [0, -3, 3, -3, 0],
      boxShadow:
        theme === "light"
          ? "0 10px 20px rgba(0, 0, 0, 0.15)"
          : "0 10px 20px rgba(255, 255, 255, 0.15)",
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, delay: 0.5 },
    },
  };

  return (
    <section
      className={`
        relative py-20 overflow-hidden
        ${theme === "light" ? "bg-gray-50" : "bg-gray-950"}
      `}
    >
      {/* Background Gradient and Particle Effect */}
      <div
        className={`
          absolute inset-0
          ${theme === "light"
            ? "bg-gradient-to-br from-yellow-100/20 via-white to-yellow-200/20"
            : "bg-gradient-to-br from-yellow-900/10 via-gray-900 to-yellow-800/10"}
          pointer-events-none
        `}
      >
        <div
          className={`
            absolute inset-0 opacity-20
            bg-[url('/textures/particle.png')] bg-repeat
            animate-subtle-move
          `}
          style={{
            backgroundSize: "200px 200px",
            animation: "subtle-move 20s linear infinite",
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className={`
            text-4xl sm:text-5xl font-extrabold text-center mb-16
            ${theme === "light" ? "text-gray-900" : "text-white"}
            tracking-tight
          `}
        >
          Our <span className="relative">
            Premium Brands
            <span
              className={`
                absolute -bottom-2 left-0 w-full h-1
                ${theme === "light" ? "bg-yellow-500" : "bg-yellow-400"}
                rounded-full
              `}
            />
          </span>
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8"
        >
          {BRANDS.map((brand, index) => (
            <motion.div
              key={brand.name}
              variants={itemVariants}
              whileHover="hover"
              className="relative group"
            >
              <div
                className={`
                  relative p-6 sm:p-8 rounded-2xl flex justify-center items-center
                  ${theme === "light" ? "bg-white/80" : "bg-gray-800/80"}
                  backdrop-blur-md border
                  ${theme === "light" ? "border-gray-200" : "border-gray-700"}
                  h-48 sm:h-56 w-full
                  transition-all duration-300
                  group-hover:ring-4
                  ${theme === "light" ? "group-hover:ring-yellow-200" : "group-hover:ring-yellow-500/50"}
                `}
              >
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={180}
                  height={180}
                  className={`
                    max-h-36 max-w-full object-contain
                    ${theme === "light" ? "opacity-90" : "opacity-80"}
                    group-hover:opacity-100
                    transition-all duration-500
                  `}
                />
                {/* Tooltip for Brand Name */}
                <div
                  className={`
                    absolute -top-10 left-1/2 transform -translate-x-1/2
                    hidden group-hover:block
                    bg-gray-900 text-white text-xs font-medium
                    px-3 py-1 rounded-lg
                    opacity-0 group-hover:opacity-100
                    transition-opacity duration-300
                  `}
                >
                  {brand.name}
                </div>
                {/* Premium Badge for Top Brands */}
                {index < 3 && (
                  <motion.div
                    variants={badgeVariants}
                    className={`
                      absolute top-2 right-2
                      bg-gradient-to-r from-yellow-400 to-yellow-600
                      text-white text-xs font-semibold
                      px-2 py-1 rounded-full
                    `}
                  >
                    Top Brand
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* CSS for Particle Animation */}
      <style jsx>{`
        @keyframes subtle-move {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 200px 200px;
          }
        }
      `}</style>
    </section>
  );
}