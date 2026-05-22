/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://auqyahcowjkjkbbwrmug.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1cXlhaGNvd2pramtiYndybXVnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI5MTk1NywiZXhwIjoyMDk0ODY3OTU3fQ.DftgOaH4WgB8prKgPSUMqdQVWl70jIzLD8ZS8WUKBXc';

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

const SEED_PRODUCTS = [
  {
    name: "Aura Radiant Essence",
    slug: "aura-radiant-essence",
    base_price: 299000,
    description: "Esens pencerah wajah premium terbuat dari Niacinamide 5%, Licorice Root, dan fermentasi Galactomyces. Perawatan harian mewah untuk menyembuhkan skin barrier, memudarkan noda hitam, dan mewujudkan kemilau abadi.",
    images: ["/images/aura_essence.png"],
    attributes: {
      category: "Skincare",
      tags: ["Skincare", "Organik", "Best Seller"],
      rating: 4.9,
      reviewsCount: 4892,
      ingredients: "Galactomyces Ferment Filtrate, Niacinamide 5%, Glycyrrhiza Glabra (Licorice) Root Extract, Sodium Hyaluronate, Centella Asiatica Extract, Allantoin, Panthenol.",
      howToUse: "Setelah membersihkan wajah, tuangkan 3-5 tetes esens ke telapak tangan Anda. Tepuk-tepuk lembut ke seluruh area wajah dan leher secara merata hingga terserap sepenuhnya sebelum menggunakan serum atau pelembap.",
      reviews: [
        { name: "Rania S.", rating: 5, date: "15 Mei 2026", text: "Esens ini luar biasa mewah! Teksturnya ringan sekali dan langsung meresap. Setelah pemakaian 2 minggu, kulit saya terasa jauh lebih cerah dan glowing seperti putri bangsawan." },
        { name: "Farah D.", rating: 5, date: "08 Mei 2026", text: "Sangat suka dengan shade Rose Pearl, memberikan efek shimmer kemerahan yang sehat di pagi hari. Menghidrasi sepanjang hari tanpa membuat berminyak." },
        { name: "Amira K.", rating: 4, date: "28 April 2026", text: "Produk yang bagus sekali. Kulit sensitif saya tidak bereaksi buruk sama sekali. Nilai plus karena wanginya sangat alami dan mewah." }
      ]
    },
    variants: [
      { sku: "NEXA-AURA-GLOW", price: 299000, stock: 120, variant_metadata: { shade: "Aura Glow (Original)", hex: "#FDFCFA", imageDesc: "Cairan bening murni berpendar lembut" } },
      { sku: "NEXA-ROSE-PEARL", price: 299000, stock: 85, variant_metadata: { shade: "Rose Pearl (Pink Shimmer)", hex: "#F4DCD6", imageDesc: "Cairan merah muda berbutir mutiara berkilau" } },
      { sku: "NEXA-GOLD-ELIXIR", price: 299000, stock: 60, variant_metadata: { shade: "Golden Elixir (Bronze Warmth)", hex: "#E8D1B3", imageDesc: "Formula madu keemasan yang menutrisi hangat" } }
    ]
  },
  {
    name: "Celestial Youth Elixir",
    slug: "celestial-youth-elixir",
    base_price: 349000,
    description: "Serum pencegah kerutan malam hari yang menstimulasi kolagen dengan kekuatan Retinol 0.2% dan Peptida aktif. Bekerja aktif saat Anda tertidur untuk memulihkan tekstur kulit dan menyamarkan garis halus.",
    images: ["/images/celestial_serum.png"],
    attributes: {
      category: "Skincare",
      tags: ["Skincare", "Anti-Aging", "Malam"],
      rating: 4.8,
      reviewsCount: 1248,
      ingredients: "Aqua, Retinol 0.2%, Copper Tripeptide-1, Acetyl Hexapeptide-8, Squalane, Ceramide NP, Panthenol, Glycerin, Sodium Hyaluronate.",
      howToUse: "Gunakan hanya pada malam hari. Setelah esens terserap, aplikasikan 2-3 pompa serum ke wajah. Gunakan tabir surya di pagi hari berikutnya untuk perlindungan maksimal.",
      reviews: [
        { name: "Tari W.", rating: 5, date: "16 Mei 2026", text: "Kombinasi Retinol dan Peptida di serum ini sangat bersahabat di kulit pemula seperti saya. Tidak ada purging, kerutan halus di dahi mulai samar." },
        { name: "Nadia L.", rating: 5, date: "05 Mei 2026", text: "Kemasan botol birunya sangat premium, rasanya seperti menggunakan produk spa bintang lima. Tekstur kulit jadi sangat halus setelah bangun tidur." },
        { name: "Citra P.", rating: 4, date: "20 April 2026", text: "Sangat melembapkan untuk ukuran serum retinol. Kulit terasa lebih kenyal dan kencang di pagi hari." }
      ]
    },
    variants: [
      { sku: "NEXA-CELESTIAL-FORMULA", price: 349000, stock: 150, variant_metadata: { shade: "Celestial Formula", hex: "#0F2C59", imageDesc: "Serum biru safir botol kaca elegan" } }
    ]
  },
  {
    name: "Elysian Cleansing Balm",
    slug: "elysian-cleansing-balm",
    base_price: 199000,
    description: "Balsem peleleh makeup organik premium dengan minyak almond manis dan ekstrak kamomil yang menenangkan. Meleleh lembut menyapu kotoran tersumbat tanpa merusak hidrasi alami kulit.",
    images: ["/images/elysian_balm.png"],
    attributes: {
      category: "Makeup",
      tags: ["Makeup", "Pembersih", "Organik"],
      rating: 4.7,
      reviewsCount: 924,
      ingredients: "Prunus Amygdalus Dulcis (Sweet Almond) Oil, Chamomilla Recutita (Matricaria) Flower Extract, Shea Butter, Tocopheryl Acetate (Vitamin E), Caprylic/Capric Triglyceride.",
      howToUse: "Ambil balsem seukuran koin menggunakan spatula. Pijat lembut pada wajah kering dengan gerakan melingkar hingga makeup meleleh, lalu bilas dengan air hangat hingga bersih.",
      reviews: [
        { name: "Dewi A.", rating: 5, date: "14 Mei 2026", text: "Makeup waterproof langsung luluh seketika! Sangat lembut dan tidak perih di mata. Wangi kamomilnya sangat menenangkan pikiran." },
        { name: "Sarah V.", rating: 5, date: "10 Mei 2026", text: "Cleansing balm terbaik yang pernah saya coba. Benar-benar meleleh jadi minyak lembut dan saat dibilas tidak meninggalkan residu lengket." },
        { name: "Kania R.", rating: 5, date: "02 Mei 2026", text: "Suka sekali dengan kemasan batu marmernya yang sangat estetis. Kulit terasa lembap setelah dibilas." }
      ]
    },
    variants: [
      { sku: "NEXA-ELYSIAN-BALM", price: 199000, stock: 90, variant_metadata: { shade: "Elysian Balm", hex: "#EBE3D5", imageDesc: "Balsem putih krim lembut wadah marmer" } }
    ]
  }
];

async function seed() {
  console.log("Checking products count...");
  const { count, error: countError } = await supabaseAdmin
    .from("products")
    .select("id", { count: "exact", head: true });

  if (countError) {
    console.error("Checking products table error:", countError.message);
    return;
  }

  console.log("Current count in DB:", count);
  if (count === 0) {
    console.log("Seeding products...");
    for (const seed of SEED_PRODUCTS) {
      const { data: product, error: productError } = await supabaseAdmin
        .from("products")
        .insert({
          name: seed.name,
          slug: seed.slug,
          base_price: seed.base_price,
          description: seed.description,
          images: seed.images,
          attributes: seed.attributes
        })
        .select()
        .single();

      if (productError) {
        console.error(`Failed to seed product ${seed.name}:`, productError.message);
        continue;
      }

      console.log(`Seeded product: ${seed.name} with ID: ${product.id}`);

      const variantsToInsert = seed.variants.map((v) => ({
        product_id: product.id,
        sku: v.sku,
        price: v.price,
        stock: v.stock,
        variant_metadata: v.variant_metadata
      }));

      const { error: variantError } = await supabaseAdmin
        .from("product_variants")
        .insert(variantsToInsert);

      if (variantError) {
        console.error(`Failed to seed variants for ${seed.name}:`, variantError.message);
      } else {
        console.log(`Seeded variants for ${seed.name}`);
      }
    }
    console.log("Seeding completed.");
  }
}

seed();
