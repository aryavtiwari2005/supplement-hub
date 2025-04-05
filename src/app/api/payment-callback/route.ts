import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";
import { orderService } from "@/services/orderService";
import crypto from "crypto";
import { cartService } from "@/services/cartService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const xVerifyHeader = req.headers.get("x-verify");
    console.log("Callback received:", body, "X-VERIFY:", xVerifyHeader);

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

    const { merchantTransactionId, responseCode } = body.data;
    const tempOrderId = merchantTransactionId.split("-")[0];
    console.log("Processing callback:", {
      merchantTransactionId,
      responseCode,
      tempOrderId,
    });

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

    if (responseCode === "SUCCESS") {
      // Fixed typo: cart_items instead of cart items
      let subtotal = pendingOrder.cart_items.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      );
      let discount = 0;
      if (pendingOrder.coupon_code) {
        const coupon = await cartService.getCoupon(pendingOrder.coupon_code);
        if (coupon) discount = subtotal * (coupon.discount_percentage / 100);
      }
      const total = subtotal - discount;

      const orderId = `order-${Date.now()}`;
      const newOrder = {
        order_id: orderId,
        items: pendingOrder.cart_items,
        total,
        subtotal,
        discount,
        status: "paid",
        payment_method: "phonePe",
        address: pendingOrder.address,
        coupon_code: pendingOrder.coupon_code || null,
        created_at: new Date().toISOString(),
      };

      const { data: userData, error: userError } = await supabase
        .from("users_onescoop")
        .select("orders")
        .eq("id", pendingOrder.user_id)
        .single();

      if (userError) throw userError;

      const updatedOrders = [...(userData.orders || []), newOrder];
      const { error: updateError } = await supabase
        .from("users_onescoop")
        .update({ orders: updatedOrders, cart: [] })
        .eq("id", pendingOrder.user_id);

      if (updateError) throw updateError;

      await supabase
        .from("pending_orders")
        .delete()
        .eq("temp_order_id", tempOrderId);
      console.log("Order created and pending order deleted:", orderId);

      await supabase
        .from("payment_transactions")
        .update({ status: "success" })
        .eq("transaction_id", merchantTransactionId);
    } else {
      console.log("Payment failed or canceled:", responseCode);
      await supabase
        .from("pending_orders")
        .delete()
        .eq("temp_order_id", tempOrderId);
      await supabase
        .from("payment_transactions")
        .update({ status: "failed" })
        .eq("transaction_id", merchantTransactionId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Payment callback error:", error.message, error.stack);
    return NextResponse.json(
      { error: error.message || "Failed to process callback" },
      { status: 500 }
    );
  }
}
