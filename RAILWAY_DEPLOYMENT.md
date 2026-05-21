# Panduan Deployment NEXAMART ke Railway Free

Dokumen ini menjelaskan langkah-demi-langkah cara mendeploy aplikasi NEXAMART (Next.js + Supabase + Midtrans + RajaOngkir + AI) ke Railway secara gratis (Railway Free Tier / Hobby Tier).

---

## 📋 Prasyarat
Sebelum memulai, pastikan Anda telah menyiapkan akun dan kredensial untuk layanan-layanan berikut:
1. **GitHub**: Repositori kode NEXAMART Anda harus sudah di-push ke GitHub.
2. **Railway**: Akun di [Railway.app](https://railway.app/).
3. **Supabase**: Proyek database PostgreSQL Supabase yang aktif (tabel `orders`, `subscriptions`, dan `store_knowledge` sudah dibuat melalui berkas `supabase_schema.sql`).
4. **Midtrans**: Akun Sandbox/Production untuk pembayaran online.
5. **RajaOngkir**: API Key Starter/Basic/Pro untuk kalkulasi ongkos kirim.
6. **Gemini / OpenAI**: API Key untuk kecerdasan buatan chatbot RAG.

---

## 🚀 Langkah 1: Hubungkan Repositori ke Railway
1. Masuk ke **[Railway Console](https://railway.app/)**.
2. Klik tombol **New Project** di kanan atas.
3. Pilih opsi **Deploy from GitHub repo**.
4. Pilih repositori **NEXAMART** dari daftar repositori Anda.
5. Klik **Deploy Now**.
   * *Catatan:* Build awal mungkin akan gagal karena variabel lingkungan (Environment Variables) belum disetel. Ini normal.

---

## 🔑 Langkah 2: Konfigurasi Variabel Lingkungan (Environment Variables)
Pergi ke tab **Variables** di proyek Railway Anda, lalu tambahkan semua variabel berikut (lihat berkas `.env.example` untuk referensi):

| Nama Variabel | Deskripsi / Contoh Nilai |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL proyek Supabase Anda (mis. `https://auqyahcowjkjkbbwrmug.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Kunci Anon publik Supabase Anda |
| `SUPABASE_SERVICE_ROLE_KEY` | Kunci Service Role Supabase (untuk bypass RLS di Dashboard Admin secara aman) |
| `MIDTRANS_SERVER_KEY` | Server Key Midtrans Anda (mis. `Mid-server-...`) |
| `MIDTRANS_CLIENT_KEY` | Client Key Midtrans Anda (mis. `Mid-client-...`) |
| `RAJAONGKIR_API_KEY` | API Key RajaOngkir Anda |
| `GEMINI_API_KEY` | API Key Gemini dari Google AI Studio (opsional, jika ingin memakai AI Gemini) |
| `OPENAI_API_KEY` | API Key OpenAI (opsional, jika ingin memakai GPT-4o-mini & Text Embeddings) |
| `ADMIN_PASSWORD` | Kata sandi masuk Dashboard Admin `/admin` (jika tidak diisi, defaultnya adalah `nexa-admin-2026`) |

*Pastikan semua variabel ditulis dengan huruf kapital secara tepat tanpa spasi tambahan.*

---

## 🌐 Langkah 3: Konfigurasi Domain Publik & Webhook
Agar Midtrans dapat mengirimkan notifikasi status pembayaran (Webhook) secara sukses ke aplikasi Anda, Anda perlu membuat domain publik di Railway dan menambahkannya ke Dashboard Midtrans.

### A. Membuat Domain di Railway
1. Buka tab **Settings** di layanan proyek Railway Anda.
2. Pada bagian **Networking**, cari **Public Domain**.
3. Klik **Generate Domain** atau masukkan custom domain Anda sendiri.
4. Anda akan mendapatkan URL publik seperti `https://nexamart-production.up.railway.app`.

### B. Konfigurasi Webhook Midtrans
1. Masuk ke **[Dashboard Midtrans](https://dashboard.midtrans.com/)** (Sandbox atau Production sesuai API Key yang dipakai).
2. Pergi ke menu **Settings** -> **Configuration**.
3. Cari kolom **Payment Notification URL**.
4. Masukkan URL webhook aplikasi Anda dengan format berikut:
   `https://[domain-railway-anda]/api/midtrans/webhook`
   *(Ganti `[domain-railway-anda]` dengan domain publik dari Railway yang digenerate di Langkah A).*
5. Klik **Update / Save Changes**.

---

## ⚡ Langkah 4: Build dan Deploy Ulang
1. Setelah variabel lingkungan dan domain terkonfigurasi, pergi ke tab **Deployments** di Railway.
2. Klik tombol **Redeploy** pada build terbaru Anda.
3. Railway akan memulai proses build menggunakan **Nixpacks** secara otomatis. Proses ini akan menjalankan `npm run build` dan `npm run start` sesuai instruksi di berkas `railway.json`.
4. Jika status berubah menjadi **Active** dengan tanda centang hijau, aplikasi Anda sudah live!

---

## 🛡️ Pengujian Keamanan Dashboard Admin
Setelah deploy sukses:
1. Akses `https://[domain-railway-anda]/admin`.
2. Masukkan kata sandi admin yang Anda atur di `ADMIN_PASSWORD`.
3. Verifikasi bahwa tab **Overview**, **Orders**, **Subscriptions**, dan **AI Knowledge** dapat memuat data Supabase dengan sukses.
