import { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image configuration
  images: {
    // Allow specific domains for external images (if needed)
    domains: ["localhost", "example.com", "cdn.yoursite.com", "*"],

    // Image formats
    formats: ["image/avif", "image/webp"],

    // Minimum cache time for images
    minimumCacheTTL: 60,
  },

  eslint: {
    // Enable or disable eslint
    ignoreDuringBuilds: true,
  },

  env: {
    JWT_SECRET: process.env.JWT_SECRET,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    EMAIL_PASS: process.env.EMAIL_PASS,
    EMAIL_USER: process.env.EMAIL_USER,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  },

  // Webpack configuration (if needed)
  webpack: (config, { isServer }) => {
    // Add any custom webpack configurations
    return config;
  },

  // Redirect configurations
  async redirects() {
    return [
      // Example redirects
      {
        source: "/old-product/:id",
        destination: "/products/:id",
        permanent: true,
      },
    ];
  },

  // Performance and optimization
  productionBrowserSourceMaps: false,

  // Enable React StrictMode
  reactStrictMode: true,

  // Compiler options
  compiler: {
    // Remove console logs in production
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
};

export default nextConfig;
