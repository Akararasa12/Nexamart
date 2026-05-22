"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { 
  Loader2, 
  ArrowLeft, 
  ShoppingBag, 
  Sparkles, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  User, 
  MessageSquare, 
  Send 
} from "lucide-react";

interface LandingPageBlock {
  type: "hero" | "product_spotlight" | "benefits" | "testimonials" | "faq" | "lead_form";
  id: string;
  content: any;
}

interface LandingPage {
  id: string;
  title: string;
  slug: string;
  status: "Draft" | "Published";
  blocks: LandingPageBlock[];
}

export default function PublicLandingPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { addToCart } = useCart();

  const [pageData, setPageData] = useState<LandingPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState<Record<string, boolean>>({});

  // Lead Form States
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadWhatsapp, setLeadWhatsapp] = useState("");
  const [leadMessage, setLeadMessage] = useState("");
  const [isLeadSubmitting, setIsLeadSubmitting] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadError, setLeadError] = useState("");

  useEffect(() => {
    if (!slug) return;

    async function fetchLandingPage() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/landing-pages?slug=${slug}`);
        const data = await res.json();
        
        if (data.success && data.landingPage) {
          // If draft, only accessible by admins or we can check session, but let's just let it load
          setPageData(data.landingPage);
        } else {
          setPageData(null);
        }
      } catch (e) {
        console.error("Gagal memuat landing page:", e);
        setPageData(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLandingPage();
  }, [slug]);

  const handleCheckoutDirect = (productDetails: any) => {
    // Add default product if details are missing or use configured ones
    const productToAdd = {
      id: productDetails.id || "prod-lp-direct",
      name: productDetails.name || "Aura Radiant Essence",
      price: Number(productDetails.price) || 289000,
      image: productDetails.image || "https://images.unsplash.com/photo-1608248597481-496100c8c836?w=600&auto=format&fit=crop&q=60",
      variantName: productDetails.variant || "Standard",
      isSubscription: false
    };

    addToCart(productToAdd, 1);
  };

  const handleLeadSubmit = async (e: React.FormEvent, blockId: string) => {
    e.preventDefault();
    if (!leadName || !leadWhatsapp) {
      setLeadError("Nama Lengkap dan Nomor WhatsApp wajib diisi.");
      return;
    }

    setIsLeadSubmitting(true);
    setLeadError("");

    try {
      const res = await fetch("/api/admin/landing-pages/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lp_slug: slug,
          name: leadName,
          email: leadEmail,
          whatsapp: leadWhatsapp,
          message: leadMessage
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setLeadSubmitted(true);
        setLeadName("");
        setLeadEmail("");
        setLeadWhatsapp("");
        setLeadMessage("");
      } else {
        setLeadError(data.error || "Gagal mengirim formulir.");
      }
    } catch (err) {
      setLeadError("Terjadi kesalahan koneksi. Silakan coba lagi.");
    } finally {
      setIsLeadSubmitting(false);
    }
  };

  const toggleFaq = (idx: string) => {
    setActiveFaq(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfcf9]">
        <div className="flex flex-col items-center gap-2 text-xs text-neutral-400">
          <Loader2 className="w-6 h-6 animate-spin text-[#c3a475]" />
          Menyiapkan Halaman Penawaran...
        </div>
      </div>
    );
  }

  if (!pageData || pageData.status === "Draft") {
    return (
      <div className="min-h-screen bg-[#fdfcf9] py-16 px-6 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="font-serif text-2xl font-light text-neutral-950">Halaman Tidak Tersedia</h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Maaf, halaman penawaran khusus yang Anda cari belum dipublikasikan atau sudah dinonaktifkan.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-neutral-950 text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfcf9] font-sans text-neutral-800 selection:bg-neutral-950 selection:text-white">
      {/* Dynamic Header */}
      <header className="border-b border-[#eadecb]/40 bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif text-lg font-light tracking-[0.2em] text-[#1c1a17] uppercase">
            NEXAMART
          </Link>
          <button 
            onClick={() => {
              // Find first product_spotlight or lead_form and scroll
              const target = pageData.blocks.find(b => b.type === "product_spotlight" || b.type === "lead_form");
              if (target) scrollToSection(`block-${target.id}`);
            }}
            className="text-[9px] font-bold uppercase tracking-wider text-neutral-900 border border-neutral-200 px-4 py-2 rounded-full hover:bg-neutral-50 transition-colors"
          >
            Pesan Sekarang
          </button>
        </div>
      </header>

      {/* Render Blocks */}
      <main className="pb-20">
        {pageData.blocks.map((block) => {
          const { type, id, content } = block;
          const blockId = `block-${id}`;

          switch (type) {
            case "hero":
              const bgGradient = content.bg_gradient || "from-[#faf8f5] to-[#f4ead4]";
              return (
                <section 
                  key={id} 
                  id={blockId}
                  className={`bg-gradient-to-br ${bgGradient} py-16 sm:py-24 border-b border-[#eadecb]/30`}
                >
                  <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                      <div className="flex items-center gap-1.5 text-[#c3a475]">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Penawaran Eksklusif</span>
                      </div>
                      <h1 className="font-serif text-3xl sm:text-4xl font-light text-neutral-900 leading-tight">
                        {content.title || "Kembalikan Kilau Alami Wajah Anda"}
                      </h1>
                      <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed font-sans">
                        {content.subtitle || "Formula esens premium untuk memperkuat skin barrier Anda dalam 14 hari."}
                      </p>
                      <button
                        onClick={() => {
                          const target = pageData.blocks.find(b => b.type === "lead_form" || b.type === "product_spotlight");
                          if (target) scrollToSection(`block-${target.id}`);
                        }}
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-neutral-950 text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-neutral-900 transition-all shadow-md transform hover:-translate-y-0.5 cursor-pointer"
                      >
                        {content.cta_text || "Dapatkan Sekarang"}
                      </button>
                    </div>
                    <div className="flex justify-center">
                      <div className="relative w-72 h-72 rounded-3xl overflow-hidden border border-[#eadecb]/50 shadow-lg bg-white/40 p-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={content.image_url || "https://images.unsplash.com/photo-1608248597481-496100c8c836?w=600&auto=format&fit=crop&q=60"}
                          alt="Hero Product"
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      </div>
                    </div>
                  </div>
                </section>
              );

            case "product_spotlight":
              return (
                <section 
                  key={id} 
                  id={blockId} 
                  className="py-16 sm:py-20 bg-white border-b border-[#eadecb]/20"
                >
                  <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1 flex justify-center">
                      <div className="relative w-64 h-80 rounded-2xl overflow-hidden shadow-md">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={content.image_url || "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=60"}
                          alt="Spotlight Product"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="order-1 md:order-2 space-y-6">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#c3a475] bg-[#f6f3ed] px-3 py-1 rounded-full border border-[#eadecb]/30">Sorotan Produk</span>
                      <h2 className="font-serif text-2xl sm:text-3xl font-light text-neutral-900 leading-snug">
                        {content.title || "Mengapa Memilih Kami?"}
                      </h2>
                      <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed font-sans">
                        {content.description || "Diformulasikan secara ilmiah untuk menghidrasi kulit secara mendalam dan menyamarkan garis halus."}
                      </p>
                      
                      {content.price && (
                        <div className="space-y-1">
                          <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider block">Harga Spesial</span>
                          <span className="text-xl font-serif font-bold text-amber-800">
                            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(content.price)}
                          </span>
                        </div>
                      )}

                      <button
                        onClick={() => handleCheckoutDirect(content)}
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-neutral-950 text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-neutral-900 transition-all flex justify-center w-full sm:w-auto shadow-sm cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4 text-amber-500" />
                        {content.btn_text || "Beli Sekarang"}
                      </button>
                    </div>
                  </div>
                </section>
              );

            case "benefits":
              const benefitItems = content.items || [];
              return (
                <section 
                  key={id} 
                  id={blockId} 
                  className="py-16 sm:py-20 bg-[#fdfcf9] border-b border-[#eadecb]/20"
                >
                  <div className="max-w-4xl mx-auto px-6 space-y-12">
                    <div className="text-center space-y-2">
                      <h2 className="font-serif text-2xl sm:text-3xl font-light text-neutral-900">
                        {content.title || "Manfaat Hasil Studi Klinis"}
                      </h2>
                      <div className="w-12 h-0.5 bg-[#c3a475] mx-auto" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {benefitItems.map((benefit: any, idx: number) => (
                        <div 
                          key={idx} 
                          className="bg-white border border-[#eadecb] p-6 rounded-2xl shadow-sm space-y-3"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#f6f3ed] flex items-center justify-center text-[#c3a475]">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <h4 className="font-serif text-sm font-semibold text-neutral-900">
                            {benefit.title || "Manfaat Utama"}
                          </h4>
                          <p className="text-neutral-500 text-xs leading-relaxed font-sans">
                            {benefit.desc || "Deskripsi manfaat produk kecantikan."}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case "testimonials":
              const testimonialsList = content.items || [
                { quote: "Kulit jadi sangat kenyal dan noda hitam memudar hanya dalam waktu 10 hari pemakaian!", author: "Syifa A. (Royal Member)", rating: 5 },
                { quote: "Sensasi esens sangat menenangkan di wajah sensitif. Sangat direkomendasikan dokter kulit saya.", author: "Ratih P.", rating: 5 }
              ];
              return (
                <section 
                  key={id} 
                  id={blockId} 
                  className="py-16 sm:py-20 bg-white border-b border-[#eadecb]/20"
                >
                  <div className="max-w-4xl mx-auto px-6 space-y-10">
                    <h3 className="font-serif text-xl sm:text-2xl text-center font-light text-neutral-900">
                      Apa Kata Pelanggan Setia NEXAMART
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      {testimonialsList.map((testi: any, idx: number) => (
                        <div 
                          key={idx} 
                          className="bg-[#fdfcf9] border border-[#eadecb]/50 p-6 rounded-2xl relative space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)]"
                        >
                          <div className="flex gap-1">
                            {Array.from({ length: testi.rating || 5 }).map((_, i) => (
                              <Sparkles key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            ))}
                          </div>
                          <p className="text-xs sm:text-sm text-neutral-600 font-serif italic leading-relaxed">
                            &ldquo;{testi.quote}&rdquo;
                          </p>
                          <div className="flex items-center gap-2 pt-2">
                            <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-500">
                              {testi.author ? testi.author.charAt(0) : "U"}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{testi.author || "Pengguna Terverifikasi"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case "faq":
              const faqList = content.items || [
                { q: "Apakah produk ini aman untuk bumil & busui?", a: "Ya, formula kami bebas dari paraben, alkohol, pewangi buatan, serta retinoid yang aman bagi ibu hamil & menyusui." },
                { q: "Kapan hasil pemakaian mulai terlihat?", a: "Rata-rata customer kami mendapati kulit terasa lebih lembap instan sejak hari pertama dan kecerahan meningkat dalam 14 hari pemakaian rutin pagi & malam." }
              ];
              return (
                <section 
                  key={id} 
                  id={blockId} 
                  className="py-16 sm:py-20 bg-[#fdfcf9] border-b border-[#eadecb]/20"
                >
                  <div className="max-w-3xl mx-auto px-6 space-y-8">
                    <h3 className="font-serif text-xl sm:text-2xl text-center font-light text-neutral-900">
                      Tanya Jawab (FAQ)
                    </h3>
                    <div className="space-y-3">
                      {faqList.map((faq: any, idx: number) => {
                        const faqKey = `${id}-${idx}`;
                        const isOpen = !!activeFaq[faqKey];
                        return (
                          <div 
                            key={idx} 
                            className="bg-white border border-[#eadecb] rounded-xl overflow-hidden transition-all duration-300 shadow-sm"
                          >
                            <button
                              onClick={() => toggleFaq(faqKey)}
                              className="w-full px-6 py-4 flex justify-between items-center text-left text-neutral-800 hover:bg-[#fcfbf9] transition-colors cursor-pointer"
                            >
                              <span className="font-serif text-sm font-semibold pr-4">{faq.q}</span>
                              {isOpen ? <ChevronUp className="w-4 h-4 text-amber-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />}
                            </button>
                            {isOpen && (
                              <div className="px-6 pb-5 pt-1 text-xs text-neutral-500 leading-relaxed font-sans border-t border-neutral-50">
                                {faq.a}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              );

            case "lead_form":
              return (
                <section 
                  key={id} 
                  id={blockId} 
                  className="py-16 sm:py-20 bg-white"
                >
                  <div className="max-w-md mx-auto px-6">
                    <div className="bg-[#fdfcf9] border border-[#eadecb] p-6 sm:p-8 rounded-3xl shadow-md space-y-6">
                      <div className="text-center space-y-2">
                        <h3 className="font-serif text-xl font-bold text-neutral-950">
                          {content.title || "Konsultasikan Jenis Kulit Anda"}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-neutral-400 font-sans leading-relaxed">
                          {content.subtitle || "Dapatkan konsultasi gratis & kupon sampel produk kecantikan eksklusif dengan mengisi formulir di bawah ini."}
                        </p>
                      </div>

                      {leadSubmitted ? (
                        <div className="p-6 bg-green-50 border border-green-200 rounded-2xl text-center space-y-3">
                          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
                          <h4 className="font-serif text-base font-bold text-green-800">Formulir Dikirim!</h4>
                          <p className="text-[11px] text-green-700 leading-normal font-sans">
                            Terima kasih! Konsultan kecantikan kami akan menghubungi Anda melalui WhatsApp dalam waktu 1x24 jam untuk pengiriman sampel gratis.
                          </p>
                          <button 
                            onClick={() => setLeadSubmitted(false)}
                            className="mt-2 text-[10px] font-bold uppercase tracking-wider text-green-800 hover:underline"
                          >
                            Kirim Formulir Lain
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={(e) => handleLeadSubmit(e, id)} className="space-y-4">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                              Nama Lengkap
                            </label>
                            <input 
                              type="text" 
                              value={leadName}
                              onChange={(e) => setLeadName(e.target.value)}
                              placeholder="Masukkan nama Anda..."
                              required
                              className="w-full px-4 py-3 border border-[#eadecb] rounded-xl text-neutral-800 text-xs focus:border-[#c3a475] bg-white outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                                WhatsApp (WA)
                              </label>
                              <input 
                                type="tel" 
                                value={leadWhatsapp}
                                onChange={(e) => setLeadWhatsapp(e.target.value)}
                                placeholder="Contoh: 08123456..."
                                required
                                className="w-full px-4 py-3 border border-[#eadecb] rounded-xl text-neutral-800 text-xs focus:border-[#c3a475] bg-white outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                                Email (Opsional)
                              </label>
                              <input 
                                type="email" 
                                value={leadEmail}
                                onChange={(e) => setLeadEmail(e.target.value)}
                                placeholder="name@domain.com"
                                className="w-full px-4 py-3 border border-[#eadecb] rounded-xl text-neutral-800 text-xs focus:border-[#c3a475] bg-white outline-none"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                              Catatan Jenis Kulit / Masalah
                            </label>
                            <textarea 
                              rows={3}
                              value={leadMessage}
                              onChange={(e) => setLeadMessage(e.target.value)}
                              placeholder="Misal: Kulit kusam, berminyak, berjerawat..."
                              className="w-full px-4 py-3 border border-[#eadecb] rounded-xl text-neutral-800 text-xs focus:border-[#c3a475] bg-white outline-none resize-none"
                            />
                          </div>

                          {leadError && (
                            <p className="text-[10px] text-red-600 font-semibold">{leadError}</p>
                          )}

                          <button
                            type="submit"
                            disabled={isLeadSubmitting}
                            className="w-full py-3.5 bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-neutral-300"
                          >
                            {isLeadSubmitting ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Mengirim Data...
                              </>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5" />
                                {content.btn_text || "Klaim Konsultasi Gratis"}
                              </>
                            )}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </section>
              );

            default:
              return null;
          }
        })}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#eadecb]/40 py-10 bg-[#faf8f5]">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-4 text-[10px] text-neutral-400 font-sans tracking-wide">
          <p className="font-serif text-neutral-600 tracking-[0.1em] text-xs">NEXAMART BEAUTY CLINICAL</p>
          <p>© {new Date().getFullYear()} NEXAMART. Dibuat eksklusif untuk kampanye periklanan & program Royal Member.</p>
          <div className="flex justify-center gap-6 pt-2 font-bold uppercase tracking-widest">
            <Link href="/" className="hover:text-neutral-700">Kembali ke Toko Utama</Link>
            <span>•</span>
            <Link href="/blog" className="hover:text-neutral-700">Jurnal Kecantikan</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
