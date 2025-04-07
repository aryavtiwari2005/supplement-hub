import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";
import nodemailer from "nodemailer";

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
        (item: any) => `${item.name} (Qty: ${item.quantity}) - $${item.price}`
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
              `<li>${item.name} (Qty: ${item.quantity}) - $${item.price}</li>`
          )
          .join("")}</ul>
        <p><strong>Subtotal:</strong> $${order.subtotal}</p>
        <p><strong>Discount:</strong> $${order.discount}</p>
        <p><strong>Total:</strong> $${order.total}</p>
        <h3>Shipping Address:</h3>
        <p>${order.address.street}<br>${order.address.city}, ${
        order.address.state
      } ${order.address.zipCode}</p>
        <p><strong>Payment Method:</strong> ${order.payment_method}</p>
        <p><strong>Status:</strong> ${order.status}</p>
      `,
    });
    console.log("COD Order confirmation email sent to:", userEmail);
  } catch (error) {
    console.error("Failed to send COD confirmation email:", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { cartItems, amount, userId, address, couponCode } = await req.json();

    if (!cartItems || !amount || !userId || !address) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const subtotal = cartItems.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );
    const discount = amount < subtotal ? subtotal - amount : 0;
    const total = amount;

    const orderId = `order-${Date.now()}`;
    const newOrder = {
      items: cartItems,
      total,
      status: "pending",
      address,
      discount,
      order_id: orderId,
      subtotal,
      created_at: new Date().toISOString(),
      coupon_code: couponCode || null,
      payment_method: "cod",
    };

    // Update user record
    const { data: userData, error: userError } = await supabase
      .from("users_onescoop")
      .select("orders, email")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Error fetching user:", userError);
      return NextResponse.json(
        { error: "Failed to fetch user data" },
        { status: 500 }
      );
    }

    const currentOrders = Array.isArray(userData.orders) ? userData.orders : [];
    const updatedOrders = [...currentOrders, newOrder];

    const { error: updateError } = await supabase
      .from("users_onescoop")
      .update({
        orders: updatedOrders,
        cart: [],
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating user orders:", updateError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    // Send confirmation email
    await sendOrderConfirmationEmail(userData.email, newOrder);

    return NextResponse.json({
      success: true,
      orderId,
    });
  } catch (error: any) {
    console.error("COD order creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create COD order" },
      { status: 500 }
    );
  }
}
