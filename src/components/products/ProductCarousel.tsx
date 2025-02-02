'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star, ShoppingCart } from 'lucide-react'
import { Product, PRODUCTS } from '@/utils/constants'
import { useAppDispatch } from '@/redux/hooks'
import { addToCart } from '@/redux/cartSlice'
import { useSelector } from 'react-redux'
import { selectTheme } from '@/redux/themeSlice'

interface ProductCarouselProps {
  category: string
}

export default function ProductCarousel({ category }: ProductCarouselProps) {
  const theme = useSelector(selectTheme)
  const dispatch = useAppDispatch()

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      const data = await PRODUCTS();
      setProducts(data);
    };
    loadProducts();
  }, []);
  
  // Filter products by category and add more products
  const categoryProducts = [...products.filter(product => product.category === category)]

  return (
    <section 
      className={`
        container mx-auto mt-0 px-4 py-16
        bg-background-primary 
        text-text-primary
        theme-transition
        h-auto
      `}
    >
      <div className="flex justify-between items-center mb-8">
        <h2 
          className={`
            text-3xl font-bold
            text-text-primary
          `}
        >
          {category}
        </h2>
      </div>

      {/* Grid Layout */}
      <div 
        className={`
          grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8
        `}
      >
        {categoryProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch()
  const theme = useSelector(selectTheme)
  const [imageError, setImageError] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const handleAddToCart = async () => {
    if (isAddingToCart) return

    setIsAddingToCart(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      dispatch(addToCart({
        ...product,
        quantity: 1
      }))
    } catch (error) {
      console.error('Failed to add product to cart', error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`
        p-4 rounded-lg relative overflow-hidden
        bg-background-secondary
        text-text-primary
        border border-border
        theme-transition
        h-full
      `}
    >
      {product.discountPercentage && (
        <div 
          className={`
            absolute top-0 right-0 
            bg-brand-accent
            text-white
            px-2 py-1 rounded-bl-lg z-10
          `}
        >
          {product.discountPercentage}% OFF
        </div>
      )}

      <div className="relative w-full h-48 mb-4">
        {!imageError ? (
          <Image 
            src={product.image} 
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain"
            onError={handleImageError}
            priority={false}
          />
        ) : (
          <div 
            className={`
              w-full h-full flex items-center justify-center
              bg-background-secondary
              text-text-secondary
            `}
          >
            Image Not Available
          </div>
        )}
      </div>

      <div className="text-center">
        <h3 
          className={`
            text-xl font-bold
            text-text-primary
          `}
        >
          {product.name}
        </h3>
        <p 
          className={`
            mb-2
            text-text-secondary
          `}
        >
          {product.brand}
        </p>

        <div className="flex justify-center items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
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
                text-text-secondary
              `}
            >
              ({product.rating})
            </span>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div>
            <span 
              className={`
                text-2xl font-bold mr-2
                text-text-primary
              `}
            >
              ₹{product.price}
            </span>
            {product.originalPrice && (
              <span 
                className={`
                  line-through 
                  text-text-secondary
                `}
              >
                ₹{product.originalPrice}
              </span>
            )}
          </div>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className={`
              p-2 rounded-full
              bg-brand-accent
              text-white 
              hover:bg-brand-accent-dark
              transition-colors
            `}
          >
            <ShoppingCart className="h-6 w-6" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}