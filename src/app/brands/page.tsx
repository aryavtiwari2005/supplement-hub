// app/brands/page.tsx
"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { selectTheme } from "@/redux/themeSlice";

const formatBrandName = (slug: string) => {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function BrandsPage() {
  const theme = useSelector(selectTheme);
  const brands = ["muscleblaze", "optimum-nutrition", "myprotein", "dymatize"]; // Add more brands as needed

  return (
    <div
      className={`min-h-screen ${
        theme === "light" ? "bg-gray-50" : "bg-gray-900"
      }`}
    >
      <div className="container mx-auto px-4 py-16 text-center">
        <h1
          className={`text-5xl font-extrabold mb-6 ${
            theme === "light" ? "text-gray-800" : "text-white"
          }`}
        >
          Shop by Brand
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <Link
              key={brand}
              href={`/brands/${brand}`}
              className={`p-6 rounded-lg shadow-md ${
                theme === "light"
                  ? "bg-white text-gray-800 hover:bg-gray-100"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              } transition-colors`}
            >
              <h2 className="text-2xl font-semibold">
                {formatBrandName(brand)}
              </h2>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
