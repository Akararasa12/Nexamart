import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

async function verifyAuth(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader === "Bearer nexa_admin_authenticated") {
    return true;
  }
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;
    if (session === "nexa_admin_authenticated") {
      return true;
    }
  } catch {
    // Ignore error
  }
  return false;
}

// GET all subscriptions with product details
export async function GET(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Join with products table
    const { data: subscriptions, error } = await supabaseAdmin
      .from("subscriptions")
      .select("*, products(*)")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, subscriptions });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("GET Subscriptions API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to retrieve subscriptions" }, { status: 500 });
  }
}

// UPDATE subscription status/billing/frequency
export async function PUT(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, frequency, next_billing_date } = body as {
      id: string;
      status?: string;
      frequency?: string;
      next_billing_date?: string;
    };

    if (!id) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 });
    }

    const updateData: {
      status?: string;
      frequency?: string;
      next_billing_date?: string;
    } = {};

    if (status !== undefined) updateData.status = status;
    if (frequency !== undefined) updateData.frequency = frequency;
    if (next_billing_date !== undefined) updateData.next_billing_date = next_billing_date;

    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .update(updateData)
      .eq("id", id)
      .select("*, products(*)");

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, updated: data });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("PUT Subscription API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to update subscription" }, { status: 500 });
  }
}

// DELETE subscription
export async function DELETE(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("subscriptions")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, message: `Subscription ${id} deleted successfully` });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("DELETE Subscription API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to delete subscription" }, { status: 500 });
  }
}
