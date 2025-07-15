import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const CASHFREE_API_URL = process.env.CASHFREE_API_URL || "https://sandbox.cashfree.com/pg";
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { couponCode, scoopPointsToRedeem = 0, cashfreeDiscount = 0 } = body;

    const token = req.cookies.get("authToken")?.value;
    if (!token) {
      console.error("Missing auth token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userId: number;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
      userId = decoded.userId;
      if (!userId) {
        throw new Error("Invalid userId in JWT token");
      }
      console.log("Authenticated user:", { userId });
    } catch (error) {
      console.error("JWT verification failed:", error);
      return NextResponse.json({ error: "Invalid auth token" }, { status: 401 });
    }

    // Fetch user data and address
    const { data: userData, error: userError } = await supabase
      .from("users_onescoop")
      .select(`
        cart,
        email,
        phone,
        scoop_points,
        users_address:users_address!user_id (
          street,
          city,
          state,
          zip_code
        )
      `)
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      console.error("Failed to fetch user data:", userError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("User data retrieved:", {
      userId,
      email: userData.email,
      phone: userData.phone,
      cart: userData.cart,
      scoopPoints: userData.scoop_points,
      addressCount: Array.isArray(userData.users_address) ? userData.users_address.length : userData.users_address ? 1 : 0,
    });

    const { cart, email, phone, scoop_points, users_address } = userData;
    if (!cart || cart.length === 0) {
      console.error("Cart is empty for user:", userId);
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Validate address
    const address = Array.isArray(users_address) ? users_address[0] : users_address;
    if (!address || !address.street || !address.city || !address.state || !address.zip_code) {
      console.error("Invalid or missing address for user:", userId);
      return NextResponse.json({ error: "Shipping address is required" }, { status: 400 });
    }

    if (!email) {
      console.error("Missing email for user:", userId);
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const customerPhone = phone || "9999999999";
    if (!phone) {
      console.warn("Phone number missing, using fallback:", customerPhone);
    }

    // Calculate order details
    const subtotal = cart.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // Apply coupon discount
    let couponDiscount = 0;
    let couponApplied = null;

    if (couponCode) {
      const { data: coupon, error: couponError } = await supabase
        .from("coupons")
        .select("code, discount_percentage")
        .eq("code", couponCode)
        .eq("is_active", true)
        .gte("expires_at", new Date().toISOString())
        .single();

      if (couponError || !coupon) {
        console.warn("Invalid or expired coupon:", { couponCode, couponError });
        return NextResponse.json({ error: "Invalid or expired coupon code" }, { status: 400 });
      }

      couponDiscount = subtotal * (coupon.discount_percentage / 100);
      couponApplied = coupon.code;
      console.log("Applied coupon:", { couponCode, discount_percentage: coupon.discount_percentage, couponDiscount });
    }

    // Validate scoop points
    if (scoopPointsToRedeem > scoop_points) {
      console.error("Insufficient scoop points:", { scoopPointsToRedeem, available: scoop_points });
      return NextResponse.json({ error: "Insufficient scoop points" }, { status: 400 });
    }

    // Cap scoop points discount at 50% of subtotal after coupon
    const maxScoopDiscount = (subtotal - couponDiscount) * 0.5;
    const scoopDiscount = Math.min(scoopPointsToRedeem, maxScoopDiscount);

    // Apply Cashfree discount (3% if applicable)
    const totalAfterCouponAndScoop = subtotal - couponDiscount - scoopDiscount;
    const cashfreeDiscountApplied = cashfreeDiscount > 0 ? Math.min(cashfreeDiscount, totalAfterCouponAndScoop * 0.03) : 0;

    const total = totalAfterCouponAndScoop - cashfreeDiscountApplied;
    if (total <= 0) {
      console.error("Invalid total amount after discounts:", total);
      return NextResponse.json({ error: "Invalid order amount" }, { status: 400 });
    }

    const discount = couponDiscount + scoopDiscount + cashfreeDiscountApplied;
    console.log("Order details calculated:", {
      subtotal,
      couponDiscount,
      scoopDiscount,
      cashfreeDiscount: cashfreeDiscountApplied,
      total,
      couponApplied,
    });

    // Generate unique order ID
    const tempOrderId = `order-${uuidv4()}`;
    const orderToken = `order_${uuidv4().replace(/-/g, "")}`;

    // Save pending order
    const { error: pendingOrderError } = await supabase
      .from("pending_orders")
      .insert({
        temp_order_id: tempOrderId,
        user_id: userId,
        cart_items: cart,
        amount: total,
        subtotal,
        discount,
        coupon_applied: couponApplied,
        status: "pending_payment",
        address: {
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zip_code,
        },
        payment_method: "cashfree",
        created_at: new Date().toISOString(),
        scoop_points_used: scoopDiscount,
        scoop_points_earned: Math.floor(total / 10),
      });

    if (pendingOrderError) {
      console.error("Failed to save pending order:", pendingOrderError);
      return NextResponse.json({ error: "Failed to create order", details: pendingOrderError.message }, { status: 500 });
    }

    console.log("Pending order saved:", { tempOrderId });

    // Save transaction
    const { error: txnError } = await supabase
      .from("payment_transactions")
      .insert({
        transaction_id: orderToken,
        order_id: tempOrderId,
        user_id: userId,
        status: "pending",
        amount: total,
        created_at: new Date().toISOString(),
      });

    if (txnError) {
      console.error("Failed to save transaction:", txnError);
      await supabase.from("pending_orders").delete().eq("temp_order_id", tempOrderId);
      return NextResponse.json({ error: "Failed to create transaction", details: txnError.message }, { status: 500 });
    }

    console.log("Transaction saved:", { orderToken, orderId: tempOrderId });

    // Update scoop points if used
    if (scoopDiscount > 0) {
      const { error: pointsError } = await supabase
        .from("users_onescoop")
        .update({ scoop_points: scoop_points - scoopDiscount })
        .eq("id", userId);

      if (pointsError) {
        console.error("Failed to update scoop points:", pointsError);
        await supabase.from("payment_transactions").delete().eq("transaction_id", orderToken);
        await supabase.from("pending_orders").delete().eq("temp_order_id", tempOrderId);
        return NextResponse.json({ error: "Failed to update scoop points", details: pointsError.message }, { status: 500 });
      }
      console.log("Scoop points updated:", { userId, pointsUsed: scoopDiscount });
    }

    // Create Cashfree order
    const customerId = `user_${userId}`;
    const orderData = {
      order_id: orderToken,
      order_amount: total,
      order_currency: "INR",
      order_note: `Order for user ${userId}`,
      customer_details: {
        customer_id: customerId,
        customer_name: email.split("@")[0],
        customer_email: email,
        customer_phone: customerPhone,
      },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-status?orderId=${tempOrderId}&orderToken=${orderToken}`,
      notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment-callback`,
    };

    console.log("Creating Cashfree order with payload:", JSON.stringify(orderData, null, 2));

    const response = await fetch(`${CASHFREE_API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": CASHFREE_APP_ID!,
        "x-client-secret": CASHFREE_SECRET_KEY!,
      },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();
    if (!response.ok) {
      console.error("Cashfree order creation failed:", result);
      await supabase.from("payment_transactions").delete().eq("transaction_id", orderToken);
      await supabase.from("pending_orders").delete().eq("temp_order_id", tempOrderId);
      if (scoopDiscount > 0) {
        await supabase.from("users_onescoop").update({ scoop_points }).eq("id", userId); // Rollback scoop points
      }
      return NextResponse.json(
        { error: "Failed to create payment order", details: result.message },
        { status: response.status }
      );
    }

    console.log("Cashfree order created:", { orderId: tempOrderId, orderToken, paymentSessionId: result.payment_session_id });

    return NextResponse.json({
      paymentSessionId: result.payment_session_id,
      orderId: tempOrderId,
      orderToken,
    });
  } catch (error: any) {
    console.error("Payment creation error:", error);
    const tempOrderId = `order-${uuidv4()}`; // Note: Won't match failed order
    await supabase.from("pending_orders").delete().eq("temp_order_id", tempOrderId);
    await supabase.from("payment_transactions").delete().eq("order_id", tempOrderId);
    return NextResponse.json(
      { error: "Failed to initiate payment", details: error.message },
      { status: 500 }
    );
  }
}