"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Compass, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="w-full bg-[#111111] text-[#ece4d9] pt-16 pb-24 md:pb-12 border-t border-[#3a3227]/50 font-sans luxury-pattern-dark select-none relative z-10">
      
      {/* Upper Grid: Newsletter and Sitemap */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10 items-start pb-12 border-b border-[#3a3227]/40">
        
        {/* Newsletter Column */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-1.5 text-gold">
            <Sparkles className="w-4 h-4 fill-gold/10" />
            <span className="text-[9px] uppercase tracking-widest font-bold">Warta Ritual Kecantikan</span>
          </div>
          <h3 className="font-serif text-2xl font-light tracking-tight text-white">
            Bergabung dengan <span className="italic">NEXAMART Circle</span>
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-light">
            Dapatkan kurasi bahan aktif eksklusif, rahasia perawatan kulit awet muda, dan akses awal ke koleksi produk musiman kami.
          </p>

          <form onSubmit={handleSubscribe} className="relative mt-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email Anda..."
              className="w-full bg-neutral-900 border border-[#3a3227] text-white px-4 py-3 rounded-full text-xs focus:outline-none focus:border-gold transition-all pr-12 font-sans placeholder-neutral-500"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-4 bg-white hover:bg-neutral-100 text-neutral-950 rounded-full transition-colors flex items-center justify-center cursor-pointer"
              title="Subscribe"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <AnimatePresence>
            {subscribed && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[10px] text-green-400 font-medium font-sans"
              >
                ✓ Terima kasih! Anda telah terdaftar dalam buletin eksklusif kami.
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Sitemap / Collections */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-[10px] uppercase tracking-wider text-gold font-bold font-sans">Koleksi Ritual</h4>
          <ul className="space-y-2 text-xs text-neutral-400 font-sans">
            <li>
              <Link href="/products" className="hover:text-white transition-colors">Semua Produk</Link>
            </li>
            <li>
              <Link href="/products?tag=Skincare" className="hover:text-white transition-colors">Perawatan Kulit (Skincare)</Link>
            </li>
            <li>
              <Link href="/products?tag=Makeup" className="hover:text-white transition-colors">Kosmetik (Makeup)</Link>
            </li>
            <li>
              <Link href="/products?tag=Anti-Aging" className="hover:text-white transition-colors">Awet Muda (Anti-Aging)</Link>
            </li>
            <li>
              <Link href="/products?tag=Organik" className="hover:text-white transition-colors">Bahan Organik</Link>
            </li>
          </ul>
        </div>

        {/* Customer Care / Returns */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-[10px] uppercase tracking-wider text-gold font-bold font-sans">Pusat Bantuan</h4>
          <ul className="space-y-2 text-xs text-neutral-400 font-sans">
            <li>
              <Link href="/returns" className="hover:text-white transition-colors">
                Kebijakan Pengembalian (30 Hari)
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition-colors">Butik Showroom</Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-white transition-colors">Jurnal Editorial</Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-white transition-colors">
                Pertanyaan Umum (FAQ)
              </Link>
            </li>
          </ul>
        </div>

        {/* Showroom & Contact Info */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="text-[10px] uppercase tracking-wider text-gold font-bold font-sans">Showroom & Kantor</h4>
          <div className="space-y-2.5 text-xs text-neutral-400 leading-relaxed font-sans">
            <div className="flex gap-2 items-start">
              <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
              <span>Grand Indonesia Mall Lt. 1, Menteng, Jakarta Pusat 10310</span>
            </div>
            <div className="flex gap-2 items-center">
              <Phone className="w-4 h-4 text-gold flex-shrink-0" />
              <span>+62 (21) 500-NEXA</span>
            </div>
            <div className="flex gap-2 items-center">
              <Mail className="w-4 h-4 text-gold flex-shrink-0" />
              <span>care@nexamart.com</span>
            </div>
          </div>
        </div>

      </div>

      {/* Middle Bar: Badges & Social Media */}
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-[#3a3227]/40">
        
        {/* Payment Partner & Security Logos */}
        <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-[9px] font-sans font-bold uppercase tracking-wider text-neutral-400">
          <span className="flex items-center gap-1 bg-neutral-900 border border-[#3a3227] px-3 py-1.5 rounded-md text-white text-[8px]">
            <ShieldCheck className="w-3.5 h-3.5 text-gold" />
            Midtrans Secured
          </span>
          <span className="bg-neutral-900 border border-[#3a3227] px-3 py-1.5 rounded-md">RajaOngkir Live</span>
          <span className="bg-neutral-900 border border-[#3a3227] px-3 py-1.5 rounded-md text-[#00a896]">GoPay</span>
          <span className="bg-neutral-900 border border-[#3a3227] px-3 py-1.5 rounded-md text-[#ee4d2d]">ShopeePay</span>
          <span className="bg-neutral-900 border border-[#3a3227] px-3 py-1.5 rounded-md text-gold">QRIS</span>
        </div>

        {/* Social Media Buttons */}
        <div className="flex items-center gap-3">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-[#3a3227] text-neutral-300 hover:text-white transition-colors"
            title="Instagram"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-[#3a3227] text-neutral-300 hover:text-white transition-colors"
            title="YouTube"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z"/>
              <polygon points="10 15 15 12 10 9"/>
            </svg>
          </a>
          <a
            href="https://pinterest.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-[#3a3227] text-neutral-300 hover:text-white transition-colors"
            title="Pinterest"
          >
            <Compass className="w-4 h-4" />
          </a>
        </div>

      </div>

      {/* Bottom Bar: Copyright */}
      <div className="max-w-6xl mx-auto px-6 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-neutral-500 font-sans">
        <p>© 2026 NEXAMART Beauty Group. Seluruh Hak Cipta Dilindungi.</p>
        <div className="flex gap-4">
          <Link href="/terms" className="hover:text-neutral-400">Syarat & Ketentuan</Link>
          <Link href="/privacy" className="hover:text-neutral-400">Kebijakan Privasi</Link>
        </div>
      </div>

    </footer>
  );
}
