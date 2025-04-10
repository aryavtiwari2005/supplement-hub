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

interface BestSellerRow {
  product_id: number;
  sales_count: number;
  products: {
    id: number;
    name: string;
    brand: string;
    category: string;
    subcategory: string | null;
    image: string;
    price: number;
    original_price: number | null;
    discount_percentage: number | null;
    rating: number;
    description: string | null;
  } | null; // Changed from array to single object or null
}

export interface Brand {
  name: string;
  logo: string;
}

export const BRANDS: Brand[] = [
  { name: "MuscleBlaze", logo: "/images/products/brands/muscleblaze.png" },
  { name: "Optimum Nutrition", logo: "/images/products/brands/on.png" },
  { name: "GNC", logo: "/images/products/brands/gnc.png" },
  { name: "Isopure", logo: "/images/products/brands/isopure.png" },
];

export const PRODUCT_CATEGORIES = [
  "Massive Discount Alert",
  "Wellness Range",
  "Best Selling Proteins",
];

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

  return data.map((item) => ({
    id: item.id,
    name: item.name,
    brand: item.brand,
    category: item.category,
    subcategory: item.subcategory || "",
    image: item.image,
    price: item.price,
    originalPrice: item.original_price || undefined,
    discountPercentage: item.discount_percentage || undefined,
    rating: item.rating,
    description: item.description || undefined,
  })) as Product[];
};

export const fetchBestSellers = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("best_seller_products")
    .select(
      `
      product_id,
      sales_count,
      products!best_seller_products_product_id_fkey (
        id,
        name,
        brand,
        category,
        subcategory,
        image,
        price,
        original_price,
        discount_percentage,
        rating,
        description
      )
    `
    )
    .order("sales_count", { ascending: false })
    .limit(4);

  if (error) {
    console.error("Error fetching best sellers:", error);
    throw new Error("Failed to fetch best-selling products");
  }

  console.log("Raw Supabase response:", data);

  if (!data || !Array.isArray(data)) {
    console.warn("No best seller data returned");
    return [];
  }

  const typedData = data as unknown as BestSellerRow[];

  const products = typedData
    .filter((item) => {
      const hasProduct = !!item.products; // Check if products is not null
      if (!hasProduct) {
        console.warn(`No product data for product_id: ${item.product_id}`);
      }
      return hasProduct;
    })
    .map((item) => {
      const product = item.products!; // Safe to access after filter
      return {
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        subcategory: product.subcategory || "",
        image: product.image,
        price: product.price,
        originalPrice: product.original_price || undefined,
        discountPercentage: product.discount_percentage || undefined,
        rating: product.rating,
        description: product.description || undefined,
      };
    }) as Product[];

  console.log("Processed best sellers:", products);
  return products;
};
