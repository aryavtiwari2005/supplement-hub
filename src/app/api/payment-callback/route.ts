import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";
import crypto from "crypto";
import { cartService } from "@/services/cartService";
import nodemailer from "nodemailer";

interface CustomError extends Error {
  message: string;
  code?: string;
  details?: any;
}

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const xVerifyHeader = req.headers.get("x-webhook-signature");
    console.log(
      "Callback received:",
      JSON.stringify(body, null, 2),
      "X-WEBHOOK-SIGNATURE:",
      xVerifyHeader
    );

    if (!xVerifyHeader) {
      console.error("Missing X-WEBHOOK-SIGNATURE header");
      return NextResponse.json(
        { error: "Missing verification header" },
        { status: 400 }
      );
    }

    const secretKey = process.env.CASHFREE_SECRET_KEY;
    if (!secretKey) {
      console.error("Missing CASHFREE_SECRET_KEY");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const stringToHash = JSON.stringify(body);
    const calculatedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(stringToHash)
      .digest("base64");

    if (calculatedSignature !== xVerifyHeader) {
      console.error("Signature mismatch:", {
        calculatedSignature,
        xVerifyHeader,
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const { event, data } = body;
    const { order_id: orderToken, order_status } = data;
    if (!event || !orderToken) {
      console.error("Missing event or order_id in webhook payload");
      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    console.log("Processing webhook event:", { event, orderToken, order_status });

    // Get transaction details
    const { data: transaction, error: txnFetchError } = await supabase
      .from("payment_transactions")
      .select("order_id, user_id, status")
      .eq("transaction_id", orderToken)
      .single();

    if (txnFetchError || !transaction) {
      console.error("Transaction not found or fetch error:", txnFetchError);
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Check for idempotency
    if (["success", "failed", "cancelled", "expired"].includes(transaction.status)) {
      console.log("Transaction already processed:", { orderToken, status: transaction.status });
      return NextResponse.json({ success: true });
    }

    const tempOrderId = transaction.order_id;
    const userId = transaction.user_id;

    const { data: pendingOrder, error: fetchError } = await supabase
      .from("pending_orders")
      .select("*")
      .eq("temp_order_id", tempOrderId)
      .single();

    if (fetchError || !pendingOrder) {
      console.error("Pending order not found:", fetchError);
      return NextResponse.json(
        { error: "Pending order not found" },
        { status: 404 }
      );
    }

    // Handle different webhook events
    switch (event) {
      case "PAYMENT_SUCCESS":
        if (order_status !== "PAID") {
          console.error("PAYMENT_SUCCESS event with non-PAID status:", order_status);
          return NextResponse.json(
            { error: "Invalid payment status for PAYMENT_SUCCESS" },
            { status: 400 }
          );
        }

        try {
          console.log("Processing successful payment...");
          const subtotal = pendingOrder.cart_items.reduce(
            (sum: number, item: any) => {
              if (!item.price || !item.quantity) {
                console.error("Invalid item data:", item);
                throw new Error("Invalid item data in cart");
              }
              return sum + item.price * item.quantity;
            },
            0
          );

          let discount = pendingOrder.discount || 0;
          const total = subtotal - discount;

          const orderId = `order-${Date.now()}`;
          const newOrder = {
            items: pendingOrder.cart_items,
            total,
            status: "pending",
            address: pendingOrder.address,
            discount,
            order_id: orderId,
            subtotal,
            created_at: new Date().toISOString(),
            coupon_code: pendingOrder.coupon_code || null,
            payment_method: "cashfree",
            scoop_points_used: pendingOrder.scoop_points_used || 0,
            scoop_points_earned: pendingOrder.scoop_points_earned || 0,
            transaction_id: orderToken,
          };

          // Update user orders and scoop points
          let updateSuccess = false;
          let attempts = 0;
          const maxAttempts = 3;

          while (attempts < maxAttempts && !updateSuccess) {
            try {
              const { data: userData, error: userFetchError } = await supabase
                .from("users_onescoop")
                .select("orders, email, scoop_points")
                .eq("id", userId)
                .single();

              if (userFetchError || !userData) {
                throw new Error(`Failed to fetch user data: ${userFetchError?.message}`);
              }

              const currentOrders = Array.isArray(userData.orders) ? userData.orders : [];
              if (currentOrders.some((order: any) => order.order_id === orderId)) {
                console.log("Order already exists in user profile:", orderId);
                updateSuccess = true;
                break;
              }

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
                throw new Error(`Update failed: ${updateError.message}`);
              }

              // Verify update
              const { data: verifyData, error: verifyError } = await supabase
                .from("users_onescoop")
                .select("orders")
                .eq("id", userId)
                .single();

              if (
                verifyError ||
                !verifyData?.orders.some((o: any) => o.order_id === orderId)
              ) {
                throw new Error("Order update verification failed");
              }

              updateSuccess = true;
              await sendOrderConfirmationEmail(userData.email, newOrder);
            } catch (error) {
              attempts++;
              const typedError = error as CustomError;
              console.error(`Update attempt ${attempts} failed:`, typedError.message);
              if (attempts === maxAttempts) throw typedError;
              await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
            }
          }

          if (!updateSuccess) {
            throw new Error("Failed to update user orders after all attempts");
          }

          // Clean up
          const { error: deleteError } = await supabase
            .from("pending_orders")
            .delete()
            .eq("temp_order_id", tempOrderId);

          if (deleteError) {
            console.warn("Failed to delete pending order:", deleteError.message);
          }

          const { error: txnUpdateError } = await supabase
            .from("payment_transactions")
            .update({
              status: "success",
              updated_at: new Date().toISOString(),
              final_order_id: orderId,
            })
            .eq("transaction_id", orderToken);

          if (txnUpdateError) {
            console.warn("Failed to update transaction:", txnUpdateError.message);
          }

          console.log("Order successfully processed:", {
            orderId,
            userId,
            transactionId: orderToken,
            orderCount: (
              await supabase
                .from("users_onescoop")
                .select("orders")
                .eq("id", userId)
                .single()
            ).data?.orders.length,
          });
        } catch (error) {
          const typedError = error as CustomError;
          console.error("Order processing failed:", typedError.message, typedError.stack);

          await supabase.from("failed_orders").insert({
            user_id: userId,
            order_data: {
              ...pendingOrder,
              transaction_id: orderToken,
              failed_at: new Date().toISOString(),
              error_message: typedError.message,
            },
          });

          return NextResponse.json(
            {
              error: "Failed to process successful payment",
              details: typedError.message,
            },
            { status: 500 }
          );
        }
        break;

      case "PAYMENT_FAILED":
      case "USER_DROPPED":
      case "ORDER_EXPIRED":
        console.log(`Handling ${event} event:`, order_status);
        const statusMap: { [key: string]: string } = {
          PAYMENT_FAILED: "failed",
          USER_DROPPED: "cancelled",
          ORDER_EXPIRED: "expired",
        };

        await supabase
          .from("pending_orders")
          .update({
            status: statusMap[event],
            updated_at: new Date().toISOString(),
          })
          .eq("temp_order_id", tempOrderId);

        await supabase
          .from("payment_transactions")
          .update({
            status: statusMap[event],
            updated_at: new Date().toISOString(),
            failure_reason: data.error_message || event,
          })
          .eq("transaction_id", orderToken);
        break;

      default:
        console.warn("Unhandled webhook event:", event);
        return NextResponse.json(
          { error: `Unsupported webhook event: ${event}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const typedError = error as CustomError;
    console.error("Callback processing error:", typedError.message, typedError.stack);
    return NextResponse.json(
      { error: typedError.message || "Failed to process callback" },
      { status: 500 }
    );
  }
}