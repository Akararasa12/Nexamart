"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Check, Star, ChevronDown, Award } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface ProductVariant {
  name: string;
  hex: string;
  imageDesc: string;
}

interface ProductReview {
  name: string;
  rating: number;
  date: string;
  text: string;
}

interface ProductInfo {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  image: string;
  description: string;
  ingredients: string;
  howToUse: string;
  variants: ProductVariant[];
  reviews: ProductReview[];
}

interface DBVariant {
  variant_metadata?: {
    shade?: string;
    name?: string;
    hex?: string;
    imageDesc?: string;
  } | null;
}

interface DBProductDetail {
  id: string;
  name: string;
  base_price: string | number;
  description?: string;
  images?: string[];
  attributes?: {
    category?: string;
    ingredients?: string;
    howToUse?: string;
    reviews?: ProductReview[];
    [key: string]: unknown;
  } | null;
  product_variants?: DBVariant[];
}

// Define the comprehensive product catalog with specs, ingredients & customer reviews
const PRODUCTS_REGISTRY: Record<string, ProductInfo> = {
  "aura-radiant-essence": {
    id: "nexa-aura-essence",
    name: "Aura Radiant Essence",
    category: "Skincare",
    basePrice: 299000,
    image: "/images/aura_essence.png",
    description: "Esens pencerah wajah premium terbuat dari Niacinamide 5%, Licorice Root, dan fermentasi Galactomyces. Perawatan harian mewah untuk menyembuhkan skin barrier, memudarkan noda hitam, dan mewujudkan kemilau abadi.",
    ingredients: "Galactomyces Ferment Filtrate, Niacinamide 5%, Glycyrrhiza Glabra (Licorice) Root Extract, Sodium Hyaluronate, Centella Asiatica Extract, Allantoin, Panthenol.",
    howToUse: "Setelah membersihkan wajah, tuangkan 3-5 tetes esens ke telapak tangan Anda. Tepuk-tepuk lembut ke seluruh area wajah dan leher secara merata hingga terserap sepenuhnya sebelum menggunakan serum atau pelembap.",
    variants: [
      { name: "Aura Glow (Original)", hex: "#FDFCFA", imageDesc: "Cairan bening murni berpendar lembut" },
      { name: "Rose Pearl (Pink Shimmer)", hex: "#F4DCD6", imageDesc: "Cairan merah muda berbutir mutiara berkilau" },
      { name: "Golden Elixir (Bronze Warmth)", hex: "#E8D1B3", imageDesc: "Formula madu keemasan yang menutrisi hangat" }
    ],
    reviews: [
      { name: "Rania S.", rating: 5, date: "15 Mei 2026", text: "Esens ini luar biasa mewah! Teksturnya ringan sekali dan langsung meresap. Setelah pemakaian 2 minggu, kulit saya terasa jauh lebih cerah dan glowing seperti putri bangsawan." },
      { name: "Farah D.", rating: 5, date: "08 Mei 2026", text: "Sangat suka dengan shade Rose Pearl, memberikan efek shimmer kemerahan yang sehat di pagi hari. Menghidrasi sepanjang hari tanpa membuat berminyak." },
      { name: "Amira K.", rating: 4, date: "28 April 2026", text: "Produk yang bagus sekali. Kulit sensitif saya tidak bereaksi buruk sama sekali. Nilai plus karena wanginya sangat alami dan mewah." }
    ]
  },
  "celestial-youth-elixir": {
    id: "nexa-celestial-serum",
    name: "Celestial Youth Elixir",
    category: "Skincare",
    basePrice: 349000,
    image: "/images/celestial_serum.png",
    description: "Serum pencegah kerutan malam hari yang menstimulasi kolagen dengan kekuatan Retinol 0.2% dan Peptida aktif. Bekerja aktif saat Anda tertidur untuk memulihkan tekstur kulit dan menyamarkan garis halus.",
    ingredients: "Aqua, Retinol 0.2%, Copper Tripeptide-1, Acetyl Hexapeptide-8, Squalane, Ceramide NP, Panthenol, Glycerin, Sodium Hyaluronate.",
    howToUse: "Gunakan hanya pada malam hari. Setelah esens terserap, aplikasikan 2-3 pompa serum ke wajah. Gunakan tabir surya di pagi hari berikutnya untuk perlindungan maksimal.",
    variants: [
      { name: "Celestial Formula", hex: "#0F2C59", imageDesc: "Serum biru safir botol kaca elegan" }
    ],
    reviews: [
      { name: "Tari W.", rating: 5, date: "16 Mei 2026", text: "Kombinasi Retinol dan Peptida di serum ini sangat bersahabat di kulit pemula seperti saya. Tidak ada purging, kerutan halus di dahi mulai samar." },
      { name: "Nadia L.", rating: 5, date: "05 Mei 2026", text: "Kemasan botol birunya sangat premium, rasanya seperti menggunakan produk spa bintang lima. Tekstur kulit jadi sangat halus setelah bangun tidur." },
      { name: "Citra P.", rating: 4, date: "20 April 2026", text: "Sangat melembapkan untuk ukuran serum retinol. Kulit terasa lebih kenyal dan kencang di pagi hari." }
    ]
  },
  "elysian-cleansing-balm": {
    id: "nexa-elysian-balm",
    name: "Elysian Cleansing Balm",
    category: "Makeup",
    basePrice: 199000,
    image: "/images/elysian_balm.png",
    description: "Balsem peleleh makeup organik premium dengan minyak almond manis dan ekstrak kamomil yang menenangkan. Meleleh lembut menyapu kotoran tersumbat tanpa merusak hidrasi alami kulit.",
    ingredients: "Prunus Amygdalus Dulcis (Sweet Almond) Oil, Chamomilla Recutita (Matricaria) Flower Extract, Shea Butter, Tocopheryl Acetate (Vitamin E), Caprylic/Capric Triglyceride.",
    howToUse: "Ambil balsem seukuran koin menggunakan spatula. Pijat lembut pada wajah kering dengan gerakan melingkar hingga makeup meleleh, lalu bilas dengan air hangat hingga bersih.",
    variants: [
      { name: "Elysian Balm", hex: "#EBE3D5", imageDesc: "Balsem putih krim lembut wadah marmer" }
    ],
    reviews: [
      { name: "Dewi A.", rating: 5, date: "14 Mei 2026", text: "Makeup waterproof langsung luluh seketika! Sangat lembut dan tidak perih di mata. Wangi kamomilnya sangat menenangkan pikiran." },
      { name: "Sarah V.", rating: 5, date: "10 Mei 2026", text: "Cleansing balm terbaik yang pernah saya coba. Benar-benar meleleh jadi minyak lembut dan saat dibilas tidak meninggalkan residu lengket." },
      { name: "Kania R.", rating: 5, date: "02 Mei 2026", text: "Suka sekali dengan kemasan batu marmernya yang sangat estetis. Kulit terasa lembap sekali setelah dibilas." }
    ]
  }
};

const BUNDLE_TIERS = [
  { id: "starter", quantity: 1, name: "Routine Starter", discount: 0, tag: "Mulai Coba" },
  { id: "complete", quantity: 3, name: "Complete Routine Set", discount: 15, tag: "Paling Populer" },
  { id: "restock", quantity: 6, name: "Restock Bundle", discount: 25, tag: "Hemat Terbesar" }
];

const mapProductFromDB = (prod: DBProductDetail): ProductInfo => {
  const attrs = prod.attributes || {};
  const mappedVariants = Array.isArray(prod.product_variants)
    ? prod.product_variants.map((v: DBVariant) => ({
        name: v.variant_metadata?.shade || v.variant_metadata?.name || "Original",
        hex: v.variant_metadata?.hex || "#FFFFFF",
        imageDesc: v.variant_metadata?.imageDesc || ""
      }))
    : [];

  return {
    id: prod.id,
    name: prod.name,
    category: attrs.category || "Skincare",
    basePrice: Number(prod.base_price),
    image: (prod.images && prod.images[0]) || "/images/aura_essence.png",
    description: prod.description || "",
    ingredients: attrs.ingredients || "",
    howToUse: attrs.howToUse || "",
    variants: mappedVariants.length > 0 ? mappedVariants : [{ name: "Original", hex: "#FFFFFF", imageDesc: "" }],
    reviews: Array.isArray(attrs.reviews) ? attrs.reviews : []
  };
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  
  const slug = (params.slug as string) || "aura-radiant-essence";
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Funnel States
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedBundle, setSelectedBundle] = useState(BUNDLE_TIERS[1]); // Default 3 bottles
  const [isSubscription, setIsSubscription] = useState(false);
  const [frequency, setFrequency] = useState("30 days");
  const [activeTab, setActiveTab] = useState("description"); // 'description' | 'ingredients' | 'howto'

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products?slug=${slug}`, { cache: "no-store" });
        const data = await res.json();
        if (data.success && data.product) {
          const mapped = mapProductFromDB(data.product);
          setProduct(mapped);
          setSelectedVariant(mapped.variants[0] || null);
        } else {
          // Fallback to static registry
          const fallback = PRODUCTS_REGISTRY[slug];
          if (fallback) {
            setProduct(fallback);
            setSelectedVariant(fallback.variants[0] || null);
          } else {
            router.push("/products");
          }
        }
      } catch (err) {
        console.error("Gagal mengambil detail produk:", err);
        const fallback = PRODUCTS_REGISTRY[slug];
        if (fallback) {
          setProduct(fallback);
          setSelectedVariant(fallback.variants[0] || null);
        } else {
          router.push("/products");
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, [slug, router]);

  if (isLoading || !product || !selectedVariant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfcf9]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-neutral-400">Menyingkap formula kecantikan...</p>
        </div>
      </div>
    );
  }

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Compute pricing
  const computePricing = () => {
    const singleBase = product.basePrice;
    const qty = selectedBundle.quantity;
    const unitPrice = isSubscription ? singleBase * 0.9 : singleBase;
    const subtotal = unitPrice * qty;
    const discount = selectedBundle.discount;
    const discountVal = Math.round(subtotal * (discount / 100));
    const finalTotal = subtotal - discountVal;
    const finalUnit = Math.round(finalTotal / qty);

    return {
      subtotal,
      discountVal,
      finalTotal,
      finalUnit
    };
  };

  const pricing = computePricing();

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: `${product.name} - ${selectedVariant.name}`,
      price: product.basePrice,
      image: product.image,
      variantName: selectedVariant.name,
      variantHex: selectedVariant.hex,
      isSubscription: isSubscription,
      subscriptionFrequency: isSubscription ? frequency : undefined
    }, selectedBundle.quantity);
  };

  // Programmatic Schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": `https://nexamart-beta.vercel.app${product.image}`,
    "description": product.description,
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "IDR",
      "lowPrice": product.basePrice * 0.75,
      "highPrice": product.basePrice,
      "offerCount": BUNDLE_TIERS.length
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": 4.8,
      "reviewCount": product.reviews.length
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcf9] py-12 px-6 luxury-pattern">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Main buy funnel section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Column: Image Display */}
          <div className="lg:col-span-6 space-y-6 lg:sticky lg:top-24">
            <div className="relative aspect-square w-full bg-white border border-[#eadecb] rounded-3xl overflow-hidden flex items-center justify-center luxury-border shadow-sm">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
              
              {/* Luxury stamp overlay */}
              <div className="absolute top-6 right-6 w-12 h-12 rounded-full border border-[#eadecb]/50 flex items-center justify-center bg-white/70 backdrop-blur-sm shadow-sm">
                <Award className="w-5 h-5 text-gold" />
              </div>
            </div>

            <div className="flex gap-4 p-5 border border-[#eadecb] rounded-2xl bg-white/60 backdrop-blur-md luxury-border">
              <ShieldCheck className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-sans font-bold text-xs text-neutral-900">Jaminan Keamanan Formula</h5>
                <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                  Semua formula teruji secara klinis, hipoalergenik, bebas alkohol, dan paraben. Kami menjamin keaslian 100% dan efisiensi optimal pada kulit Anda.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Funnel controls */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-3">
              <span className="text-[9px] uppercase tracking-widest font-sans font-bold text-gold px-2.5 py-1 bg-[#f4ead4] rounded-full inline-block">
                Koleksi {product.category}
              </span>
              <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-neutral-950">
                {product.name}
              </h1>
              
              {/* Rating Summary */}
              <div className="flex items-center gap-1.5 text-yellow-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current text-yellow-500" />
                ))}
                <span className="text-xs font-bold text-neutral-800 font-sans ml-1">
                  4.8 (Berdasarkan {product.reviews.length} Ulasan Terverifikasi)
                </span>
              </div>
            </div>

            {/* Dynamic tabs selector */}
            <div className="space-y-4">
              <div className="flex border-b border-[#eadecb]/40 text-xs font-bold uppercase tracking-wider">
                {[
                  { id: "description", label: "Deskripsi" },
                  { id: "ingredients", label: "Bahan Aktif" },
                  { id: "howto", label: "Cara Pakai" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 pr-6 transition-all border-b-2 cursor-pointer ${
                      activeTab === tab.id
                        ? "border-neutral-950 text-neutral-950"
                        : "border-transparent text-neutral-400 hover:text-neutral-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="min-h-24">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-xs text-neutral-400 leading-relaxed font-sans"
                  >
                    {activeTab === "description" && product.description}
                    {activeTab === "ingredients" && (
                      <div className="space-y-2">
                        <p className="font-semibold text-neutral-800">Kandungan Utama:</p>
                        <p className="italic">{product.ingredients}</p>
                      </div>
                    )}
                    {activeTab === "howto" && product.howToUse}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* 1. VARIANT SELECTOR */}
            {product.variants.length > 1 && (
              <div className="space-y-3">
                <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400">
                  Pilih Varian Shade:
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant.name === v.name;
                    return (
                      <button
                        key={v.name}
                        onClick={() => setSelectedVariant(v)}
                        className={`flex items-center gap-2 px-3.5 py-2 border rounded-full text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "border-neutral-950 bg-neutral-950 text-white shadow-sm"
                            : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-neutral-200"
                          style={{ backgroundColor: v.hex }}
                        />
                        {v.name.split(" ")[0]}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. BUNDLING SELECTOR (Goli Funnel) */}
            <div className="space-y-4">
              <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400">
                Pilih Bundling Pembelian:
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {BUNDLE_TIERS.map((bundle) => {
                  const isSelected = selectedBundle.id === bundle.id;
                  
                  const singleBase = product.basePrice;
                  const unitPrice = isSubscription ? singleBase * 0.9 : singleBase;
                  const priceBeforeBundle = unitPrice * bundle.quantity;
                  const finalBundlePrice = priceBeforeBundle - Math.round(priceBeforeBundle * (bundle.discount / 100));
                  const finalUnitCost = Math.round(finalBundlePrice / bundle.quantity);

                  return (
                    <button
                      key={bundle.id}
                      onClick={() => setSelectedBundle(bundle)}
                      className={`relative grid grid-cols-12 items-center p-4 border rounded-2xl text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-neutral-950 bg-[#fdfcf9] ring-1 ring-neutral-950 shadow-sm"
                          : "border-[#eadecb]/80 bg-white hover:border-[#c3a475]"
                      }`}
                    >
                      <div className="col-span-1 flex justify-center">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? "border-neutral-950 bg-neutral-950" : "border-neutral-300"
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                      </div>

                      <div className="col-span-7 pl-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-serif font-bold text-sm text-neutral-955 font-bold">
                            {bundle.quantity} Botol
                          </span>
                          {bundle.discount > 0 && (
                            <span className="bg-red-50 text-red-600 text-[8px] font-bold px-2 py-0.2 rounded-full border border-red-100 uppercase">
                              Hemat {bundle.discount}%
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-400 block mt-0.5">{bundle.name}</span>
                      </div>

                      <div className="col-span-4 text-right">
                        <div className="font-serif font-bold text-sm text-neutral-955 font-bold">
                          {formatRupiah(finalBundlePrice)}
                        </div>
                        <span className="text-[9px] text-neutral-400 block mt-0.5">
                          {formatRupiah(finalUnitCost)}/Unit
                        </span>
                      </div>

                      {bundle.tag && (
                        <span className="absolute -top-2 right-4 px-2 py-0.5 bg-neutral-950 text-white text-[7px] uppercase tracking-widest font-bold rounded-full">
                          {bundle.tag}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. SUBSCRIPTION */}
            <div className="space-y-4">
              <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400">
                Pilihan Keanggotaan:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsSubscription(false)}
                  className={`p-3.5 border rounded-2xl text-center flex flex-col justify-center items-center gap-1 cursor-pointer transition-all ${
                    !isSubscription
                      ? "border-neutral-950 bg-[#f6f3ed]/30 ring-1 ring-neutral-950 font-bold"
                      : "border-[#eadecb] bg-white hover:border-[#c3a475]"
                  }`}
                >
                  <span className="text-xs text-neutral-800">Beli Satu Kali</span>
                  <span className="text-[9px] text-neutral-400">Tanpa Komitmen</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSubscription(true)}
                  className={`p-3.5 border rounded-2xl text-center flex flex-col justify-center items-center gap-1 cursor-pointer relative transition-all ${
                    isSubscription
                      ? "border-neutral-950 bg-[#f6f3ed]/30 ring-1 ring-neutral-950 font-bold"
                      : "border-[#eadecb] bg-white hover:border-[#c3a475]"
                  }`}
                >
                  <span className="text-xs text-neutral-800 flex items-center gap-1">
                    Langganan
                    <span className="bg-green-50 text-green-700 text-[8px] font-bold px-1.5 py-0.2 rounded-full border border-green-100">
                      -10%
                    </span>
                  </span>
                  <span className="text-[9px] text-neutral-400 font-sans">Kirim Berkala</span>
                </button>
              </div>

              {isSubscription && (
                <div className="space-y-1.5">
                  <label className="block text-[9px] text-neutral-400 font-sans font-bold uppercase">
                    Interval Pengiriman:
                  </label>
                  <div className="relative">
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="w-full text-xs px-4 py-2.5 bg-white border border-[#eadecb] rounded-xl appearance-none cursor-pointer"
                    >
                      <option value="30 days">30 Hari (Rekomendasi Pemakaian Skincare)</option>
                      <option value="60 days">60 Hari (Hemat & Praktis)</option>
                      <option value="90 days">90 Hari (Perawatan Rutin Ringan)</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-3 w-4 h-4 text-neutral-400 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            {/* 4. PRICING TOTAL & CTA */}
            <div className="space-y-4 pt-4 border-t border-[#eadecb]/40">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-neutral-400">Total Pembelian</span>
                <div className="text-right">
                  <span className="text-2xl font-bold font-serif text-neutral-955 block font-bold">
                    {formatRupiah(pricing.finalTotal)}
                  </span>
                  {pricing.discountVal > 0 && (
                    <span className="text-[10px] text-red-600 font-bold">
                      Diskon: -{formatRupiah(pricing.discountVal)}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full py-4 bg-neutral-950 text-white font-bold uppercase text-xs tracking-widest hover:bg-neutral-900 active:scale-98 transition-all duration-300 rounded-full shadow-lg cursor-pointer"
              >
                Tambahkan ke Keranjang
              </button>
            </div>

          </div>

        </div>

        {/* CUSTOMER REVIEWS SECTION */}
        <div className="border-t border-[#eadecb]/40 pt-16 space-y-8">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <h3 className="font-serif text-2xl font-light text-neutral-950">Ulasan Pengelana Indah</h3>
              <p className="text-[10px] text-neutral-400">Ulasan jujur dari pelanggan terverifikasi kami.</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end text-yellow-500 font-bold">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-sans text-neutral-800 font-bold">4.8 / 5.0</span>
              </div>
              <span className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold font-sans">Total {product.reviews.length} Ulasan</span>
            </div>
          </div>

          <div className="grid gap-6">
            {product.reviews.map((rev, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#eadecb]/80 p-6 rounded-3xl space-y-4 shadow-sm luxury-border"
              >
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-serif font-bold text-neutral-950">{rev.name}</h4>
                    <span className="text-[9px] text-neutral-400 mt-0.5 block">{rev.date}</span>
                  </div>
                  <div className="flex gap-0.5 text-yellow-500">
                    {Array.from({ length: rev.rating }).map((_, rIdx) => (
                      <Star key={rIdx} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed font-sans italic">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
