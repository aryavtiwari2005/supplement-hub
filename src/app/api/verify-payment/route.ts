import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

const PHONEPE_HOST = process.env.PHONEPE_HOST;
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const SALT_KEY = process.env.PHONEPE_SALT_KEY;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";

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
        <p>${order.address.street}<br>${order.address.city}, ${
        order.address.state
      } ${order.address.zipCode}</p>
        <p><strong>Payment Method:</strong> ${order.payment_method}</p>
        <p><strong>Status:</strong> ${order.status}</p>
      `,
    });
    console.log("Order confirmation email sent to:", userEmail);
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("orderId");
  const transactionId = url.searchParams.get("transactionId");

  if (!orderId || !transactionId) {
    return NextResponse.json(
      { error: "Missing orderId or transactionId" },
      { status: 400 }
    );
  }

  const token = req.cookies.get("authToken")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };
    const userId = decoded.userId;

    if (!PHONEPE_HOST || !MERCHANT_ID || !SALT_KEY) {
      return NextResponse.json(
        { error: "PhonePe configuration missing" },
        { status: 500 }
      );
    }

    // Check if order is already processed
    const { data: userData, error: userError } = await supabase
      .from("users_onescoop")
      .select("orders")
      .eq("id", userId)
      .single();

    if (userError) throw userError;

    const currentOrders = Array.isArray(userData.orders) ? userData.orders : [];
    if (currentOrders.some((order: any) => order.order_id === orderId)) {
      return NextResponse.json({
        orderId,
        transactionId,
        status: "pending",
        paymentStatus: "success",
      });
    }

    // Fetch pending order
    const { data: pendingOrder, error: pendingError } = await supabase
      .from("pending_orders")
      .select("*")
      .eq("temp_order_id", orderId)
      .eq("user_id", userId)
      .single();

    if (pendingError || !pendingOrder) {
      return NextResponse.json(
        { error: "Pending order not found" },
        { status: 404 }
      );
    }

    // Check PhonePe status
    const endpoint = `/pg/v1/status/${MERCHANT_ID}/${transactionId}`;
    const checksum = `${crypto
      .createHash("sha256")
      .update(`/pg/v1/status/${MERCHANT_ID}/${transactionId}${SALT_KEY}`)
      .digest("hex")}###${SALT_INDEX}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      Accept: "application/json",
    };
    if (MERCHANT_ID) headers["X-MERCHANT-ID"] = MERCHANT_ID;

    const statusResponse = await fetch(`${PHONEPE_HOST}${endpoint}`, {
      method: "GET",
      headers,
    });

    const statusData = await statusResponse.json();

    if (
      statusData.success &&
      (statusData.code === "PAYMENT_SUCCESS" || statusData.code === "SUCCESS")
    ) {
      // Payment successful, save order
      const newOrder = {
        items: pendingOrder.cart_items,
        total: pendingOrder.amount,
        subtotal: pendingOrder.cart_items.reduce(
          (sum: number, item: any) => sum + item.price * item.quantity,
          0
        ),
        discount: pendingOrder.coupon_code
          ? pendingOrder.cart_items.reduce(
              (sum: number, item: any) => sum + item.price * item.quantity,
              0
            ) - pendingOrder.amount
          : 0,
        status: "pending",
        address: pendingOrder.address,
        order_id: orderId,
        created_at: new Date().toISOString(),
        coupon_code: pendingOrder.coupon_code || null,
        payment_method: "phonePe",
        transaction_id: transactionId,
      };

      const updatedOrders = [...currentOrders, newOrder];
      const { error: updateError } = await supabase
        .from("users_onescoop")
        .update({ orders: updatedOrders, cart: [] })
        .eq("id", userId);

      if (updateError) throw updateError;

      // Send confirmation email
      const { data: emailData } = await supabase
        .from("users_onescoop")
        .select("email")
        .eq("id", userId)
        .single();
      if (emailData?.email)
        await sendOrderConfirmationEmail(emailData.email, newOrder);

      // Clean up pending order
      await supabase
        .from("pending_orders")
        .delete()
        .eq("temp_order_id", orderId);

      return NextResponse.json({
        orderId,
        transactionId,
        status: "pending",
        paymentStatus: "success",
      });
    } else {
      // Payment failed or pending, keep in pending_orders
      return NextResponse.json({
        orderId,
        transactionId,
        status: "pending",
        paymentStatus: "pending",
      });
    }
  } catch (error: any) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
