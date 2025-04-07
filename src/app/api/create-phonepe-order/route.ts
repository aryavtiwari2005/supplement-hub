import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/utils/supabase";

const PHONEPE_HOST = process.env.PHONEPE_HOST;
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const SALT_KEY = process.env.PHONEPE_SALT_KEY;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";
const REDIRECT_URL = process.env.NEXT_PUBLIC_APP_URL + "/payment-status";

export async function POST(req: NextRequest) {
  try {
    const { cartItems, amount, userId, address, couponCode, orderId } =
      await req.json();

    if (!cartItems || !amount || !userId || !address || !orderId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const merchantTransactionId = `MT${Date.now()}`;

    // Store pending order
    const { error: tempError } = await supabase.from("pending_orders").insert({
      temp_order_id: orderId,
      user_id: userId,
      cart_items: cartItems,
      amount,
      address,
      coupon_code: couponCode || null,
      payment_method: "phonePe",
      status: "pending_payment",
      created_at: new Date().toISOString(),
      transaction_id: merchantTransactionId,
    });

    if (tempError) {
      console.error("Failed to store pending order:", tempError);
      return NextResponse.json(
        { error: "Failed to initiate payment process" },
        { status: 500 }
      );
    }

    // Initiate PhonePe payment
    const payload = {
      merchantId: MERCHANT_ID,
      merchantTransactionId,
      merchantUserId: `MUID${userId}`,
      amount: Math.round(amount * 100),
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
