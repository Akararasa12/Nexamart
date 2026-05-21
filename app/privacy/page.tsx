"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Lock } from "lucide-react";

export default function PrivacyPage() {
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
            <Shield className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-widest font-bold font-sans">Kepatuhan Privasi</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-light tracking-tight text-neutral-950 leading-tight">
            Kebijakan <span className="italic">Privasi Pelanggan</span>
          </h1>
          <p className="text-sm text-neutral-500 font-sans leading-relaxed">
            Terakhir Diperbarui: Mei 2026. NEXAMART menghargai privasi data Anda. Kami berkomitmen untuk melindungi informasi pribadi Anda dengan standar keamanan tertinggi.
          </p>
        </div>

        {/* Content Paragraphs */}
        <div className="space-y-8 text-xs md:text-sm text-neutral-600 font-sans leading-relaxed">
          <section className="space-y-2">
            <h3 className="font-serif font-bold text-neutral-900 text-base">1. Informasi Yang Kami Kumpulkan</h3>
            <p>
              Kami mengumpulkan informasi yang Anda berikan secara langsung saat menggunakan situs kami, termasuk:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Informasi identitas (Nama, Alamat Surel, Nomor WhatsApp).</li>
              <li>Detail alamat pengiriman (Provinsi, Kota, Kecamatan, Kode Pos).</li>
              <li>Rincian keranjang belanja dan riwayat transaksi langganan.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-serif font-bold text-neutral-900 text-base">2. Bagaimana Kami Menggunakan Data Anda</h3>
            <p>
              Data pribadi Anda hanya digunakan untuk memproses transaksi checkout, menghitung ongkos kirim RajaOngkir, mengirimkan simulasi kode verifikasi OTP, memverifikasi status pembayaran Midtrans Snap, serta mengirim warta berkala (jika Anda terdaftar).
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-serif font-bold text-neutral-900 text-base">3. Keamanan Data & Enkripsi</h3>
            <p>
              Kami menggunakan penyimpanan lokal (`localStorage`) terenkripsi di sisi klien untuk mengingat sesi login Anda demi kemudahan penjelajahan. Seluruh data transaksi sensitif diproses langsung di server gerbang pembayaran terenkripsi pihak ketiga sehingga tidak tersimpan di server kami.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-serif font-bold text-neutral-900 text-base">4. Hak Pelanggan</h3>
            <p>
              Anda berhak memperbarui alamat pengiriman utama Anda, menghapus riwayat sesi dari perangkat (melalui tombol Keluar Akun di dasbor), serta membatalkan langganan newsletter kapan pun melalui tautan pemutusan langganan.
            </p>
          </section>
        </div>

        {/* Security Stamp */}
        <div className="border-t border-[#eadecb] pt-6 flex items-center justify-center gap-2 text-[10px] text-neutral-400 font-sans">
          <Lock className="w-4 h-4 text-gold" />
          <span>Keamanan Data Terjamin SSL Enkripsi NEXAMART</span>
        </div>

      </div>
    </div>
  );
}
