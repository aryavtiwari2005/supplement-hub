'use client'

import { motion } from 'framer-motion'
import { Shield, Trophy, Sparkles, Globe, Beaker, FireExtinguisher, Book } from 'lucide-react'
import { useSelector } from 'react-redux'
import { selectTheme } from '@/redux/themeSlice'
import { THEMES } from '@/utils/theme'

const WHY_FEATURES = [
  {
    icon: Shield,
    title: 'Quality Assured',
    description: 'Rigorous testing and certification for every product we sell.',
    color: 'text-green-500',
    backgroundGradient: {
      light: 'from-green-100/50 to-green-200/50',
      dark: 'from-green-500/20 to-green-900/20'
    }
  },
  {
    icon: Trophy,
    title: 'Premium Brands',
    description: 'Curated selection from top global supplement manufacturers.',
    color: 'text-yellow-500',
    backgroundGradient: {
      light: 'from-yellow-100/50 to-yellow-200/50',
      dark: 'from-yellow-500/20 to-yellow-900/20'
    }
  },
  {
    icon: Sparkles,
    title: 'Performance Optimized',
    description: 'Scientifically formulated supplements for maximum results.',
    color: 'text-purple-500',
    backgroundGradient: {
      light: 'from-purple-100/50 to-purple-200/50',
      dark: 'from-purple-500/20 to-purple-900/20'
    }
  },
  {
    icon: Globe,
    title: 'PAN India Shipping',
    description: 'Fast and reliable delivery to your doorstep, anywhere in the world.',
    color: 'text-blue-500',
    backgroundGradient: {
      light: 'from-blue-100/50 to-blue-200/50',
      dark: 'from-blue-500/20 to-blue-900/20'
    }
  }
]

export default function WhySupplementHub() {
  const theme = useSelector(selectTheme)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
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
      className={`
        relative py-16 overflow-hidden
        ${theme === 'light' ? 'bg-white' : 'bg-gray-900'}
      `}
    >
      {/* Floating Fitness Elements */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1 }}
      >
        {[
          { Icon: Beaker, animate: { x: [0, 50, 0], y: [0, -50, 0], rotate: [0, 10, -10, 0] } },
          { Icon: FireExtinguisher, animate: { x: [0, -50, 0], y: [0, 50, 0], rotate: [0, -10, 10, 0] } },
          { Icon: Book, animate: { x: [0, 50, 0], y: [0, -50, 0] } }
        ].map(({ Icon, animate }, index) => (
          <motion.div
            key={index}
            animate={{
              ...animate,
              transition: {
                duration: 10 + index * 2,
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
            className={`
              absolute 
              ${index === 0 ? 'top-10 left-10' : 
                index === 1 ? 'bottom-10 right-10' : 
                'top-1/3 right-1/4'}
            `}
          >
            <Icon 
              className={`
                w-24 h-24 
                ${theme === 'light' 
                  ? 'text-yellow-300/20' 
                  : 'text-brand-accent/20'}
              `} 
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Content */}
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
          Why Supplement <span 
            className={`
              ${theme === 'light' 
                ? 'text-yellow-600' 
                : 'text-yellow-400'}
            `}
          >
            Hub?
          </span>
        </motion.h2>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-4 gap-8"
        >
          {WHY_FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0px 15px 25px rgba(0,0,0,0.2)"
              }}
              className={`
                relative overflow-hidden 
                bg-gradient-to-br 
                ${theme === 'light' 
                  ? feature.backgroundGradient.light 
                  : feature.backgroundGradient.dark}
                p-6 rounded-2xl text-center group 
                ${theme === 'light' 
                  ? 'border-gray-200' 
                  : 'border-white/10'}
                border backdrop-blur-sm
              `}
            >
              {/* Animated Glow Effect */}
              <div 
                className={`
                  absolute inset-0 
                  ${theme === 'light' 
                    ? 'bg-gradient-to-br from-transparent to-yellow-100/20' 
                    : 'bg-gradient-to-br from-transparent to-brand-accent/10'}
                  opacity-0 group-hover:opacity-100 
                  transition-opacity duration-300
                `}
              ></div>

              <div className="relative z-10">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="flex justify-center mb-4"
                >
                  <feature.icon 
                    className={`
                      h-16 w-16 
                      ${feature.color} 
                      group-hover:scale-110 
                      transition-transform
                    `} 
                  />
                </motion.div>
                
                <h3 
                  className={`
                    text-2xl font-bold mb-3
                                        ${theme === 'light' ? 'text-black' : 'text-white'}
                  `}
                >
                  {feature.title}
                </h3>
                
                <p 
                  className={`
                    ${theme === 'light' 
                      ? 'text-gray-700' 
                      : 'text-gray-300'}
                  `}
                >
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}