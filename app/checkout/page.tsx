"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { 
  getDistrictsForCity, 
  COUNTRIES, 
  INTERNATIONAL_PROVINCES, 
  INTERNATIONAL_CITIES, 
  getDistrictsForInternationalCity 
} from "@/lib/districts";
import { CreditCard, Lock, ChevronLeft, Loader2 } from "lucide-react";

interface ShippingCostDetail {
  value: number;
  etd: string;
  note: string;
}

interface ShippingServiceCost {
  service: string;
  description: string;
  cost: ShippingCostDetail[];
}

interface SnapWindow extends Window {
  snap?: {
    pay: (token: string, options: {
      onSuccess: (result: unknown) => void;
      onPending: (result: unknown) => void;
      onError: (err: unknown) => void;
      onClose: () => void;
    }) => void;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartSubtotal, discountAmount, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  // Loading States
  const [isInitializing, setIsInitializing] = useState(false);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);

  // Form Fields
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [selectedCountry, setSelectedCountry] = useState("Indonesia");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Kecamatan states
  const [checkoutDistrict, setCheckoutDistrict] = useState("");
  const [checkoutDistricts, setCheckoutDistricts] = useState<string[]>([]);

  // RajaOngkir States
  const [provinces, setProvinces] = useState<Array<{ province_id: string; province: string }>>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  
  const [cities, setCities] = useState<Array<{ city_id: string; city_name: string; type: string }>>([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedCityName, setSelectedCityName] = useState("");
  const [selectedProvinceName, setSelectedProvinceName] = useState("");

  const [courier, setCourier] = useState("jne");
  const [shippingServices, setShippingServices] = useState<ShippingServiceCost[]>([]);
  const [selectedService, setSelectedService] = useState<ShippingServiceCost | null>(null);
  // Refs to hold pending auto-fill values that need to wait for async data
  const pendingCityIdRef = React.useRef("");
  const pendingDistrictRef = React.useRef("");

  // Auto-fill customer details from AuthContext
  useEffect(() => {
    if (user) {
      setCustomer({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || ""
      });
      if (user.address) {
        const addr = user.address;
        setAddress(addr.address || "");
        setSelectedCountry(addr.country || "Indonesia");
        setPostalCode(addr.postalCode || "");
        setSelectedProvinceId(addr.provinceId || "");
        // Store pending values - will be applied when cities/districts load
        pendingCityIdRef.current = addr.cityId || "";
        pendingDistrictRef.current = addr.kecamatan || "";
        setSelectedCityId(addr.cityId || "");
      }
    }
  }, [user]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Fetch provinces when selectedCountry changes
  useEffect(() => {
    const countryCode = COUNTRIES.find(c => c.name === selectedCountry)?.id || "ID";
    if (countryCode === "ID") {
      async function fetchProvinces() {
        try {
          const res = await fetch("/api/shipping?type=province");
          const data = await res.json();
          if (data.results) {
            setProvinces(data.results);
          }
        } catch (e) {
          console.error("Gagal memuat provinsi:", e);
        }
      }
      fetchProvinces();
    } else {
      const list = INTERNATIONAL_PROVINCES[countryCode] || [];
      setProvinces(list);
      // Auto-reset when country changes (but not if auto-filling from user)
      if (!pendingCityIdRef.current) {
        setSelectedProvinceId("");
        setSelectedCityId("");
        setCities([]);
        setCheckoutDistricts([]);
        setCheckoutDistrict("");
      }
    }
  }, [selectedCountry]);

  // Fetch cities when selected province changes
  useEffect(() => {
    if (!selectedProvinceId) {
      setCities([]);
      // Only reset city if not waiting for pending auto-fill
      if (!pendingCityIdRef.current) {
        setSelectedCityId("");
      }
      return;
    }
    const countryCode = COUNTRIES.find(c => c.name === selectedCountry)?.id || "ID";
    if (countryCode === "ID") {
      async function fetchCities() {
        try {
          const res = await fetch(`/api/shipping?type=city&provinceId=${selectedProvinceId}`);
          const data = await res.json();
          if (data.results) {
            setCities(data.results);
            // Restore pending city selection after cities load
            if (pendingCityIdRef.current) {
              setSelectedCityId(pendingCityIdRef.current);
              pendingCityIdRef.current = "";
            }
          }
          const prov = provinces.find(p => p.province_id === selectedProvinceId);
          if (prov) setSelectedProvinceName(prov.province);
        } catch (e) {
          console.error("Gagal memuat kota:", e);
        }
      }
      fetchCities();
    } else {
      const list = INTERNATIONAL_CITIES[countryCode]?.filter(c => c.province_id === selectedProvinceId) || [];
      setCities(list);
      if (pendingCityIdRef.current) {
        setSelectedCityId(pendingCityIdRef.current);
        pendingCityIdRef.current = "";
      }
      const prov = provinces.find(p => p.province_id === selectedProvinceId);
      if (prov) setSelectedProvinceName(prov.province);
    }
  }, [selectedProvinceId, selectedCountry, provinces]);

  // Load Districts when selectedCityId changes in checkout
  useEffect(() => {
    if (!selectedCityId) {
      setCheckoutDistricts([]);
      if (!pendingDistrictRef.current) {
        setCheckoutDistrict("");
      }
      return;
    }
    const countryCode = COUNTRIES.find(c => c.name === selectedCountry)?.id || "ID";
    const city = cities.find(c => c.city_id === selectedCityId);
    if (city) {
      let list: string[] = [];
      if (countryCode === "ID") {
        const cityName = `${city.type} ${city.city_name}`;
        list = getDistrictsForCity(cityName);
      } else {
        list = getDistrictsForInternationalCity(selectedCityId, city.city_name);
      }
      setCheckoutDistricts(list);
      
      // Restore pending district or auto select user's saved kecamatan
      if (pendingDistrictRef.current && list.includes(pendingDistrictRef.current)) {
        setCheckoutDistrict(pendingDistrictRef.current);
        pendingDistrictRef.current = "";
      } else if (user?.address?.cityId === selectedCityId && user.address.kecamatan && list.includes(user.address.kecamatan)) {
        setCheckoutDistrict(user.address.kecamatan);
      } else {
        setCheckoutDistrict(list[0] || "");
      }
    }
  }, [selectedCityId, cities, user, selectedCountry]);

  // Calculate Shipping Cost when city or courier changes
  useEffect(() => {
    if (!selectedCityId) {
      setShippingServices([]);
      setSelectedService(null);
      return;
    }

    const countryCode = COUNTRIES.find(c => c.name === selectedCountry)?.id || "ID";
    if (countryCode !== "ID") {
      const intServices = [
        {
          service: "INT-STD",
          description: "Standard International Shipping",
          cost: [{ value: 85000, etd: "7-14 Hari", note: "" }]
        },
        {
          service: "INT-EXP",
          description: "DHL Express (International)",
          cost: [{ value: 155000, etd: "3-5 Hari", note: "" }]
        },
        {
          service: "INT-FEDEX",
          description: "FedEx International Priority",
          cost: [{ value: 225000, etd: "2-3 Hari", note: "" }]
        }
      ];
      setShippingServices(intServices);
      setSelectedService(intServices[0]);
      
      const ct = cities.find(c => c.city_id === selectedCityId);
      if (ct) setSelectedCityName(ct.city_name);
      return;
    }

    if (!courier) {
      setShippingServices([]);
      setSelectedService(null);
      return;
    }

    async function calculateShipping() {
      setIsLoadingShipping(true);
      try {
        const res = await fetch("/api/shipping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            destinationCityId: selectedCityId,
            weightInGrams: cart.reduce((sum, item) => sum + item.quantity * 250, 0) || 1000, // 250g per item
            courierCode: courier
          })
        });
        const data = await res.json();
        if (data.results && data.results[0]?.costs) {
          setShippingServices(data.results[0].costs);
          // Auto select first service (usually REG)
          setSelectedService(data.results[0].costs[0]);
        }
        
        // Update city name string
        const ct = cities.find(c => c.city_id === selectedCityId);
        if (ct) setSelectedCityName(`${ct.type} ${ct.city_name}`);
      } catch (e) {
        console.error("Gagal memuat biaya pengiriman:", e);
      } finally {
        setIsLoadingShipping(false);
      }
    }
    calculateShipping();
  }, [selectedCityId, courier, cart, cities, selectedCountry]);

  const shippingCost = selectedService ? selectedService.cost[0].value : 0;
  const grandTotal = cartTotal + shippingCost;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || isInitializing) return;

    if (!selectedCityId || !selectedService) {
      alert("Silakan pilih kota tujuan dan layanan pengiriman terlebih dahulu.");
      return;
    }

    setIsInitializing(true);

    const saveLocalOrder = (orderId: string, status: string = "Menunggu Pembayaran") => {
      if (typeof window === "undefined") return;
      const userKey = customer.email || customer.phone || "guest";
      const key = `nexamart_orders_${userKey}`;
      const existing = localStorage.getItem(key);
      const orders = existing ? JSON.parse(existing) : [];
      
      orders.unshift({
        id: orderId,
        date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
        total: grandTotal,
        status: status,
        items: cart.map(i => `${i.quantity}x ${i.name}${i.variantName ? ` (${i.variantName})` : ""}`).join(", ")
      });
      localStorage.setItem(key, JSON.stringify(orders));
    };

    try {
      const checkoutPayload = {
        items: cart,
        customer,
        shippingCost,
        discountAmount,
        totalAmount: grandTotal,
        shippingAddress: {
          address,
          country: selectedCountry,
          province: selectedProvinceName,
          cityName: selectedCityName,
          cityId: selectedCityId,
          kecamatan: checkoutDistrict,
          postalCode,
          serviceName: selectedCountry === "Indonesia"
            ? `${courier.toUpperCase()} ${selectedService.service}`
            : `INTL ${selectedService.service}`
        }
      };

      const res = await fetch("/api/midtrans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkoutPayload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat transaksi.");
      }

      // Check if sandbox mock redirection is returned
      if (data.isMock) {
        saveLocalOrder(data.order_id, "Sedang Diproses");
        clearCart();
        router.push(data.redirect_url);
        return;
      }

      // Open Midtrans Snap Modal
      const snapWindow = window as unknown as SnapWindow;
      if (typeof window !== "undefined" && snapWindow.snap) {
        snapWindow.snap.pay(data.token, {
          onSuccess: (result: unknown) => {
            console.log("Midtrans payment success:", result);
            saveLocalOrder(data.order_id, "Sedang Diproses");
            clearCart();
            router.push(`/checkout/success?order_id=${data.order_id}&status=paid`);
          },
          onPending: (result: unknown) => {
            console.log("Midtrans payment pending:", result);
            saveLocalOrder(data.order_id, "Menunggu Pembayaran");
            clearCart();
            router.push(`/checkout/success?order_id=${data.order_id}&status=pending`);
          },
          onError: (err: unknown) => {
            console.error("Midtrans payment error:", err);
            alert("Terjadi kesalahan pembayaran. Silakan coba kembali.");
            setIsInitializing(false);
          },
          onClose: () => {
            console.log("Midtrans modal closed.");
            setIsInitializing(false);
          }
        });
      } else {
        // Fallback: Redirect to snap payment URL directly
        saveLocalOrder(data.order_id, "Menunggu Pembayaran");
        clearCart();
        window.location.href = data.redirect_url;
      }
    } catch (e: unknown) {
      const err = e as Error;
      console.error(err);
      alert(err.message || "Gagal memproses pembayaran. Cek koneksi Anda.");
      setIsInitializing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 bg-white">
        <h2 className="font-serif text-2xl text-neutral-900 tracking-wide">Tas Belanja Kosong</h2>
        <p className="text-xs text-neutral-400 mt-2">Anda tidak dapat melakukan checkout tanpa produk.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 px-8 py-3 bg-neutral-950 hover:bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest rounded-full cursor-pointer"
        >
          Kembali ke Toko
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen text-neutral-900 py-12 px-6">
      
      {/* Midtrans Snap JS SDK Script (Sandbox default) */}
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Back Link */}
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-900 transition-colors uppercase tracking-wider font-semibold cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali
        </button>

        <h2 className="font-serif text-3xl font-light text-neutral-950 tracking-tight">
          Formulir <span className="italic font-normal">Pembayaran & Pengiriman</span>
        </h2>

        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Form Details (Customer & RajaOngkir Shipping) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 1. Customer Info */}
            <div className="space-y-4">
              <h3 className="font-serif text-base font-semibold text-neutral-900 flex items-center gap-2 pb-2 border-b border-neutral-100">
                <span className="w-5 h-5 rounded-full bg-neutral-100 text-[10px] flex items-center justify-center font-bold">1</span>
                Informasi Kontak Pelanggan
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Nama Penerima</label>
                  <input
                    required
                    type="text"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    placeholder="Nama lengkap Anda"
                    className="w-full text-xs px-4 py-3 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 font-sans">No. Telepon / WhatsApp</label>
                  <input
                    required
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="08123456789"
                    className="w-full text-xs px-4 py-3 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Surel (Email)</label>
                <input
                  required
                  type="email"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  placeholder="nama@email.com"
                  className="w-full text-xs px-4 py-3 rounded-xl"
                />
              </div>
            </div>

            {/* 2. Shipping Info */}
            <div className="space-y-4">
              <h3 className="font-serif text-base font-semibold text-neutral-900 flex items-center gap-2 pb-2 border-b border-neutral-100">
                <span className="w-5 h-5 rounded-full bg-neutral-100 text-[10px] flex items-center justify-center font-bold">2</span>
                Alamat Pengiriman
              </h3>

              {/* Country select */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Negara</label>
                <select
                  required
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full text-xs px-4 py-3 rounded-xl border border-neutral-200 bg-white cursor-pointer focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Province */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                    {selectedCountry === "Indonesia" ? "Provinsi" : "Negara Bagian / Wilayah"}
                  </label>
                  <select
                    required
                    value={selectedProvinceId}
                    onChange={(e) => {
                      setSelectedProvinceId(e.target.value);
                      setSelectedCityId("");
                    }}
                    className="w-full text-xs px-4 py-3 rounded-xl border border-neutral-200 bg-white cursor-pointer focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all"
                  >
                    <option value="">
                      {selectedCountry === "Indonesia" ? "Pilih Provinsi" : "Pilih Wilayah"}
                    </option>
                    {provinces.map((p) => (
                      <option key={p.province_id} value={p.province_id}>
                        {p.province}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Kota / Kabupaten</label>
                  <select
                    required
                    disabled={!selectedProvinceId}
                    value={selectedCityId}
                    onChange={(e) => setSelectedCityId(e.target.value)}
                    className="w-full text-xs px-4 py-3 rounded-xl border border-neutral-200 bg-white disabled:bg-neutral-50 disabled:text-neutral-400 cursor-pointer focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all"
                  >
                    <option value="">Pilih Kota</option>
                    {cities.map((c) => (
                      <option key={c.city_id} value={c.city_id}>
                        {c.type ? `${c.type} ` : ""}{c.city_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kecamatan */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                    {selectedCountry === "Indonesia" ? "Kecamatan (Data Riil)" : "Kecamatan / Distrik"}
                  </label>
                  <select
                    required
                    disabled={!selectedCityId || checkoutDistricts.length === 0}
                    value={checkoutDistrict}
                    onChange={(e) => setCheckoutDistrict(e.target.value)}
                    className="w-full text-xs px-4 py-3 rounded-xl border border-neutral-200 bg-white disabled:bg-neutral-50 disabled:text-neutral-400 cursor-pointer focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all"
                  >
                    {checkoutDistricts.map((d, index) => (
                      <option key={index} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Postal Code */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Kode Pos</label>
                  <input
                    required
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="40111"
                    className="w-full text-xs px-4 py-3 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all"
                  />
                </div>
              </div>

              {/* Courier & Address details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Alamat Lengkap & Rumah</label>
                  <textarea
                    rows={2}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Jl. Raya Indah No. 4B, RT/RW..."
                    className="w-full text-xs px-4 py-3 rounded-xl border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all resize-none"
                  />
                </div>

                {selectedCountry === "Indonesia" ? (
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Kurir Pengiriman</label>
                    <select
                      value={courier}
                      onChange={(e) => setCourier(e.target.value)}
                      className="w-full text-xs px-4 py-3 rounded-xl border border-neutral-200 bg-white cursor-pointer focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all"
                    >
                      <option value="jne">JNE Express</option>
                      <option value="pos">POS Indonesia</option>
                      <option value="tiki">TIKI</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Kurir Pengiriman</label>
                    <div className="w-full text-xs px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-500 font-medium flex items-center">
                      Kurir Internasional Terintegrasi (DHL / FedEx)
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Shipping Cost & Service Type */}
            <div className="space-y-4">
              <h3 className="font-serif text-base font-semibold text-neutral-900 flex items-center gap-2 pb-2 border-b border-neutral-100">
                <span className="w-5 h-5 rounded-full bg-neutral-100 text-[10px] flex items-center justify-center font-bold">3</span>
                Layanan & Tarif Pengiriman
              </h3>
              
              {isLoadingShipping ? (
                <div className="flex items-center gap-2 text-xs text-neutral-400 py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                  Mengalkulasi ongkos kirim RajaOngkir...
                </div>
              ) : shippingServices.length === 0 ? (
                <p className="text-xs text-neutral-400 py-2">
                  *Isi alamat pengiriman di atas untuk memunculkan layanan pengiriman.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {shippingServices.map((service, index) => {
                    const isSelected = selectedService?.service === service.service;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedService(service)}
                        className={`flex justify-between items-center p-4 border rounded-xl text-left transition-all ${
                          isSelected
                            ? "border-neutral-950 bg-neutral-50/40 ring-1 ring-neutral-950"
                            : "border-neutral-200 bg-white hover:border-neutral-300"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-neutral-900 uppercase">
                              {courier.toUpperCase()} {service.service}
                            </span>
                            <span className="text-[10px] text-neutral-400">({service.description})</span>
                          </div>
                          <span className="text-[10px] text-neutral-400 block mt-0.5">Estimasi tiba: {service.cost[0].etd} Hari</span>
                        </div>
                        <span className="text-xs font-bold text-neutral-950">{formatRupiah(service.cost[0].value)}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Order Summary (Sticky Checkout Box) */}
          <div className="lg:col-span-5 bg-neutral-50/40 border border-neutral-100 rounded-3xl p-6 lg:sticky lg:top-8 space-y-6">
            <h3 className="font-serif text-base font-semibold text-neutral-900 pb-2 border-b border-neutral-100">
              Ringkasan Pesanan Anda
            </h3>

            {/* List items */}
            <div className="divide-y divide-neutral-100/50 max-h-60 overflow-y-auto space-y-3">
              {cart.map((item, index) => {
                const finalPrice = item.isSubscription ? item.price * 0.9 : item.price;
                return (
                  <div key={index} className="flex justify-between items-center py-2 text-xs">
                    <div>
                      <span className="font-serif font-bold text-neutral-950">{item.name}</span>
                      <div className="flex gap-2 text-[9px] text-neutral-400 mt-0.5">
                        <span>Jumlah: {item.quantity}</span>
                        {item.variantName && <span>Varian: {item.variantName}</span>}
                        {item.isSubscription && <span className="text-green-700 font-medium">Langganan</span>}
                      </div>
                    </div>
                    <span className="font-medium text-neutral-800">{formatRupiah(finalPrice * item.quantity)}</span>
                  </div>
                );
              })}
            </div>

            {/* Billing figures */}
            <div className="space-y-2.5 text-xs border-t border-neutral-100 pt-4">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal</span>
                <span>{formatRupiah(cartSubtotal)}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between text-red-600 font-medium">
                  <span>Diskon Bundling</span>
                  <span>-{formatRupiah(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-500">
                <span>Ongkos Kirim ({courier.toUpperCase()})</span>
                <span>{selectedService ? formatRupiah(shippingCost) : "Dihitung otomatis"}</span>
              </div>

              <div className="h-px bg-neutral-100 my-1" />

              <div className="flex justify-between items-baseline">
                <span className="font-serif text-sm font-semibold text-neutral-800">Total Akhir</span>
                <span className="text-lg font-bold text-neutral-950">{formatRupiah(grandTotal)}</span>
              </div>
            </div>

            {/* Submit Action */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={isInitializing}
                className="w-full flex items-center justify-center gap-2 py-4 bg-neutral-950 hover:bg-neutral-900 disabled:bg-neutral-200 disabled:text-neutral-400 text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 shadow-md cursor-pointer"
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Menghubungi Midtrans...
                  </>
                ) : (
                  <>
                    Bayar Sekarang
                    <CreditCard className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[9px] text-neutral-400">
                <Lock className="w-3 h-3 text-neutral-400" />
                <span>Enkripsi Secure 3D-Secure Gate Midtrans</span>
              </div>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
}
