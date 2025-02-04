'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Play, ChevronRight } from 'lucide-react'
import { useSelector } from 'react-redux'
import { selectTheme } from '@/redux/themeSlice'
import { THEMES } from '@/utils/theme'

export default function HeroSection() {
  const theme = useSelector(selectTheme)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  const scrollToBestSellers = () => {
    const bestSellersSection = document.getElementById('best-selling-supplements')
    if (bestSellersSection) {
      bestSellersSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
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
    <div 
      className={`
        relative w-full min-h-screen overflow-hidden flex items-center justify-center
        ${theme === 'light' 
          ? 'bg-white text-black' 
          : 'bg-gray-900 text-white'}
      `}
    >
      {/* Animated Background with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          initial={{ scale: 1 }}
          animate={{ 
            scale: [1, 1.05, 1],
            transition: { 
              duration: 10, 
              repeat: Infinity, 
              repeatType: "loop" 
            }
          }}
          className="absolute inset-0"
        >
          <video 
            src="/videos/fitness-background.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-60"
          >
            Your browser does not support the video tag.
          </video>
        </motion.div>
        <div 
          className={`
            absolute inset-0 
            ${theme === 'light' 
              ? 'bg-gradient-to-r from-yellow-100/40 to-yellow-200/50' 
              : 'bg-gradient-to-r from-gray-800/40 to-gray-900/50'}
          `}
        ></div>
      </div>

      {/* Content Container */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 container mx-auto flex flex-col items-center justify-center text-center px-6 py-24"
      >
        {/* Text Content */}
        <motion.div variants={itemVariants} className="space-y-6 max-w-3xl">
          <motion.h1 
            variants={itemVariants}
            className={`
              text-5xl md:text-6xl font-bold leading-tight
              ${theme === 'light' ? 'text-black' : 'text-white'}
            `}
          >
            Transform Your <br />
            <span 
              className={`
                ${theme === 'light' 
                  ? 'text-yellow-600' 
                  : 'text-yellow-400'}
              `}
            >
              Fitness
            </span> Journey
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className={`
              text-xl max-w-xl mx-auto
              ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}
            `}
          >
            Unlock your potential with premium, scientifically-formulated supplements designed to elevate your performance and wellness.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex justify-center space-x-4"
          >
            <motion.button 
              onClick={scrollToBestSellers}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                px-8 py-3 rounded-full font-semibold flex items-center space-x-2 group
                ${theme === 'light' 
                  ? 'bg-yellow-500 text-black hover:bg-yellow-600' 
                  : 'bg-yellow-600 text-white hover:bg-yellow-700'}
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
                px-8 py-3 rounded-full flex items-center space-x-2 group
                ${theme === 'light' 
                  ? 'bg-gray-200 text-black hover:bg-gray-300' 
                  : 'bg-gray-700 text-white hover:bg-gray-600'}
              `}
            >
              <Play 
                className={`
                  h-6 w-6 
                  ${theme === 'light' ? 'text-yellow-600' : 'text-yellow-400'}
                  group-hover:animate-pulse
                `} 
              />
              <span>Watch Promo</span>
            </motion.button>
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
            ${theme === 'light' 
              ? 'bg-black/80' 
              : 'bg-black/90'}
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
  )
}