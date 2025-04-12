import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";
import { cartService } from "@/services/cartService";
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
        <p><strong>Scoop Points Used:</strong> ${
          order.scoop_points_used || 0
        }</p>
        <p><strong>Scoop Points Earned:</strong> ${
          order.scoop_points_earned || 0
        }</p>
      `,
    });
    console.log("COD Order confirmation email sent to:", userEmail);
  } catch (error) {
    console.error("Failed to send COD confirmation email:", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { cartItems, userId, address, couponCode, scoopPointsToRedeem } =
      await req.json();

    if (!cartItems || !userId || !address) {
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
    const scoopPointsEarned = Math.floor(total / 100) * 2; // 2 points per ₹100 spent

    const orderId = `order-${Date.now()}`;
    const newOrder = {
      items: cartItems,
      total,
      status: "Order placed",
      address,
      discount: totalDiscount,
      order_id: orderId,
      subtotal,
      created_at: new Date().toISOString(),
      coupon_code: couponCode || null,
      payment_method: "cod",
      scoop_points_used: scoopPointsToRedeem || 0,
      scoop_points_earned: scoopPointsEarned,
    };

    // Update user data
    const { data: userFullData, error: fetchError } = await supabase
      .from("users_onescoop")
      .select("orders, email, scoop_points")
      .eq("id", userId)
      .single();

    if (fetchError) {
      console.error("Error fetching user:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch user data" },
        { status: 500 }
      );
    }

    const currentOrders = Array.isArray(userFullData.orders)
      ? userFullData.orders
      : [];
    const updatedOrders = [...currentOrders, newOrder];
    const newScoopPoints =
      (userFullData.scoop_points || 0) -
      (scoopPointsToRedeem || 0) +
      scoopPointsEarned;

    const { error: updateError } = await supabase
      .from("users_onescoop")
      .update({
        orders: updatedOrders,
        cart: [],
        scoop_points: newScoopPoints,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating user orders:", updateError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    await sendOrderConfirmationEmail(userFullData.email, newOrder);

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
