import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const { data: journal, error } = await supabaseAdmin
        .from("journals")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      if (!journal) {
        return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });
      }

      return NextResponse.json({ success: true, journal });
    }

    const { data: journals, error } = await supabaseAdmin
      .from("journals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, journals });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("GET Public Journals API error:", err.message);
    return NextResponse.json({ error: "Gagal memproses jurnal" }, { status: 500 });
  }
}
