import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const SEED_JOURNALS = [
  {
    slug: "rahasia-galactomyces-kulit-cerah-alami",
    title: "Rahasia Galactomyces: Kunci Kulit Cerah Alami Murni",
    author: "dr. Livia W.",
    category: "Bahan Aktif",
    excerpt: "Mengapa fermentasi Galactomyces menjadi bahan legendaris dalam esens perawatan kulit premium? Simak manfaatnya untuk elastisitas dan skin barrier.",
    content: "Fermentasi Galactomyces adalah ragi filtrat yang kaya akan vitamin, asam amino, dan mineral penting. Bahan ini bekerja dengan cara meningkatkan kelembapan alami kulit, memperkuat skin barrier, dan menghambat produksi melanin secara aman. Penggunaan rutin esens Galactomyces terbukti memudarkan noda hitam, meratakan warna kulit, serta mengembalikan elastisitas alami wajah, memberikan kilau sehat murni yang tahan lama.",
    read_time: "5 Menit Baca"
  },
  {
    slug: "panduan-memulai-retinol-tanpa-purging",
    title: "Panduan Memulai Retinol Tanpa Takut Purging",
    author: "Elena Rose",
    category: "Anti-Aging",
    excerpt: "Banyak pemula takut mencoba retinol karena resiko purging. Simak tips mencampurnya dengan peptida dan squalane untuk hasil awet muda bebas kemerahan.",
    content: "Retinol adalah standar emas untuk regenerasi sel kulit dan pencegahan penuaan dini. Namun, efek iritasi awal (purging) sering kali membuat pemula mundur. Untuk menghindarinya, mulailah dengan metode sandwich: oleskan pelembap tipis, ikuti dengan retinol dosis rendah (0.1% - 0.2%), lalu kunci kembali dengan pelembap tebal. Mencampur retinol dengan bahan penenang seperti squalane atau peptida juga mempercepat adaptasi kulit Anda tanpa memicu dehidrasi.",
    read_time: "7 Menit Baca"
  },
  {
    slug: "double-cleansing-pentingnya-cleansing-balm",
    title: "Double Cleansing: Mengapa Balsem Pembersih Sangat Penting?",
    author: "Clara S.",
    category: "Deep Cleansing",
    excerpt: "Sabun wajah biasa tidak cukup melelehkan sebum tersumbat dan makeup tebal. Ketahui mengapa minyak almond manis dalam balsem pembersih adalah kunci kulit bernapas bebas jerawat.",
    content: "Menggunakan sabun cuci muka biasa sering kali menyisakan sisa tabir surya tahan air dan sebum berlebih di pori-pori. Balsem pembersih (Cleansing Balm) dengan kandungan lipid alami bekerja melarutkan kotoran berbasis minyak tersebut tanpa merusak pelindung kulit. Setelah dibilas dengan air hangat, ikuti dengan pembersih berbasis air yang lembut untuk memastikan wajah bersih total dan siap menyerap nutrisi skincare selanjutnya secara optimal.",
    read_time: "4 Menit Baca"
  }
];

async function checkAndSeedJournals() {
  const { count, error: countError } = await supabaseAdmin
    .from("journals")
    .select("id", { count: "exact", head: true });

  if (countError) {
    console.error("Checking journals table error:", countError.message);
    return;
  }

  if (count === 0) {
    console.log("Seeding journals...");
    const { error: seedError } = await supabaseAdmin
      .from("journals")
      .insert(SEED_JOURNALS);

    if (seedError) {
      console.error("Seeding journals error:", seedError.message);
    } else {
      console.log("Seeding journals completed successfully.");
    }
  }
}

export async function GET(request: Request) {
  try {
    // Run seed check
    await checkAndSeedJournals();

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

      return NextResponse.json(
        { success: true, journal },
        {
          headers: {
            "Cache-Control": "no-store, max-age=0, must-revalidate",
          },
        }
      );
    }

    const { data: journals, error } = await supabaseAdmin
      .from("journals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(
      { success: true, journals },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (error: unknown) {
    const err = error as Error;
    console.error("GET Public Journals API error:", err.message);
    return NextResponse.json({ error: "Gagal memproses jurnal" }, { status: 500 });
  }
}
