"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown } from "lucide-react";
import { useTheme } from "../ThemeProvider";

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

interface MobileNavProps {
  dropdownMenus: { [key: string]: DropdownMenu };
  isOpen: boolean;
  toggleMenu: () => void;
}

export default function MobileNav({
  dropdownMenus,
  isOpen,
  toggleMenu,
}: MobileNavProps) {
  const { theme } = useTheme();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`md:hidden fixed inset-0 z-50 overflow-y-auto ${
            theme === "light" ? "bg-yellow-50" : "bg-gray-900"
          }`}
          variants={{
            hidden: { opacity: 0, x: "-100%" },
            visible: {
              opacity: 1,
              x: 0,
              transition: { type: "spring", stiffness: 100, damping: 20 },
            },
          }}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, x: "-100%", transition: { duration: 0.2 } }}
        >
          <div className="relative p-6">
            <button
              onClick={toggleMenu}
              className={`absolute top-6 right-6 p-2 rounded-full ${
                theme === "light"
                  ? "text-black hover:bg-gray-200"
                  : "text-white hover:bg-gray-700"
              }`}
            >
              <X className="w-6 h-6" />
            </button>

            <div className="mt-16 space-y-6">
              {Object.entries(dropdownMenus).map(([menuName, menuData]) => (
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
                      onClick={toggleMenu}
                      className={`flex items-center space-x-3 text-lg font-semibold ${
                        theme === "light" ? "text-black" : "text-white"
                      } hover:text-yellow-500 transition-colors`}
                    >
                      <menuData.icon className="w-6 h-6" />
                      <span>{menuName}</span>
                    </Link>
                  ) : (
                    <button
                      className={`flex items-center justify-between w-full text-lg font-semibold ${
                        theme === "light" ? "text-black" : "text-white"
                      } hover:text-yellow-500 transition-colors`}
                      onClick={() =>
                        setActiveDropdown(
                          activeDropdown === menuName ? null : menuName
                        )
                      }
                    >
                      <div className="flex items-center space-x-3">
                        <menuData.icon className="w-6 h-6" />
                        <span>{menuName}</span>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform ${
                          activeDropdown === menuName ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}
                  {menuData.items.length > 0 && activeDropdown === menuName && (
                    <div className="pl-10 mt-3 space-y-3">
                      {menuData.items.map((item) => (
                        <div key={item.name}>
                          {item.href ? (
                            <Link
                              href={item.href}
                              onClick={toggleMenu}
                              className={`block text-base ${
                                theme === "light"
                                  ? "text-gray-700"
                                  : "text-gray-300"
                              } hover:text-yellow-500 transition-colors`}
                            >
                              {item.name}
                            </Link>
                          ) : (
                            <span
                              className={`block text-base ${
                                theme === "light"
                                  ? "text-gray-700"
                                  : "text-gray-300"
                              }`}
                            >
                              {item.name}
                            </span>
                          )}
                          {item.subItems && (
                            <div className="pl-4 mt-2 space-y-2">
                              {item.subItems.map((subItem) => (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  onClick={toggleMenu}
                                  className={`flex items-center space-x-2 text-sm ${
                                    theme === "light"
                                      ? "text-gray-600"
                                      : "text-gray-400"
                                  } hover:text-yellow-500 transition-colors`}
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
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
