import Header from "@/components/Header";
import HeroSection from "@/components/home/HeroSection";
import BestSellers from "@/components/home/BestSellers";
import ProductCarousel from "@/components/products/ProductCarousel";
import BrandShowcase from "@/components/products/BrandShowcase";
import WhySupplementHub from "@/components/WhySupplementHub";
import { PRODUCT_CATEGORIES } from "@/utils/constants";
import CalorieCalculator from "@/components/home/CalorieCalculator";
import { ThemeProvider } from "@/components/ThemeProvider";
import ChatWithExpert from "@/components/home/ChatWithExpert";
import ShopByCategory from "@/components/home/ShopByCategory";

export default function SupplementHubHomePage() {
  return (
    <ThemeProvider>
      <main className="min-h-screen bg-brand-black">
        <HeroSection />
        <BestSellers />
        <CalorieCalculator />
        <ShopByCategory />
        <BrandShowcase />
        <WhySupplementHub />
        <ChatWithExpert />
      </main>
    </ThemeProvider>
  );
}
