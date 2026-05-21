"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Sparkles, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ContactPage() {
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#fdfcf9] py-16 px-6 luxury-pattern">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header Title */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <div className="flex items-center justify-center gap-1.5 text-gold">
            <Sparkles className="w-4.5 h-4.5 fill-gold/10" />
            <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-neutral-500">Layanan Pelanggan</span>
          </div>
          <h2 className="font-serif text-4xl font-light tracking-tight text-neutral-950">
            Hubungi <span className="italic font-normal font-serif luxury-text-gradient">Layanan Pelanggan</span>
          </h2>
          <p className="text-xs text-neutral-400 font-sans leading-relaxed">
            Butuh konsultasi kulit pribadi atau memiliki pertanyaan seputar proses pemesanan Anda? Tim kurator kami siap menyambut Anda hangat.
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Contact Cards */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-white/70 backdrop-blur-md border border-[#eadecb] p-6 rounded-3xl space-y-4 luxury-border shadow-sm">
              <h3 className="font-serif text-lg font-bold text-neutral-950">Showroom Utama</h3>
              
              <div className="space-y-3.5 text-xs text-neutral-500 font-sans">
                <div className="flex gap-3 items-start">
                  <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                  <span>NEXAMART Boutique, Grand Indonesia Mall Lt. 1, Menteng, Jakarta Pusat 10310</span>
                </div>
                <div className="flex gap-3 items-center">
                  <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>+62 (21) 500-NEXA</span>
                </div>
                <div className="flex gap-3 items-center">
                  <Mail className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>care@nexamart.com</span>
                </div>
                <div className="flex gap-3 items-start">
                  <Clock className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-neutral-700">Setiap Hari:</p>
                    <p>10:00 - 22:00 WIB</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border border-[#eadecb]/50 rounded-2xl bg-white/40 text-[10px] text-neutral-400 font-sans leading-relaxed">
              *Pertanyaan seputar program kemitraan atau influencer dapat dikirimkan langsung ke email khusus media kami di <span className="font-bold text-neutral-600">partnership@nexamart.com</span>.
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="md:col-span-7 bg-white/70 backdrop-blur-md border border-[#eadecb] p-6 rounded-3xl shadow-sm luxury-border">
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-sans font-bold tracking-wider text-neutral-400">Nama Lengkap</label>
                  <input required type="text" placeholder="Anastasia" className="w-full px-4 py-2.5 rounded-xl border border-[#eadecb]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-sans font-bold tracking-wider text-neutral-400">Surel (Email)</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#eadecb]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-sans font-bold tracking-wider text-neutral-400">Subjek</label>
                <input required type="text" placeholder="Konsultasi Perawatan Kulit / Pengiriman" className="w-full px-4 py-2.5 rounded-xl border border-[#eadecb]" />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-sans font-bold tracking-wider text-neutral-400">Pesan</label>
                <textarea required rows={5} placeholder="Tuliskan pesan atau keluhan Anda secara detail di sini..." className="w-full px-4 py-2.5 rounded-xl border border-[#eadecb] resize-none" />
              </div>

              <button type="submit" className="w-full py-3.5 bg-neutral-950 hover:bg-neutral-900 text-white font-bold uppercase tracking-widest rounded-full transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm">
                <Send className="w-3.5 h-3.5" />
                Kirim Pesan
              </button>
            </form>

            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mt-4 p-4 bg-green-50 border border-green-100 text-green-800 rounded-2xl text-xs font-medium"
                >
                  Pesan Anda berhasil dikirim! Tim kurator kami akan menghubungi Anda melalui surel <span className="font-bold">{email}</span> dalam 1x24 jam.
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
}
