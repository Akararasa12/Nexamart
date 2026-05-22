"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkle, ShieldCheck, Check, ArrowRight, Star, ChevronDown, ChevronLeft, ChevronRight, Quote, Building2, Users, Award, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
interface FlagshipVariant {
  name: string;
  hex: string;
  imageDesc: string;
}

interface FlagshipBundle {
  id: string;
  quantity: number;
  name: string;
  discount: number;
  tag: string;
}

interface FlagshipProductType {
  id: string;
  slug: string;
  name: string;
  basePrice: number;
  description: string;
  variants: FlagshipVariant[];
  bundles: FlagshipBundle[];
}

interface DBVariant {
  variant_metadata?: {
    shade?: string;
    name?: string;
    hex?: string;
    imageDesc?: string;
  } | null;
}

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
  product_variants?: DBVariant[];
}

interface MappedProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  desc: string;
  image: string;
  tag: string;
  rating: number;
  reviews: number;
}

// Flagship product data
const FLAGSHIP_PRODUCT = {
  id: "nexa-aura-essence",
  slug: "aura-radiant-essence",
  name: "Aura Radiant Essence",
  basePrice: 299000,
  description: "Esens pencerah wajah premium terbuat dari Niacinamide 5%, Licorice Root, dan fermentasi Galactomyces. Formula harian untuk menyembuhkan skin barrier, memudarkan noda hitam, dan mewujudkan kemilau alami kulit Anda.",
  variants: [
    { name: "Aura Glow (Original)", hex: "#FDFCFA", imageDesc: "Cairan bening murni berpendar lembut" },
    { name: "Rose Pearl (Pink Shimmer)", hex: "#F4DCD6", imageDesc: "Cairan merah muda berbutir mutiara berkilau" },
    { name: "Golden Elixir (Bronze Warmth)", hex: "#E8D1B3", imageDesc: "Formula madu keemasan yang menutrisi hangat" }
  ],
  bundles: [
    { id: "starter", quantity: 1, name: "Routine Starter", discount: 0, tag: "Coba Sekarang" },
    { id: "complete", quantity: 3, name: "Complete Routine Set", discount: 15, tag: "Paling Populer" },
    { id: "restock", quantity: 6, name: "Restock Bundle", discount: 25, tag: "Hemat Terbesar" }
  ]
};

// All products for carousel
const ALL_PRODUCTS = [
  {
    id: "nexa-aura-essence",
    slug: "aura-radiant-essence",
    name: "Aura Radiant Essence",
    price: 299000,
    desc: "Esens pencerah Niacinamide 5% & Galactomyces.",
    image: "/images/aura_essence.png",
    tag: "Best Seller",
    rating: 4.9,
    reviews: 4892
  },
  {
    id: "nexa-celestial-serum",
    slug: "celestial-youth-elixir",
    name: "Celestial Youth Elixir",
    price: 349000,
    desc: "Serum Retinol 0.2% & Peptida pencegah kerutan.",
    image: "/images/celestial_serum.png",
    tag: "Baru",
    rating: 4.8,
    reviews: 2134
  },
  {
    id: "nexa-elysian-balm",
    slug: "elysian-cleansing-balm",
    name: "Elysian Cleansing Balm",
    price: 199000,
    desc: "Balsem peleleh makeup dengan Almond Oil & Kamomil.",
    image: "/images/elysian_balm.png",
    tag: "Populer",
    rating: 4.7,
    reviews: 3201
  }
];


// Customer reviews data
const CUSTOMER_REVIEWS = [
  {
    name: "Dina Maharani",
    location: "Jakarta",
    avatar: "DM",
    rating: 5,
    text: "Setelah 2 minggu pemakaian, noda hitam di wajah saya benar-benar memudar. Kulit jadi lebih glowing secara natural!",
    product: "Aura Radiant Essence",
    date: "2 hari lalu"
  },
  {
    name: "Rani Safitri",
    location: "Bandung",
    avatar: "RS",
    rating: 5,
    text: "Produk ini luar biasa! Teksturnya ringan, cepat menyerap, dan tidak lengket sama sekali. Cocok untuk kulit berminyak saya.",
    product: "Aura Radiant Essence",
    date: "5 hari lalu"
  },
  {
    name: "Ayu Lestari",
    location: "Surabaya",
    avatar: "AL",
    rating: 4,
    text: "Cleansing balm terbaik yang pernah saya coba. Makeup waterproof sekalipun langsung terangkat tanpa bikin kulit kering.",
    product: "Elysian Cleansing Balm",
    date: "1 minggu lalu"
  },
  {
    name: "Fira Dwi Ananda",
    location: "Yogyakarta",
    avatar: "FA",
    rating: 5,
    text: "Saya pakai serum retinol ini setiap malam. Garis halus di sekitar mata saya berkurang drastis dalam sebulan. Highly recommend!",
    product: "Celestial Youth Elixir",
    date: "3 hari lalu"
  },
  {
    name: "Maya Putri",
    location: "Semarang",
    avatar: "MP",
    rating: 5,
    text: "Sudah repurchase 3x! Kulit saya jadi lebih cerah dan merata. Packaging-nya juga premium banget, cocok buat hadiah.",
    product: "Aura Radiant Essence",
    date: "1 minggu lalu"
  },
  {
    name: "Siti Nurhaliza",
    location: "Medan",
    avatar: "SN",
    rating: 5,
    text: "Baru pertama kali coba dan langsung jatuh cinta! Aroma herbal-nya segar, bikin rileks saat skincare routine malam.",
    product: "Celestial Youth Elixir",
    date: "4 hari lalu"
  }
];

// FAQs Data
const FAQS = [
  {
    q: "Bagaimana cara menggunakan Aura Radiant Essence?",
    a: "Setelah membersihkan wajah, tuangkan 3-5 tetes esens ke telapak tangan Anda. Tepuk-tepuk lembut ke seluruh area wajah dan leher secara merata hingga terserap sepenuhnya sebelum menggunakan serum atau pelembap."
  },
  {
    q: "Apakah produk NEXAMART aman untuk kulit sensitif?",
    a: "Ya, seluruh produk kami diformulasikan secara hipoalergenik, bebas alkohol, paraben, dan pewangi buatan sehingga sangat aman untuk kulit sensitif sekalipun."
  },
  {
    q: "Kapan pengiriman saya akan dikirim?",
    a: "Semua pesanan diproses dan dikirim dari gudang utama kami di Bandung menggunakan kurir pilihan Anda (JNE, POS, TIKI) dalam waktu 24 jam kerja."
  },
  {
    q: "Bagaimana cara kerja program langganan (Subscribe & Save)?",
    a: "Dengan berlangganan, Anda menghemat 10% untuk setiap botol. Produk akan dikirim otomatis ke alamat Anda setiap 30, 60, atau 90 hari. Anda dapat menjeda atau membatalkan kapan saja tanpa biaya tambahan."
  }
];

// Auto-scrolling product carousel component
function ProductCarousel({ products, title, addToCart }: { 
  products: MappedProduct[]; 
  title: string;
  addToCart: (item: { id: string; name: string; price: number; image: string; isSubscription: boolean }, qty: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const formatRupiah = (val: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const interval = setInterval(() => {
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 320, behavior: "smooth" });
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-5">
      <div className="text-center space-y-3">
        <h4 className="font-serif text-xl font-bold text-neutral-950 tracking-tight">{title}</h4>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => scroll("left")} disabled={!canScrollLeft} className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:border-neutral-400 hover:text-neutral-800 disabled:opacity-30 transition-all cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => scroll("right")} disabled={!canScrollRight} className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:border-neutral-400 hover:text-neutral-800 disabled:opacity-30 transition-all cursor-pointer">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div ref={scrollRef} onScroll={checkScroll} className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {[...products, ...products].map((p, i) => (
          <div key={`${p.id}-${i}`} className="flex-shrink-0 w-[280px] snap-start bg-white border border-[#eadecb]/80 rounded-2xl overflow-hidden group hover:shadow-lg transition-all duration-300">
            <Link href={`/products/${p.slug}`} className="relative block h-[220px] bg-[#f8f6f2] overflow-hidden">
              <Image src={p.image} alt={p.name} fill sizes="280px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
              {p.tag && (
                <span className={`absolute top-3 left-3 text-[8px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  p.tag === "Baru" ? "bg-emerald-500 text-white" :
                  p.tag === "Best Seller" ? "bg-amber-500 text-white" :
                  "bg-neutral-900 text-white"
                }`}>
                  {p.tag}
                </span>
              )}
            </Link>
            <div className="p-4 space-y-2.5">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star key={si} className={`w-3 h-3 ${si < Math.floor(p.rating) ? "fill-amber-400 text-amber-400" : "text-neutral-200"}`} />
                ))}
                <span className="text-[9px] text-neutral-400 ml-1">({p.reviews.toLocaleString()})</span>
              </div>
              <Link href={`/products/${p.slug}`}>
                <h5 className="font-serif font-bold text-sm text-neutral-900 hover:text-amber-700 transition-colors leading-tight">{p.name}</h5>
              </Link>
              <p className="text-[10px] text-neutral-400 leading-relaxed line-clamp-2">{p.desc}</p>
              <div className="flex items-center justify-between pt-1">
                <span className="font-serif font-bold text-base text-neutral-950">{formatRupiah(p.price)}</span>
                <button
                  onClick={() => addToCart({ id: p.id, name: p.name, price: p.price, image: p.image, isSubscription: false }, 1)}
                  className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-[9px] font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer"
                >
                  + Keranjang
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const mapHomepageProduct = (prod: DBProduct): MappedProduct => {
  const attrs = prod.attributes || {};
  const tagsList = Array.isArray(attrs.tags) ? attrs.tags : [];
  let displayTag = "";
  if (tagsList.includes("Baru") || tagsList.includes("New")) {
    displayTag = "Baru";
  } else if (tagsList.includes("Best Seller")) {
    displayTag = "Best Seller";
  } else if (tagsList.includes("Populer") || tagsList.includes("Popular")) {
    displayTag = "Populer";
  } else if (tagsList.length > 0) {
    displayTag = tagsList[0];
  }

  return {
    id: prod.id,
    slug: prod.slug,
    name: prod.name,
    price: Number(prod.base_price),
    desc: prod.description ? (prod.description.length > 60 ? prod.description.substring(0, 57) + "..." : prod.description) : "",
    image: (prod.images && prod.images[0]) || "/images/aura_essence.png",
    tag: displayTag,
    rating: typeof attrs.rating === "number" ? attrs.rating : 4.8,
    reviews: typeof attrs.reviewsCount === "number" ? attrs.reviewsCount : 100
  };
};

const mapFlagshipProduct = (prod: DBProduct): FlagshipProductType => {
  const mappedVariants = Array.isArray(prod.product_variants)
    ? prod.product_variants.map((v: DBVariant) => ({
        name: v.variant_metadata?.shade || v.variant_metadata?.name || "Original",
        hex: v.variant_metadata?.hex || "#FFFFFF",
        imageDesc: v.variant_metadata?.imageDesc || ""
      }))
    : [];

  return {
    id: prod.id,
    slug: prod.slug,
    name: prod.name,
    basePrice: Number(prod.base_price),
    description: prod.description || "",
    variants: mappedVariants.length > 0 ? mappedVariants : [{ name: "Original", hex: "#FFFFFF", imageDesc: "" }],
    bundles: [
      { id: "starter", quantity: 1, name: "Routine Starter", discount: 0, tag: "Coba Sekarang" },
      { id: "complete", quantity: 3, name: "Complete Routine Set", discount: 15, tag: "Paling Populer" },
      { id: "restock", quantity: 6, name: "Restock Bundle", discount: 25, tag: "Hemat Terbesar" }
    ]
  };
};

export default function Storefront() {
  const { addToCart } = useCart();
  
  const [productsList, setProductsList] = useState<MappedProduct[]>(ALL_PRODUCTS);
  const [flagshipProduct, setFlagshipProduct] = useState<FlagshipProductType>(FLAGSHIP_PRODUCT);
  
  // Flagship Selector State
  const [selectedVariant, setSelectedVariant] = useState<FlagshipVariant>(FLAGSHIP_PRODUCT.variants[0]);
  const [selectedBundle, setSelectedBundle] = useState<FlagshipBundle>(FLAGSHIP_PRODUCT.bundles[1]);
  const [isSubscription, setIsSubscription] = useState(false);
  const [frequency, setFrequency] = useState("30 days");

  // Dynamic filter products
  const productsTerbaru = useMemo(() => {
    return productsList.filter(p => ["Baru", "Best Seller"].includes(p.tag || ""));
  }, [productsList]);

  const productsTerpopuler = useMemo(() => {
    return productsList.filter(p => ["Populer", "Best Seller"].includes(p.tag || ""));
  }, [productsList]);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Review pagination
  const [reviewPage, setReviewPage] = useState(0);
  const reviewsPerPage = 3;
  const totalReviewPages = Math.ceil(CUSTOMER_REVIEWS.length / reviewsPerPage);
  const visibleReviews = CUSTOMER_REVIEWS.slice(reviewPage * reviewsPerPage, (reviewPage + 1) * reviewsPerPage);

  // Auto-rotate reviews
  useEffect(() => {
    const interval = setInterval(() => {
      setReviewPage((prev) => (prev + 1) % totalReviewPages);
    }, 6000);
    return () => clearInterval(interval);
  }, [totalReviewPages]);

  // Form State
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactEmail, setContactEmail] = useState("");

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  useEffect(() => {
    // Silent fetch to seed data if it doesn't exist
    fetch("/api/rag/embed").catch((err) => console.log("Seeder status:", err));

    async function loadDynamicStorefront() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          // Map products
          const mappedProducts = data.products.map(mapHomepageProduct);
          setProductsList(mappedProducts);
          
          // Find flagship
          const dbFlagship = data.products.find((p: DBProduct) => p.slug === "aura-radiant-essence");
          if (dbFlagship) {
            const mappedFlagship = mapFlagshipProduct(dbFlagship);
            setFlagshipProduct(mappedFlagship);
            setSelectedVariant(mappedFlagship.variants[0]);
            setSelectedBundle(mappedFlagship.bundles[1]);
          }
        }
      } catch (err) {
        console.error("Gagal memuat data beranda dinamis:", err);
      }
    }
    loadDynamicStorefront();
  }, []);

  // Compute Flagship pricing display
  const computeFlagshipPricing = () => {
    const singleBase = flagshipProduct.basePrice;
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

  const pricing = computeFlagshipPricing();

  const handleAddFlagshipToCart = () => {
    addToCart({
      id: flagshipProduct.id,
      name: `${flagshipProduct.name} - ${selectedVariant.name}`,
      price: flagshipProduct.basePrice,
      image: "/images/aura_essence.png",
      variantName: selectedVariant.name,
      variantHex: selectedVariant.hex,
      isSubscription: isSubscription,
      subscriptionFrequency: isSubscription ? frequency : undefined
    }, selectedBundle.quantity);
  };

  return (
    <div className="bg-[#fdfcf9] min-h-screen text-neutral-900 selection:bg-neutral-950 selection:text-white">
      
      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero_bg.png"
            alt="Hero background"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
          {/* Warm accent overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-900/20 via-transparent to-amber-800/10" />
        </div>

        <div className="max-w-3xl space-y-6 z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-1.5"
          >
            <Sparkle className="w-4 h-4 fill-amber-400/30 text-amber-400" />
            <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-bold text-amber-300/90">Premium Skincare Indonesia</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-serif text-5xl md:text-7xl font-light tracking-tight text-white leading-[1.1]"
          >
            Kemilau Abadi <br className="hidden md:block"/>
            <span className="italic font-normal font-serif luxury-text-gradient" style={{ background: 'linear-gradient(135deg, #ffffff 30%, #c3a475 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Kecantikan Klasik</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-sans text-xs md:text-sm text-white/70 max-w-xl mx-auto leading-relaxed"
          >
            Skincare premium dengan formula modern dan bahan alami terpilih. 
            Dirancang khusus untuk memberikan hasil nyata pada kulit Anda — cerah, sehat, dan bercahaya.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6"
          >
            <a
              href="#flagship"
              className="px-8 py-3.5 bg-white text-neutral-950 hover:bg-amber-50 text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 shadow-lg group"
            >
              Belanja Sekarang
              <ArrowRight className="inline-block w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
            <Link
              href="/products"
              className="px-8 py-3.5 bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300"
            >
              Lihat Semua Produk
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6 pt-8"
          >
            {["BPOM Certified", "100% Halal", "Cruelty Free", "Natural Ingredients"].map((badge) => (
              <span key={badge} className="text-[9px] uppercase tracking-wider font-bold text-white/50 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400/60" />
                {badge}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 flex flex-col items-center gap-1 z-10">
          <span className="text-[8px] uppercase tracking-widest font-bold text-white/40">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ─── PRODUCT CAROUSELS: TERBARU & TERPOPULER ─── */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="py-20 border-t border-[#eadecb]/40 bg-gradient-to-b from-[#fdfcf9] to-white"
      >
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-2">
            <h3 className="font-serif text-3xl font-light text-neutral-950 tracking-tight">
              Koleksi Produk Kami
            </h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Temukan rangkaian skincare premium yang dirancang untuk kebutuhan kulit Anda.
            </p>
          </div>

          <ProductCarousel products={productsTerbaru} title="Produk Terbaru" addToCart={addToCart} />
          <ProductCarousel products={productsTerpopuler} title="Paling Populer" addToCart={addToCart} />
        </div>
      </motion.section>

      {/* ─── FLAGSHIP PRODUCT SHOWCASE ─── */}
      <section id="flagship" className="py-24 px-6 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start border-t border-[#eadecb]/40">
        
        {/* Left Side: Product Image */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:col-span-6 space-y-6 lg:sticky lg:top-24"
        >
          <div className="relative aspect-square w-full bg-white border border-[#eadecb] rounded-3xl overflow-hidden flex items-center justify-center shadow-sm">
            <Image
              src="/images/aura_essence.png"
              alt="Aura Radiant Essence Product Shot"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            
            {/* Color Overlay Tint reflecting selected Variant */}
            <div 
              className="absolute inset-0 mix-blend-color pointer-events-none opacity-20 transition-all duration-500"
              style={{ backgroundColor: selectedVariant.hex }}
            />

            {/* Float Badge */}
            <div className="absolute bottom-6 left-6 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#eadecb]/80 text-[10px] text-neutral-800 font-serif italic shadow-sm">
              Shade Terpilih: {selectedVariant.name}
            </div>
          </div>

          <div className="flex gap-4 p-5 border border-[#eadecb] rounded-2xl bg-white/60 backdrop-blur-md shadow-sm">
            <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-sans font-bold text-xs text-neutral-900">Garansi Kepuasan 30 Hari</h5>
              <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                Kembalikan wadah kosong Anda dalam 30 hari jika produk kami tidak memberikan hasil yang memuaskan. Kami ganti 100% uang Anda tanpa pertanyaan.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Purchasing Funnel */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
          className="lg:col-span-6 bg-white/50 backdrop-blur-md border border-[#eadecb] p-8 rounded-3xl space-y-8 shadow-sm"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-1 text-yellow-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current text-yellow-500" />
              ))}
              <span className="text-[10px] font-bold text-neutral-800 font-sans ml-1">4.9/5.0 (4,892 Ulasan Terverifikasi)</span>
            </div>
            
            <Link href={`/products/${flagshipProduct.slug}`} className="group block">
              <h3 className="font-serif text-3xl font-bold tracking-tight text-neutral-950 group-hover:text-amber-700 transition-colors">
                {flagshipProduct.name}
              </h3>
            </Link>
            
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">
              {flagshipProduct.description}
            </p>
          </div>

          {/* 1. VARIANT SELECTOR */}
          <div className="space-y-3">
            <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400">
              Pilih Shade & Formula Varian:
            </label>
            <div className="flex flex-wrap gap-2.5">
              {flagshipProduct.variants.map((v: FlagshipVariant) => {
                const isSelected = selectedVariant.name === v.name;
                return (
                  <button
                    key={v.name}
                    onClick={() => setSelectedVariant(v)}
                    className={`flex items-center gap-2 px-3.5 py-2 border rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
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

          {/* 2. BUNDLING SELECTOR */}
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400">
                Pilih Paket Bundling:
              </label>
              <span className="text-[9px] text-neutral-400 font-sans font-bold uppercase tracking-wider">Tiered Discounts</span>
            </div>
            
            <div className="grid grid-cols-1 gap-2.5">
              {flagshipProduct.bundles.map((bundle: FlagshipBundle) => {
                const isSelected = selectedBundle.id === bundle.id;
                
                const unitPrice = isSubscription ? flagshipProduct.basePrice * 0.9 : flagshipProduct.basePrice;
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
                        : "border-neutral-200 bg-white hover:border-neutral-300"
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
                        <span className="font-serif font-bold text-sm text-neutral-900">
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
                      <div className="font-serif font-bold text-sm text-neutral-900">
                        {formatRupiah(finalBundlePrice)}
                      </div>
                      <span className="text-[9px] text-neutral-400 block mt-0.5">
                        {formatRupiah(finalUnitCost)}/botol
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
              Opsi Pembelian:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsSubscription(false)}
                className={`p-3.5 border rounded-2xl text-center flex flex-col justify-center items-center gap-1 cursor-pointer transition-all ${
                  !isSubscription
                    ? "border-neutral-950 bg-[#fdfcf9] ring-1 ring-neutral-950 font-bold"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                <span className="text-xs text-neutral-800">Sekali Beli</span>
                <span className="text-[9px] text-neutral-400 font-sans">Harga Standar</span>
              </button>

              <button
                onClick={() => setIsSubscription(true)}
                className={`p-3.5 border rounded-2xl text-center flex flex-col justify-center items-center gap-1 cursor-pointer relative transition-all ${
                  isSubscription
                    ? "border-neutral-950 bg-[#fdfcf9] ring-1 ring-neutral-950 font-bold"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                <span className="text-xs text-neutral-800 flex items-center gap-1">
                  Langganan
                  <span className="bg-green-50 text-green-700 text-[8px] font-bold px-1.5 py-0.2 rounded-full border border-green-100">
                    Hemat 10%
                  </span>
                </span>
                <span className="text-[9px] text-neutral-400 font-sans">Pengiriman Otomatis</span>
              </button>
            </div>

            {isSubscription && (
              <div className="space-y-1.5">
                <label className="block text-[9px] text-neutral-400 font-sans font-bold uppercase">
                  Kirim Otomatis Setiap:
                </label>
                <div className="relative">
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full text-xs px-4 py-2.5 bg-white border border-neutral-200 rounded-xl appearance-none cursor-pointer text-neutral-800"
                  >
                    <option value="30 days">30 Hari (Penggunaan Rutin Maksimal)</option>
                    <option value="60 days">60 Hari (Perawatan Sedang)</option>
                    <option value="90 days">90 Hari (Perawatan Santai)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-3 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          {/* 4. TOTAL & ADD */}
          <div className="space-y-4 pt-4 border-t border-neutral-100">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-neutral-400 font-medium">Total Pembelian</span>
              <div className="text-right">
                <span className="text-2xl font-bold font-serif text-neutral-955 block">
                  {formatRupiah(pricing.finalTotal)}
                </span>
                {pricing.discountVal > 0 && (
                  <span className="text-[10px] text-red-650 font-bold text-red-600">
                    Hemat {formatRupiah(pricing.discountVal)}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleAddFlagshipToCart}
              className="w-full py-4 bg-neutral-950 text-white font-bold uppercase text-xs tracking-widest hover:bg-neutral-900 active:scale-98 transition-all duration-300 rounded-full shadow-lg cursor-pointer"
            >
              Masukkan ke Keranjang
            </button>
          </div>
        </motion.div>
      </section>

      {/* ─── CUSTOMER REVIEWS ─── */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="py-20 border-t border-[#eadecb]/40 bg-gradient-to-b from-white to-[#faf8f4]"
      >
        <div className="max-w-5xl mx-auto px-6 space-y-10">
          <div className="text-center space-y-2">
            <h3 className="font-serif text-3xl font-light text-neutral-950 tracking-tight">
              Apa Kata Pelanggan Kami
            </h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Ribuan pelanggan telah merasakan manfaat nyata dari produk NEXAMART.
            </p>
            <div className="flex items-center justify-center gap-1 pt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-sm font-bold text-neutral-800 ml-2">4.9/5.0</span>
              <span className="text-xs text-neutral-400 ml-1">dari 10.000+ ulasan</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {visibleReviews.map((review, index) => (
              <motion.div
                key={`${review.name}-${reviewPage}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white border border-[#eadecb]/80 rounded-2xl p-6 space-y-4 hover:shadow-md transition-shadow duration-300 relative"
              >
                <Quote className="absolute top-4 right-4 w-8 h-8 text-amber-100" />
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-neutral-200"}`} />
                  ))}
                </div>
                
                <p className="text-xs text-neutral-600 leading-relaxed italic relative z-10">
                  &ldquo;{review.text}&rdquo;
                </p>
                
                <div className="flex items-center gap-3 pt-2 border-t border-neutral-100">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {review.avatar}
                  </div>
                  <div>
                    <h6 className="text-xs font-bold text-neutral-900">{review.name}</h6>
                    <p className="text-[9px] text-neutral-400">{review.location} · {review.date}</p>
                  </div>
                </div>
                
                <span className="inline-block text-[8px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {review.product}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Review pagination dots */}
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: totalReviewPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setReviewPage(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  i === reviewPage ? "bg-amber-500 w-6" : "bg-neutral-200 hover:bg-neutral-300"
                }`}
              />
            ))}
          </div>
        </div>
      </motion.section>

      {/* ─── BUSINESS PROFILE ─── */}
      <section className="py-20 border-t border-[#eadecb]/40">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: About text */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-600">Tentang Kami</span>
                <h3 className="font-serif text-3xl font-light text-neutral-950 tracking-tight leading-snug">
                  NEXAMART — <br />Skincare Premium Indonesia
                </h3>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                NEXAMART adalah brand skincare Direct-to-Consumer (D2C) yang lahir dari komitmen menghadirkan produk perawatan kulit berkualitas tinggi dengan harga terjangkau. 
                Kami percaya bahwa setiap orang berhak mendapatkan kulit sehat dan bercahaya tanpa harus membayar mahal.
              </p>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Seluruh produk kami dikembangkan bersama dermatologis berpengalaman, menggunakan bahan aktif terstandar internasional, 
                dan diproduksi di fasilitas bersertifikat BPOM & Halal MUI.
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-start gap-3 p-4 bg-white border border-[#eadecb]/60 rounded-xl">
                  <Building2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h6 className="text-xs font-bold text-neutral-900">Berdiri 2024</h6>
                    <p className="text-[9px] text-neutral-400 mt-0.5">Bandung, Indonesia</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white border border-[#eadecb]/60 rounded-xl">
                  <Users className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h6 className="text-xs font-bold text-neutral-900">50.000+</h6>
                    <p className="text-[9px] text-neutral-400 mt-0.5">Pelanggan Aktif</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white border border-[#eadecb]/60 rounded-xl">
                  <Award className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h6 className="text-xs font-bold text-neutral-900">BPOM & Halal</h6>
                    <p className="text-[9px] text-neutral-400 mt-0.5">Tersertifikasi Resmi</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white border border-[#eadecb]/60 rounded-xl">
                  <Globe className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h6 className="text-xs font-bold text-neutral-900">5 Negara</h6>
                    <p className="text-[9px] text-neutral-400 mt-0.5">Jangkauan Pengiriman</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Visual card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-[#f5f0e6] to-[#ede5d8] rounded-3xl p-10 overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-amber-200/30 to-transparent rounded-bl-full" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-amber-100/40 to-transparent rounded-tr-full" />
                
                <div className="relative z-10 text-center space-y-6">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-white shadow-md flex items-center justify-center">
                    <span className="font-serif text-2xl font-bold text-neutral-900 tracking-tight">N</span>
                  </div>
                  <div>
                    <h4 className="font-serif text-xl font-bold text-neutral-900">NEXAMART</h4>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">Premium Skincare</p>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-[9px] text-neutral-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.9 Rating
                    </span>
                    <span>•</span>
                    <span>10K+ Ulasan</span>
                    <span>•</span>
                    <span>50K+ Terjual</span>
                  </div>
                  <Link 
                    href="/contact" 
                    className="inline-block px-6 py-2.5 bg-neutral-950 text-white text-[9px] font-bold uppercase tracking-widest rounded-full hover:bg-neutral-800 transition-all"
                  >
                    Hubungi Kami
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="py-24 max-w-3xl mx-auto px-6 space-y-10 border-t border-[#eadecb]/40"
      >
        <div className="text-center space-y-2">
          <h3 className="font-serif text-3xl font-light text-neutral-950">Pertanyaan Umum (FAQ)</h3>
          <p className="text-xs text-neutral-400">Hal-hal yang sering ditanyakan pelanggan mengenai produk dan layanan kami.</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="border border-[#eadecb] rounded-2xl overflow-hidden bg-white/70 backdrop-blur-sm shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center bg-transparent transition-colors cursor-pointer"
                >
                  <span className="font-serif text-sm font-semibold text-neutral-900">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 text-xs text-neutral-400 leading-relaxed font-sans border-t border-[#eadecb]/30 pt-2 bg-neutral-50/5">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* ─── CONTACT SECTION ─── */}
      <section id="contact" className="py-20 border-t border-[#eadecb]/40">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-md mx-auto px-6 text-center space-y-8 bg-white/40 border border-[#eadecb] p-8 rounded-3xl"
        >
          <div className="space-y-2">
            <h3 className="font-serif text-3xl font-light text-neutral-950">Hubungi Kami</h3>
            <p className="text-xs text-neutral-400">Ada pertanyaan? Tim customer service kami siap membantu Anda.</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setContactSuccess(true);
            }}
            className="space-y-4 text-left"
          >
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-sans font-bold tracking-wider text-neutral-400">Surel (Email)</label>
              <input
                required
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full text-xs px-4 py-3 rounded-xl"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-sans font-bold tracking-wider text-neutral-400">Pesan</label>
              <textarea
                required
                rows={4}
                placeholder="Tuliskan pertanyaan Anda..."
                className="w-full text-xs px-4 py-3 rounded-xl resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-neutral-950 hover:bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all cursor-pointer shadow-md"
            >
              Kirim Pesan
            </button>
          </form>

          <AnimatePresence>
            {contactSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 bg-green-50 border border-green-100 text-green-800 rounded-2xl text-xs font-medium"
              >
                Pesan terkirim dengan sukses. Kami akan membalas pesan Anda ke <span className="font-bold">{contactEmail}</span> dalam kurun waktu 1x24 jam kerja.
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Footer copyright */}
      <footer className="py-12 border-t border-[#eadecb]/40 text-center text-[10px] text-neutral-400 font-sans tracking-widest uppercase">
        © {new Date().getFullYear()} NEXAMART. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
}
