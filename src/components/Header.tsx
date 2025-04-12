"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Flame, Tag, Ticket, Book, Zap } from "lucide-react";
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
        // Fetch best sellers
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
        console.log("Fetched product IDs:", productIds);

        // Fetch products with categories and subcategories
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

        console.log("Fetched products data:", productsData);

        // Group products by category, excluding Uncategorized and handling Unnamed
        const categoryMap: { [key: string]: SubMenuItem[] } = {};
        const categoryProductCount: { [key: string]: number } = {}; // Track product count per category
        const categoryUnnamedCount: { [key: string]: number } = {}; // Track unnamed subcategories per category

        productsData.forEach(
          (product: {
            id: number;
            name: string;
            category?: string;
            subcategory?: string;
          }) => {
            const category = product.category?.trim();
            const subcategoryName = product.subcategory?.trim();

            // Skip if category is missing or empty (would be "Uncategorized")
            if (!category) {
              return;
            }

            // Initialize category in maps
            if (!categoryMap[category]) {
              categoryMap[category] = [];
              categoryProductCount[category] = 0;
              categoryUnnamedCount[category] = 0;
            }

            categoryProductCount[category] += 1;

            // Skip if subcategory is missing or empty (would be "Unnamed")
            if (!subcategoryName) {
              categoryUnnamedCount[category] += 1;
              return;
            }

            // Avoid duplicate subcategories
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

        // Filter out categories with a single product that's Unnamed
        const filteredCategoryMap: { [key: string]: SubMenuItem[] } = {};
        Object.entries(categoryMap).forEach(([category, subItems]) => {
          if (
            categoryProductCount[category] === 1 &&
            categoryUnnamedCount[category] === 1 &&
            subItems.length === 0
          ) {
            // Skip categories with one product that's Unnamed
            return;
          }
          if (subItems.length > 0) {
            // Only include categories with valid subcategories
            filteredCategoryMap[category] = subItems;
          }
        });

        console.log("Filtered category map:", filteredCategoryMap);

        // Convert grouped data into DropdownMenuItem array
        const bestSellerMenuItems: DropdownMenuItem[] = Object.entries(
          filteredCategoryMap
        ).map(([category, subItems]) => ({
          name: category,
          subItems,
        }));

        console.log("Best seller menu items:", bestSellerMenuItems);
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
    <header
      className={`${theme === "light" ? "bg-white" : "bg-black"} ${
        theme === "light" ? "border-gray-200" : "border-gray-800"
      } border-b shadow-md sticky top-0 z-50`}
    >
      <div className="container mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <LogoSection />
        <DesktopNav dropdownMenus={DROPDOWN_MENUS} />
        <div className="flex items-center space-x-2 sm:space-x-4">
          <CartDropdown />
          <ProfileDropdown />
          <button
            className={`md:hidden p-2 rounded-md ${
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
      <MobileNav
        dropdownMenus={DROPDOWN_MENUS}
        isOpen={isMobileMenuOpen}
        toggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />
    </header>
  );
}
