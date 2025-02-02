import { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Image configuration
  images: {
    // Allow specific domains for external images (if needed)
    domains: [
      'localhost',
      'example.com',
      'cdn.yoursite.com'
    ],
    
    // Image formats
    formats: ['image/avif', 'image/webp'],
    
    // Minimum cache time for images
    minimumCacheTTL: 60,
  },
  
  // Webpack configuration (if needed)
  webpack: (config, { isServer }) => {
    // Add any custom webpack configurations
    return config
  },
  
  // Environment variables
  env: {
    // Add any environment-specific variables
    NEXT_PUBLIC_SITE_NAME: 'Supplement Hub',
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production' 
      ? 'https://api.yourdomain.com' 
      : 'http://localhost:3000/api'
  },
  
  // Redirect configurations
  async redirects() {
    return [
      // Example redirects
      {
        source: '/old-product/:id',
        destination: '/products/:id',
        permanent: true,
      }
    ]
  },
  
  // Performance and optimization
  productionBrowserSourceMaps: false,
  
  // Enable React StrictMode
  reactStrictMode: true,
  
  // Compiler options
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' 
      ? { exclude: ['error'] } 
      : false,
  },
  
  // Experimental features
  experimental: {
    // Enable new image optimization
    images: {
      allowFutureImage: true,
    }
  }
}

export default nextConfig