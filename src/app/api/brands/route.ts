import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Zap } from "lucide-react";

// Define the type for featured_brands table
interface FeaturedBrand {
  brand_name: string;
}

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
    // Fetch top 5 featured brands
    const { data, error } = (await supabase
      .from("featured_brands")
      .select("brand_name")
      .order("added_at", { ascending: false }) // Most recent first
      .limit(5)) as { data: FeaturedBrand[] | null; error: any };

    if (error) {
      console.error("Error fetching brands:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch brands" },
        { status: 500 }
      );
    }

    // Handle null or empty data
    if (!data) {
      return NextResponse.json([]);
    }

    // Format brands for response
    const brands = data.map((item) => ({
      name: item.brand_name.charAt(0).toUpperCase() + item.brand_name.slice(1), // Capitalize first letter
      href: `/brands/${formatBrandName(item.brand_name.toLowerCase())}`, // Dynamic route for each brand
      icon: Zap, // Consistent with original code
    }));

    return NextResponse.json(brands);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
