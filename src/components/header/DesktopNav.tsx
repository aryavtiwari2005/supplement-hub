"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
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

interface DesktopNavProps {
  dropdownMenus: { [key: string]: DropdownMenu };
}

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

export default function DesktopNav({ dropdownMenus }: DesktopNavProps) {
  const { theme } = useTheme();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeSubDropdown, setActiveSubDropdown] = useState<string | null>(
    null
  );

  return (
    <nav className="hidden md:flex items-center space-x-6">
      {Object.entries(dropdownMenus).map(([menuName, menuData]) => (
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
                className={`flex items-center space-x-2 ${
                  theme === "light" ? "text-gray-700" : "text-gray-300"
                } hover:${
                  theme === "light" ? "text-black" : "text-white"
                } transition-colors cursor-pointer`}
                whileHover={{ scale: 1.05 }}
              >
                <menuData.icon className="w-5 h-5" />
                <span>{menuName}</span>
              </motion.button>
            </Link>
          ) : (
            <motion.button
              className={`flex items-center space-x-2 ${
                theme === "light" ? "text-gray-700" : "text-gray-300"
              } hover:${
                theme === "light" ? "text-black" : "text-white"
              } transition-colors cursor-pointer`}
              onClick={() =>
                setActiveDropdown(activeDropdown === menuName ? null : menuName)
              }
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
                className={`absolute top-full left-0 w-64 ${
                  theme === "light" ? "bg-yellow-50" : "bg-gray-900"
                } rounded-lg shadow-xl mt-2 p-2 border ${
                  theme === "light" ? "border-gray-200" : "border-gray-800"
                }`}
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
                          className={`flex items-center justify-between p-2 rounded-md ${
                            theme === "light"
                              ? "text-gray-800"
                              : "text-gray-300"
                          } hover:${
                            theme === "light"
                              ? "hover:bg-yellow-100"
                              : "hover:bg-gray-800"
                          } transition-colors cursor-pointer`}
                        >
                          <span>{item.name}</span>
                          {item.subItems && (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </div>
                      </Link>
                    ) : (
                      <div
                        className={`flex items-center justify-between p-2 rounded-md ${
                          theme === "light" ? "text-gray-800" : "text-gray-300"
                        } hover:${
                          theme === "light"
                            ? "hover:bg-yellow-100"
                            : "hover:bg-gray-800"
                        } transition-colors cursor-pointer`}
                      >
                        <span>{item.name}</span>
                        {item.subItems && <ChevronRight className="w-4 h-4" />}
                      </div>
                    )}

                    {item.subItems && activeSubDropdown === item.name && (
                      <motion.div
                        variants={subDropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={`absolute left-full top-0 w-64 ${
                          theme === "light" ? "bg-yellow-50" : "bg-gray-900"
                        } rounded-lg shadow-xl p-2 border ${
                          theme === "light"
                            ? "border-gray-200"
                            : "border-gray-800"
                        }`}
                      >
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={`flex items-center space-x-3 p-2 rounded-md ${
                              theme === "light"
                                ? "text-gray-800"
                                : "text-gray-300"
                            } hover:${
                              theme === "light"
                                ? "hover:bg-yellow-100"
                                : "hover:bg-gray-800"
                            } transition-colors cursor-pointer`}
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
  );
}
