"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectTheme } from "@/redux/themeSlice";
import { supabase } from "@/utils/supabase";
import Link from "next/link";
import { motion } from "framer-motion";

// Updated interface to include the product ID
interface CategoryItem {
    id: number;
    category: string;
    image: string;
}

export default function ShopByCategory() {
    const theme = useSelector(selectTheme);
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase.rpc('get_categories_with_image');

                if (error) {
                    throw new Error(`Failed to fetch categories: ${error.message}`);
                }

                setCategories(data.slice(0, 20) || []);
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const CategoryCard = ({ item }: { item: CategoryItem }) => (
        // UPDATED: The href now points to the product page using the product's ID
        <Link
            href={`/products/${item.id}`}
            className="flex-shrink-0 w-40 sm:w-48"
        >
            <motion.div
                whileHover={{ y: -5 }}
                className={`block rounded-lg overflow-hidden shadow-md h-full transition-shadow duration-300 hover:shadow-xl ${theme === "light" ? "bg-white" : "bg-gray-800"
                    }`}
            >
                <div className="h-40 sm:h-48 overflow-hidden">
                    <img
                        src={item.image}
                        alt={item.category}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                </div>
                <div className="p-4 text-center">
                    <h3 className={`font-semibold text-base truncate ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                        {item.category}
                    </h3>
                </div>
            </motion.div>
        </Link>
    );

    return (
        <>
            <style jsx global>{`
        @keyframes marquee-slow {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee-slow {
          animation: marquee-slow 15s linear infinite;
        }
      `}</style>

            <div className={`w-full py-12 sm:py-16 ${theme === "light" ? "bg-yellow-100" : "bg-gray-900"}`}>
                <div className="container mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className={`text-2xl sm:text-3xl font-bold text-center mb-8 ${theme === "light" ? "text-gray-800" : "text-white"}`}>
                        Shop By <span className="text-yellow-600 italic border-b-4 border-[#a16207] pb-1">Category</span>
                        </h2>
                    </motion.div>

                    {isLoading ? (
                        <div className="text-center">Loading categories...</div>
                    ) : (
                        <div className="group relative w-full overflow-hidden">
                            <div className="flex gap-6 animate-marquee-slow group-hover:[animation-play-state:paused]">
                                {categories.map((item, index) => (
                                    <CategoryCard key={`${item.category}-${index}-1`} item={item} />
                                ))}
                                {categories.map((item, index) => (
                                    <CategoryCard key={`${item.category}-${index}-2`} item={item} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}