import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status
    } = body;

    if (!order_id || !status_code || !gross_amount || !signature_key || !transaction_status) {
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
    }

    // 1. Verify Signature Key (Only if server key is configured)
    if (MIDTRANS_SERVER_KEY) {
      const payloadString = order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY;
      const calculatedHash = crypto.createHash("sha512").update(payloadString).digest("hex");

      if (calculatedHash !== signature_key) {
        console.error("Midtrans Webhook: Invalid Signature Hash verification failed.");
        return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
      }
    }

    // 2. Map status code to standard states
    let finalPaymentStatus = "pending";

    if (transaction_status === "capture") {
      if (fraud_status === "challenge") {
        finalPaymentStatus = "challenge";
      } else if (fraud_status === "accept") {
        finalPaymentStatus = "paid";
      }
    } else if (transaction_status === "settlement") {
      finalPaymentStatus = "paid";
    } else if (["cancel", "deny", "expire"].includes(transaction_status)) {
      finalPaymentStatus = "failed";
    } else if (transaction_status === "pending") {
      finalPaymentStatus = "pending";
    }

    // 3. Update Order Status in Supabase
    const { error: dbError } = await supabaseAdmin
      .from("orders")
      .update({ payment_status: finalPaymentStatus })
      .eq("id", order_id);

    if (dbError) {
      console.error(`Supabase: Failed to update order status for ${order_id}:`, dbError.message);
      return NextResponse.json({ error: "Failed to update database" }, { status: 500 });
    }

    console.log(`Midtrans Webhook success: Order ${order_id} updated to ${finalPaymentStatus}`);
    return NextResponse.json({ status: "OK", paymentStatus: finalPaymentStatus });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Webhook processing error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to process webhook" }, { status: 500 });
  }
}
