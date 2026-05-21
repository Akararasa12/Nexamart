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

// GET all orders
export async function GET(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, orders });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("GET Orders API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to retrieve orders" }, { status: 500 });
  }
}

// UPDATE order status / details
export async function PUT(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, payment_status, shipping_status, tracking_number } = body as {
      id: string;
      payment_status?: string;
      shipping_status?: string;
      tracking_number?: string | null;
    };

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Build update object based on what is provided
    const updateData: {
      payment_status?: string;
      shipping_status?: string;
      tracking_number?: string | null;
    } = {};

    if (payment_status !== undefined) updateData.payment_status = payment_status;
    if (shipping_status !== undefined) updateData.shipping_status = shipping_status;
    if (tracking_number !== undefined) updateData.tracking_number = tracking_number;

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, updated: data });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("PUT Order API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to update order" }, { status: 500 });
  }
}

// DELETE order
export async function DELETE(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("orders")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, message: `Order ${id} deleted successfully` });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("DELETE Order API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to delete order" }, { status: 500 });
  }
}
