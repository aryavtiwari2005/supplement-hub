'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { BRANDS } from '@/utils/constants'
import { useSelector } from 'react-redux'
import { selectTheme } from '@/redux/themeSlice'

export default function BrandShowcase() {
  const theme = useSelector(selectTheme)

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
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 50 
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100
      }
    },
    hover: {
      scale: 1.05,
      rotate: [0, -5, 5, 0],
      transition: {
        duration: 0.3
      }
    }
  }

  return (
    <section 
      className={`
        relative py-16 overflow-hidden
        ${theme === 'light' 
          ? 'bg-white' 
          : 'bg-gray-900'}
      `}
    >
      {/* Background Gradient Overlay */}
      <div 
        className={`
          absolute inset-0 
          ${theme === 'light' 
            ? 'bg-gradient-to-br from-yellow-100/10 to-yellow-200/20' 
            : 'bg-gradient-to-br from-brand-dark-red/10 to-brand-black/20'}
          pointer-events-none
        `}
      ></div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className={`
            text-4xl font-bold text-center mb-12
            ${theme === 'light' ? 'text-black' : 'text-white'}
          `}
        >
          Our Trusted <span 
            className={`
              ${theme === 'light' 
                ? 'text-yellow-600' 
                : 'text-yellow-400'}
            `}
          >
            Brands
          </span>
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {BRANDS.map((brand) => (
            <motion.div
              key={brand.name}
              variants={itemVariants}
              whileHover="hover"
              className="relative group"
            >
              <div 
                className={`
                  p-6 rounded-2xl flex justify-center items-center 
                  ${theme === 'light' 
                    ? 'bg-gray-100' 
                    : 'bg-gray-800'}
                  backdrop-blur-sm
                  h-48 w-full
                `}
              >
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={150}
                  height={150}
                  className={`
                    max-h-32 max-w-full object-contain 
                    ${theme === 'light' 
                      ? 'grayscale-0 opacity-80' 
                      : 'grayscale group-hover:grayscale-0'}
                    group-hover:opacity-100 
                    transition-all duration-300
                  `}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}