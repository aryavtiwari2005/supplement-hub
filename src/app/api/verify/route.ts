// api/verify/route.ts

import { supabase } from "@/utils/supabase";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ message: "Token is required" }, { status: 400 });
  }

  try {
    // Verify the token in the correct table
    const { data: user, error: findError } = await supabase
      .from("users_onescoop") // FIXED: Changed table to 'users_onescoop'
      .select("id")
      .eq("verification_token", token)
      .single();

    if (findError || !user) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // Mark email as verified in the correct table
    const { error: updateError } = await supabase
      .from("users_onescoop") // FIXED: Changed table to 'users_onescoop'
      .update({ email_verified: true, verification_token: null })
      .eq("id", user.id);

    if (updateError) throw updateError;

    // You can redirect the user to the login page or a success page
    // instead of just returning a JSON message.
    const url = new URL('/login?verified=true', req.url);
    return NextResponse.redirect(url);

  } catch (err: any) {
    const url = new URL('/login?error=verification-failed', req.url);
    return NextResponse.redirect(url);
  }
}