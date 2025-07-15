import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const CASHFREE_API_URL = process.env.CASHFREE_API_URL || "https://sandbox.cashfree.com/pg";
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOrderConfirmationEmail(userEmail: string, order: any) {
  try {
    const itemsList = order.items
      .map(
        (item: any) => `${item.name} (Qty: ${item.quantity}) - ₹${item.price}`
      )
      .join("\n");

    await transporter.sendMail({
      from: `"Supplement Hub" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Order Confirmation - ${order.order_id}`,
      html: `
        <h2>Thank you for your order!</h2>
        <p><strong>Order ID:</strong> ${order.order_id}</p>
        <h3>Items:</h3>
        <ul>${order.items
          .map(
            (item: any) =>
              `<li>${item.name} (Qty: ${item.quantity}) - ₹${item.price}</li>`
          )
          .join("")}</ul>
        <p><strong>Subtotal:</strong> ₹${order.subtotal}</p>
        <p><strong>Discount:</strong> ₹${order.discount}</p>
        <p><strong>Total:</strong> ₹${order.total}</p>
        <h3>Shipping Address:</h3>
        <p>${order.address.street}<br>${order.address.city}, ${order.address.state} ${order.address.zipCode}</p>
        <p><strong>Payment Method:</strong> ${order.payment_method}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <p><strong>Scoop Points Used:</strong> ${order.scoop_points_used || 0}</p>
        <p><strong>Scoop Points Earned:</strong> ${order.scoop_points_earned || 0}</p>
      `,
    });
    console.log("Order confirmation email sent to:", userEmail);
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("orderId") || url.searchParams.get("order_id");
  const orderToken = url.searchParams.get("orderToken") || url.searchParams.get("order_id");

  if (!orderId || !orderToken) {
    console.error("Missing orderId or orderToken:", { orderId, orderToken });
    return NextResponse.json(
      { error: "Missing orderId or orderToken" },
      { status: 400 }
    );
  }

  const token = req.cookies.get("authToken")?.value;
  if (!token) {
    console.error("Missing auth token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    const userId = decoded.userId;

    if (!CASHFREE_API_URL || !CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
      console.error("Missing Cashfree configuration:", {
        CASHFREE_API_URL,
        CASHFREE_APP_ID: !!CASHFREE_APP_ID,
        CASHFREE_SECRET_KEY: !!CASHFREE_SECRET_KEY,
      });
      return NextResponse.json(
        { error: "Cashfree configuration missing" },
        { status: 500 }
      );
    }

    // Check if order is already in user's orders
    const { data: userData, error: userError } = await supabase
      .from("users_onescoop")
      .select("orders, scoop_points, email")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Failed to fetch user data:", userError);
      throw userError;
    }

    const currentOrders = Array.isArray(userData.orders) ? userData.orders : [];
    if (currentOrders.some((order: any) => order.order_id === orderId)) {
      console.log("Order already exists in user profile:", orderId);
      return NextResponse.json({
        orderId,
        orderToken,
        status: "pending",
        paymentStatus: "success",
      });
    }

    // Check pending order
    const { data: pendingOrder, error: pendingError } = await supabase
      .from("pending_orders")
      .select("*")
      .eq("temp_order_id", orderId)
      .eq("user_id", userId)
      .single();

    if (pendingError || !pendingOrder) {
      console.error("Pending order not found:", { orderId, userId, error: pendingError });
      return NextResponse.json(
        { error: "Pending order not found" },
        { status: 404 }
      );
    }

    // Check transaction status
    const { data: transaction, error: txnError } = await supabase
      .from("payment_transactions")
      .select("status, failure_reason, final_order_id")
      .eq("transaction_id", orderToken)
      .single();

    if (txnError || !transaction) {
      console.error("Transaction not found:", { orderToken, error: txnError });
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Return early if transaction is processed
    if (["success", "failed", "cancelled", "expired"].includes(transaction.status)) {
      console.log("Transaction status from database:", {
        orderToken,
        status: transaction.status,
        failure_reason: transaction.failure_reason,
      });
      return NextResponse.json({
        orderId,
        orderToken,
        status: "pending",
        paymentStatus: transaction.status,
        failureReason: transaction.failure_reason || undefined,
      });
    }

    // Fetch status from Cashfree API
    const statusResponse = await fetch(`${CASHFREE_API_URL}/orders/${orderToken}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": CASHFREE_APP_ID!,
        "x-client-secret": CASHFREE_SECRET_KEY!,
      },
    });

    const statusData = await statusResponse.json();
    console.log("Cashfree API status response:", JSON.stringify(statusData, null, 2));

    if (!statusResponse.ok) {
      console.error("Cashfree API error:", statusData);
      return NextResponse.json(
        { error: "Failed to verify payment status", details: statusData.message },
        { status: statusResponse.status }
      );
    }

    let paymentStatus: string;
    let failureReason: string | undefined;

    switch (statusData.order_status) {
      case "PAID":
        paymentStatus = "success";
        break;
      case "TERMINATED":
        paymentStatus = statusData.order_status_details || "failed";
        failureReason = statusData.order_error_reason || "Payment terminated";
        break;
      case "EXPIRED":
        paymentStatus = "expired";
        failureReason = "Order expired";
        break;
      default:
        paymentStatus = "pending";
        failureReason = undefined;
    }

    if (paymentStatus === "success") {
      const newOrder = {
        items: pendingOrder.cart_items,
        total: pendingOrder.amount,
        subtotal: pendingOrder.subtotal,
        discount: pendingOrder.discount,
        status: "pending",
        address: pendingOrder.address,
        order_id: orderId,
        created_at: new Date().toISOString(),
        coupon_code: pendingOrder.coupon_code || null,
        payment_method: "cashfree",
        transaction_id: orderToken,
        scoop_points_used: pendingOrder.scoop_points_used || 0,
        scoop_points_earned: pendingOrder.scoop_points_earned || 0,
      };

      const updatedOrders = [...currentOrders, newOrder];
      const newScoopPoints =
        (userData.scoop_points || 0) -
        (pendingOrder.scoop_points_used || 0) +
        (pendingOrder.scoop_points_earned || 0);

      const { error: updateError } = await supabase
        .from("users_onescoop")
        .update({
          orders: updatedOrders,
          cart: [],
          scoop_points: newScoopPoints,
        })
        .eq("id", userId);

      if (updateError) {
        console.error("Failed to update user orders:", updateError);
        throw updateError;
      }

      await sendOrderConfirmationEmail(userData.email, newOrder);

      await supabase
        .from("pending_orders")
        .delete()
        .eq("temp_order_id", orderId);

      await supabase
        .from("payment_transactions")
        .update({
          status: "success",
          updated_at: new Date().toISOString(),
          final_order_id: orderId,
        })
        .eq("transaction_id", orderToken);
    } else if (["failed", "cancelled", "expired"].includes(paymentStatus)) {
      await supabase
        .from("pending_orders")
        .update({
          status: paymentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("temp_order_id", orderId);

      await supabase
        .from("payment_transactions")
        .update({
          status: paymentStatus,
          updated_at: new Date().toISOString(),
          failure_reason: failureReason || statusData.order_error_reason || paymentStatus,
        })
        .eq("transaction_id", orderToken);
    }

    return NextResponse.json({
      orderId,
      orderToken,
      status: "pending",
      paymentStatus,
      failureReason,
    });
  } catch (error: any) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment", details: error.message },
      { status: 500 }
    );
  }
}