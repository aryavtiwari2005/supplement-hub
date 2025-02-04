import { supabase } from "@/utils/supabase";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  try {
    // Check if the user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already in use" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds set to 10

    // Generate a verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Add user to the database
    const { error } = await supabase.from("users").insert({
      name,
      email,
      password: hashedPassword, // Store the hashed password
      verification_token: verificationToken,
    });

    if (error) throw error;

    // Send verification email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify?token=${verificationToken}`;

    await transporter.sendMail({
      from: `"Supplement Hub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Email Verification",
      html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
    });

    return NextResponse.json({
      message: "Signup successful! Check your email for verification.",
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
