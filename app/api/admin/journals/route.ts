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
  try {
    const { count, error } = await supabaseAdmin
      .from("journals")
      .select("id", { count: "exact", head: true });

    if (error) {
      console.error("Checking journals error in admin seed:", error.message);
      return;
    }

    if (count === 0) {
      console.log("[NEXAMART] Seeding default journals from Admin API...");
      await supabaseAdmin.from("journals").insert(SEED_JOURNALS);
    }
  } catch (err) {
    console.error("Failed to run seed check in admin:", err);
  }
}

// GET all journal posts
export async function GET(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Seed default journals if database is empty
    await checkAndSeedJournals();

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
    console.error("GET Journals API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to retrieve journals" }, { status: 500 });
  }
}

// POST create journal post
export async function POST(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, content, excerpt, category, read_time, author } = body as {
      title: string;
      slug: string;
      content: string;
      excerpt?: string;
      category: string;
      read_time?: string;
      author?: string;
    };

    if (!title || !slug || !content || !category) {
      return NextResponse.json({ error: "Title, Slug, Content, and Category are required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("journals")
      .insert({
        title,
        slug,
        content,
        excerpt: excerpt || "",
        category,
        read_time: read_time || "5 Menit Baca",
        author: author || "dr. Livia W."
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, journal: data });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("POST Journal API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to create journal" }, { status: 500 });
  }
}

// PUT update journal post
export async function PUT(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, slug, content, excerpt, category, read_time, author } = body as {
      id: string;
      title: string;
      slug: string;
      content: string;
      excerpt?: string;
      category: string;
      read_time?: string;
      author?: string;
    };

    if (!id || !title || !slug || !content || !category) {
      return NextResponse.json({ error: "ID, Title, Slug, Content, and Category are required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("journals")
      .update({
        title,
        slug,
        content,
        excerpt,
        category,
        read_time,
        author
      })
      .eq("id", id)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, journal: data });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("PUT Journal API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to update journal" }, { status: 500 });
  }
}

// DELETE journal post
export async function DELETE(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Journal ID is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("journals")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: `Journal ${id} deleted successfully` });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("DELETE Journal API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to delete journal" }, { status: 500 });
  }
}
