import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";
import jwt from "jsonwebtoken";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentPreference?: string;
  cart?: any[];
  orders?: any[];
  scoopPoints?: number; // Added Scoop Points
}

interface Address {
  street: string;
  city: string;
  state: string;
  zip_code: string;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("authToken")?.value;
  if (!token)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };
    const userId = decoded.userId;

    const { data: user, error } = await supabase
      .from("users_onescoop")
      .select(
        `
        id,
        name,
        email,
        phone,
        cart,
        orders,
        scoop_points,
        address:users_address!users_address_user_id_fkey(street, city, state, zip_code),
        payment_preference
      `
      )
      .eq("id", userId)
      .single();

    if (error) throw error;
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    const orders = user.orders?.map((order: any) => ({ ...order })) || [];
    const addressData =
      Array.isArray(user.address) && user.address.length > 0
        ? {
            street: String(user.address[0].street),
            city: String(user.address[0].city),
            state: String(user.address[0].state),
            zip_code: String(user.address[0].zip_code),
          }
        : null;

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        cart: user.cart,
        orders,
        address: addressData
          ? {
              street: addressData.street,
              city: addressData.city,
              state: addressData.state,
              zipCode: addressData.zip_code,
            }
          : undefined,
        paymentPreference: user.payment_preference,
        scoopPoints: user.scoop_points || 0, // Include Scoop Points
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, address, paymentPreference, scoopPoints } =
      await req.json();
    const token = req.cookies.get("authToken")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not configured");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      userId: number;
    };
    const userId = decoded.userId;

    if (action === "logout") {
      const response = NextResponse.json({
        message: "Logged out successfully",
      });
      response.cookies.set("authToken", "", { maxAge: 0, path: "/" });
      return response;
    }

    if (action === "save-address" && address) {
      const { error } = await supabase.from("users_address").upsert({
        user_id: userId,
        street: address.street,
        city: address.city,
        state: address.state,
        zip_code: address.zipCode,
      });

      if (error) throw error;
      return NextResponse.json({ message: "Address saved" });
    }

    if (action === "save-payment-preference" && paymentPreference) {
      const { error } = await supabase
        .from("users_onescoop")
        .update({ payment_preference: paymentPreference })
        .eq("id", userId);

      if (error) throw error;
      return NextResponse.json({ message: "Payment preference saved" });
    }

    if (action === "update-scoop-points" && scoopPoints !== undefined) {
      const { error } = await supabase
        .from("users_onescoop")
        .update({ scoop_points: scoopPoints })
        .eq("id", userId);

      if (error) throw error;
      return NextResponse.json({ message: "Scoop Points updated" });
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("User API POST error:", error.message);
    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: 500 }
    );
  }
}
