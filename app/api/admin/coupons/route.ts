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

// GET all coupons
export async function GET(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: coupons, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, coupons });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("GET Coupons API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to retrieve coupons" }, { status: 500 });
  }
}

// POST create coupon
export async function POST(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { code, discount_type, discount_value, min_purchase, active } = body as {
      code: string;
      discount_type: string;
      discount_value: number;
      min_purchase?: number;
      active?: boolean;
    };

    if (!code || !discount_type || discount_value === undefined) {
      return NextResponse.json({ error: "Code, Type, and Value are required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("coupons")
      .insert({
        code: code.trim().toUpperCase(),
        discount_type,
        discount_value,
        min_purchase: min_purchase || 0,
        active: active !== undefined ? active : true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, coupon: data });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("POST Coupon API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to create coupon" }, { status: 500 });
  }
}

// PUT update coupon
export async function PUT(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, code, discount_type, discount_value, min_purchase, active } = body as {
      id: string;
      code: string;
      discount_type: string;
      discount_value: number;
      min_purchase?: number;
      active?: boolean;
    };

    if (!id || !code || !discount_type || discount_value === undefined) {
      return NextResponse.json({ error: "ID, Code, Type, and Value are required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("coupons")
      .update({
        code: code.trim().toUpperCase(),
        discount_type,
        discount_value,
        min_purchase: min_purchase !== undefined ? min_purchase : 0,
        active: active !== undefined ? active : true
      })
      .eq("id", id)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, coupon: data });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("PUT Coupon API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to update coupon" }, { status: 500 });
  }
}

// DELETE coupon
export async function DELETE(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("coupons")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: `Coupon ${id} deleted successfully` });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("DELETE Coupon API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to delete coupon" }, { status: 500 });
  }
}
