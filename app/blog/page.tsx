"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Calendar, User, ArrowRight, Loader2 } from "lucide-react";

interface Journal {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  read_time: string;
  author: string;
  created_at: string;
}

const DEFAULT_BLOG_POSTS: Journal[] = [
  {
    id: "default-1",
    slug: "rahasia-galactomyces-kulit-cerah-alami",
    title: "Rahasia Galactomyces: Kunci Kulit Cerah Alami Murni",
    created_at: "2026-05-18T00:00:00.000Z",
    author: "dr. Livia W.",
    category: "Bahan Aktif",
    excerpt: "Mengapa fermentasi Galactomyces menjadi bahan legendaris dalam esens perawatan kulit premium? Simak manfaatnya untuk elastisitas dan skin barrier.",
    content: "Fermentasi Galactomyces adalah ragi filtrat yang kaya akan vitamin, asam amino, dan mineral penting. Bahan ini bekerja dengan cara meningkatkan kelembapan alami kulit, memperkuat skin barrier, dan menghambat produksi melanin secara aman. Penggunaan rutin esens Galactomyces terbukti memudarkan noda hitam, meratakan warna kulit, serta mengembalikan elastisitas alami wajah, memberikan kilau sehat murni yang tahan lama.",
    read_time: "5 Menit Baca"
  },
  {
    id: "default-2",
    slug: "panduan-memulai-retinol-tanpa-purging",
    title: "Panduan Memulai Retinol Tanpa Takut Purging",
    created_at: "2026-05-14T00:00:00.000Z",
    author: "Elena Rose",
    category: "Anti-Aging",
    excerpt: "Banyak pemula takut mencoba retinol karena resiko purging. Simak tips mencampurnya dengan peptida dan squalane untuk hasil awet muda bebas kemerahan.",
    content: "Retinol adalah standar emas untuk regenerasi sel kulit dan pencegahan penuaan dini. Namun, efek iritasi awal (purging) sering kali membuat pemula mundur. Untuk menghindarinya, mulailah dengan metode sandwich: oleskan pelembap tipis, ikuti dengan retinol dosis rendah (0.1% - 0.2%), lalu kunci kembali dengan pelembap tebal. Mencampur retinol dengan bahan penenang seperti squalane atau peptida juga mempercepat adaptasi kulit Anda tanpa memicu dehidrasi.",
    read_time: "7 Menit Baca"
  },
  {
    id: "default-3",
    slug: "double-cleansing-pentingnya-cleansing-balm",
    title: "Double Cleansing: Mengapa Balsem Pembersih Sangat Penting?",
    created_at: "2026-05-10T00:00:00.000Z",
    author: "Clara S.",
    category: "Deep Cleansing",
    excerpt: "Sabun wajah biasa tidak cukup melelehkan sebum tersumbat dan makeup tebal. Ketahui mengapa minyak almond manis dalam balsem pembersih adalah kunci kulit bernapas bebas jerawat.",
    content: "Menggunakan sabun cuci muka biasa sering kali menyisakan sisa tabir surya tahan air dan sebum berlebih di pori-pori. Balsem pembersih (Cleansing Balm) dengan kandungan lipid alami bekerja melarutkan kotoran berbasis minyak tersebut tanpa merusak pelindung kulit. Setelah dibilas dengan air hangat, ikuti dengan pembersih berbasis air yang lembut untuk memastikan wajah bersih total dan siap menyerap nutrisi skincare selanjutnya secara optimal.",
    read_time: "4 Menit Baca"
  }
];

export default function BlogPage() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchJournals() {
      try {
        const res = await fetch("/api/journals", { cache: "no-store" });
        const data = await res.json();
        if (data.success && data.journals && data.journals.length > 0) {
          setJournals(data.journals);
        } else {
          // Fallback to default posts if database is empty
          setJournals(DEFAULT_BLOG_POSTS);
        }
      } catch (e) {
        console.error("Gagal memuat jurnal:", e);
        setJournals(DEFAULT_BLOG_POSTS);
      } finally {
        setIsLoading(false);
      }
    }
    fetchJournals();
  }, []);

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-[#fdfcf9] py-16 px-6 luxury-pattern">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header Title */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <div className="flex items-center justify-center gap-1.5 text-gold">
            <Sparkles className="w-4.5 h-4.5 fill-gold/10 text-amber-600" />
            <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-neutral-500">Jurnal Kecantikan</span>
          </div>
          <h2 className="font-serif text-4xl font-light tracking-tight text-neutral-950">
            Jurnal <span className="italic font-normal font-serif luxury-text-gradient">Kecantikan & Formula</span>
          </h2>
          <p className="text-xs text-neutral-400 font-sans leading-relaxed">
            Artikel ilmiah, tips perawatan kulit, dan panduan kecantikan klasik dari ahli kosmetologi kami untuk mengawal perjalanan kecantikan Anda.
          </p>
        </div>

        {/* Blog Posts List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {journals.map((post) => (
              <div
                key={post.slug}
                className="bg-white/70 backdrop-blur-md border border-[#eadecb] p-6 rounded-3xl space-y-4 hover:shadow-[0_12px_35px_rgba(195,164,117,0.06)] transition-all duration-300 luxury-border"
              >
                <div className="flex justify-between items-center text-[9px] font-sans font-bold uppercase tracking-wider text-amber-700">
                  <span>{post.category}</span>
                  <span>{post.read_time}</span>
                </div>

                <div className="space-y-2">
                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="font-serif text-xl font-bold text-neutral-950 hover:text-amber-700 transition-colors cursor-pointer">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="border-t border-[#eadecb]/40 pt-4 flex justify-between items-center text-xs text-neutral-400">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1.5 font-sans">
                      <Calendar className="w-3.5 h-3.5 text-neutral-300" />
                      {formatDate(post.created_at)}
                    </span>
                    <span className="flex items-center gap-1.5 font-sans">
                      <User className="w-3.5 h-3.5 text-neutral-300" />
                      {post.author}
                    </span>
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-[10px] font-bold uppercase tracking-wider text-neutral-950 hover:text-amber-700 flex items-center gap-1 cursor-pointer bg-transparent border-none outline-none"
                  >
                    Baca Artikel
                    <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* The article is now loaded in a separate page under /blog/[slug] */}
    </div>
  );
}
