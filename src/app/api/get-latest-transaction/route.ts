import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("authToken")?.value;
        if (!token) {
            console.error("Missing auth token");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
        const userId = decoded.userId;

        const { data: transaction, error } = await supabase
            .from("payment_transactions")
            .select("transaction_id, order_id, status, failure_reason")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (error || !transaction) {
            console.error("No recent transactions found for user:", userId, error);
            return NextResponse.json({ error: "No recent transactions found" }, { status: 404 });
        }

        console.log("Latest transaction retrieved:", transaction);
        return NextResponse.json({ transaction });
    } catch (error: any) {
        console.error("Get latest transaction error:", error);
        return NextResponse.json(
            { error: "Failed to retrieve transaction", details: error.message },
            { status: 500 }
        );
    }
}