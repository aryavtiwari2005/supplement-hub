import { supabase } from "./supabase";

export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  image: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  rating: number;
  description?: string;
}

export interface Brand {
  name: string;
  logo: string;
}

export const BRANDS: Brand[] = [
  {
    name: "MuscleBlaze",
    logo: "/images/products/brands/muscleblaze.png",
  },
  {
    name: "Optimum Nutrition",
    logo: "/images/products/brands/on.png",
  },
  {
    name: "GNC",
    logo: "/images/products/brands/gnc.png",
  },
  {
    name: "Isopure",
    logo: "/images/products/brands/isopure.png",
  },
];

export const PRODUCT_CATEGORIES = [
  "Massive Discount Alert",
  "Wellness Range",
  "Best Selling Proteins",
];

// Fetch Products
// utils/constants.ts
export const PRODUCTS = async (category?: string): Promise<Product[]> => {
  let query = supabase.from("products").select("*");
  if (category) {
    query = query.eq("category", category);
  }
  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return data as Product[];
};

export const fetchBestSellers = async (): Promise<Product[]> => {
  const products = await PRODUCTS();
  return products.filter(
    (product) => product.category === "Best Selling Proteins"
  );
};
