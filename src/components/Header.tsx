"use client";

import { useRouter } from "next/navigation";
import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  Flame,
  Tag,
  Ticket,
  Book,
  X,
  ChevronDown,
  Zap,
  Heart,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCartItems,
  selectCartQuantity,
  removeFromCart,
  updateQuantity,
} from "@/redux/cartSlice";

type Theme = "light" | "dark";

const THEMES = {
  light: {
    background: {
      primary: "bg-white",
      secondary: "bg-yellow-50",
    },
    text: {
      primary: "text-black",
      secondary: "text-gray-700",
      muted: "text-gray-500",
    },
    border: "border-gray-200",
    dropdown: {
      background: "bg-yellow-50",
      text: "text-gray-800",
      hover: "hover:bg-yellow-100",
    },
  },
  dark: {
    background: {
      primary: "bg-black",
      secondary: "bg-gray-900",
    },
    text: {
      primary: "text-white",
      secondary: "text-gray-300",
      muted: "text-gray-500",
    },
    border: "border-gray-800",
    dropdown: {
      background: "bg-gray-900",
      text: "text-gray-300",
      hover: "hover:bg-gray-800",
    },
  },
};

// Theme Context
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
});

// Theme Provider
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>("light");

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom Theme Hook
export const useTheme = () => useContext(ThemeContext);

// Define types for dropdown menu items
interface SubMenuItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface DropdownMenuItem {
  name: string;
  href?: string; // Optional href for direct links or default navigation
  icon?: React.ComponentType<{ className?: string }>;
  subItems?: SubMenuItem[];
}

interface DropdownMenu {
  icon: React.ComponentType<{ className?: string }>;
  items: DropdownMenuItem[];
  href?: string; // Optional href for direct links
}

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const cartQuantity = useSelector(selectCartQuantity);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSubDropdown, setActiveSubDropdown] = useState<string | null>(
    null
  );
  const [brandItems, setBrandItems] = useState<DropdownMenuItem[]>([]);

  // Fetch brands from Supabase via API route
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch("/api/brands");
        if (!response.ok) throw new Error("Failed to fetch brands");
        const data = await response.json();
        if (Array.isArray(data)) {
          setBrandItems(data);
        } else {
          console.warn("Unexpected data format:", data);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };

    fetchBrands();
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleQuantityChange = (id: number, quantity: number) => {
    dispatch(updateQuantity({ id, quantity }));
  };

  const handleRemoveItem = (id: number) => {
    dispatch(removeFromCart(id));
  };

  // Updated Dropdown Menus with dynamic Brands
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
              icon: Heart,
            },
            {
              name: "Mass Gainer",
              href: "/best-sellers/sport-nutrition/mass-gainer",
              icon: Flame,
            },
            {
              name: "BCAA",
              href: "/best-sellers/sport-nutrition/bcaa",
              icon: Heart,
            },
            {
              name: "Fat Burners",
              href: "/best-sellers/sport-nutrition/fat-burners",
              icon: Zap,
            },
            {
              name: "Pre Workout",
              href: "/best-sellers/sport-nutrition/pre-workout",
              icon: Flame,
            },
            {
              name: "Creatine",
              href: "/best-sellers/sport-nutrition/creatine",
              icon: Heart,
            },
            {
              name: "Protein Bars",
              href: "/best-sellers/sport-nutrition/protein-bars",
              icon: Tag,
            },
            {
              name: "Weight Gainer",
              href: "/best-sellers/sport-nutrition/weight-gainer",
              icon: Zap,
            },
            {
              name: "Carb Blends",
              href: "/best-sellers/sport-nutrition/carb-blends",
              icon: Heart,
            },
            {
              name: "Other Support",
              href: "/best-sellers/sport-nutrition/other-support",
              icon: Flame,
            },
            {
              name: "Casein Protein",
              href: "/best-sellers/sport-nutrition/casein-protein",
              icon: Tag,
            },
          ],
        },
        {
          name: "Health Nutrition",
          subItems: [
            {
              name: "Protein Powder",
              href: "/best-sellers/health-nutrition/protein-powder",
              icon: Tag,
            },
            {
              name: "Whey Protein",
              href: "/best-sellers/health-nutrition/whey-protein",
              icon: Zap,
            },
            {
              name: "Whey Protein Isolate",
              href: "/best-sellers/health-nutrition/whey-protein-isolate",
              icon: Heart,
            },
            {
              name: "Mass Gainer",
              href: "/best-sellers/health-nutrition/mass-gainer",
              icon: Flame,
            },
            {
              name: "BCAA",
              href: "/best-sellers/health-nutrition/bcaa",
              icon: Heart,
            },
            {
              name: "Fat Burners",
              href: "/best-sellers/health-nutrition/fat-burners",
              icon: Zap,
            },
            {
              name: "Pre Workout",
              href: "/best-sellers/health-nutrition/pre-workout",
              icon: Flame,
            },
            {
              name: "Creatine",
              href: "/best-sellers/health-nutrition/creatine",
              icon: Heart,
            },
            {
              name: "Protein Bars",
              href: "/best-sellers/health-nutrition/protein-bars",
              icon: Tag,
            },
            {
              name: "Weight Gainer",
              href: "/best-sellers/health-nutrition/weight-gainer",
              icon: Zap,
            },
            {
              name: "Carb Blends",
              href: "/best-sellers/health-nutrition/carb-blends",
              icon: Heart,
            },
            {
              name: "Other Support",
              href: "/best-sellers/health-nutrition/other-support",
              icon: Flame,
            },
            {
              name: "Casein Protein",
              href: "/best-sellers/health-nutrition/casein-protein",
              icon: Tag,
            },
          ],
        },
        {
          name: "Fitness",
          subItems: [
            {
              name: "Protein Powder",
              href: "/best-sellers/fitness/protein-powder",
              icon: Tag,
            },
            {
              name: "Whey Protein",
              href: "/best-sellers/fitness/whey-protein",
              icon: Zap,
            },
            {
              name: "Whey Protein Isolate",
              href: "/best-sellers/fitness/whey-protein-isolate",
              icon: Heart,
            },
            {
              name: "Mass Gainer",
              href: "/best-sellers/fitness/mass-gainer",
              icon: Flame,
            },
            { name: "BCAA", href: "/best-sellers/fitness/bcaa", icon: Heart },
            {
              name: "Fat Burners",
              href: "/best-sellers/fitness/fat-burners",
              icon: Zap,
            },
            {
              name: "Pre Workout",
              href: "/best-sellers/fitness/pre-workout",
              icon: Flame,
            },
            {
              name: "Creatine",
              href: "/best-sellers/fitness/creatine",
              icon: Heart,
            },
            {
              name: "Protein Bars",
              href: "/best-sellers/fitness/protein-bars",
              icon: Tag,
            },
            {
              name: "Weight Gainer",
              href: "/best-sellers/fitness/weight-gainer",
              icon: Zap,
            },
            {
              name: "Carb Blends",
              href: "/best-sellers/fitness/carb-blends",
              icon: Heart,
            },
            {
              name: "Other Support",
              href: "/best-sellers/fitness/other-support",
              icon: Flame,
            },
            {
              name: "Casein Protein",
              href: "/best-sellers/fitness/casein-protein",
              icon: Tag,
            },
          ],
        },
        {
          name: "Wellness",
          subItems: [
            {
              name: "Protein Powder",
              href: "/best-sellers/wellness/protein-powder",
              icon: Tag,
            },
            {
              name: "Whey Protein",
              href: "/best-sellers/wellness/whey-protein",
              icon: Zap,
            },
            {
              name: "Whey Protein Isolate",
              href: "/best-sellers/wellness/whey-protein-isolate",
              icon: Heart,
            },
            {
              name: "Mass Gainer",
              href: "/best-sellers/wellness/mass-gainer",
              icon: Flame,
            },
            { name: "BCAA", href: "/best-sellers/wellness/bcaa", icon: Heart },
            {
              name: "Fat Burners",
              href: "/best-sellers/wellness/fat-burners",
              icon: Zap,
            },
            {
              name: "Pre Workout",
              href: "/best-sellers/wellness/pre-workout",
              icon: Flame,
            },
            {
              name: "Creatine",
              href: "/best-sellers/wellness/creatine",
              icon: Heart,
            },
            {
              name: "Protein Bars",
              href: "/best-sellers/wellness/protein-bars",
              icon: Tag,
            },
            {
              name: "Weight Gainer",
              href: "/best-sellers/wellness/weight-gainer",
              icon: Zap,
            },
            {
              name: "Carb Blends",
              href: "/best-sellers/wellness/carb-blends",
              icon: Heart,
            },
            {
              name: "Other Support",
              href: "/best-sellers/wellness/other-support",
              icon: Flame,
            },
            {
              name: "Casein Protein",
              href: "/best-sellers/wellness/casein-protein",
              icon: Tag,
            },
          ],
        },
      ],
    },
    Products: {
      icon: Ticket,
      items: [],
      href: "/products",
    },
    Brands: {
      icon: Tag,
      items: brandItems,
    },
    Blogs: {
      icon: Book,
      items: [
        { name: "Fitness Tips", href: "/blogs/fitness", icon: Flame },
        { name: "Nutrition Guides", href: "/blogs/nutrition", icon: Heart },
      ],
    },
    Services: {
      icon: Zap,
      items: [
        {
          name: "Fitness Consultancies",
          href: "/services/fitness-consultancies",
          icon: Flame,
        },
        {
          name: "Online Training",
          href: "/services/online-training",
          icon: Heart,
        },
        {
          name: "Calorie Calculator",
          href: "#calorie-calculator",
          icon: ShoppingCart,
        },
      ],
    },
  };

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  };

  const subDropdownVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
  };

  return (
    <header
      className={`
        ${THEMES[theme].background.primary} 
        ${THEMES[theme].border} 
        shadow-md
        sticky top-0 z-50
      `}
    >
      <div className="container mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2 group cursor-pointer"
        >
          <Image
            src="/images/logo/logo.png"
            alt="Brand Logo"
            width={40}
            height={40}
            className="group-hover:rotate-6 transition-transform"
          />
          <span
            className={`
            text-2xl font-bold 
            ${THEMES[theme].text.primary}
            group-hover:text-yellow-500 
            transition-colors
          `}
          >
            1Scoop Protein
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {Object.entries(DROPDOWN_MENUS).map(([menuName, menuData]) => (
            <div
              key={menuName}
              className="relative group"
              onMouseEnter={() =>
                menuData.items.length > 0 && setActiveDropdown(menuName)
              }
              onMouseLeave={() => {
                setActiveDropdown(null);
                setActiveSubDropdown(null);
              }}
            >
              {/* Wrap in Link if href exists, otherwise use button for dropdown */}
              {menuData.href ? (
                <Link href={menuData.href} passHref>
                  <motion.button
                    className={`
                      flex items-center space-x-2 
                      ${THEMES[theme].text.secondary}
                      hover:${THEMES[theme].text.primary}
                      transition-colors
                      cursor-pointer
                    `}
                    whileHover={{ scale: 1.05 }}
                  >
                    <menuData.icon className="w-5 h-5" />
                    <span>{menuName}</span>
                  </motion.button>
                </Link>
              ) : (
                <motion.button
                  className={`
                    flex items-center space-x-2 
                    ${THEMES[theme].text.secondary}
                    hover:${THEMES[theme].text.primary}
                    transition-colors
                    cursor-pointer
                  `}
                  onClick={() => {
                    if (menuData.items.length > 0) {
                      setActiveDropdown(
                        activeDropdown === menuName ? null : menuName
                      );
                    }
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <menuData.icon className="w-5 h-5" />
                  <span>{menuName}</span>
                  {menuData.items.length > 0 && (
                    <ChevronDown className="w-4 h-4 opacity-50" />
                  )}
                </motion.button>
              )}

              <AnimatePresence>
                {activeDropdown === menuName && menuData.items.length > 0 && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={`
                      absolute top-full left-0 
                      w-64 
                      ${THEMES[theme].dropdown.background}
                      rounded-lg shadow-xl
                      mt-2 p-2
                      border ${THEMES[theme].border}
                    `}
                  >
                    {menuData.items.map((item) => (
                      <div
                        key={item.name}
                        className="relative"
                        onMouseEnter={() => setActiveSubDropdown(item.name)}
                        onMouseLeave={() => setActiveSubDropdown(null)}
                      >
                        {item.href ? (
                          <Link href={item.href} passHref>
                            <div
                              className={`
                                flex items-center justify-between 
                                p-2 rounded-md 
                                ${THEMES[theme].dropdown.text}
                                hover:${THEMES[theme].dropdown.hover}
                                transition-colors
                                cursor-pointer
                              `}
                            >
                              <span>{item.name}</span>
                              {item.subItems && (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </div>
                          </Link>
                        ) : (
                          <div
                            className={`
                              flex items-center justify-between 
                              p-2 rounded-md 
                              ${THEMES[theme].dropdown.text}
                              hover:${THEMES[theme].dropdown.hover}
                              transition-colors
                              cursor-pointer
                            `}
                          >
                            <span>{item.name}</span>
                            {item.subItems && (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </div>
                        )}

                        {item.subItems && activeSubDropdown === item.name && (
                          <motion.div
                            variants={subDropdownVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className={`
                              absolute left-full top-0 
                              w-64 
                              ${THEMES[theme].dropdown.background}
                              rounded-lg shadow-xl
                              p-2
                              border ${THEMES[theme].border}
                            `}
                          >
                            {item.subItems.map((subItem) => (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className={`
                                  flex items-center space-x-3 
                                  p-2 rounded-md 
                                  ${THEMES[theme].dropdown.text}
                                  hover:${THEMES[theme].dropdown.hover}
                                  transition-colors
                                  cursor-pointer
                                `}
                              >
                                {subItem.icon && (
                                  <subItem.icon className="w-5 h-5" />
                                )}
                                <span>{subItem.name}</span>
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:block relative flex-grow max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className={`h-5 w-5 ${THEMES[theme].text.muted}`} />
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`
                w-full pl-10 pr-4 py-2 rounded-full
                ${THEMES[theme].background.secondary}
                ${THEMES[theme].text.primary}
                ${THEMES[theme].border}
                focus:outline-none 
                focus:ring-2 
                focus:ring-yellow-500
                transition-all duration-300
                cursor-pointer
              `}
            />
          </div>

          <div className="flex items-center space-x-2">
            <ThemeToggle />

            {/* Shopping Cart with Dropdown */}
            <div className="relative">
              <button
                className={`
                  ${THEMES[theme].text.primary} 
                  hover:text-yellow-500 
                  transition-colors
                  relative
                  cursor-pointer
                `}
                onClick={() => setIsCartOpen(!isCartOpen)}
              >
                <ShoppingCart />
                {cartQuantity > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartQuantity}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isCartOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={`
                      absolute right-0 top-full mt-2 w-96
                      ${THEMES[theme].dropdown.background}
                      rounded-lg shadow-xl
                      border ${THEMES[theme].border}
                      z-50
                    `}
                  >
                    <div className="p-4">
                      <h3
                        className={`${THEMES[theme].text.primary} font-semibold mb-4`}
                      >
                        Shopping Cart ({cartQuantity})
                      </h3>

                      {cartItems.length === 0 ? (
                        <div
                          className={`${THEMES[theme].text.muted} text-center py-4`}
                        >
                          Your cart is empty
                          <Link
                            href="/products"
                            className={`block text-yellow-500 hover:text-yellow-600 cursor-pointer`}
                          >
                            Start Shopping
                          </Link>
                        </div>
                      ) : (
                        <>
                          <div className="max-h-64 overflow-y-auto space-y-4">
                            {cartItems.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center space-x-2"
                              >
                                <div className="flex-1">
                                  <p
                                    className={`${THEMES[theme].text.primary}`}
                                  >
                                    {item.name}
                                  </p>
                                  {item.selectedVariant && (
                                    <p
                                      className={`${THEMES[theme].text.muted} text-sm`}
                                    >
                                      {item.selectedVariant}
                                    </p>
                                  )}
                                  <p
                                    className={`${THEMES[theme].text.primary}`}
                                  >
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                                <select
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleQuantityChange(
                                      item.id,
                                      Number(e.target.value)
                                    )
                                  }
                                  className={`p-1 rounded ${THEMES[theme].background.secondary} cursor-pointer`}
                                >
                                  {[...Array(10)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                      {i + 1}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="text-red-500 hover:text-red-600 cursor-pointer"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <Link
                            href="/cart"
                            className={`mt-4 block text-center py-2 rounded w-full cursor-pointer ${
                              theme === "light"
                                ? "bg-yellow-500 text-black hover:bg-yellow-600"
                                : "bg-yellow-600 text-white hover:bg-yellow-700"
                            }`}
                            onClick={() => setIsCartOpen(false)}
                          >
                            View Full Cart
                          </Link>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Button */}
            <button
              className={`
                ${THEMES[theme].text.primary} 
                hover:text-yellow-500 
                transition-colors
                cursor-pointer
              `}
            >
              <Link href="/login">
                <User />
              </Link>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className={`
                ${THEMES[theme].text.primary} 
                md:hidden
                cursor-pointer
              `}
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className={`
                ${THEMES[theme].dropdown.background} 
                md:hidden 
                fixed 
                inset-0 
                z-50 
                overflow-y-auto
              `}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    delayChildren: 0.2,
                    staggerChildren: 0.1,
                  },
                },
              }}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="relative p-4">
                <button
                  onClick={toggleMobileMenu}
                  className={`absolute top-4 right-4 cursor-pointer`}
                >
                  <X className={THEMES[theme].text.primary} />
                </button>

                <div className="mt-12 space-y-4">
                  {Object.entries(DROPDOWN_MENUS).map(
                    ([menuName, menuData]) => (
                      <motion.div
                        key={menuName}
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { opacity: 1, y: 0 },
                        }}
                      >
                        {menuData.href ? (
                          <Link
                            href={menuData.href}
                            onClick={toggleMobileMenu}
                            className={`
                            flex items-center 
                            space-x-2 
                            ${THEMES[theme].text.primary} 
                            font-semibold 
                            mb-2
                            cursor-pointer
                          `}
                          >
                            <menuData.icon className="w-6 h-6" />
                            <span>{menuName}</span>
                          </Link>
                        ) : (
                          <motion.button
                            className={`
                              flex items-center 
                              space-x-2 
                              ${THEMES[theme].text.primary} 
                              font-semibold 
                              mb-2
                              cursor-pointer
                            `}
                            onClick={() => {
                              setActiveDropdown(
                                activeDropdown === menuName ? null : menuName
                              );
                            }}
                          >
                            <menuData.icon className="w-6 h-6" />
                            <span>{menuName}</span>
                          </motion.button>
                        )}
                        {menuData.items.length > 0 &&
                          activeDropdown === menuName && (
                            <div className="pl-8 space-y-2">
                              {menuData.items.map((item) => (
                                <div key={item.name}>
                                  {item.href ? (
                                    <Link
                                      href={item.href}
                                      onClick={toggleMobileMenu}
                                      className={`
                                      flex items-center 
                                      space-x-2 
                                      ${THEMES[theme].text.secondary}
                                      hover:${THEMES[theme].text.primary}
                                      transition-colors
                                      cursor-pointer
                                    `}
                                    >
                                      <span>{item.name}</span>
                                    </Link>
                                  ) : (
                                    <div
                                      className={`
                                      flex items-center 
                                      space-x-2 
                                      ${THEMES[theme].text.secondary}
                                      hover:${THEMES[theme].text.primary}
                                      transition-colors
                                      cursor-pointer
                                    `}
                                    >
                                      <span>{item.name}</span>
                                    </div>
                                  )}
                                  {item.subItems && (
                                    <div className="pl-4 space-y-1 mt-1">
                                      {item.subItems.map((subItem) => (
                                        <Link
                                          key={subItem.name}
                                          href={subItem.href}
                                          onClick={toggleMobileMenu}
                                          className={`
                                          flex items-center 
                                          space-x-2 
                                          ${THEMES[theme].text.secondary}
                                          hover:${THEMES[theme].text.primary}
                                          transition-colors
                                          cursor-pointer
                                        `}
                                        >
                                          {subItem.icon && (
                                            <subItem.icon className="w-4 h-4" />
                                          )}
                                          <span>{subItem.name}</span>
                                        </Link>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                      </motion.div>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
