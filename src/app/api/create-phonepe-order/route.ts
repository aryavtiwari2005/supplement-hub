import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/utils/supabase";
import { orderService } from "@/services/orderService";

// Corrected sandbox URL: "preprod" instead of "prepod"
const PHONEPE_HOST =
  process.env.PHONEPE_HOST || "https://api-preprod.phonepe.com/apis/hermes";
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const SALT_KEY = process.env.PHONEPE_SALT_KEY;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";
const CALLBACK_URL = process.env.NEXT_PUBLIC_APP_URL + "/api/payment-callback";
const REDIRECT_URL = process.env.NEXT_PUBLIC_APP_URL + "/payment-status";

export async function POST(req: NextRequest) {
  try {
    const { cartItems, amount, userId, address, couponCode } = await req.json();
    console.log("Received request:", {
      cartItems,
      amount,
      userId,
      address,
      couponCode,
    });

    if (!cartItems || !amount || !userId || !address) {
      console.error("Missing required parameters");
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    if (!MERCHANT_ID || !SALT_KEY) {
      console.error("PhonePe credentials missing:", { MERCHANT_ID, SALT_KEY });
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    const tempOrderId = `temp-order-${Date.now()}`;
    const merchantTransactionId = `${tempOrderId}-${Date.now()}`;
    console.log("Generated IDs:", { tempOrderId, merchantTransactionId });

    const { error: tempError } = await supabase.from("pending_orders").insert({
      temp_order_id: tempOrderId,
      user_id: userId,
      cart_items: cartItems,
      amount,
      address,
      coupon_code: couponCode || null,
      payment_method: "phonePe",
      status: "pending_payment",
      created_at: new Date().toISOString(),
    });

    if (tempError) {
      console.error("Failed to store pending order:", tempError);
      throw new Error(
        "Failed to initiate payment process: " + tempError.message
      );
    }
    console.log("Pending order stored successfully");

    const { error: txnError } = await supabase
      .from("payment_transactions")
      .insert({
        order_id: tempOrderId,
        transaction_id: merchantTransactionId,
        user_id: userId,
        amount,
        status: "initiated",
        gateway: "phonepe",
        created_at: new Date().toISOString(),
      });

    if (txnError) {
      console.error(
        "Failed to store transaction, full error:",
        JSON.stringify(txnError, null, 2)
      );
      throw new Error(
        `Failed to record transaction: ${txnError.message || "Unknown error"}`
      );
    }
    console.log("Transaction recorded successfully");

    const payload = {
      merchantId: MERCHANT_ID,
      merchantTransactionId,
      merchantUserId: `MUID-${userId}`,
      amount: Math.round(amount * 100),
      redirectUrl: `${REDIRECT_URL}?orderId=${tempOrderId}&transactionId=${merchantTransactionId}`,
      redirectMode: "REDIRECT",
      callbackUrl: CALLBACK_URL,
      mobileNumber: "",
      paymentInstrument: { type: "PAY_PAGE" },
    };
    console.log("PhonePe payload:", payload);

    const payloadString = JSON.stringify(payload);
    const payloadBase64 = Buffer.from(payloadString).toString("base64");
    console.log("Payload base64:", payloadBase64);
    const string = payloadBase64 + "/pg/v1/pay" + SALT_KEY;
    console.log("Checksum string:", string);
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + SALT_INDEX;
    console.log("Generated checksum:", checksum);
    console.log("Fetching from URL:", `${PHONEPE_HOST}/pg/v1/pay`);

    const response = await fetch(`${PHONEPE_HOST}/pg/v1/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      body: JSON.stringify({ request: payloadBase64 }),
      signal: AbortSignal.timeout(30000),
    });

    const responseData = await response.json();
    console.log("PhonePe response status:", response.status);
    console.log("PhonePe response data:", responseData);

    if (!response.ok) {
      console.error("PhonePe API error:", response.status, responseData);
      return NextResponse.json(
        { error: "Payment initiation failed", details: responseData },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      paymentUrl: responseData.data.instrumentResponse.redirectInfo.url,
    });
  } catch (error: any) {
    console.error(
      "PhonePe payment creation error:",
      error.message,
      error.stack
    );
    return NextResponse.json(
      { error: error.message || "Failed to initiate payment" },
      { status: 500 }
    );
  }
}
