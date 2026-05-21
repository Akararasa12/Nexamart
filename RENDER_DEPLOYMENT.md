# Panduan Deployment NEXAMART ke Render

Dokumen ini menjelaskan langkah-demi-langkah cara mendeploy aplikasi NEXAMART (Next.js + Supabase + Midtrans + RajaOngkir + AI) ke **Render** secara gratis menggunakan layanan **Web Service**.

---

## ❓ Apakah Vercel Diperlukan?
**Tidak.** Anda tidak memerlukan Vercel jika sudah menggunakan Render (atau sebaliknya). Anda cukup memilih salah satu platform untuk meng-host aplikasi Anda.
* **Perbandingan Singkat:**
  * **Vercel**: Dibuat oleh pembuat Next.js. Sangat dioptimalkan, gratis, performa cepat (karena serverless), dan tidak ada masalah "cold start" (web mati sementara jika tidak diakses).
  * **Render**: Menyediakan server Node.js persisten. Sangat bagus untuk aplikasi web umum, namun pada paket gratis, Render memiliki kebijakan **Spin Down** (aplikasi akan "tidur" jika tidak ada pengunjung dalam 15 menit, dan akan membutuhkan sekitar 50 detik untuk bangun kembali saat diakses berikutnya).

Jika Anda tetap ingin menggunakan **Render**, ikuti panduan lengkap di bawah ini.

---

## 📋 Prasyarat
Pastikan Anda memiliki akun dan kredensial untuk:
1. **GitHub**: Repositori kode NEXAMART Anda harus terunggah ke GitHub.
2. **Render**: Akun aktif di [Render.com](https://render.com/).
3. **Kredensial Layanan**: Supabase, Midtrans, RajaOngkir, dan Gemini/OpenAI API.

---

## 🚀 Langkah 1: Hubungkan Repositori ke Render
1. Masuk ke **[Render Dashboard](https://dashboard.render.com/)**.
2. Klik tombol **New +** di kanan atas, lalu pilih **Web Service**.
3. Hubungkan akun GitHub Anda jika belum dilakukan, lalu pilih repositori **NEXAMART**.
4. Di halaman konfigurasi Web Service, isi parameter berikut:
   * **Name**: `nexamart` (atau nama proyek pilihan Anda).
   * **Region**: Pilih wilayah terdekat (mis. `Singapore`).
   * **Branch**: `main`.
   * **Runtime**: `Node`.
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `npm run start`
   * **Instance Type**: Pilih **Free** (Gratis).

---

## 🔑 Langkah 2: Konfigurasi Environment Variables di Render
Gulir ke bawah dan klik tombol **Advanced** untuk menambahkan variabel lingkungan:

1. Tambahkan variabel versi node agar sesuai dengan Next.js:
   * `NODE_VERSION` = `20`
2. Tambahkan variabel dari `.env.example` lainnya:

| Key | Value / Deskripsi |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase Anda |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon Key Supabase Anda |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key Supabase |
| `MIDTRANS_SERVER_KEY` | Server Key Midtrans Anda |
| `MIDTRANS_CLIENT_KEY` | Client Key Midtrans Anda |
| `RAJAONGKIR_API_KEY` | API Key RajaOngkir |
| `GEMINI_API_KEY` | API Key Gemini |
| `OPENAI_API_KEY` | API Key OpenAI (opsional) |
| `ADMIN_PASSWORD` | Kata sandi portal admin `/admin` |

3. Klik **Create Web Service**. Render akan segera memulai build aplikasi Anda.

---

## 🌐 Langkah 3: Membuat URL Webhook Midtrans
Setelah build selesai, Render akan memberikan URL publik di bagian kiri atas halaman Web Service Anda (contoh: `https://nexamart.onrender.com`).

### Hubungkan Webhook Midtrans:
1. Masuk ke **[Dashboard Midtrans](https://dashboard.midtrans.com/)**.
2. Pergi ke **Settings** -> **Configuration**.
3. Di bagian **Payment Notification URL**, isi dengan:
   `https://[domain-render-anda].onrender.com/api/midtrans/webhook`
4. Simpan perubahan. Kini status transaksi dari Midtrans akan otomatis sinkron ke database Supabase Anda saat pelanggan melakukan pembayaran!
