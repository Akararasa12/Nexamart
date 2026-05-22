import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { chatCompletionStream } from "@/lib/ai";

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

export async function POST(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, dashboardStats } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages history is required" }, { status: 400 });
    }

    // Embed current stats context if available to help the AI answer about store performance
    let statsContext = "";
    if (dashboardStats) {
      statsContext = `
[INFORMASI KINERJA TOKO AKTUAL]
- Total Penjualan/Omset: Rp ${new Intl.NumberFormat("id-ID").format(dashboardStats.totalSales || 0)}
- Total Transaksi: ${dashboardStats.totalOrders || 0} (Lunas: ${dashboardStats.paidOrders || 0}, Tertunda: ${dashboardStats.pendingOrders || 0}, Gagal: ${dashboardStats.failedOrders || 0})
- Langganan Aktif (Subscribe & Save): ${dashboardStats.activeSubscriptions || 0} dari total ${dashboardStats.totalSubscriptions || 0}
`;
    }

    const systemPrompt = `Anda adalah NEXAMART Admin Copilot, asisten AI resmi yang dirancang khusus untuk mendampingi dan memandu administrator toko NEXAMART.
Gaya bicara Anda harus taktis, profesional, cerdas, dan siap membantu kelancaran bisnis. Sapa admin dengan sebutan "Admin" atau "Anda".

Tugas Anda meliputi:
1. Membantu merumuskan strategi pemasaran dan ide promosi/kupon diskon.
2. Membantu menyusun draf artikel Jurnal Kecantikan (berisi tips skincare, kandungan kosmetik, cara retur, dll.) dalam format markdown yang rapi agar admin tinggal menyalinnya.
3. Menganalisis kinerja penjualan toko berdasarkan data aktual yang disediakan di bawah ini dan memberikan saran operasional yang berharga.
4. Memberikan panduan cara menggunakan fitur dashboard admin NEXAMART (seperti CRUD Produk, CRUD Jurnal, Cetak Resi, Ekspor CSV, dan Pembuatan Voucher).

${statsContext}

PENTING: Jawab langsung sebagai asisten tanpa menyebutkan parameter sistem, "systemPrompt", atau file konfigurasi. Jaga jawaban tetap ringkas dan sangat informatif.`;

    const stream = await chatCompletionStream(messages, systemPrompt);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive"
      }
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Admin Chat API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to process admin chat" }, { status: 500 });
  }
}
