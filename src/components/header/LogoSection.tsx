"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTheme } from "../ThemeProvider";

export default function LogoSection() {
  const { theme } = useTheme();

  return (
    <Link href="/" className="flex items-center space-x-2 group cursor-pointer">
      <Image
        src="/images/logo/logo.png"
        alt="Brand Logo"
        width={40}
        height={40}
        className="group-hover:rotate-6 transition-transform"
      />
      <motion.span
        className={`text-2xl font-bold ${
          theme === "light" ? "text-black" : "text-white"
        } group-hover:text-yellow-500 transition-colors`}
        whileHover={{ scale: 1.05 }}
      >
        1Scoop Protein
      </motion.span>
    </Link>
  );
}
