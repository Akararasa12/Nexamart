"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, AlertCircle, Clock, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const orderId = searchParams.get("order_id") || "NEXA-123456789";
  const mockPayment = searchParams.get("mock_payment") === "true";
  const statusParam = (searchParams.get("status") || "success").toLowerCase();

  // Deduce status categories
  let state: "success" | "pending" | "failed" = "success";
  if (statusParam === "pending") {
    state = "pending";
  } else if (
    statusParam === "failed" ||
    statusParam === "error" ||
    statusParam === "deny" ||
    statusParam === "expire" ||
    statusParam === "cancel"
  ) {
    state = "failed";
  }

  // Render variables based on status state
  const config = {
    success: {
      title: "Pembayaran Berhasil!",
      description: "Terima kasih telah mempercayakan perawatan kecantikan Anda kepada NEXAMART.",
      color: "text-green-600 bg-green-50 border-green-100",
      statusLabel: "Berhasil Diverifikasi (Lunas)",
      icon: <CheckCircle className="w-8 h-8 text-white" />,
      iconBg: "bg-neutral-950",
      actionText: "Kembali Berbelanja",
      actionUrl: "/"
    },
    pending: {
      title: "Menunggu Pembayaran",
      description: "Silakan selesaikan pembayaran Anda sesuai instruksi pada aplikasi e-wallet atau kanal bank pilihan Anda.",
      color: "text-amber-600 bg-amber-50 border-amber-100",
      statusLabel: "Menunggu Pembayaran (Pending)",
      icon: <Clock className="w-8 h-8 text-neutral-950 animate-pulse" />,
      iconBg: "bg-amber-100 border border-amber-300",
      actionText: "Pantau Riwayat Pesanan",
      actionUrl: "/profile"
    },
    failed: {
      title: "Transaksi Dibatalkan / Gagal",
      description: "Maaf, transaksi pembayaran Anda tidak dapat diselesaikan atau telah kedaluwarsa. Silakan periksa saldo Anda atau hubungi bank penerbit.",
      color: "text-red-600 bg-red-50 border-red-100",
      statusLabel: "Gagal / Kedaluwarsa (Failed)",
      icon: <AlertCircle className="w-8 h-8 text-white" />,
      iconBg: "bg-red-600",
      actionText: "Coba Bayar Lagi",
      actionUrl: "/checkout"
    }
  }[state];

  return (
    <div className="max-w-md w-full bg-white border border-neutral-200/80 rounded-3xl p-8 shadow-[0_12px_40px_rgba(0,0,0,0.03)] text-center space-y-6 luxury-border">
      
      {/* Animated Icon Container */}
      <div className="flex justify-center">
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className={`w-16 h-16 rounded-full ${config.iconBg} flex items-center justify-center shadow-md`}
        >
          {config.icon}
        </motion.div>
      </div>

      {/* Heading */}
      <div className="space-y-2">
        <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-neutral-950">
          {config.title}
        </h2>
        <p className="text-xs text-neutral-400 font-sans px-4 leading-relaxed">
          {config.description}
        </p>
      </div>

      {/* Invoice Detail Box */}
      <div className="bg-neutral-50/70 border border-neutral-200/40 rounded-2xl p-5 text-left space-y-3 text-xs font-sans">
        <div className="flex justify-between items-center">
          <span className="text-neutral-400">Kode Pemesanan:</span>
          <span className="font-mono font-bold text-neutral-900 bg-neutral-100 px-2.5 py-0.5 rounded-full text-[10px]">
            {orderId}
          </span>
        </div>
        <div className="flex justify-between items-center border-t border-neutral-100 pt-2.5">
          <span className="text-neutral-400">Status Transaksi:</span>
          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${config.color}`}>
            {config.statusLabel}
          </span>
        </div>
        {mockPayment && (
          <div className="text-[10px] text-yellow-700 bg-yellow-50/50 border border-yellow-100/40 rounded-lg p-2 text-center mt-2 font-medium">
            * Transaksi disimulasikan menggunakan Sandbox Mock.
          </div>
        )}
      </div>

      {/* Dynamic Instruction details */}
      <div className="text-xs text-neutral-500 leading-relaxed space-y-2.5 px-2">
        {state === "success" && (
          <p>
            Detail pengiriman beserta nomor resi kurir **RajaOngkir** akan dikirimkan otomatis ke surel Anda setelah pesanan diserahkan ke logistik.
          </p>
        )}
        {state === "pending" && (
          <p>
            Kami akan memantau pembayaran Anda secara otomatis. Anda juga dapat melihat update status pembayaran secara berkala di tab akun profil Anda.
          </p>
        )}
        {state === "failed" && (
          <p>
            Keranjang belanja Anda tetap aman tersimpan. Klik tombol di bawah untuk kembali ke checkout dan mencoba metode pembayaran lain.
          </p>
        )}
        
        <p className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-400">
          <ShieldCheck className="w-3.5 h-3.5 text-gold" />
          Pembayaran terenkripsi dan aman oleh Midtrans Snap.
        </p>
      </div>

      {/* Button Action */}
      <div className="pt-4 border-t border-neutral-100 flex flex-col gap-2">
        <button
          onClick={() => router.push(config.actionUrl)}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-neutral-950 hover:bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 shadow-md group cursor-pointer"
        >
          {config.actionText}
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </button>

        {state !== "success" && (
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 border border-neutral-200 hover:bg-neutral-50 text-neutral-600 text-xs font-bold uppercase tracking-widest rounded-full transition-all cursor-pointer"
          >
            Kembali ke Beranda
          </button>
        )}
      </div>

    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="bg-[#fdfcf9] min-h-screen flex items-center justify-center px-6 py-12 luxury-pattern">
      <Suspense fallback={
        <div className="text-xs text-neutral-400 flex items-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-gold" />
          Memuat rincian transaksi...
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
