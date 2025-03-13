import Header from "@/components/Header";
import HeroSection from "@/components/home/HeroSection";
import BestSellers from "@/components/home/BestSellers";
import ProductCarousel from "@/components/products/ProductCarousel";
import BrandShowcase from "@/components/products/BrandShowcase";
import WhySupplementHub from "@/components/WhySupplementHub";
import { PRODUCT_CATEGORIES } from "@/utils/constants";
import CalorieCalculator from "@/components/home/CalorieCalculator";

export default function SupplementHubHomePage() {
  return (
    <main className="min-h-screen bg-brand-black">
      <HeroSection />
      <BestSellers />
      <CalorieCalculator />
      <BrandShowcase />
      <WhySupplementHub />
    </main>
  );
}
