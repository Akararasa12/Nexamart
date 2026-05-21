import { NextResponse } from "next/server";

const RAJAONGKIR_KEY = process.env.RAJAONGKIR_API_KEY || "";
const BASE_URL = "https://api.rajaongkir.com/starter";
const ORIGIN_CITY_ID = "152"; // Bandung as default origin

// Mock data for fallback when API Key is missing or Starter limit reached
const MOCK_PROVINCES = [
  { province_id: "1", province: "Bali" },
  { province_id: "6", province: "DKI Jakarta" },
  { province_id: "9", province: "Jawa Barat" },
  { province_id: "10", province: "Jawa Tengah" },
  { province_id: "11", province: "Jawa Timur" },
  { province_id: "34", province: "Sumatera Utara" }
];

const MOCK_CITIES = [
  { city_id: "17", province_id: "1", type: "Kabupaten", city_name: "Badung", postal_code: "80351" },
  { city_id: "114", province_id: "6", type: "Kota", city_name: "Jakarta Barat", postal_code: "11220" },
  { city_id: "115", province_id: "6", type: "Kota", city_name: "Jakarta Pusat", postal_code: "10110" },
  { city_id: "116", province_id: "6", type: "Kota", city_name: "Jakarta Selatan", postal_code: "12110" },
  { city_id: "23", province_id: "9", type: "Kota", city_name: "Bandung", postal_code: "40111" },
  { city_id: "501", province_id: "10", type: "Kota", city_name: "Yogyakarta", postal_code: "55111" },
  { city_id: "444", province_id: "11", type: "Kota", city_name: "Surabaya", postal_code: "60111" },
  { city_id: "278", province_id: "34", type: "Kota", city_name: "Medan", postal_code: "20111" }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // "province" or "city"
  const provinceId = searchParams.get("provinceId");

  if (!RAJAONGKIR_KEY) {
    if (type === "province") {
      return NextResponse.json({ status: "mock", results: MOCK_PROVINCES });
    }
    if (type === "city") {
      const filteredCities = provinceId
        ? MOCK_CITIES.filter((c) => c.province_id === provinceId)
        : MOCK_CITIES;
      return NextResponse.json({ status: "mock", results: filteredCities });
    }
    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
  }

  try {
    const endpoint = type === "province" ? "/province" : `/city${provinceId ? `?province=${provinceId}` : ""}`;
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { key: RAJAONGKIR_KEY }
    });
    const data = await response.json();

    if (data.rajaongkir?.status?.code !== 200) {
      throw new Error(data.rajaongkir?.status?.description || "RajaOngkir error");
    }

    return NextResponse.json({ status: "live", results: data.rajaongkir.results });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("RajaOngkir GET error, falling back to mock data:", err.message);
    // Graceful fallback
    if (type === "province") {
      return NextResponse.json({ status: "fallback", results: MOCK_PROVINCES });
    }
    const filteredCities = provinceId
      ? MOCK_CITIES.filter((c) => c.province_id === provinceId)
      : MOCK_CITIES;
    return NextResponse.json({ status: "fallback", results: filteredCities });
  }
}

export async function POST(request: Request) {
  try {
    const { destinationCityId, weightInGrams, courierCode } = await request.json();

    if (!destinationCityId) {
      return NextResponse.json({ error: "destinationCityId is required" }, { status: 400 });
    }

    const weight = weightInGrams || 1000;
    const courier = courierCode || "jne"; // jne, pos, tiki

    if (!RAJAONGKIR_KEY) {
      // Calculate a mock cost based on destination
      const baseCost = destinationCityId === "23" ? 8000 : 18000; // cheaper in Bandung (origin)
      const costResult = [
        {
          code: courier,
          name: courier.toUpperCase(),
          costs: [
            {
              service: "REG",
              description: "Regular Service",
              cost: [{ value: baseCost, etd: "2-3", note: "" }]
            },
            {
              service: "YES",
              description: "Overnight Service",
              cost: [{ value: baseCost + 10000, etd: "1", note: "" }]
            }
          ]
        }
      ];
      return NextResponse.json({ status: "mock", results: costResult });
    }

    // Call RajaOngkir API
    const response = await fetch(`${BASE_URL}/cost`, {
      method: "POST",
      headers: {
        key: RAJAONGKIR_KEY,
        "content-type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        origin: ORIGIN_CITY_ID,
        destination: destinationCityId,
        weight: weight.toString(),
        courier: courier
      })
    });

    const data = await response.json();

    if (data.rajaongkir?.status?.code !== 200) {
      throw new Error(data.rajaongkir?.status?.description || "RajaOngkir error");
    }

    return NextResponse.json({ status: "live", results: data.rajaongkir.results });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("RajaOngkir POST error, falling back to mock:", err.message);
    // Fallback logic
    const baseCost = 15000;
    return NextResponse.json({
      status: "fallback",
      results: [
        {
          code: "jne",
          name: "JNE",
          costs: [
            {
              service: "REG",
              description: "Regular Service (Fallback)",
              cost: [{ value: baseCost, etd: "2-4 Hari", note: "" }]
            }
          ]
        }
      ]
    });
  }
}
