import { NextResponse } from "next/server";
import { getEmbedding } from "@/lib/ai";
import { supabaseAdmin } from "@/lib/supabase";

// Pre-packaged NEXAMART seed data for beauty products, shipping, and policies
const SEED_KNOWLEDGE = [
  {
    content: "NEXAMART adalah brand kecantikan dan kosmetik D2C mewah yang mengusung tema 'White Clean Mode'. Koleksi kami terbuat dari bahan-bahan organik premium yang memadukan keindahan legendaris abad pertengahan dengan sains kecantikan modern.",
    metadata: { category: "brand" }
  },
  {
    content: "Aura Radiant Essence adalah esens pencerah wajah unggulan NEXAMART. Mengandung 5% Niacinamide, Ekstrak Licorice Root (Akar Manis), dan Galactomyces Ferment Filtrate. Esens ini efektif memperbaiki skin barrier, memudarkan noda hitam, dan memberikan efek kulit bercahaya bagai bangsawan kerajaan. Cocok untuk semua jenis kulit termasuk kulit sensitif.",
    metadata: { category: "products", product_name: "Aura Radiant Essence", ingredients: ["Niacinamide", "Licorice Root", "Galactomyces"] }
  },
  {
    content: "Celestial Youth Elixir adalah serum anti-aging premium dari NEXAMART. Diformulasikan dengan 0.2% Encapsulated Retinol, Peptide Complex, dan Blue Tansy Oil yang menenangkan. Serum ini bekerja di malam hari untuk merangsang kolagen, menyamarkan garis halus, meningkatkan kekenyalan kulit, dan mencegah tanda-tanda penuaan dini.",
    metadata: { category: "products", product_name: "Celestial Youth Elixir", ingredients: ["Retinol", "Peptides", "Blue Tansy Oil"] }
  },
  {
    content: "Elysian Cleansing Balm adalah balsem pembersih wajah mewah dari NEXAMART. Mengandung Sweet Almond Oil, Chamomile Extract, dan Shea Butter. Pembersih ini meleleh di kulit untuk mengangkat sisa makeup waterproof, sunscreen, dan minyak berlebih tanpa membuat kulit terasa kering atau tertarik.",
    metadata: { category: "products", product_name: "Elysian Cleansing Balm", ingredients: ["Sweet Almond Oil", "Chamomile Extract", "Shea Butter"] }
  },
  {
    content: "NEXAMART menyediakan pilihan pembelian Bundling Hemat (Goli-Style Flow): 1. Routine Starter (1 Botol): Harga normal. 2. Complete Routine Set (3 Botol): Hemat 15% (Paling Populer). 3. Restock Bundle (6 Botol): Hemat 25% (Pilihan Terbaik). Bundling ini berlaku untuk semua produk unggulan.",
    metadata: { category: "bundling" }
  },
  {
    content: "Layanan Langganan NEXAMART (Subscribe & Save): Dapatkan potongan langsung 10% dengan berlangganan pengiriman otomatis setiap 30 hari, 60 hari, atau 90 hari. Langganan ini sangat cocok untuk menjaga rutinitas perawatan kulit Anda tanpa terputus. Pelanggan dapat menjeda, memodifikasi, atau membatalkan langganan kapan saja melalui menu Profil.",
    metadata: { category: "subscriptions" }
  },
  {
    content: "Kebijakan Pengiriman NEXAMART terintegrasi secara otomatis dengan RajaOngkir. Pengiriman dikirim langsung dari gudang utama kami di Kota Bandung. Kami mendukung kurir domestik resmi JNE, POS Indonesia, dan TIKI. Estimasi pengiriman reguler adalah 2-4 hari kerja, sedangkan layanan ekspres (JNE YES) memakan waktu 1 hari kerja.",
    metadata: { category: "shipping" }
  },
  {
    content: "Metode Pembayaran di NEXAMART menggunakan gerbang pembayaran aman Midtrans. Kami menerima pembayaran lokal terpopuler di Indonesia secara otomatis: QRIS (GoPay, ShopeePay, Dana, LinkAja, OVO), Virtual Account (VA Mandiri, BCA, BNI, BRI), Kartu Kredit (Visa, Mastercard, JCB), serta gerbang pembayaran elektronik lainnya.",
    metadata: { category: "payment" }
  },
  {
    content: "Kebijakan Pengembalian (Return & Refund Policy) NEXAMART menjamin kepuasan 30 hari. Pengembalian produk diterima dalam waktu 30 hari sejak tanggal pembelian di platform kami. Produk harus dalam keadaan tersegel rapat dan belum digunakan (kecuali keluhan alergi/iritasi kulit khusus disertai bukti foto kondisi kulit). Pengajuan retur dilakukan dengan mengirim email ke care@nexamart.com dengan subjek 'Retur NEXA - [Nomor Order Anda]' dan wajib menyertakan video unboxing. Setelah disetujui, dana dikembalikan dalam 3-5 hari kerja ke rekening asal atau Midtrans. Layanan pelanggan instan tersedia melalui WhatsApp di +62 812-3456-789 atau telepon kantor di +62 (21) 500-NEXA.",
    metadata: { category: "returns" }
  }
];

// POST endpoint: Insert a single custom knowledge block
export async function POST(request: Request) {
  try {
    const { content, metadata } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    console.log(`Generating embedding for content: "${content.substring(0, 30)}..."`);
    const embedding = await getEmbedding(content);

    const { data, error } = await supabaseAdmin
      .from("store_knowledge")
      .insert([
        {
          content,
          embedding,
          metadata: metadata || {}
        }
      ])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, inserted: data });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Embedding API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to create embedding" }, { status: 500 });
  }
}

// GET endpoint: Seeding the base store knowledge
export async function GET() {
  try {
    const results = [];
    
    for (const item of SEED_KNOWLEDGE) {
      console.log(`Seeding embedding for: "${item.content.substring(0, 35)}..."`);
      const embedding = await getEmbedding(item.content);

      // Check if it already exists to avoid duplicates
      const { data: existing } = await supabaseAdmin
        .from("store_knowledge")
        .select("id")
        .eq("content", item.content)
        .limit(1);

      if (existing && existing.length > 0) {
        results.push({ content: item.content, status: "already exists" });
        continue;
      }

      const { error } = await supabaseAdmin
        .from("store_knowledge")
        .insert([
          {
            content: item.content,
            embedding,
            metadata: item.metadata
          }
        ]);

      if (error) {
        console.error("Seeding item error:", error.message);
        results.push({ content: item.content, status: "error", error: error.message });
      } else {
        results.push({ content: item.content, status: "seeded" });
      }
    }

    return NextResponse.json({ success: true, summary: results });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Seeding API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to seed database" }, { status: 500 });
  }
}
