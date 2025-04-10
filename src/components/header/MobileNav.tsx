"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
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
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { delayChildren: 0.2, staggerChildren: 0.1 },
            },
          }}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <div className="relative p-4">
            <button
              onClick={toggleMenu}
              className={`absolute top-4 right-4 cursor-pointer`}
            >
              <X className={theme === "light" ? "text-black" : "text-white"} />
            </button>

            <div className="mt-12 space-y-4">
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
                      className={`flex items-center space-x-2 ${
                        theme === "light" ? "text-black" : "text-white"
                      } font-semibold mb-2 cursor-pointer`}
                    >
                      <menuData.icon className="w-6 h-6" />
                      <span>{menuName}</span>
                    </Link>
                  ) : (
                    <motion.button
                      className={`flex items-center space-x-2 ${
                        theme === "light" ? "text-black" : "text-white"
                      } font-semibold mb-2 cursor-pointer`}
                      onClick={() =>
                        setActiveDropdown(
                          activeDropdown === menuName ? null : menuName
                        )
                      }
                    >
                      <menuData.icon className="w-6 h-6" />
                      <span>{menuName}</span>
                    </motion.button>
                  )}
                  {menuData.items.length > 0 && activeDropdown === menuName && (
                    <div className="pl-8 space-y-2">
                      {menuData.items.map((item) => (
                        <div key={item.name}>
                          {item.href ? (
                            <Link
                              href={item.href}
                              onClick={toggleMenu}
                              className={`flex items-center space-x-2 ${
                                theme === "light"
                                  ? "text-gray-700"
                                  : "text-gray-300"
                              } hover:${
                                theme === "light" ? "text-black" : "text-white"
                              } transition-colors cursor-pointer`}
                            >
                              <span>{item.name}</span>
                            </Link>
                          ) : (
                            <div
                              className={`flex items-center space-x-2 ${
                                theme === "light"
                                  ? "text-gray-700"
                                  : "text-gray-300"
                              } hover:${
                                theme === "light" ? "text-black" : "text-white"
                              } transition-colors cursor-pointer`}
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
                                  onClick={toggleMenu}
                                  className={`flex items-center space-x-2 ${
                                    theme === "light"
                                      ? "text-gray-700"
                                      : "text-gray-300"
                                  } hover:${
                                    theme === "light"
                                      ? "text-black"
                                      : "text-white"
                                  } transition-colors cursor-pointer`}
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
