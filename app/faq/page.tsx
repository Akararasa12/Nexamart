"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, HelpCircle, ChevronDown, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqCategory {
  title: string;
  items: FaqItem[];
}

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState<number>(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const FAQ_DATA: FaqCategory[] = [
    {
      title: "Pesanan & Pengiriman",
      items: [
        {
          question: "Kurir pengiriman apa saja yang digunakan?",
          answer: "NEXAMART bekerja sama langsung dengan RajaOngkir untuk memberikan pilihan kurir terpercaya seperti JNE Express, POS Indonesia, dan TIKI dengan ongkos kirim real-time."
        },
        {
          question: "Berapa lama estimasi pengiriman sampai?",
          answer: "Untuk wilayah Jabodetabek, pengiriman biasanya memakan waktu 1-2 hari kerja. Untuk luar Jabodetabek dan pulau lainnya, estimasi sekitar 3-5 hari kerja tergantung jenis servis kurir yang dipilih."
        },
        {
          question: "Bagaimana cara melacak nomor resi pesanan saya?",
          answer: "Setelah pesanan diserahkan ke kurir, nomor resi pelacakan resmi akan dikirim otomatis ke alamat Email atau No. WhatsApp terdaftar Anda. Anda dapat melacaknya langsung di situs kurir terkait."
        }
      ]
    },
    {
      title: "Produk & Kandungan",
      items: [
        {
          question: "Apakah seluruh produk NEXAMART aman untuk kulit sensitif?",
          answer: "Ya. Setiap produk kami (seperti Aura Radiant Essence dan Elysian Cleansing Balm) dirancang menggunakan esens organik premium berkadar irritabilitas 0% dan telah lolos uji klinis dermatologis."
        },
        {
          question: "Apakah produk kecantikan NEXAMART bebas dari uji coba hewan (Cruelty-Free)?",
          answer: "Komitmen kami adalah etika keindahan sejati. Seluruh bahan aktif dan proses pembuatan produk NEXAMART 100% Cruelty-Free dan ramah lingkungan."
        },
        {
          question: "Bagaimana cara berkonsultasi mengenai jenis kulit saya?",
          answer: "Anda dapat berinteraksi langsung dengan RAG AI Assistant kami di pojok kanan bawah layar untuk mendapatkan panduan kandungan kosmetik instan, atau hubungi kosmetolog kami di showroom."
        }
      ]
    },
    {
      title: "Metode Pembayaran",
      items: [
        {
          question: "Metode pembayaran apa saja yang didukung?",
          answer: "Melalui integrasi gerbang pembayaran Midtrans Snap, kami menerima transfer bank Virtual Account (Mandiri, BCA, BNI, BRI), kartu kredit, e-wallet (GoPay, ShopeePay), serta kode QRIS standar nasional."
        },
        {
          question: "Apakah pembayaran saya aman?",
          answer: "Sangat aman. Seluruh transaksi diproses melalui enkripsi SSL 256-bit berstandar industri perbankan yang diamankan langsung oleh sistem Midtrans."
        },
        {
          question: "Apa yang harus dilakukan jika transaksi berstatus Pending?",
          answer: "Status pending biasanya terjadi jika Anda memilih metode transfer Virtual Account atau QRIS dan belum mentransfer dana. Anda memiliki batas waktu 24 jam sebelum invoice otomatis kedaluwarsa."
        }
      ]
    },
    {
      title: "Program Langganan (Subscription)",
      items: [
        {
          question: "Apa keuntungan program langganan berkala (Replenishment)?",
          answer: "Dengan mengikuti program langganan berkala (misal tiap 30 atau 45 hari), Anda mendapatkan potongan harga instan 10% untuk produk tersebut, prioritas stok, dan pengiriman otomatis tepat waktu."
        },
        {
          question: "Apakah saya bisa menjeda atau membatalkan langganan?",
          answer: "Tentu saja. Anda dapat menjeda (tunda), mempercepat, atau membatalkan langganan kapan saja melalui halaman dashboard profil keanggotaan Anda tanpa dikenakan denda apapun."
        }
      ]
    }
  ];

  const handleToggle = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

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
            <HelpCircle className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-widest font-bold font-sans">Pusat Informasi Pengguna</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-light tracking-tight text-neutral-950 leading-tight">
            Pertanyaan <span className="italic">Umum (FAQ)</span>
          </h1>
          <p className="text-sm text-neutral-500 font-sans leading-relaxed">
            Temukan jawaban instan mengenai proses pembelian, pengiriman RajaOngkir, sistem pembayaran aman Midtrans, hingga program langganan produk kecantikan Anda.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2.5">
          {FAQ_DATA.map((cat, idx) => {
            const isActive = activeCategory === idx;
            return (
              <button
                key={idx}
                onClick={() => {
                  setActiveCategory(idx);
                  setExpandedIndex(null);
                }}
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? "bg-neutral-950 text-white shadow-sm"
                    : "bg-white border border-[#eadecb] text-neutral-400 hover:text-neutral-950"
                }`}
              >
                {cat.title}
              </button>
            );
          })}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {FAQ_DATA[activeCategory].items.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div 
                key={idx} 
                className="bg-white border border-[#eadecb] rounded-2xl overflow-hidden transition-all duration-300 luxury-border"
              >
                {/* Header/Question Trigger */}
                <button
                  onClick={() => handleToggle(idx)}
                  className="w-full flex justify-between items-center text-left p-6 font-serif font-bold text-neutral-900 text-sm md:text-base cursor-pointer focus:outline-none"
                >
                  <span>{item.question}</span>
                  <ChevronDown 
                    className={`w-4 h-4 text-gold transition-transform duration-300 flex-shrink-0 ml-4 ${
                      isExpanded ? "transform rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Answer Content */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-[#eadecb]/40 bg-[#fdfcf9]/40"
                    >
                      <div className="p-6 text-xs md:text-sm text-neutral-500 font-sans leading-relaxed">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Still Need Help Box */}
        <div className="bg-neutral-950 text-[#ece4d9] p-8 rounded-3xl text-center space-y-4 luxury-pattern-dark">
          <MessageSquare className="w-6 h-6 text-gold mx-auto" />
          <h3 className="font-serif text-xl font-light">Belum Menemukan Jawaban Anda?</h3>
          <p className="text-xs text-neutral-400 font-sans max-w-md mx-auto leading-relaxed">
            Tim konsultan kecantikan kami selalu siaga menjawab seluruh pertanyaan Anda seputar kecocokan kulit, pemesanan, dan kerja sama butik.
          </p>
          <div className="pt-2">
            <Link 
              href="/contact" 
              className="inline-block bg-[#fdfcf9] hover:bg-white text-neutral-950 text-[10px] font-bold uppercase tracking-widest px-8 py-3 rounded-full transition-all"
            >
              Hubungi CS NEXAMART
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
