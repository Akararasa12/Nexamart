"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Star, Sparkles, SlidersHorizontal, ArrowUpRight } from "lucide-react";

const ALL_PRODUCTS = [
  {
    id: "nexa-aura-essence",
    slug: "aura-radiant-essence",
    name: "Aura Radiant Essence",
    category: "Skincare",
    tags: ["Skincare", "Organik", "Best Seller"],
    price: 299000,
    rating: 4.9,
    reviewsCount: 4892,
    excerpt: "Esens pencerah wajah premium terbuat dari Niacinamide 5%, Licorice Root, dan fermentasi Galactomyces.",
    image: "/images/aura_essence.png"
  },
  {
    id: "nexa-celestial-serum",
    slug: "celestial-youth-elixir",
    category: "Skincare",
    tags: ["Skincare", "Anti-Aging", "Malam"],
    name: "Celestial Youth Elixir",
    price: 349000,
    rating: 4.8,
    reviewsCount: 1248,
    excerpt: "Serum pencegah kerutan malam hari yang menstimulasi kolagen dengan kekuatan Retinol 0.2% & Peptida.",
    image: "/images/celestial_serum.png"
  },
  {
    id: "nexa-elysian-balm",
    slug: "elysian-cleansing-balm",
    category: "Makeup",
    tags: ["Makeup", "Pembersih", "Organik"],
    name: "Elysian Cleansing Balm",
    price: 199000,
    rating: 4.7,
    reviewsCount: 924,
    excerpt: "Balsem peleleh makeup organik premium dengan minyak almond manis dan ekstrak kamomil yang menenangkan.",
    image: "/images/elysian_balm.png"
  }
];

interface DBProduct {
  id: string;
  slug: string;
  name: string;
  description?: string;
  base_price: string | number;
  images?: string[];
  attributes?: {
    category?: string;
    tags?: string[];
    rating?: number;
    reviewsCount?: number;
    [key: string]: unknown;
  } | null;
}

interface MappedProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  tags: string[];
  price: number;
  rating: number;
  reviewsCount: number;
  excerpt: string;
  image: string;
}

const CATEGORIES = ["Semua", "Skincare", "Makeup", "Anti-Aging", "Organik"];

const mapProductFromDB = (prod: DBProduct): MappedProduct => {
  const attrs = prod.attributes || {};
  return {
    id: prod.id,
    slug: prod.slug,
    name: prod.name,
    category: attrs.category || "Skincare",
    tags: Array.isArray(attrs.tags) ? attrs.tags : ["Skincare"],
    price: Number(prod.base_price),
    rating: typeof attrs.rating === "number" ? attrs.rating : 4.8,
    reviewsCount: typeof attrs.reviewsCount === "number" ? attrs.reviewsCount : 100,
    excerpt: prod.description || "",
    image: (prod.images && prod.images[0]) || "/images/aura_essence.png"
  };
};

export default function ProductsPage() {
  const [products, setProducts] = useState<MappedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("Semua");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        const data = await res.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          const mapped = data.products.map(mapProductFromDB);
          setProducts(mapped);
        } else {
          setProducts(ALL_PRODUCTS);
        }
      } catch (err) {
        console.error("Gagal mengambil data produk:", err);
        setProducts(ALL_PRODUCTS);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTag = selectedTag === "Semua" || 
        product.category.toLowerCase() === selectedTag.toLowerCase() || 
        product.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase());

      return matchesSearch && matchesTag;
    });
  }, [products, searchQuery, selectedTag]);

  // Programmatic JSON-LD Schema
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "NEXAMART Products Catalog",
    "numberOfItems": products.length,
    "itemListElement": products.map((prod, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://nexamart-ecommerce.vercel.app/products/${prod.slug}`,
      "name": prod.name
    }))
  };

  return (
    <div className="min-h-screen bg-[#fdfcf9] py-16 px-6 luxury-pattern">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Page Title Header */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <div className="flex items-center justify-center gap-1.5 text-neutral-400">
            <Sparkles className="w-4.5 h-4.5 text-gold fill-gold/10" />
            <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-neutral-500">Katalog Produk</span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-light tracking-tight text-neutral-950">
            Koleksi <span className="italic font-normal font-serif">Kecantikan Premium</span>
          </h2>
          <p className="text-xs text-neutral-400 font-sans leading-relaxed">
            Jelajahi produk kosmetik organik premium yang diformulasikan khusus untuk merawat kecantikan kulit abadi Anda.
          </p>
        </div>

        {/* Search and Filters Controls */}
        <div className="bg-white/70 backdrop-blur-md border border-[#eadecb] p-6 rounded-3xl space-y-5 shadow-sm max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk kecantikan Anda..."
                className="w-full text-xs pl-10 pr-4 py-3 rounded-full border border-[#eadecb] focus:border-gold"
              />
              <Search className="absolute left-4 top-3.5 w-4.5 h-4.5 text-neutral-400" />
            </div>

            {/* Filter Metadata Info */}
            <div className="flex items-center gap-2 text-neutral-400 text-xs flex-shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-gold" />
              <span>{filteredProducts.length} Produk Ditemukan</span>
            </div>
          </div>

          {/* Tags Pills */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[#eadecb]/40">
            {CATEGORIES.map((tag) => {
              const isActive = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase cursor-pointer transition-all duration-200 ${
                    isActive
                      ? "bg-neutral-950 text-white shadow-sm"
                      : "bg-[#f6f3ed]/60 text-neutral-500 hover:bg-[#f6f3ed] hover:text-neutral-900 border border-[#eadecb]/30"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-neutral-400 font-sans">Menyelaraskan koleksi premium...</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-neutral-400">Tidak ada produk yang cocok dengan pencarian Anda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="group flex flex-col bg-white border border-[#eadecb] rounded-3xl p-5 hover:shadow-[0_12px_40px_rgba(195,164,117,0.08)] transition-all duration-300 relative luxury-border overflow-hidden"
              >
                {/* Product Image Frame */}
                <div className="relative aspect-square w-full bg-[#fdfcf9] border border-neutral-100 rounded-2xl overflow-hidden flex items-center justify-center mb-5">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                  
                  {/* Category Pill Tag */}
                  <span className="absolute top-4 left-4 bg-neutral-950/80 text-white text-[8px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                    {p.category}
                  </span>
                </div>

                {/* Info Block */}
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {/* Rating */}
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-[10px] font-bold text-neutral-800 font-sans">
                        {p.rating} ({p.reviewsCount} Ulasan)
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-lg text-neutral-950 group-hover:text-gold transition-colors leading-snug flex justify-between items-start gap-1">
                      {p.name}
                      <ArrowUpRight className="w-4 h-4 text-neutral-300 group-hover:text-gold group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </h3>

                    <p className="text-xs text-neutral-500 leading-relaxed font-sans line-clamp-2">
                      {p.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#eadecb]/30">
                    <span className="font-serif text-base font-bold text-neutral-950">
                      {formatRupiah(p.price)}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold group-hover:underline">
                      Detail Produk
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
