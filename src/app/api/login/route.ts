// /pages/api/login.ts
import { supabase } from "@/utils/supabase";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, password, email_verified")
      .eq("email", email)
      .single();

    if (error || !user) {
      return new Response(JSON.stringify({ message: "Invalid email" }), {
        status: 401,
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return new Response(JSON.stringify({ message: "Invalid password" }), {
        status: 401,
      });
    }

    if (!user.email_verified) {
      return new Response(
        JSON.stringify({ message: "Please verify your email" }),
        { status: 403 }
      );
    }

    // Create JWT Token
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined!");
    }

    const jwtSecret: string = process.env.JWT_SECRET as string;

    const token = jwt.sign({ userId: user.id }, jwtSecret, {
      expiresIn: "1h",
    });

    const response = NextResponse.json({ message: "Login successful" });
    response.cookies.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 3600, // 1 hour
    });

    return response;
  } catch (err: any) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 500,
    });
  }
}
