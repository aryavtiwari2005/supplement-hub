import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";
import { cartService } from "@/services/cartService";
import crypto from "crypto";

const PHONEPE_HOST = process.env.PHONEPE_HOST;
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const SALT_KEY = process.env.PHONEPE_SALT_KEY;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";
const REDIRECT_URL = process.env.NEXT_PUBLIC_APP_URL + "/payment-status";

export async function POST(req: NextRequest) {
  try {
    const {
      cartItems,
      userId,
      address,
      couponCode,
      orderId,
      scoopPointsToRedeem,
    } = await req.json();

    if (!cartItems || !userId || !address || !orderId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Calculate subtotal
    const subtotal = cartItems.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // Apply coupon discount
    let couponDiscount = 0;
    if (couponCode) {
      const coupon = await cartService.getCoupon(couponCode);
      if (coupon) {
        couponDiscount = subtotal * (coupon.discount_percentage / 100);
      }
    }

    // Apply scoop points discount (1 point = ₹1)
    const scoopPointsDiscount = scoopPointsToRedeem || 0;

    // Validate scoop points
    const { data: userData, error: userError } = await supabase
      .from("users_onescoop")
      .select("scoop_points")
      .eq("id", userId)
      .single();
    if (userError) {
      console.error("Error fetching user scoop points:", userError);
      return NextResponse.json(
        { error: "Failed to fetch user data" },
        { status: 500 }
      );
    }
    const availableScoopPoints = userData?.scoop_points || 0;
    if (scoopPointsToRedeem > availableScoopPoints) {
      return NextResponse.json(
        { error: "Insufficient scoop points" },
        { status: 400 }
      );
    }

    // Calculate total
    const totalDiscount = couponDiscount + scoopPointsDiscount;
    const total = Math.max(0, subtotal - totalDiscount);
    const scoopPointsEarned = Math.floor(total / 100) * 2;

    const merchantTransactionId = `MT${Date.now()}`;

    // Store pending order
    const { error: tempError } = await supabase.from("pending_orders").insert({
      temp_order_id: orderId,
      user_id: userId,
      cart_items: cartItems,
      amount: total,
      address,
      coupon_code: couponCode || null,
      payment_method: "phonePe",
      status: "pending_payment",
      created_at: new Date().toISOString(),
      transaction_id: merchantTransactionId,
      scoop_points_used: scoopPointsToRedeem || 0,
      scoop_points_earned: scoopPointsEarned,
      discount: totalDiscount,
      subtotal,
    });

    if (tempError) {
      console.error("Failed to store pending order:", tempError);
      return NextResponse.json(
        { error: "Failed to initiate payment process" },
        { status: 500 }
      );
    }

    const payload = {
      merchantId: MERCHANT_ID,
      merchantTransactionId,
      merchantUserId: `MUID${userId}`,
      amount: Math.round(total * 100), // Convert to paise
      redirectUrl: `${REDIRECT_URL}?orderId=${orderId}&transactionId=${merchantTransactionId}`,
      redirectMode: "REDIRECT",
      callbackUrl: process.env.NEXT_PUBLIC_APP_URL + "/api/payment-callback",
      paymentInstrument: { type: "UPI_INTENT" },
    };

    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString(
      "base64"
    );
    const endpoint = "/pg/v1/pay";
    const checksum = `${crypto
      .createHash("sha256")
      .update(payloadBase64 + endpoint + SALT_KEY)
      .digest("hex")}###${SALT_INDEX}`;

    const response = await fetch(`${PHONEPE_HOST}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        Accept: "application/json",
      },
      body: JSON.stringify({ request: payloadBase64 }),
    });

    const responseData = await response.json();
    if (!response.ok || !responseData.success) {
      console.error("PhonePe API error:", responseData);
      return NextResponse.json(
        { error: "Payment initiation failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentUrl: responseData.data.instrumentResponse.redirectInfo.url,
    });
  } catch (error: any) {
    console.error("PhonePe payment creation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate payment" },
      { status: 500 }
    );
  }
}
