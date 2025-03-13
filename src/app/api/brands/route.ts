import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Zap } from "lucide-react";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const formatBrandName = (slug: string) => {
  return slug
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("-");
};

export async function GET() {
  try {
    // Fetch all products and get unique brands
    const { data, error } = await supabase
      .from("products")
      .select("brand")
      .not("brand", "is", null); // Exclude null brands

    if (error) {
      console.error("Error fetching brands:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch brands" },
        { status: 500 }
      );
    }

    // Extract unique brand names (case-insensitive)
    const uniqueBrands = [
      ...new Set(
        data
          .map((item) => item.brand?.toLowerCase())
          .filter((brand): brand is string => brand !== undefined)
      ),
    ].map((brand) => ({
      name: brand.charAt(0).toUpperCase() + brand.slice(1), // Capitalize first letter
      href: `/brands/${formatBrandName(brand)}`, // Dynamic route for each brand
      icon: Zap, // You can adjust the icon as needed
    }));

    return NextResponse.json(uniqueBrands);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
