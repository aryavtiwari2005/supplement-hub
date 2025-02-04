// /pages/api/user.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";
import jwt from "jsonwebtoken";

// Handle GET and POST requests
export async function GET(req: NextRequest) {
  const token = req.cookies.get("authToken")?.value;

  if (!token) {
    console.log("Unauthorized");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Decode JWT to get user ID
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined!");
    }

    const jwtSecret: string = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, jwtSecret) as any;
    const userId = decoded.userId;

    // Fetch user details from Supabase
    const { data: user, error } = await supabase
      .from("users") // Replace 'users' with your Supabase table name
      .select("id, name, email") // Adjust the fields as needed
      .eq("id", userId)
      .single();

    if (error || !user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Invalid token or server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { action } = await req.json();

  // Handle logout action
  if (action === "logout") {
    const response = NextResponse.json({ message: "Logged out successfully" });
    response.cookies.set("authToken", "", { maxAge: 0, path: "/" }); // Clear the cookie
    return response;
  }

  return NextResponse.json({ message: "Invalid action" }, { status: 400 });
}
