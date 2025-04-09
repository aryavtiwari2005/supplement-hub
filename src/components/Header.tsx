"use client";

import { useRouter } from "next/navigation";
import jwt, { JwtPayload } from "jsonwebtoken";
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
  Mail,
  Lock,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCartItems,
  selectCartQuantity,
  removeFromCart,
  updateQuantity,
} from "@/redux/cartSlice";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  subItems?: SubMenuItem[];
}

interface DropdownMenu {
  icon: React.ComponentType<{ className?: string }>;
  items: DropdownMenuItem[];
  href?: string;
}

interface User {
  id: number;
}

// Define the expected JWT payload type
interface JwtPayloadWithUserId extends JwtPayload {
  userId: number;
}

// Define the user data type from users_onescoop
interface UserData {
  id: number;
  email: string;
  scoop_points: number;
  orders: any[];
}

const dropdownVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const cartQuantity = useSelector(selectCartQuantity);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSubDropdown, setActiveSubDropdown] = useState<string | null>(
    null
  );
  const [brandItems, setBrandItems] = useState<DropdownMenuItem[]>([]);
  const [topBlogs, setTopBlogs] = useState<SubMenuItem[]>([]); // State for top 5 blogs
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null); // Explicitly type as User | null
  const [userData, setUserData] = useState<UserData | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const router = useRouter();

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

  // Fetch top 5 blogs from Supabase
  useEffect(() => {
    const fetchTopBlogs = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase
        .from("blogs_onescoop")
        .select("title, slug")
        .order("created_at", { ascending: false }) // Sort by creation date, newest first
        .limit(5); // Limit to top 5

      if (error) {
        console.error("Error fetching top blogs:", error.message);
      } else {
        const blogItems: SubMenuItem[] = data.map((blog) => ({
          name: blog.title,
          href: `/blogs/${blog.slug}`,
          icon: Book, // Optional: Use Book icon for blogs
        }));
        setTopBlogs(blogItems);
      }
    };

    fetchTopBlogs();
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

  useEffect(() => {
    // Fetch user data based on JWT token in cookies
    const fetchUserData = async () => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1];

      if (!token) {
        setUser(null);
        setUserData(null);
        return;
      }

      try {
        const jwtSecret =
          process.env.NEXT_PUBLIC_JWT_SECRET || process.env.JWT_SECRET;
        if (!jwtSecret) throw new Error("JWT_SECRET is not defined");

        const decoded = jwt.verify(token, jwtSecret) as JwtPayloadWithUserId;
        setUser({ id: decoded.userId });

        const { data, error } = await supabase
          .from("users_onescoop")
          .select("id, email, scoop_points, orders")
          .eq("id", decoded.userId)
          .single();

        if (error) throw error;
        setUserData(data);
      } catch (err) {
        console.error("Error verifying token or fetching user data:", err);
        setUser(null);
        setUserData(null);
      }
    };

    fetchUserData();
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const { data, error } = await supabase
          .from("users_onescoop")
          .select("id, email, scoop_points, orders")
          .eq("email", email)
          .single();

        if (error) throw error;

        setUser({ id: data.id });
        setUserData(data);
        setEmail("");
        setPassword("");
        setIsProfileOpen(false);
      } else {
        const { message } = await res.json();
        setLoginError(message);
      }
    } catch (err) {
      setLoginError("Something went wrong. Please try again.");
      console.error("Login error:", err);
    }
  };

  const handleLogout = () => {
    document.cookie =
      "authToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    setUser(null);
    setUserData(null);
    setIsProfileOpen(false);
  };

  // Updated Dropdown Menus with dynamic Brands and Top Blogs
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
      items: topBlogs,
    },
    Services: {
      icon: Zap,
      items: [
        {
          name: "Fitness Consultancies",
          href: "/fitness-consultancy",
          icon: Flame,
        },
        // ... (other subItems remain the same)
      ],
    },
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
    exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } },
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
          {/* <div className="hidden md:block relative flex-grow max-w-xs">
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
          </div> */}

          <div className="flex items-center space-x-6">
            {/* <ThemeToggle /> */}

            {/* Shopping Cart with Dropdown */}
            <div className="relative">
              <button
                className={`
            flex items-center space-x-2
            ${THEMES[theme].text.primary} 
            hover:text-yellow-500 
            transition-colors
            px-3 py-2 rounded-md
            ${THEMES[theme].background.secondary}
            cursor-pointer
          `}
                onClick={() => setIsCartOpen(!isCartOpen)}
              >
                <ShoppingCart className="w-6 h-6" />
                <span className="text-sm font-medium">Cart</span>
                {cartQuantity > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
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
                    <div className="p-6">
                      <h3
                        className={`${THEMES[theme].text.primary} font-semibold text-lg mb-4`}
                      >
                        Shopping Cart ({cartQuantity})
                      </h3>
                      {cartItems.length === 0 ? (
                        <div
                          className={`${THEMES[theme].text.muted} text-center py-6`}
                        >
                          <p>Your cart is empty</p>
                          <Link
                            href="/products"
                            className={`mt-2 inline-block text-yellow-500 hover:text-yellow-600 font-medium cursor-pointer`}
                            onClick={() => setIsCartOpen(false)}
                          >
                            Start Shopping
                          </Link>
                        </div>
                      ) : (
                        <>
                          <div className="max-h-72 overflow-y-auto space-y-6">
                            {cartItems.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center space-x-4 border-b pb-4"
                              >
                                <div className="flex-1">
                                  <p
                                    className={`${THEMES[theme].text.primary} font-medium`}
                                  >
                                    {item.name}
                                  </p>
                                  {item.selectedVariant && (
                                    <p
                                      className={`${THEMES[theme].text.muted} text-sm`}
                                    >
                                      Variant: {item.selectedVariant}
                                    </p>
                                  )}
                                  <p
                                    className={`${THEMES[theme].text.primary} text-sm`}
                                  >
                                    ₹{(item.price * item.quantity).toFixed(2)}{" "}
                                    (₹{item.price} x {item.quantity})
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
                                  className={`p-1 rounded ${THEMES[theme].background.secondary} border ${THEMES[theme].border} cursor-pointer`}
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
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="mt-6 border-t pt-4">
                            <p
                              className={`${THEMES[theme].text.primary} font-semibold`}
                            >
                              Subtotal: ₹
                              {cartItems
                                .reduce(
                                  (sum, item) =>
                                    sum + item.price * item.quantity,
                                  0
                                )
                                .toFixed(2)}
                            </p>
                            <Link
                              href="/cart"
                              className={`mt-4 block text-center py-3 rounded w-full cursor-pointer ${
                                theme === "light"
                                  ? "bg-yellow-500 text-black hover:bg-yellow-600"
                                  : "bg-yellow-600 text-white hover:bg-yellow-700"
                              } transition-colors font-semibold`}
                              onClick={() => setIsCartOpen(false)}
                            >
                              View Cart & Checkout
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Button with Login/Profile Dropdown */}
            <div className="relative">
              <button
                className={`
            flex items-center space-x-2
            ${THEMES[theme].text.primary} 
            hover:text-yellow-500 
            transition-colors
            px-3 py-2 rounded-md
            ${THEMES[theme].background.secondary}
            cursor-pointer
          `}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <User className="w-6 h-6" />
                <span className="text-sm font-medium">
                  {user ? "Profile" : "Login"}
                </span>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={`
                absolute right-0 top-full mt-2 w-72
                ${THEMES[theme].dropdown.background}
                rounded-lg shadow-xl
                border ${THEMES[theme].border}
                z-50
              `}
                  >
                    <div className="p-4">
                      {user && userData ? (
                        <>
                          <p
                            className={`${THEMES[theme].text.primary} font-semibold`}
                          >
                            Hello, {userData.email}
                          </p>
                          <p className={`${THEMES[theme].text.muted} text-sm`}>
                            Scoop Points: {userData.scoop_points || 0}
                          </p>
                          <div className="mt-4 space-y-2">
                            <Link
                              href="/profile"
                              className={`${THEMES[theme].text.primary} block hover:text-yellow-500`}
                              onClick={() => setIsProfileOpen(false)}
                            >
                              My Profile
                            </Link>
                            <Link
                              href="/profile/orders"
                              className={`${THEMES[theme].text.primary} block hover:text-yellow-500`}
                              onClick={() => setIsProfileOpen(false)}
                            >
                              My Orders
                            </Link>
                            <button
                              onClick={handleLogout}
                              className="w-full text-left text-red-500 hover:text-red-600"
                            >
                              Logout
                            </button>
                          </div>
                        </>
                      ) : (
                        <form onSubmit={handleLogin} className="space-y-4">
                          <div>
                            <label
                              className={`block mb-1 ${THEMES[theme].text.secondary}`}
                            >
                              Email
                            </label>
                            <div className="relative">
                              <Mail
                                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${THEMES[theme].text.muted}`}
                              />
                              <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`
                            w-full pl-10 pr-3 py-2 rounded-md
                            ${THEMES[theme].background.primary}
                            ${THEMES[theme].text.primary}
                            ${THEMES[theme].border}
                            focus:outline-none focus:ring-2 focus:ring-yellow-500
                          `}
                                placeholder="Enter your email"
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <label
                              className={`block mb-1 ${THEMES[theme].text.secondary}`}
                            >
                              Password
                            </label>
                            <div className="relative">
                              <Lock
                                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${THEMES[theme].text.muted}`}
                              />
                              <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`
                            w-full pl-10 pr-3 py-2 rounded-md
                            ${THEMES[theme].background.primary}
                            ${THEMES[theme].text.primary}
                            ${THEMES[theme].border}
                            focus:outline-none focus:ring-2 focus:ring-yellow-500
                          `}
                                placeholder="Enter your password"
                                required
                              />
                            </div>
                          </div>
                          {loginError && (
                            <p className="text-red-500 text-sm">{loginError}</p>
                          )}
                          <motion.button
                            type="submit"
                            className={`
                        w-full bg-yellow-500 text-white
                        py-2 rounded-md flex items-center justify-center space-x-2
                        hover:bg-yellow-600 transition-colors
                      `}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <span>Sign In</span>
                            <ArrowRight className="w-4 h-4" />
                          </motion.button>
                          <p
                            className={`text-center ${THEMES[theme].text.muted} text-sm`}
                          >
                            Don’t have an account?{" "}
                            <Link
                              href="/signup"
                              className="text-yellow-500 hover:text-yellow-600"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              Sign Up
                            </Link>
                          </p>
                        </form>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
