'use client'

import { useRouter } from 'next/navigation'
import React, { useState, useCallback, createContext, useContext } from 'react'
import Link from 'next/link'
import ThemeToggle from '../components/ThemeToggle'
import { motion, AnimatePresence } from 'framer-motion'
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
  Dumbbell,
  Pill,
  Leaf,
  Apple,
  Zap,
  Heart
} from 'lucide-react'
import Image from 'next/image'
import { useSelector, useDispatch } from 'react-redux'
import { selectCartItems, selectCartQuantity, removeFromCart, updateQuantity } from '@/redux/cartSlice'


type Theme = 'light' | 'dark'

const THEMES = {
  light: {
    background: {
      primary: 'bg-white',
      secondary: 'bg-yellow-50'
    },
    text: {
      primary: 'text-black',
      secondary: 'text-gray-700',
      muted: 'text-gray-500'
    },
    border: 'border-gray-200',
    dropdown: {
      background: 'bg-yellow-50',
      text: 'text-gray-800',
      hover: 'hover:bg-yellow-100'
    }
  },
  dark: {
    background: {
      primary: 'bg-black',
      secondary: 'bg-gray-900'
    },
    text: {
      primary: 'text-white',
      secondary: 'text-gray-300',
      muted: 'text-gray-500'
    },
    border: 'border-gray-800',
    dropdown: {
      background: 'bg-gray-900',
      text: 'text-gray-300',
      hover: 'hover:bg-gray-800'
    }
  }
}

// Theme Context
interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {}
})

// Theme Provider
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light')

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'))
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Custom Theme Hook
export const useTheme = () => useContext(ThemeContext)

// Dropdown Menu Item Type
type DropdownMenuItem = {
  name: string;
  href: string;
}

export default function Header() {
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const dispatch = useDispatch()
  const cartItems = useSelector(selectCartItems)
  const cartQuantity = useSelector(selectCartQuantity)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleQuantityChange = (id: number, quantity: number) => {
    dispatch(updateQuantity({ id, quantity }))
  }

  const handleRemoveItem = (id: number) => {
    dispatch(removeFromCart(id))
  }

  // Updated Dropdown Menus with Icons
  const DROPDOWN_MENUS = {
    'Best Sellers': {
      icon: Flame,
      items: [
        { name: 'Top Protein Powders', href: '/best-sellers/protein', icon: Dumbbell },
        { name: 'Most Popular Supplements', href: '/best-sellers/supplements', icon: Pill }
      ]
    },
    'Brands': {
      icon: Tag,
      items: [
        { name: 'MuscleBlaze', href: '/brands/muscleblaze', icon: Zap },
        { name: 'Optimum Nutrition', href: '/brands/on', icon: Heart }
      ]
    },
    'Offer Zone': {
      icon: Ticket,
      items: [
        { name: 'Massive Discounts', href: '/offers/massive-discounts', icon: ShoppingCart },
        { name: 'Clearance Sale', href: '/offers/clearance', icon: Tag }
      ]
    },
    'Blogs': {
      icon: Book,
      items: [
        { name: 'Fitness Tips', href: '/blogs/fitness', icon: Dumbbell },
        { name: 'Nutrition Guides', href: '/blogs/nutrition', icon: Apple }
      ]
    },
    'Services': {
      icon: Zap,
      items: [
        { name: 'Fitness Consultancies', href: '/Services/Fitness Consultancies', icon: Dumbbell },
        { name: 'Online Training', href: '/Services/Online Training', icon: Heart },
        { name: 'Calorie Calculator', href: '/Services/Calorie Calculator', icon: Apple }
      ]
    }
  }

  // Updated Categories with Icons
  const CATEGORIES = [
    {
      name: 'Sports Nutrition',
      icon: Dumbbell,
      subcategories: [
        'Protein Powder', 'Whey Protein', 'Mass Gainer', 
        'BCAA', 'Pre Workout', 'Creatine'
      ]
    },
    {
      name: 'Vitamins and Supplements',
      icon: Pill,
      subcategories: ['Multivitamins', 'Vitamin D', 'Vitamin C']
    },
    {
      name: 'Ayurveda and Herbs',
      icon: Leaf,
      subcategories: ['Herbal Supplements', 'Ayurvedic Medicines']
    },
    {
      name: 'Health Food and Drinks',
      icon: Apple,
      subcategories: ['Protein Drinks', 'Healthy Snacks']
    },
    {
      name: 'Fitness',
      icon: Zap,
      subcategories: ['Fitness Accessories', 'Workout Gear']
    },
    {
      name: 'Wellness',
      icon: Heart,
      subcategories: ['Mental Wellness', 'Physical Wellness']
    }
  ]
  
  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      y: -20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  }

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
          className="flex items-center space-x-2 group"
        >
          <Image 
            src="/images/logo/logo.png" 
            alt="Brand Logo" 
            width={40} 
            height={40} 
            className="group-hover:rotate-6 transition-transform"
          />
          <span className={`
            text-2xl font-bold 
            ${THEMES[theme].text.primary}
            group-hover:text-yellow-500 
            transition-colors
          `}>
            1Scoop Protein
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {Object.entries(DROPDOWN_MENUS).map(([menuName, menuData]) => (
            <div 
              key={menuName}
              className="relative group"
              onMouseEnter={() => setActiveDropdown(menuName)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <motion.button 
                className={`
                  flex items-center space-x-2 
                  ${THEMES[theme].text.secondary}
                  hover:${THEMES[theme].text.primary}
                  transition-colors
                `}
                whileHover={{ scale: 1.05 }}
              >
                <menuData.icon className="w-5 h-5" />
                <span>{menuName}</span>
                <ChevronDown className="w-4 h-4 opacity-50" />
              </motion.button>

              <AnimatePresence>
                {activeDropdown === menuName && (
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
                      <Link 
                        key={item.name}
                        href={item.href}
                        className={`
                          flex items-center space-x-3 
                          p-2 rounded-md 
                          ${THEMES[theme].dropdown.text}
                          hover:${THEMES[theme].dropdown.hover}
                          transition-colors
                        `}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
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
                      <h3 className={`${THEMES[theme].text.primary} font-semibold mb-4`}>
                        Shopping Cart ({cartQuantity})
                      </h3>
                      
                      {cartItems.length === 0 ? (
                        <div className={`${THEMES[theme].text.muted} text-center py-4`}>
                          Your cart is empty
                          <Link href="/products" className="block text-yellow-500 hover:text-yellow-600">
                            Start Shopping
                          </Link>
                        </div>
                      ) : (
                        <>
                          <div className="max-h-64 overflow-y-auto space-y-4">
                            {cartItems.map((item) => (
                              <div key={item.id} className="flex items-center space-x-2">
                                <div className="flex-1">
                                  <p className={`${THEMES[theme].text.primary}`}>
                                    {item.name}
                                  </p>
                                  {item.selectedVariant && (
                                    <p className={`${THEMES[theme].text.muted} text-sm`}>
                                      {item.selectedVariant}
                                    </p>
                                  )}
                                  <p className={`${THEMES[theme].text.primary}`}>
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                                <select
                                  value={item.quantity}
                                  onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                                  className={`p-1 rounded ${THEMES[theme].background.secondary}`}
                                >
                                  {[...Array(10)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                      {i + 1}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <Link
                            href="/cart"
                            className={`mt-4 block text-center py-2 rounded w-full ${
                              theme === 'light' 
                                ? 'bg-yellow-500 text-black hover:bg-yellow-600' 
                                : 'bg-yellow-600 text-white hover:bg-yellow-700'
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
                    staggerChildren: 0.1
                  }
                }
              }}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="relative p-4">
                <button 
                  onClick={toggleMobileMenu} 
                  className="absolute top-4 right-4"
                >
                  <X className={THEMES[theme].text.primary} />
                </button>

                <div className="mt-12 space-y-4">
                  {Object.entries(DROPDOWN_MENUS).map(([menuName, menuData]) => (
                    <motion.div 
                      key={menuName}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                    >
                      <div 
                        className={`
                          flex items-center 
                          space-x-2 
                          ${THEMES[theme].text.primary} 
                          font-semibold 
                          mb-2
                        `}
                      >
                        <menuData.icon className="w-6 h-6" />
                        <span>{menuName}</span>
                      </div>
                      <div className="pl-8 space-y-2">
                        {menuData.items.map((item) => (
                          <Link 
                            key={item.name} 
                            href={item.href} 
                            onClick={toggleMobileMenu}
                            className={`
                              flex items-center 
                              space-x-2 
                              ${THEMES[theme].text.secondary}
                              hover:${THEMES[theme].text.primary}
                              transition-colors
                            `}
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{item.name}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}

// // components/Header.tsx
// "use client";

// import { useRouter } from "next/navigation";
// import React, { useState, useCallback, createContext, useContext, useEffect } from "react";
// import Link from "next/link";
// import ThemeToggle from "../components/ThemeToggle";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Search,
//   ShoppingCart,
//   User,
//   Menu,
//   Flame,
//   Tag,
//   Ticket,
//   Book,
//   X,
//   ChevronDown,
//   Dumbbell,
//   Pill,
//   Leaf,
//   Apple,
//   Zap,
//   Heart,
// } from "lucide-react";
// import Image from "next/image";
// import { useSelector, useDispatch } from "react-redux";
// import { selectCartItems, selectCartQuantity, removeFromCart, updateQuantity, fetchCartFromSupabase, clearCart } from "@/redux/cartSlice";
// import { supabase } from "@/utils/supabase";

// type Theme = "light" | "dark";

// const THEMES = {
//   light: {
//     background: { primary: "bg-white", secondary: "bg-yellow-50" },
//     text: { primary: "text-black", secondary: "text-gray-700", muted: "text-gray-500" },
//     border: "border-gray-200",
//     dropdown: { background: "bg-yellow-50", text: "text-gray-800", hover: "hover:bg-yellow-100" },
//   },
//   dark: {
//     background: { primary: "bg-black", secondary: "bg-gray-900" },
//     text: { primary: "text-white", secondary: "text-gray-300", muted: "text-gray-500" },
//     border: "border-gray-800",
//     dropdown: { background: "bg-gray-900", text: "text-gray-300", hover: "hover:bg-gray-800" },
//   },
// };

// interface ThemeContextType {
//   theme: Theme;
//   toggleTheme: () => void;
// }

// const ThemeContext = createContext<ThemeContextType>({
//   theme: "light",
//   toggleTheme: () => {},
// });

// export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [theme, setTheme] = useState<Theme>("light");
//   const toggleTheme = useCallback(() => setTheme((prev) => (prev === "light" ? "dark" : "light")), []);
//   return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
// };

// export const useTheme = () => useContext(ThemeContext);

// type DropdownMenuItem = { name: string; href: string; icon: any };

// export default function Header() {
//   const { theme, toggleTheme } = useTheme();
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const cartItems = useSelector(selectCartItems);
//   const cartQuantity = useSelector(selectCartQuantity);
//   const [isCartOpen, setIsCartOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [user, setUser] = useState<any>(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   useEffect(() => {
//     const fetchUserAndCart = async () => {
//       console.log("Fetching user and cart...");
//       const { data: { user }, error } = await supabase.auth.getUser();

//       if (error) {
//         if (error.name === "AuthSessionMissingError") {
//           console.log("No active session found, user is not logged in.");
//           setUser(null);
//           setIsAuthenticated(false);
//           dispatch(clearCart());
//           return;
//         }
//         console.error("Error fetching user:", error.message);
//         setUser(null);
//         setIsAuthenticated(false);
//         dispatch(clearCart());
//         return;
//       }

//       if (user) {
//         console.log("User authenticated:", user.id);
//         setUser(user);
//         setIsAuthenticated(true);

//         // Check and create user profile if it doesn’t exist
//         const { data: userProfile, error: profileError } = await supabase
//           .from("users_onescoop")
//           .select("id, cart")
//           .eq("id", userd)
//           .single();

//         if (profileError?.code === "PGRST116") {
//           console.log("Creating user profile in users_onescoop");
//           await supabase.from("users_onescoop").insert({
//             id: user.id,
//             email: user.email,
//             cart: [],
//           });
//         } else if (profileError) {
//           console.error("Error fetching user profile:", profileError.message);
//         }

//         await fetchCartFromSupabase(dispatch);
//       } else {
//         console.log("No user found.");
//         setUser(null);
//         setIsAuthenticated(false);
//         dispatch(clearCart());
//       }
//     };

//     fetchUserAndCart();

//     const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
//       console.log("Auth state changed:", event, session?.user?.id);
//       const newUser = session?.user ?? null;

//       if (newUser) {
//         setUser(newUser);
//         setIsAuthenticated(true);
//         await fetchCartFromSupabase(dispatch);
//       } else {
//         setUser(null);
//         setIsAuthenticated(false);
//         dispatch(clearCart());
//       }
//     });

//     return () => authListener.subscription.unsubscribe();
//   }, [dispatch]);

//   const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

//   const handleCartClick = (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     console.log("Cart clicked, isAuthenticated:", isAuthenticated, "isCartOpen:", !isCartOpen);
//     if (!isAuthenticated) {
//       router.push("/login");
//     } else {
//       setIsCartOpen((prev) => !prev);
//     }
//   };

//   const handleQuantityChange = (id: number, quantity: number) => {
//     dispatch(updateQuantity({ id, quantity }));
//   };

//   const handleRemoveItem = (id: number) => {
//     dispatch(removeFromCart(id));
//   };

//   const DROPDOWN_MENUS = {
//     "Best Sellers": {
//       icon: Flame,
//       items: [
//         { name: "Top Protein Powders", href: "/best-sellers/protein", icon: Dumbbell },
//         { name: "Most Popular Supplements", href: "/best-sellers/supplements", icon: Pill },
//       ],
//     },
//     Brands: {
//       icon: Tag,
//       items: [
//         { name: "MuscleBlaze", href: "/brands/muscleblaze", icon: Zap },
//         { name: "Optimum Nutrition", href: "/brands/on", icon: Heart },
//       ],
//     },
//     "Offer Zone": {
//       icon: Ticket,
//       items: [
//         { name: "Massive Discounts", href: "/offers/massive-discounts", icon: ShoppingCart },
//         { name: "Clearance Sale", href: "/offers/clearance", icon: Tag },
//       ],
//     },
//     Blogs: {
//       icon: Book,
//       items: [
//         { name: "Fitness Tips", href: "/blogs/fitness", icon: Dumbbell },
//         { name: "Nutrition Guides", href: "/blogs/nutrition", icon: Apple },
//       ],
//     },
//     Services: {
//       icon: Zap,
//       items: [
//         { name: "Fitness Consultancies", href: "/Services/Fitness Consultancies", icon: Dumbbell },
//         { name: "Online Training", href: "/Services/Online Training", icon: Heart },
//         { name: "Calorie Calculator", href: "/Services/Calorie Calculator", icon: Apple },
//       ],
//     },
//   };

//   const dropdownVariants = {
//     hidden: { opacity: 0, y: -20, scale: 0.95 },
//     visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } },
//     exit: { opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } },
//   };

//   return (
//     <header className={`${THEMES[theme].background.primary} ${THEMES[theme].border} shadow-md sticky top-0 z-50`}>
//       <div className="container mx-auto flex justify-between items-center p-4">
//         {/* Logo */}
//         <Link href="/" className="flex items-center space-x-2 group">
//           <Image
//             src="/images/logo/logo.png"
//             alt="Brand Logo"
//             width={40}
//             height={40}
//             className="group-hover:rotate-6 transition-transform"
//           />
//           <span
//             className={`text-2xl font-bold ${THEMES[theme].text.primary} group-hover:text-yellow-500 transition-colors`}
//           >
//             1Scoop Protein
//           </span>
//         </Link>

//         {/* Desktop Navigation */}
//         <nav className="hidden md:flex items-center space-x-6">
//           {Object.entries(DROPDOWN_MENUS).map(([menuName, menuData]) => (
//             <div
//               key={menuName}
//               className="relative group"
//               onMouseEnter={() => setActiveDropdown(menuName)}
//               onMouseLeave={() => setActiveDropdown(null)}
//             >
//               <motion.button
//                 className={`flex items-center space-x-2 ${THEMES[theme].text.secondary} hover:${THEMES[theme].text.primary} transition-colors`}
//                 whileHover={{ scale: 1.05 }}
//               >
//                 <menuData.icon className="w-5 h-5" />
//                 <span>{menuName}</span>
//                 <ChevronDown className="w-4 h-4 opacity-50" />
//               </motion.button>
//               <AnimatePresence>
//                 {activeDropdown === menuName && (
//                   <motion.div
//                     variants={dropdownVariants}
//                     initial="hidden"
//                     animate="visible"
//                     exit="exit"
//                     className={`absolute top-full left-0 w-64 ${THEMES[theme].dropdown.background} rounded-lg shadow-xl mt-2 p-2 border ${THEMES[theme].border}`}
//                   >
//                     {menuData.items.map((item) => (
//                       <Link
//                         key={item.name}
//                         href={item.href}
//                         className={`flex items-center space-x-3 p-2 rounded-md ${THEMES[theme].dropdown.text} hover:${THEMES[theme].dropdown.hover} transition-colors`}
//                       >
//                         <item.icon className="w-5 h-5" />
//                         <span>{item.name}</span>
//                       </Link>
//                     ))}
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           ))}
//         </nav>

//         {/* Right side controls */}
//         <div className="flex items-center space-x-4">
//           {/* Search */}
//           <div className="hidden md:block relative flex-grow max-w-xs">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <Search className={`h-5 w-5 ${THEMES[theme].text.muted}`} />
//             </div>
//             <input
//               type="text"
//               placeholder="Search..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className={`w-full pl-10 pr-4 py-2 rounded-full ${THEMES[theme].background.secondary} ${THEMES[theme].text.primary} ${THEMES[theme].border} focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-300`}
//             />
//           </div>

//           <div className="flex items-center space-x-2">
//             <ThemeToggle />

//             {/* Shopping Cart */}
//             <div className="relative">
//               <button
//                 className={`${THEMES[theme].text.primary} hover:text-yellow-500 transition-colors relative`}
//                 onClick={handleCartClick}
//               >
//                 <ShoppingCart />
//                 {cartQuantity > 0 && (
//                   <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//                     {cartQuantity}
//                   </span>
//                 )}
//               </button>

//               <AnimatePresence>
//                 {isCartOpen && isAuthenticated && (
//                   <motion.div
//                     variants={dropdownVariants}
//                     initial="hidden"
//                     animate="visible"
//                     exit="exit"
//                     className={`absolute right-0 top-full mt-2 w-96 ${THEMES[theme].dropdown.background} rounded-lg shadow-xl border ${THEMES[theme].border} z-50`}
//                   >
//                     <div className="p-4">
//                       <h3 className={`${THEMES[theme].text.primary} font-semibold mb-4`}>
//                         Shopping Cart ({cartQuantity})
//                       </h3>
//                       {cartItems.length === 0 ? (
//                         <div className={`${THEMES[theme].text.muted} text-center py-4`}>
//                           Your cart is empty
//                           <Link href="/products" className="block text-yellow-500 hover:text-yellow-600">
//                             Start Shopping
//                           </Link>
//                         </div>
//                       ) : (
//                         <>
//                           <div className="max-h-64 overflow-y-auto space-y-4">
//                             {cartItems.map((item) => (
//                               <div key={item.id} className="flex items-center space-x-2">
//                                 <div className="flex-1">
//                                   <p className={`${THEMES[theme].text.primary}`}>{item.name}</p>
//                                   {item.selectedVariant && (
//                                     <p className={`${THEMES[theme].text.muted} text-sm`}>
//                                       {item.selectedVariant}
//                                     </p>
//                                   )}
//                                   <p className={`${THEMES[theme].text.primary}`}>
//                                     ${(item.price * item.quantity).toFixed(2)}
//                                   </p>
//                                 </div>
//                                 <select
//                                   value={item.quantity}
//                                   onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
//                                   className={`p-1 rounded ${THEMES[theme].background.secondary}`}
//                                 >
//                                   {[...Array(10)].map((_, i) => (
//                                     <option key={i + 1} value={i + 1}>{i + 1}</option>
//                                   ))}
//                                 </select>
//                                 <button
//                                   onClick={() => handleRemoveItem(item.id)}
//                                   className="text-red-500 hover:text-red-600"
//                                 >
//                                   <X className="w-4 h-4" />
//                                 </button>
//                               </div>
//                             ))}
//                           </div>
//                           <button
//                             onClick={() => {
//                               setIsCartOpen(false);
//                               router.push("/cart");
//                             }}
//                             className={`mt-4 block text-center py-2 rounded w-full ${
//                               theme === "light"
//                                 ? "bg-yellow-500 text-black hover:bg-yellow-600"
//                                 : "bg-yellow-600 text-white hover:bg-yellow-700"
//                             }`}
//                           >
//                             View Full Cart
//                           </button>
//                         </>
//                       )}
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>

//             {/* User Button */}
//             <button
//               className={`${THEMES[theme].text.primary} hover:text-yellow-500 transition-colors`}
//               onClick={() => router.push(isAuthenticated ? "/profile" : "/login")}
//             >
//               <User />
//             </button>

//             {/* Mobile Menu Toggle */}
//             <button
//               className={`${THEMES[theme].text.primary} md:hidden`}
//               onClick={toggleMobileMenu}
//             >
//               {isMobileMenuOpen ? <X /> : <Menu />}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Navigation */}
//         <AnimatePresence>
//           {isMobileMenuOpen && (
//             <motion.div
//               className={`${THEMES[theme].dropdown.background} md:hidden fixed inset-0 z-50 overflow-y-auto`}
//               variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delayChildren: 0.2, staggerChildren: 0.1 } } }}
//               initial="hidden"
//               animate="visible"
//               exit="hidden"
//             >
//               <div className="relative p-4">
//                 <button onClick={toggleMobileMenu} className="absolute top-4 right-4">
//                   <X className={THEMES[theme].text.primary} />
//                 </button>
//                 <div className="mt-12 space-y-4">
//                   {Object.entries(DROPDOWN_MENUS).map(([menuName, menuData]) => (
//                     <motion.div
//                       key={menuName}
//                       variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
//                     >
//                       <div
//                         className={`flex items-center space-x-2 ${THEMES[theme].text.primary} font-semibold mb-2`}
//                       >
//                         <menuData.icon className="w-6 h-6" />
//                         <span>{menuName}</span>
//                       </div>
//                       <div className="pl-8 space-y-2">
//                         {menuData.items.map((item) => (
//                           <Link
//                             key={item.name}
//                             href={item.href}
//                             onClick={toggleMobileMenu}
//                             className={`flex items-center space-x-2 ${THEMES[theme].text.secondary} hover:${THEMES[theme].text.primary} transition-colors`}
//                           >
//                             <item.icon className="w-4 h-4" />
//                             <span>{item.name}</span>
//                           </Link>
//                         ))}
//                       </div>
//                     </motion.div>
//                   ))}
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </header>
//   );
// }