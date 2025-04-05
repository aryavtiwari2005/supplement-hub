import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/utils/supabase";
import { orderService } from "@/services/orderService";

// Hardcode sandbox URL for testing
const PHONEPE_HOST = process.env.PHONEPE_HOST;
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const SALT_KEY = process.env.PHONEPE_SALT_KEY;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";
const CALLBACK_URL = process.env.NEXT_PUBLIC_APP_URL + "/api/payment-callback";
const REDIRECT_URL = process.env.NEXT_PUBLIC_APP_URL + "/payment-status";

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
        {
          error:
            "Payment gateway not configured properly. Missing MERCHANT_ID or SALT_KEY.",
        },
        { status: 500 }
      );
    }

    const tempOrderId = `temp-order-${Date.now()}`;
    const merchantTransactionId = `MT${Date.now()}`;
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
        "Failed to store transaction:",
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
      merchantUserId: `MUID${userId}`,
      amount: Math.round(amount * 100), // Amount in paise
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

    const endpoint = "/pg/v1/pay";
    const stringToHash = payloadBase64 + endpoint + SALT_KEY;
    console.log("Checksum string:", stringToHash);
    const sha256 = crypto
      .createHash("sha256")
      .update(stringToHash)
      .digest("hex");
    const checksum = `${sha256}###${SALT_INDEX}`;
    console.log("Generated checksum:", checksum);
    console.log("Fetching from URL:", `${PHONEPE_HOST}${endpoint}`);

    // Retry logic for 429
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`${PHONEPE_HOST}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": checksum,
            "X-MERCHANT-ID": MERCHANT_ID,
            Accept: "application/json",
          },
          body: JSON.stringify({ request: payloadBase64 }),
          signal: AbortSignal.timeout(60000),
        });

        const responseData = await response.json();
        console.log("PhonePe response status:", response.status);
        console.log(
          "PhonePe response data:",
          JSON.stringify(responseData, null, 2)
        );

        if (response.status === 429) {
          attempts++;
          console.log(
            `Rate limit hit (attempt ${attempts}/${maxAttempts}). Retrying in ${
              attempts * 5
            }s...`
          );
          await delay(attempts * 5000); // Exponential backoff: 5s, 10s, 15s
          continue;
        }

        if (!response.ok || !responseData.success) {
          console.error("PhonePe API error:", response.status, responseData);
          return NextResponse.json(
            {
              error: "Payment initiation failed",
              details:
                responseData.message || responseData.code || "Unknown error",
              phonePeResponse: responseData,
            },
            { status: response.status || 500 }
          );
        }

        if (
          !responseData.data ||
          !responseData.data.instrumentResponse?.redirectInfo?.url
        ) {
          console.error("Invalid PhonePe response structure:", responseData);
          throw new Error("Missing payment URL in PhonePe response");
        }

        return NextResponse.json({
          success: true,
          paymentUrl: responseData.data.instrumentResponse.redirectInfo.url,
        });
      } catch (fetchError: any) {
        console.error(
          "Fetch to PhonePe failed:",
          fetchError.message,
          fetchError.stack
        );
        throw new Error(
          `Failed to connect to PhonePe API: ${fetchError.message}`
        );
      }
    }

    console.error("Max retry attempts reached for PhonePe API");
    return NextResponse.json(
      { error: "Too many requests to PhonePe API. Please try again later." },
      { status: 429 }
    );
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
