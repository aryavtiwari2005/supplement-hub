'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { StarIcon, ShoppingCartIcon } from '@heroicons/react/24/solid'
import { fetchBestSellers, Product } from '@/utils/constants'
import Image from 'next/image'
import { useSelector } from 'react-redux'
import { selectTheme } from '@/redux/themeSlice'
import { THEMES } from '@/utils/theme'

export default function BestSellers() {
  const theme = useSelector(selectTheme)
  const [BEST_SELLERS, setBestSellers] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchBestSellers();
        setBestSellers(data);
      } catch (error) {
        console.error('Error fetching best sellers:', error);
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
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100
      }
    }
  }

  return (
    <section 
      id="best-selling-supplements" 
      className={`
        container mx-auto mt-12 px-4 py-16
        ${theme === 'light' 
          ? 'bg-white text-black' 
          : 'bg-gray-900 text-white'}
      `}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 
          className={`
            text-4xl font-bold text-center mb-12
            ${theme === 'light' ? 'text-black' : 'text-white'}
          `}
        >
          Best Selling <span 
            className={`
              ${theme === 'light' 
                ? 'text-yellow-600' 
                : 'text-yellow-400'}
            `}
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
        {BEST_SELLERS.map((product) => {
          // Convert prices to INR
          const priceInINR = product.price
          const originalPriceInINR = product.originalPrice 
            ? product.originalPrice 
            : undefined

          return (
            <motion.div
              key={product.id}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0px 10px 20px rgba(0,0,0,0.2)"
              }}
              className={`
                p-6 rounded-2xl text-center relative overflow-hidden group
                ${theme === 'light' 
                  ? 'bg-gray-100 text-black' 
                  : 'bg-gray-800 text-white'}
              `}
            >
              {/* Gradient Overlay */}
              <div 
                className={`
                  absolute inset-0 
                  ${theme === 'light' 
                    ? 'bg-gradient-to-br from-transparent to-yellow-100/20' 
                    : 'bg-gradient-to-br from-transparent to-yellow-600/10'}
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300
                `}
              ></div>

              {/* Product Image */}
              <div className="relative z-10 mb-6">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={200}
                  height={200}
                  className="mx-auto h-48 object-contain transition-transform group-hover:scale-110 duration-300"
                />
              </div>

              {/* Product Details */}
              <div className="relative z-10">
                <h3 
                  className={`
                    text-xl font-bold mb-2
                    ${theme === 'light' ? 'text-black' : 'text-white'}
                  `}
                >
                  {product.name}
                </h3>
                <p 
                  className={`
                    mb-3
                    ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}
                  `}
                >
                  {product.brand}
                </p>

                {/* Rating */}
                <div className="flex justify-center items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon 
                        key={i} 
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating) 
                            ? 'text-yellow-500' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                    <span 
                      className={`
                        ml-2 
                        ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}
                      `}
                    >
                      ({product.rating})
                    </span>
                  </div>
                </div>

                {/* Price and Cart */}
                <div className="flex justify-between items-center">
                  <div>
                    <span 
                      className={`
                        text-2xl font-bold mr-2
                        ${theme === 'light' ? 'text-black' : 'text-white'}
                      `}
                    >
                      {priceInINR}
                    </span>
                    {originalPriceInINR && (
                      <span 
                        className={`
                          line-through 
                          ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}
                        `}
                      >
                        {priceInINR}
                      </span>
                    )}
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`
                      p-2 rounded-full 
                      ${theme === 'light' 
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                        : 'bg-yellow-600 text-white hover:bg-yellow-700'}
                      transition-colors
                    `}
                  >
                    <ShoppingCartIcon className="h-6 w-6" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}