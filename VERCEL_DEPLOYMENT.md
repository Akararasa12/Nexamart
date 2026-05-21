# Panduan Deployment NEXAMART ke Vercel

Dokumen ini menjelaskan langkah-demi-langkah cara mendeploy aplikasi NEXAMART (Next.js + Supabase + Midtrans + RajaOngkir + AI) ke **Vercel** secara gratis.

---

## 🚀 Keunggulan Vercel
1. **100% Gratis & Tanpa Kartu Kredit:** Anda bisa langsung mendeploy proyek hobi/personal tanpa verifikasi metode pembayaran.
2. **Performa Maksimal:** Vercel adalah platform resmi pembuat Next.js, sehingga proses build dan waktu muat (loading) akan dioptimalkan secara otomatis.
3. **Tanpa Cold Start:** Tidak seperti Render (yang tertidur jika sepi pengunjung dalam 15 menit), aplikasi Anda di Vercel akan selalu aktif dan merespons secara instan.

---

## 📋 Langkah-Langkah Deployment

### Langkah 1: Hubungkan Repositori ke Vercel
1. Masuk ke **[Vercel Dashboard](https://vercel.com)**.
2. Klik tombol **Sign Up** dan daftar menggunakan akun **GitHub** Anda.
3. Setelah masuk, klik tombol **Add New...** di pojok kanan atas, lalu pilih **Project**.
4. Di bagian *Import Git Repository*, cari repositori **Nexamart** Anda lalu klik **Import**.

### Langkah 2: Konfigurasi Proyek di Vercel
Pada halaman konfigurasi proyek, isi parameter berikut:
* **Framework Preset:** `Next.js` (Vercel akan mendeteksinya secara otomatis).
* **Root Directory:** `./` (biarkan default).
* **Build and Output Settings:** Biarkan default (tidak perlu diubah).

### Langkah 3: Konfigurasi Environment Variables (PENTING)
Buka menu *drop-down* **Environment Variables** di bagian bawah halaman konfigurasi, lalu tambahkan semua variabel lingkungan berikut (sesuaikan nilainya dengan isi `.env.local` Anda):

| Key | Value / Deskripsi |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL proyek Supabase Anda |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon Key Supabase Anda |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key Supabase Anda |
| `MIDTRANS_SERVER_KEY` | Server Key Midtrans Anda |
| `MIDTRANS_CLIENT_KEY` | Client Key Midtrans Anda |
| `RAJAONGKIR_API_KEY` | API Key RajaOngkir Anda |
| `GEMINI_API_KEY` | API Key Gemini AI Anda |
| `ADMIN_PASSWORD` | Kata sandi untuk halaman `/admin` (mis. `nexa-admin-2026`) |

*Catatan: Anda bisa menyalin-tempel baris dari file `.env.local` Anda langsung ke kolom isian pertama Vercel, dan Vercel akan otomatis memisahkannya.*

### Langkah 4: Klik Deploy
1. Klik tombol **Deploy** di bagian bawah halaman.
2. Tunggu proses kompilasi selama 1 - 2 menit.
3. Setelah selesai, Anda akan melihat animasi kembang api dan mendapatkan URL publik aplikasi Anda (contoh: `https://nexamart-alpha.vercel.app`).

---

## 🌐 Hubungkan Webhook Midtrans dengan URL Vercel Baru
Setelah aplikasi Anda berhasil aktif di Vercel:
1. Salin URL publik baru Anda dari Vercel (misalnya: `https://nexamart-kamu.vercel.app`).
2. Masuk ke **[Dashboard Midtrans](https://dashboard.midtrans.com/)**.
3. Pergi ke **Settings** -> **Configuration**.
4. Di kolom **Payment Notification URL**, ganti dengan URL webhook Vercel Anda:
   `https://[domain-vercel-anda].vercel.app/api/midtrans/webhook`
5. Simpan perubahan.

Kini, setiap kali pelanggan melakukan pembayaran, status transaksi di database Supabase akan langsung sinkron secara otomatis!
