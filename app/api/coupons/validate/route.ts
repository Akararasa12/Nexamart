import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, subtotal } = body as { code: string; subtotal: number };

    if (!code) {
      return NextResponse.json({ error: "Kode kupon wajib diisi" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Query database for coupon
    const { data: coupon, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("code", cleanCode)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!coupon) {
      return NextResponse.json({ error: "Kode promo tidak ditemukan" }, { status: 404 });
    }

    if (!coupon.active) {
      return NextResponse.json({ error: "Kode promo sudah tidak aktif" }, { status: 400 });
    }

    const subtotalNum = Number(subtotal) || 0;
    const minPurchaseNum = Number(coupon.min_purchase) || 0;

    if (subtotalNum < minPurchaseNum) {
      return NextResponse.json({ 
        error: `Total belanja belum memenuhi syarat. Minimal pembelian Rp ${new Intl.NumberFormat("id-ID").format(minPurchaseNum)}` 
      }, { status: 400 });
    }

    // Calculate discount amount
    let discountValue = 0;
    const value = Number(coupon.discount_value) || 0;

    if (coupon.discount_type === "percentage") {
      discountValue = Math.round(subtotalNum * (value / 100));
    } else {
      discountValue = Math.min(value, subtotalNum); // fixed discount cannot exceed subtotal
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: value,
        calculated_discount: discountValue
      }
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Validate Coupon API error:", err.message);
    return NextResponse.json({ error: "Gagal memproses validasi kupon" }, { status: 500 });
  }
}
