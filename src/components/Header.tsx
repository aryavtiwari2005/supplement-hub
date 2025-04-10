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

    fetchBrands();
    fetchTopBlogs();
  }, []);

  const DROPDOWN_MENUS: { [key: string]: DropdownMenu } = {
    "Best Sellers": {
      icon: Flame,
      items: [
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
            // Add other subItems as needed...
          ],
        },
        // Add other categories as needed...
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
        {
          name: "Calorie Calculator",
          href: "/calorie-calculator",
          icon: Tag,
        },
        {
          name: "BMI Calculator",
          href: "/bmi-calculator",
          icon: Ticket,
        },
      ],
    },
  };

  return (
    <header
      className={`${theme === "light" ? "bg-white" : "bg-black"} ${
        theme === "light" ? "border-gray-200" : "border-gray-800"
      } border-b shadow-md sticky top-0 z-50`}
    >
      <div className="container mx-auto flex justify-between items-center p-4">
        <LogoSection />
        <DesktopNav dropdownMenus={DROPDOWN_MENUS} />
        <div className="flex items-center space-x-4">
          <CartDropdown />
          <ProfileDropdown />
          <button
            className={`md:hidden ${
              theme === "light" ? "text-black" : "text-white"
            } cursor-pointer`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? "X" : "Menu"}
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
