// /src/app/api/create-razorpay-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import jwt from "jsonwebtoken";
import { supabase } from "@/utils/supabase";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error(
    "Razorpay credentials are not defined in environment variables."
  );
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req: NextRequest) {
  const token = req.cookies.get("authToken")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined!");
    }

    const jwtSecret: string = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, jwtSecret) as { userId: number };
    const authenticatedUserId = decoded.userId;

    const { cartItems, userId, couponCode } = await req.json();

    if (authenticatedUserId !== userId) {
      return NextResponse.json(
        { message: "User ID mismatch" },
        { status: 403 }
      );
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { message: "Invalid or empty cart items" },
        { status: 400 }
      );
    }

    // Calculate subtotal
    const subtotal = cartItems.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    // Apply coupon discount if provided
    let totalAmount = subtotal;
    if (couponCode) {
      const { data: coupon, error } = await supabase
        .from("coupons")
        .select("discount_percentage, expires_at")
        .eq("code", couponCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (error || !coupon) {
        return NextResponse.json(
          { message: "Invalid or expired coupon code" },
          { status: 400 }
        );
      }

      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return NextResponse.json(
          { message: "Coupon code has expired" },
          { status: 400 }
        );
      }

      const discount = subtotal * (coupon.discount_percentage / 100);
      totalAmount = Math.max(0, subtotal - discount);
    }

    const totalAmountInPaise = totalAmount * 100;

    if (totalAmountInPaise <= 0) {
      return NextResponse.json(
        { message: "Total amount must be greater than zero" },
        { status: 400 }
      );
    }

    const order = await razorpay.orders.create({
      amount: totalAmountInPaise,
      currency: "INR",
      receipt: `order_${userId}_${Date.now()}`,
      payment_capture: true,
    });

    return NextResponse.json({ orderId: order.id }, { status: 200 });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    let message = "Internal server error";
    if (error instanceof jwt.JsonWebTokenError) {
      message = "Invalid token";
    } else if (error instanceof jwt.TokenExpiredError) {
      message = "Token expired";
    }
    return NextResponse.json({ message }, { status: 500 });
  }
}
