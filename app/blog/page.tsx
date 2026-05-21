"use client";

import React from "react";
import { Sparkles, Calendar, User, ArrowRight } from "lucide-react";

const BLOG_POSTS = [
  {
    slug: "rahasia-galactomyces-kulit-cerah-alami",
    title: "Rahasia Galactomyces: Kunci Kulit Cerah Alami Murni",
    date: "18 Mei 2026",
    author: "dr. Livia W.",
    category: "Bahan Aktif",
    excerpt: "Mengapa fermentasi Galactomyces menjadi bahan legendaris dalam esens perawatan kulit premium? Simak manfaatnya untuk elastisitas dan skin barrier.",
    readTime: "5 Menit Baca"
  },
  {
    slug: "panduan-memulai-retinol-tanpa-purging",
    title: "Panduan Memulai Retinol Tanpa Takut Purging",
    date: "14 Mei 2026",
    author: "Elena Rose",
    category: "Anti-Aging",
    excerpt: "Banyak pemula takut mencoba retinol karena resiko purging. Simak tips mencampurnya dengan peptida dan squalane untuk hasil awet muda bebas kemerahan.",
    readTime: "7 Menit Baca"
  },
  {
    slug: "double-cleansing-pentingnya-cleansing-balm",
    title: "Double Cleansing: Mengapa Balsem Pembersih Sangat Penting?",
    date: "10 Mei 2026",
    author: "Clara S.",
    category: "Deep Cleansing",
    excerpt: "Sabun wajah biasa tidak cukup melelehkan sebum tersumbat dan makeup tebal. Ketahui mengapa minyak almond manis dalam balsem pembersih adalah kunci kulit bernapas bebas jerawat.",
    readTime: "4 Menit Baca"
  }
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#fdfcf9] py-16 px-6 luxury-pattern">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header Title */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <div className="flex items-center justify-center gap-1.5 text-gold">
            <Sparkles className="w-4.5 h-4.5 fill-gold/10" />
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
        <div className="space-y-6">
          {BLOG_POSTS.map((post) => (
            <div
              key={post.slug}
              className="bg-white/70 backdrop-blur-md border border-[#eadecb] p-6 rounded-3xl space-y-4 hover:shadow-[0_12px_35px_rgba(195,164,117,0.06)] transition-all duration-300 luxury-border"
            >
              <div className="flex justify-between items-center text-[9px] font-sans font-bold uppercase tracking-wider text-gold">
                <span>{post.category}</span>
                <span>{post.readTime}</span>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-xl font-bold text-neutral-950 hover:text-gold transition-colors">
                  {post.title}
                </h3>
                <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="border-t border-[#eadecb]/40 pt-4 flex justify-between items-center text-xs text-neutral-400">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1.5 font-sans">
                    <Calendar className="w-3.5 h-3.5 text-neutral-300" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1.5 font-sans">
                    <User className="w-3.5 h-3.5 text-neutral-300" />
                    {post.author}
                  </span>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-950 hover:underline flex items-center gap-1 cursor-pointer">
                  Baca Artikel
                  <ArrowRight className="w-3.5 h-3.5 text-gold" />
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
