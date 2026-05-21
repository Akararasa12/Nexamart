"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#fdfcf9] py-16 px-6 luxury-pattern">
      <div className="max-w-3xl mx-auto space-y-12">
        
        {/* Navigation Breadcrumb */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-400 hover:text-neutral-950 transition-colors font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke Beranda
        </Link>

        {/* Editorial Header */}
        <div className="space-y-4 border-b border-[#eadecb] pb-8">
          <div className="flex items-center gap-2 text-gold">
            <FileText className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-widest font-bold font-sans">Legalitas Platform</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-light tracking-tight text-neutral-950 leading-tight">
            Syarat & <span className="italic">Ketentuan Penggunaan</span>
          </h1>
          <p className="text-sm text-neutral-500 font-sans leading-relaxed">
            Terakhir Diperbarui: Mei 2026. Selamat datang di platform NEXAMART. Harap membaca ketentuan ini secara seksama sebelum mengakses layanan kami.
          </p>
        </div>

        {/* Content Paragraphs */}
        <div className="space-y-8 text-xs md:text-sm text-neutral-600 font-sans leading-relaxed">
          <section className="space-y-2">
            <h3 className="font-serif font-bold text-neutral-900 text-base">1. Penerimaan Ketentuan</h3>
            <p>
              Dengan mengakses, mengunjungi, atau menggunakan situs web NEXAMART.com serta melakukan transaksi pembelian produk kecantikan di platform kami, Anda dianggap menyetujui untuk terikat secara hukum oleh Syarat & Ketentuan Penggunaan ini.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-serif font-bold text-neutral-900 text-base">2. Pendaftaran Akun & Verifikasi OTP</h3>
            <p>
              Untuk melacak transaksi pesanan dan menggunakan fitur isi alamat otomatis, pelanggan dapat melakukan masuk akun menggunakan sistem verifikasi OTP (One-Time Password) yang dikirimkan ke Email atau Nomor WhatsApp Anda. Anda bertanggung jawab penuh atas keamanan nomor seluler dan akun Anda sendiri.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-serif font-bold text-neutral-900 text-base">3. Pemesanan & Pembayaran Midtrans</h3>
            <p>
              Seluruh transaksi pembayaran yang dilakukan di platform kami diproses secara aman melalui gerbang pembayaran pihak ketiga, **Midtrans Snap**. Kami berhak menolak pesanan jika dicurigai adanya penyalahgunaan promosi, kesalahan sistem harga, atau stok produk yang mendadak tidak mencukupi.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-serif font-bold text-neutral-900 text-base">4. Pengiriman & RajaOngkir</h3>
            <p>
              Kalkulasi tarif pengiriman dihitung secara otomatis berdasarkan berat produk menggunakan API RajaOngkir. Kami tidak bertanggung jawab atas keterlambatan pengiriman yang diakibatkan oleh bencana alam, pemogokan massal kurir logistik, atau kesalahan penulisan alamat oleh pembeli.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-serif font-bold text-neutral-900 text-base">5. Hak Kekayaan Intelektual</h3>
            <p>
              Seluruh merek dagang, logo, desain visual, grafis, kode program, foto editorial produk, dan teks yang ditampilkan di situs web NEXAMART adalah milik sah dari NEXAMART Beauty Group dan dilindungi oleh hukum hak cipta Negara Republik Indonesia.
            </p>
          </section>
        </div>

        {/* Security Stamp */}
        <div className="border-t border-[#eadecb] pt-6 flex items-center justify-center gap-2 text-[10px] text-neutral-400 font-sans">
          <ShieldCheck className="w-4 h-4 text-gold" />
          <span>NEXAMART Legal & Compliance Team 2026</span>
        </div>

      </div>
    </div>
  );
}
