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
    console.log("Order confirmation email sent to:", userEmail);
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const xVerifyHeader = req.headers.get("x-verify");
    console.log(
      "Callback received:",
      JSON.stringify(body, null, 2),
      "X-VERIFY:",
      xVerifyHeader
    );

    if (!xVerifyHeader) {
      console.error("Missing X-VERIFY header");
      return NextResponse.json(
        { error: "Missing verification header" },
        { status: 400 }
      );
    }

    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltIndex = process.env.PHONEPE_SALT_INDEX || "1";
    const stringToHash = `${JSON.stringify(body)}${saltKey}`;
    const calculatedChecksum =
      crypto.createHash("sha256").update(stringToHash).digest("hex") +
      "###" +
      saltIndex;

    if (calculatedChecksum !== xVerifyHeader) {
      console.error("Checksum mismatch:", {
        calculatedChecksum,
        xVerifyHeader,
      });
      return NextResponse.json({ error: "Invalid checksum" }, { status: 400 });
    }

    const { merchantTransactionId, code: responseCode } = body.data;
    console.log("Processing transaction:", {
      merchantTransactionId,
      responseCode,
    });

    // Get transaction details with validation
    const { data: transaction, error: txnFetchError } = await supabase
      .from("payment_transactions")
      .select("order_id, user_id, status")
      .eq("transaction_id", merchantTransactionId)
      .single();

    if (txnFetchError || !transaction) {
      console.error("Transaction not found or fetch error:", txnFetchError);
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Check if transaction was already processed
    if (transaction.status === "success") {
      console.log("Transaction already processed:", merchantTransactionId);
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

    if (responseCode === "PAYMENT_SUCCESS" || responseCode === "SUCCESS") {
      try {
        console.log("Payment successful, processing order...");
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

        let discount = 0;
        if (pendingOrder.coupon_code) {
          const coupon = await cartService.getCoupon(pendingOrder.coupon_code);
          discount = coupon ? subtotal * (coupon.discount_percentage / 100) : 0;
        }
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
          payment_method: "phonePe",
        };

        // Robust user update with verification
        let updateSuccess = false;
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts && !updateSuccess) {
          try {
            // Fetch current user data
            const { data: userData, error: userFetchError } = await supabase
              .from("users_onescoop")
              .select("orders, email")
              .eq("id", userId)
              .single();

            if (userFetchError || !userData) {
              throw new Error(
                `Failed to fetch user data: ${userFetchError?.message}`
              );
            }

            const currentOrders = Array.isArray(userData.orders)
              ? userData.orders
              : [];

            // Check if order already exists to prevent duplicates
            if (
              currentOrders.some((order: any) => order.order_id === orderId)
            ) {
              console.log("Order already exists in user profile:", orderId);
              updateSuccess = true;
              break;
            }

            const updatedOrders = [...currentOrders, newOrder];

            // Update user with new orders
            const { error: updateError } = await supabase
              .from("users_onescoop")
              .update({
                orders: updatedOrders,
                cart: [],
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
            console.error(
              `Update attempt ${attempts} failed:`,
              typedError.message
            );
            if (attempts === maxAttempts) throw typedError;
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * attempts)
            );
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
          .eq("transaction_id", merchantTransactionId);

        if (txnUpdateError) {
          console.warn("Failed to update transaction:", txnUpdateError.message);
        }

        console.log("Order successfully processed:", {
          orderId,
          userId,
          transactionId: merchantTransactionId,
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
        console.error(
          "Order processing failed:",
          typedError.message,
          typedError.stack
        );

        await supabase.from("failed_orders").insert({
          user_id: userId,
          order_data: {
            ...pendingOrder,
            transaction_id: merchantTransactionId,
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
    } else {
      console.log("Payment failed:", responseCode);
      await supabase
        .from("pending_orders")
        .delete()
        .eq("temp_order_id", tempOrderId);

      await supabase
        .from("payment_transactions")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
          failure_reason: responseCode || "Unknown error",
        })
        .eq("transaction_id", merchantTransactionId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const typedError = error as CustomError;
    console.error(
      "Callback processing error:",
      typedError.message,
      typedError.stack
    );
    return NextResponse.json(
      { error: typedError.message || "Failed to process callback" },
      { status: 500 }
    );
  }
}
