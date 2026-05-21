/**
 * Kamus data Kecamatan riil untuk kota-kota besar di Indonesia.
 * Digunakan sebagai fallback pengisian data kecamatan yang tidak dicakup oleh RajaOngkir Starter.
 */

export const DISTRICTS_BY_CITY: Record<string, string[]> = {
  // Bandung (City ID: 23)
  "bandung": [
    "Andir",
    "Astana Anyar",
    "Babakan Ciparay",
    "Bandung Kidul",
    "Bandung Kulon",
    "Bandung Wetan",
    "Batununggal",
    "Bojongloa Kaler",
    "Bojongloa Kidul",
    "Buahbatu",
    "Cibeunying Kaler",
    "Cibeunying Kidul",
    "Cibiru",
    "Cicendo",
    "Cidadap",
    "Cinambo",
    "Coblong",
    "Gedebage",
    "Kiaracondong",
    "Lengkong",
    "Mandalajati",
    "Panyileukan",
    "Rancasari",
    "Regol",
    "Sukajadi",
    "Sukasari",
    "Sumur Bandung",
    "Ujungberung"
  ],
  // Jakarta Pusat (City ID: 115)
  "jakarta pusat": [
    "Cempaka Putih",
    "Gambir",
    "Johar Baru",
    "Kemayoran",
    "Menteng",
    "Sawah Besar",
    "Senen",
    "Tanah Abang"
  ],
  // Jakarta Selatan (City ID: 116)
  "jakarta selatan": [
    "Cilandak",
    "Jagakarsa",
    "Kebayoran Baru",
    "Kebayoran Lama",
    "Mampang Prapatan",
    "Pancoran",
    "Pasar Minggu",
    "Pesanggrahan",
    "Setiabudi",
    "Tebet"
  ],
  // Jakarta Barat (City ID: 114)
  "jakarta barat": [
    "Cengkareng",
    "Grogol Petamburan",
    "Kalideres",
    "Kebon Jeruk",
    "Kembangan",
    "Palmerah",
    "Taman Sari",
    "Tambora"
  ],
  // Jakarta Utara (City ID: 117)
  "jakarta utara": [
    "Cilincing",
    "Kelapa Gading",
    "Koja",
    "Pademangan",
    "Penjaringan",
    "Tanjung Priok"
  ],
  // Jakarta Timur (City ID: 118)
  "jakarta timur": [
    "Cakung",
    "Cipayung",
    "Ciracas",
    "Duren Sawit",
    "Jatinegara",
    "Kramat Jati",
    "Makasar",
    "Matraman",
    "Pasar Rebo",
    "Pulo Gadung"
  ],
  // Yogyakarta (City ID: 501)
  "yogyakarta": [
    "Danurejan",
    "Gedongtengen",
    "Gondokusuman",
    "Gondomanan",
    "Jetis",
    "Kotagede",
    "Kraton",
    "Mantrijeron",
    "Mergangsan",
    "Ngampilan",
    "Pakualaman",
    "Tegalrejo",
    "Umbulharjo",
    "Wirobrajan"
  ],
  // Surabaya (City ID: 444)
  "surabaya": [
    "Asemrowo",
    "Benowo",
    "Bubutan",
    "Bulak",
    "Dukuh Pakis",
    "Gayungan",
    "Genteng",
    "Gubeng",
    "Gunung Anyar",
    "Jambangan",
    "Karang Pilang",
    "Kenjeran",
    "Krembangan",
    "Lakar Santri",
    "Mulyorejo",
    "Pabean Cantian",
    "Pakal",
    "Rungkut",
    "Sambikerep",
    "Sawahan",
    "Semampir",
    "Simokerto",
    "Sukolilo",
    "Sukomanunggal",
    "Tegalsari",
    "Tenggilis Mejoyo",
    "Tandes",
    "Wiyung",
    "Wonocolo",
    "Wonokromo"
  ],
  // Medan (City ID: 278)
  "medan": [
    "Medan Amplas",
    "Medan Area",
    "Medan Barat",
    "Medan Baru",
    "Medan Belawan",
    "Medan Deli",
    "Medan Denai",
    "Medan Helvetia",
    "Medan Johor",
    "Medan Kota",
    "Medan Labuhan",
    "Medan Maimun",
    "Medan Marelan",
    "Medan Perjuangan",
    "Medan Petisah",
    "Medan Polonia",
    "Medan Selayang",
    "Medan Sunggal",
    "Medan Tembung",
    "Medan Tuntungan",
    "Medan Timur"
  ],
  // Badung (City ID: 17)
  "badung": [
    "Abiansemal",
    "Kuta",
    "Kuta Selatan",
    "Kuta Utara",
    "Mengwi",
    "Petang"
  ]
};

// Generic Fallback Districts if city is not in major dictionary
const GENERIC_DISTRICTS = [
  "Kecamatan Tengah",
  "Kecamatan Barat",
  "Kecamatan Timur",
  "Kecamatan Utara",
  "Kecamatan Selatan",
  "Kecamatan Pusat",
  "Kecamatan Wetan",
  "Kecamatan Kulon"
];

/**
 * Mengambil daftar kecamatan berdasarkan nama kota.
 * Melakukan normalisasi string untuk mencocokkan kunci pencarian.
 */
export function getDistrictsForCity(cityName: string): string[] {
  if (!cityName) return GENERIC_DISTRICTS;
  
  const normalized = cityName.toLowerCase()
    .replace(/^kota\s+/, "")
    .replace(/^kabupaten\s+/, "")
    .trim();
  
  return DISTRICTS_BY_CITY[normalized] || [
    `Kecamatan ${normalized} Timur`,
    `Kecamatan ${normalized} Barat`,
    `Kecamatan ${normalized} Selatan`,
    `Kecamatan ${normalized} Utara`,
    `Kecamatan ${normalized} Tengah`
  ];
}

export interface Country {
  id: string;
  name: string;
}

export interface MockProvince {
  province_id: string;
  province: string;
}

export interface MockCity {
  city_id: string;
  province_id: string;
  type: string;
  city_name: string;
  postal_code: string;
}

export const COUNTRIES: Country[] = [
  { id: "ID", name: "Indonesia" },
  { id: "MY", name: "Malaysia" },
  { id: "SG", name: "Singapura" },
  { id: "BN", name: "Brunei" },
  { id: "TH", name: "Thailand" }
];

export const INTERNATIONAL_PROVINCES: Record<string, MockProvince[]> = {
  MY: [
    { province_id: "my-1", province: "Kuala Lumpur" },
    { province_id: "my-2", province: "Selangor" },
    { province_id: "my-3", province: "Johor" },
    { province_id: "my-4", province: "Penang" },
    { province_id: "my-5", province: "Sabah" },
    { province_id: "my-6", province: "Sarawak" }
  ],
  SG: [
    { province_id: "sg-1", province: "Central Region" },
    { province_id: "sg-2", province: "East Region" },
    { province_id: "sg-3", province: "North Region" },
    { province_id: "sg-4", province: "North-East Region" },
    { province_id: "sg-5", province: "West Region" }
  ],
  BN: [
    { province_id: "bn-1", province: "Brunei-Muara" },
    { province_id: "bn-2", province: "Belait" },
    { province_id: "bn-3", province: "Tutong" },
    { province_id: "bn-4", province: "Temburong" }
  ],
  TH: [
    { province_id: "th-1", province: "Bangkok" },
    { province_id: "th-2", province: "Chiang Mai" },
    { province_id: "th-3", province: "Phuket" },
    { province_id: "th-4", province: "Chonburi" },
    { province_id: "th-5", province: "Krabi" }
  ]
};

export const INTERNATIONAL_CITIES: Record<string, MockCity[]> = {
  MY: [
    { city_id: "my-c1", province_id: "my-1", type: "Wilayah", city_name: "Kuala Lumpur City", postal_code: "50000" },
    { city_id: "my-c2", province_id: "my-2", type: "Kota", city_name: "Petaling Jaya", postal_code: "46000" },
    { city_id: "my-c3", province_id: "my-2", type: "Kota", city_name: "Shah Alam", postal_code: "40000" },
    { city_id: "my-c4", province_id: "my-3", type: "Kota", city_name: "Johor Bahru", postal_code: "80000" },
    { city_id: "my-c5", province_id: "my-4", type: "Kota", city_name: "George Town", postal_code: "10000" },
    { city_id: "my-c6", province_id: "my-5", type: "Kota", city_name: "Kota Kinabalu", postal_code: "88000" },
    { city_id: "my-c7", province_id: "my-6", type: "Kota", city_name: "Kuching", postal_code: "93000" }
  ],
  SG: [
    { city_id: "sg-c1", province_id: "sg-1", type: "Sektor", city_name: "Downtown Core", postal_code: "018981" },
    { city_id: "sg-c2", province_id: "sg-1", type: "Sektor", city_name: "Orchard Road Area", postal_code: "238872" },
    { city_id: "sg-c3", province_id: "sg-2", type: "Sektor", city_name: "Tampines Area", postal_code: "520101" },
    { city_id: "sg-c4", province_id: "sg-3", type: "Sektor", city_name: "Woodlands Area", postal_code: "730900" },
    { city_id: "sg-c5", province_id: "sg-4", type: "Sektor", city_name: "Sengkang Area", postal_code: "540101" },
    { city_id: "sg-c6", province_id: "sg-5", type: "Sektor", city_name: "Jurong East Area", postal_code: "600001" }
  ],
  BN: [
    { city_id: "bn-c1", province_id: "bn-1", type: "Kota", city_name: "Bandar Seri Begawan", postal_code: "BS8611" },
    { city_id: "bn-c2", province_id: "bn-2", type: "Pekan", city_name: "Kuala Belait", postal_code: "KB1133" },
    { city_id: "bn-c3", province_id: "bn-2", type: "Pekan", city_name: "Seria", postal_code: "KB2133" },
    { city_id: "bn-c4", province_id: "bn-3", type: "Pekan", city_name: "Tutong Town", postal_code: "TA1133" },
    { city_id: "bn-c5", province_id: "bn-4", type: "Pekan", city_name: "Bangar Town", postal_code: "PA1133" }
  ],
  TH: [
    { city_id: "th-c1", province_id: "th-1", type: "Distrik", city_name: "Phra Nakhon (Pusat)", postal_code: "10200" },
    { city_id: "th-c2", province_id: "th-1", type: "Distrik", city_name: "Pathum Wan", postal_code: "10330" },
    { city_id: "th-c3", province_id: "th-2", type: "Distrik", city_name: "Mueang Chiang Mai", postal_code: "50000" },
    { city_id: "th-c4", province_id: "th-3", type: "Distrik", city_name: "Mueang Phuket", postal_code: "83000" },
    { city_id: "th-c5", province_id: "th-4", type: "Distrik", city_name: "Pattaya City", postal_code: "20150" },
    { city_id: "th-c6", province_id: "th-5", type: "Distrik", city_name: "Mueang Krabi", postal_code: "81000" }
  ]
};

export function getDistrictsForInternationalCity(cityId: string, cityName: string): string[] {
  if (cityId.startsWith("my-")) {
    return ["Kawasan 1", "Kawasan 2", "Kawasan 3", "Kawasan 4"];
  }
  if (cityId.startsWith("sg-")) {
    return ["Sub-Sektor Utara", "Sub-Sektor Selatan", "Sub-Sektor Timur", "Sub-Sektor Barat"];
  }
  if (cityId.startsWith("bn-")) {
    return ["Mukim 1", "Mukim 2", "Mukim 3"];
  }
  if (cityId.startsWith("th-")) {
    return ["Khwaeng 1", "Khwaeng 2", "Khwaeng 3"];
  }
  return [`Wilayah ${cityName}`];
}
