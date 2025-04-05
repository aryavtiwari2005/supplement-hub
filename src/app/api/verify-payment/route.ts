import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";
import jwt from "jsonwebtoken";
import { orderService } from "@/services/orderService";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("orderId");
  const transactionId = url.searchParams.get("transactionId");
  console.log("Verify payment request:", { orderId, transactionId });

  if (!orderId || !transactionId) {
    console.error("Missing orderId or transactionId");
    return NextResponse.json(
      { error: "Missing orderId or transactionId" },
      { status: 400 }
    );
  }

  const token = req.cookies.get("authToken")?.value;
  if (!token) {
    console.error("No auth token found");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };
    const userId = decoded.userId;

    const { data: pendingOrder } = await supabase
      .from("pending_orders")
      .select("*")
      .eq("temp_order_id", orderId)
      .eq("user_id", userId)
      .single();

    if (pendingOrder) {
      console.log("Found pending order:", pendingOrder);
      return NextResponse.json({
        orderId,
        transactionId,
        status: "payment_pending",
      });
    }

    const order = await orderService.getOrder(userId, orderId);
    if (!order) {
      console.error("Order not found for user:", userId, orderId);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { data: transaction } = await supabase
      .from("payment_transactions")
      .select("status")
      .eq("transaction_id", transactionId)
      .eq("order_id", orderId)
      .single();

    console.log("Payment verification result:", {
      orderStatus: order.status,
      transactionStatus: transaction?.status,
    });
    return NextResponse.json({
      orderId,
      transactionId,
      status: order.status,
      paymentStatus: transaction?.status || "unknown",
    });
  } catch (error: any) {
    console.error("Verify payment error:", error.message, error.stack);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}
