// src/app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const exclude = url.searchParams.get("exclude");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    // Start building the query
    let query = supabase.from("products").select("*");

    // Apply filters if provided
    if (category) {
      query = query.eq("category", category);
    }

    if (exclude) {
      query = query.neq("id", exclude);
    }

    // Get the result
    const { data, error } = await query.limit(limit);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    // Transform the product data to match the expected format in the frontend
    const formattedProducts = data.map((product) => ({
      ...product,
      discount: product.discount_percentage, // Map to the expected property name
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
