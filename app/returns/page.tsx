"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, ShieldCheck, Heart } from "lucide-react";

export default function ReturnsPage() {
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

        {/* Editorial Title */}
        <div className="space-y-4 border-b border-[#eadecb] pb-8">
          <div className="flex items-center gap-2 text-gold">
            <RefreshCw className="w-5 h-5 animate-spin-slow" />
            <span className="text-[10px] uppercase tracking-widest font-bold font-sans">Jaminan Kepuasan Pelanggan</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-light tracking-tight text-neutral-950 leading-tight">
            Kebijakan <span className="italic">Pengembalian</span>
          </h1>
          <p className="text-sm text-neutral-500 font-sans leading-relaxed max-w-2xl">
            Di NEXAMART, setiap produk dirancang untuk memberikan perawatan kecantikan yang luar biasa. Jika produk perawatan kulit Anda tidak berjalan sesuai harapan, kami siap mempermudah proses retur.
          </p>
        </div>

        {/* 3 Main Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Garansi 30 Hari",
              desc: "Kami menerima pengembalian produk dalam waktu 30 hari sejak tanggal pembelian di platform kami."
            },
            {
              title: "Ramah Sensitivitas",
              desc: "Jika terjadi iritasi kulit, kosmetolog kami siap menganalisis klaim Anda untuk pengembalian penuh."
            },
            {
              title: "Bebas Biaya Retur",
              desc: "Untuk pesanan yang terverifikasi cacat produksi atau salah kirim, ongkos kirim kami yang tanggung."
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-[#eadecb] p-6 rounded-2xl luxury-border space-y-3">
              <h3 className="font-serif font-bold text-base text-neutral-900">{item.title}</h3>
              <p className="text-xs text-neutral-500 leading-relaxed font-sans">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Step-by-Step Return Process */}
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-light text-neutral-950">
            Cara Mengajukan <span className="italic">Pengembalian Dana (Refund)</span>
          </h2>

          <div className="space-y-4">
            {[
              {
                step: "01",
                title: "Siapkan Bukti Unboxing & Kondisi Produk",
                desc: "Rekam video singkat unboxing paket Anda. Pastikan produk masih memiliki segel pelindung asli (kecuali untuk klaim alergi/iritasi kulit khusus)."
              },
              {
                step: "02",
                title: "Kirim Pengajuan ke Tim Care",
                desc: "Hubungi email kami di care@nexamart.com dengan subjek 'Retur NEXA - [Nomor Order Anda]'. Lampirkan bukti video dan detail masalah Anda."
              },
              {
                step: "03",
                title: "Pemeriksaan oleh Ahli Kecantikan",
                desc: "Tim kosmetolog kami akan memverifikasi klaim Anda dalam waktu 1-2 hari kerja untuk menentukan opsi pengembalian dana atau penggantian barang."
              },
              {
                step: "04",
                title: "Pengembalian Dana / Transfer Produk",
                desc: "Setelah disetujui, dana Anda akan dikembalikan melalui rekening asal (atau metode pembayaran Midtrans) dalam kurun waktu 3-5 hari kerja."
              }
            ].map((stepItem, idx) => (
              <div key={idx} className="flex gap-4 items-start border-l-2 border-[#c3a475] pl-6 py-2">
                <span className="font-serif text-xl font-bold text-[#c3a475]">{stepItem.step}</span>
                <div className="space-y-1">
                  <h4 className="font-sans font-bold text-sm text-neutral-900">{stepItem.title}</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed font-sans">{stepItem.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Syarat Tambahan */}
        <div className="bg-neutral-900 text-[#ece4d9] rounded-3xl p-8 space-y-4 relative overflow-hidden luxury-pattern-dark">
          <div className="flex items-center gap-2 text-gold">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="font-serif text-lg font-medium">Syarat Produk yang Memenuhi Syarat Retur</h3>
          </div>
          <ul className="space-y-2 text-xs text-neutral-300 font-sans list-disc list-inside leading-relaxed">
            <li>Produk kecantikan masih tersegel rapat dan belum pernah digunakan (untuk retur standar).</li>
            <li>Pembelian dilakukan secara sah langsung dari situs NEXAMART.com.</li>
            <li>Untuk keluhan kecocokan kulit, harap sertakan foto kemerahan/alergi yang terjadi sebagai bukti klinis pendukung.</li>
          </ul>
          <div className="pt-2 text-[10px] text-neutral-400">
            * NEXAMART berhak menolak klaim retur jika ditemukan indikasi penyalahgunaan atau kecurangan produk.
          </div>
        </div>

        {/* Contact Hotline */}
        <div className="text-center space-y-4 pt-6 border-t border-[#eadecb]">
          <Heart className="w-5 h-5 text-gold mx-auto" />
          <h3 className="font-serif text-lg text-neutral-950">Butuh Bantuan Instan?</h3>
          <p className="text-xs text-neutral-500 font-sans max-w-md mx-auto leading-relaxed">
            Hubungi Konsultan Kecantikan NEXAMART melalui WhatsApp di **+62 812-3456-789** atau telepon kantor kami di **+62 (21) 500-NEXA**.
          </p>
          <div className="pt-2">
            <Link 
              href="/contact" 
              className="inline-block bg-neutral-950 hover:bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest px-8 py-3 rounded-full transition-all"
            >
              Hubungi Showroom Kami
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
