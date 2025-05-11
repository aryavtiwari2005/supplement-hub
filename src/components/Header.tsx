"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Flame, Tag, Ticket, Book, Zap, MapPin } from "lucide-react";
import LogoSection from "./header/LogoSection";
import DesktopNav from "./header/DesktopNav";
import CartDropdown from "./header/CartDropdown";
import ProfileDropdown from "./header/ProfileDropdown";
import MobileNav from "./header/MobileNav";
import { useTheme } from "./ThemeProvider";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SubMenuItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface DropdownMenuItem {
  name: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  subItems?: SubMenuItem[];
}

interface DropdownMenu {
  icon: React.ComponentType<{ className?: string }>;
  items: DropdownMenuItem[];
  href?: string;
}

export default function Header() {
  const { theme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [brandItems, setBrandItems] = useState<DropdownMenuItem[]>([]);
  const [topBlogs, setTopBlogs] = useState<SubMenuItem[]>([]);
  const [bestSellerItems, setBestSellerItems] = useState<DropdownMenuItem[]>(
    []
  );

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch("/api/brands");
        if (!response.ok) throw new Error("Failed to fetch brands");
        const data = await response.json();
        if (Array.isArray(data)) setBrandItems(data);
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };

    const fetchTopBlogs = async () => {
      const { data, error } = await supabase
        .from("blogs_onescoop")
        .select("title, slug")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching top blogs:", error.message);
      } else {
        const blogItems: SubMenuItem[] = data.map((blog) => ({
          name: blog.title,
          href: `/blogs/${blog.slug}`,
          icon: Book,
        }));
        setTopBlogs(blogItems);
      }
    };

    const fetchBestSellers = async () => {
      try {
        const { data: bestSellersData, error: bestSellersError } =
          await supabase
            .from("best_seller_products")
            .select("product_id, sales_count")
            .order("sales_count", { ascending: false });

        if (bestSellersError) {
          console.error(
            "Error fetching best sellers:",
            bestSellersError.message
          );
          return;
        }

        if (!bestSellersData || bestSellersData.length === 0) {
          console.warn("No best sellers found.");
          setBestSellerItems([]);
          return;
        }

        const productIds = bestSellersData.map(
          (item: { product_id: number }) => item.product_id
        );

        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("id, name, category, subcategory");

        if (productsError) {
          console.error("Error fetching products:", productsError.message);
          return;
        }

        if (!productsData || productsData.length === 0) {
          console.warn("No products found for the given IDs.");
          setBestSellerItems([]);
          return;
        }

        const categoryMap: { [key: string]: SubMenuItem[] } = {};
        const categoryProductCount: { [key: string]: number } = {};
        const categoryUnnamedCount: { [key: string]: number } = {};

        productsData.forEach(
          (product: {
            id: number;
            name: string;
            category?: string;
            subcategory?: string;
          }) => {
            const category = product.category?.trim();
            const subcategoryName = product.subcategory?.trim();

            if (!category) {
              return;
            }

            if (!categoryMap[category]) {
              categoryMap[category] = [];
              categoryProductCount[category] = 0;
              categoryUnnamedCount[category] = 0;
            }

            categoryProductCount[category] += 1;

            if (!subcategoryName) {
              categoryUnnamedCount[category] += 1;
              return;
            }

            const existingSubcategory = categoryMap[category].find(
              (item) => item.name === subcategoryName
            );
            if (!existingSubcategory) {
              categoryMap[category].push({
                name: subcategoryName,
                href: `/best-sellers/${category
                  .toLowerCase()
                  .replace(/\s+/g, "-")}/${subcategoryName
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`,
                icon: Tag,
              });
            }
          }
        );

        const filteredCategoryMap: { [key: string]: SubMenuItem[] } = {};
        Object.entries(categoryMap).forEach(([category, subItems]) => {
          if (
            categoryProductCount[category] === 1 &&
            categoryUnnamedCount[category] === 1 &&
            subItems.length === 0
          ) {
            return;
          }
          if (subItems.length > 0) {
            filteredCategoryMap[category] = subItems;
          }
        });

        const bestSellerMenuItems: DropdownMenuItem[] = Object.entries(
          filteredCategoryMap
        ).map(([category, subItems]) => ({
          name: category,
          subItems,
        }));

        setBestSellerItems(bestSellerMenuItems);
      } catch (error) {
        console.error("Unexpected error in fetchBestSellers:", error);
        setBestSellerItems([]);
      }
    };

    fetchBrands();
    fetchTopBlogs();
    fetchBestSellers();
  }, []);

  const DROPDOWN_MENUS: { [key: string]: DropdownMenu } = {
    "Best Sellers": {
      icon: Flame,
      items:
        bestSellerItems.length > 0
          ? bestSellerItems
          : [
              {
                name: "Sport Nutrition",
                subItems: [
                  {
                    name: "Protein Powder",
                    href: "/best-sellers/sport-nutrition/protein-powder",
                    icon: Tag,
                  },
                  {
                    name: "Whey Protein",
                    href: "/best-sellers/sport-nutrition/whey-protein",
                    icon: Zap,
                  },
                  {
                    name: "Whey Protein Isolate",
                    href: "/best-sellers/sport-nutrition/whey-protein-isolate",
                    icon: Flame,
                  },
                ],
              },
            ],
    },
    Products: { icon: Ticket, items: [], href: "/products" },
    Brands: { icon: Tag, items: brandItems },
    Blogs: { icon: Book, items: topBlogs },
    Services: {
      icon: Zap,
      items: [
        {
          name: "Fitness Consultancies",
          href: "/fitness-consultancy",
          icon: Flame,
        },
        { name: "Calorie Calculator", href: "/calorie-calculator", icon: Tag },
        { name: "BMI Calculator", href: "/bmi-calculator", icon: Ticket },
      ],
    },
  };

  return (
    <div className="sticky top-0 z-50">
      {/* Blue Bar with Marquee on Mobile */}
      <div
        className={`
          bg-blue-900 text-white text-center text-xs sm:text-sm py-2
          ${theme === "light" ? "bg-opacity-90" : "bg-opacity-80"}
          overflow-hidden
        `}
      >
        <div className="sm:hidden">
          <div className="animate-marquee whitespace-nowrap">
            100% Authentic Products | Extra 3% OFF on UPI | Sourced directly
            from Brands | Up to 50% OFF *
          </div>
        </div>
        <div className="hidden sm:block">
          100% Authentic Products | Extra 3% OFF on UPI | Sourced directly from
          Brands | Up to 50% OFF *
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`${theme === "light" ? "bg-white" : "bg-black"} ${
          theme === "light" ? "border-gray-200" : "border-gray-800"
        } border-b shadow-md`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          {/* Desktop Layout */}
          <div className="hidden sm:flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <LogoSection />
              <div
                className={`
                  flex flex-col items-start bg-purple-100 text-purple-800 text-xs sm:text-sm px-3 py-2 rounded-lg
                  ${theme === "light" ? "bg-opacity-80" : "bg-opacity-60"}
                `}
              >
                <div className="flex items-center">
                  <Zap className="h-4 w-4 mr-1" />
                  <span>Get it tomorrow</span>
                </div>
                <span className="text-xs">For Noida Pincodes</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <DesktopNav dropdownMenus={DROPDOWN_MENUS} />
              <CartDropdown />
              <ProfileDropdown />
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="sm:hidden flex flex-col space-y-3">
            <div className="flex justify-between items-center">
              <LogoSection />
              <div className="flex items-center space-x-2">
                <CartDropdown />
                <ProfileDropdown />
                <button
                  className={`p-2 rounded-md ${
                    theme === "light"
                      ? "text-black hover:bg-gray-100"
                      : "text-white hover:bg-gray-800"
                  }`}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? (
                    <span className="text-lg font-bold">X</span>
                  ) : (
                    <span className="text-lg font-bold">☰</span>
                  )}
                </button>
              </div>
            </div>
            <div className="flex justify-between space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">201303, Noida</span>
              </div>
              <div
                className={`
                  flex flex-col items-start bg-purple-100 text-purple-800 text-xs px-3 py-2 rounded-lg w-fit
                  ${theme === "light" ? "bg-opacity-80" : "bg-opacity-60"}
                `}
              >
                <div className="flex items-center">
                  <Zap className="h-4 w-4 mr-1" />
                  <span>Get it tomorrow</span>
                </div>
                <span className="text-xs">For Noida Pincodes</span>
              </div>
            </div>
          </div>
        </div>
        <MobileNav
          dropdownMenus={DROPDOWN_MENUS}
          isOpen={isMobileMenuOpen}
          toggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
      </header>

      {/* Inline CSS for Marquee Animation */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          animation: marquee 15s linear infinite;
        }
      `}</style>
    </div>
  );
}
