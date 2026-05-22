"use client";

import React, { useState, useEffect } from "react";
import { useAuth, UserAddress } from "@/context/AuthContext";
import { 
  getDistrictsForCity, 
  COUNTRIES, 
  INTERNATIONAL_PROVINCES, 
  INTERNATIONAL_CITIES, 
  getDistrictsForInternationalCity 
} from "@/lib/districts";
import {
  Shield,
  RefreshCw,
  ShoppingBag,
  LogOut,
  CheckCircle,
  MapPin,
  ArrowRight,
  Lock,
  Loader2,
  Sparkles
} from "lucide-react";

export default function ProfilePage() {
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    loginState,
    otpAlert,
    registerUser,
    loginWithPassword,
    verifyOtp,
    resendOtp,
    logout,
    updateAddress,
    updateProfile
  } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState("subscription"); // 'subscription' | 'orders' | 'address'

  const [orders, setOrders] = useState<Array<{
    id: string;
    date: string;
    total: number;
    status: string;
    items: string;
  }>>([]);

  const [subscriptions, setSubscriptions] = useState<Array<{
    id: string;
    productName: string;
    frequency: string;
    nextShipDate: string;
    status: string;
    price: number;
  }>>([]);

  // Load orders and subscriptions from localStorage
  useEffect(() => {
    if (!user) return;
    const userKey = user.email || user.phone || "guest";
    
    // Orders
    const orderKey = `nexamart_orders_${userKey}`;
    const localOrders = localStorage.getItem(orderKey);
    if (localOrders) {
      setOrders(JSON.parse(localOrders));
    } else {
      const initialMock = [
        {
          id: "NEXA-10827",
          date: "12 Mei 2026",
          total: 807300,
          status: "Terkirim",
          items: "3x Aura Radiant Essence - Aura Glow"
        },
        {
          id: "NEXA-09824",
          date: "10 April 2026",
          total: 199000,
          status: "Terkirim",
          items: "1x Elysian Cleansing Balm"
        }
      ];
      localStorage.setItem(orderKey, JSON.stringify(initialMock));
      setOrders(initialMock);
    }

    // Subscriptions
    const subKey = `nexamart_subs_${userKey}`;
    const localSubs = localStorage.getItem(subKey);
    if (localSubs) {
      setSubscriptions(JSON.parse(localSubs));
    } else {
      const initialMock = [
        {
          id: "SUB-8291",
          productName: "Aura Radiant Essence - Rose Pearl",
          frequency: "30 Hari sekali",
          nextShipDate: "12 Juni 2026",
          status: "Aktif",
          price: 269100
        }
      ];
      localStorage.setItem(subKey, JSON.stringify(initialMock));
      setSubscriptions(initialMock);
    }
  }, [user]);

  const handleCancelOrder = (orderId: string) => {
    if (!confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) return;
    
    const userKey = user?.email || user?.phone || "guest";
    const orderKey = `nexamart_orders_${userKey}`;
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return { ...o, status: "Dibatalkan" };
      }
      return o;
    });
    
    setOrders(updated);
    localStorage.setItem(orderKey, JSON.stringify(updated));
  };

  const handleCancelSubscription = (subId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghentikan langganan ini?")) return;
    
    const userKey = user?.email || user?.phone || "guest";
    const subKey = `nexamart_subs_${userKey}`;
    const updated = subscriptions.map((s) => {
      if (s.id === subId) {
        return { ...s, status: "Dibatalkan" };
      }
      return s;
    });
    
    setSubscriptions(updated);
    localStorage.setItem(subKey, JSON.stringify(updated));
  };

  // Auth Form States
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [identityInput, setIdentityInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [whatsappInput, setWhatsappInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Address Form States
  const [selectedCountry, setSelectedCountry] = useState("Indonesia");
  const [provinces, setProvinces] = useState<Array<{ province_id: string; province: string }>>([]);
  const [cities, setCities] = useState<Array<{ city_id: string; city_name: string; type: string }>>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  
  const [formAddress, setFormAddress] = useState("");
  const [formDistrict, setFormDistrict] = useState("");
  const [formPostalCode, setFormPostalCode] = useState("");

  const [isAddressSaving, setIsAddressSaving] = useState(false);
  const [addressSuccess, setAddressSuccess] = useState(false);

  // Fetch Provinces based on country and activeSubTab
  useEffect(() => {
    if (activeSubTab !== "address") return;
    
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
      // Auto-clear or reset sub-selections when country changes
      setSelectedProvinceId("");
      setSelectedCityId("");
      setCities([]);
      setDistricts([]);
      setFormDistrict("");
    }
  }, [selectedCountry, activeSubTab]);

  // Fetch Cities when selected province changes
  useEffect(() => {
    if (!selectedProvinceId) {
      setCities([]);
      setSelectedCityId("");
      setDistricts([]);
      setFormDistrict("");
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
          }
        } catch (e) {
          console.error("Gagal memuat kota:", e);
        }
      }
      fetchCities();
    } else {
      const list = INTERNATIONAL_CITIES[countryCode]?.filter(c => c.province_id === selectedProvinceId) || [];
      setCities(list);
    }
  }, [selectedProvinceId, selectedCountry]);

  // Load Districts when selected city changes
  useEffect(() => {
    if (!selectedCityId) {
      setDistricts([]);
      setFormDistrict("");
      return;
    }
    
    const countryCode = COUNTRIES.find(c => c.name === selectedCountry)?.id || "ID";
    const city = cities.find(c => c.city_id === selectedCityId);
    if (city) {
      if (countryCode === "ID") {
        const cityName = `${city.type} ${city.city_name}`;
        const list = getDistrictsForCity(cityName);
        setDistricts(list);
        setFormDistrict(list[0] || "");
      } else {
        const list = getDistrictsForInternationalCity(selectedCityId, city.city_name);
        setDistricts(list);
        setFormDistrict(list[0] || "");
      }
    }
  }, [selectedCityId, cities, selectedCountry]);

  // Set Address form values from authenticated user on mount or tab change
  useEffect(() => {
    if (user?.address) {
      const addr = user.address;
      setFormAddress(addr.address || "");
      setSelectedCountry(addr.country || "Indonesia");
      setSelectedProvinceId(addr.provinceId || "");
      setSelectedCityId(addr.cityId || "");
      setFormDistrict(addr.kecamatan || "");
      setFormPostalCode(addr.postalCode || "");
    }
  }, [user, activeSubTab]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError("");
    try {
      if (authTab === "register") {
        if (!nameInput || !emailInput || !whatsappInput || !passwordInput) {
          setLoginError("Mohon lengkapi seluruh kolom pendaftaran.");
          setIsSubmitting(false);
          return;
        }
        const res = await registerUser({
          name: nameInput,
          email: emailInput,
          phone: whatsappInput,
          password: passwordInput
        });
        if (!res.success) {
          setLoginError(res.error || "Gagal melakukan pendaftaran.");
        }
      } else {
        if (!identityInput || !passwordInput) {
          setLoginError("Mohon isi identitas (Email/WA) dan kata sandi Anda.");
          setIsSubmitting(false);
          return;
        }
        const res = await loginWithPassword(identityInput, passwordInput);
        if (!res.success) {
          setLoginError(res.error || "Gagal masuk akun.");
        }
      }
    } catch {
      setLoginError("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput) return;
    setIsSubmitting(true);
    setLoginError("");
    try {
      const ok = await verifyOtp(otpInput);
      if (!ok) {
        setLoginError("Kode OTP salah. Silakan periksa kembali email atau kode simulasi Anda.");
      }
    } catch {
      setLoginError("Gagal memverifikasi kode OTP.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvinceId || !selectedCityId || !formDistrict || !formAddress || !formPostalCode) {
      alert("Silakan lengkapi seluruh kolom alamat.");
      return;
    }

    setIsAddressSaving(true);
    setAddressSuccess(false);

    const prov = provinces.find(p => p.province_id === selectedProvinceId);
    const city = cities.find(c => c.city_id === selectedCityId);

    if (prov && city) {
      const addressData: UserAddress = {
        address: formAddress,
        country: selectedCountry,
        provinceId: selectedProvinceId,
        provinceName: prov.province,
        cityId: selectedCityId,
        cityName: city.type ? `${city.type} ${city.city_name}` : city.city_name,
        kecamatan: formDistrict,
        postalCode: formPostalCode
      };

      updateAddress(addressData);

      setAddressSuccess(true);
      setTimeout(() => setAddressSuccess(false), 3000);
    }
    setIsAddressSaving(false);
  };



  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfcf9]">
        <div className="flex flex-col items-center gap-2 text-xs text-neutral-400">
          <Loader2 className="w-5 h-5 animate-spin text-gold" />
          Memuat akun kecantikan Anda...
        </div>
      </div>
    );
  }

  // 1. If not authenticated, display luxury login/verification form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fdfcf9] py-16 px-6 flex items-center justify-center luxury-pattern">
        <div className="max-w-md w-full bg-white/85 backdrop-blur-md border border-[#eadecb] p-8 rounded-3xl shadow-lg luxury-border space-y-6">
          
          <div className="text-center space-y-3">
            <div className="flex justify-center text-gold">
              <Sparkles className="w-6 h-6 fill-gold/10" />
            </div>
            <h2 className="font-serif text-3xl font-light text-neutral-950">
              {loginState === "otp_sent" ? (
                <>Verifikasi <span className="italic">OTP</span></>
              ) : (
                <>Akses <span className="italic">Akun</span></>
              )}
            </h2>
            <p className="text-xs text-neutral-400 font-sans leading-relaxed">
              {loginState === "otp_sent" 
                ? "Masukkan kode verifikasi yang dikirimkan untuk mengonfirmasi identitas Anda."
                : "Masuk ke akun Anda atau daftarkan diri untuk menikmati layanan istimewa NEXAMART."}
            </p>
          </div>

          {/* Form Tabs (only show in idle state) */}
          {loginState === "idle" && (
            <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-full border border-neutral-200/50">
              <button
                type="button"
                onClick={() => {
                  setAuthTab("login");
                  setLoginError("");
                }}
                className={`py-2 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  authTab === "login" 
                    ? "bg-white text-neutral-950 shadow-sm" 
                    : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                MASUK
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab("register");
                  setLoginError("");
                }}
                className={`py-2 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  authTab === "register" 
                    ? "bg-white text-neutral-950 shadow-sm" 
                    : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                DAFTAR
              </button>
            </div>
          )}

          {loginError && (
            <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl font-medium">
              {loginError}
            </div>
          )}

          {loginState === "idle" ? (
            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
              {authTab === "register" && (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold tracking-wider text-neutral-400">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama lengkap Anda"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#eadecb] bg-white focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold tracking-wider text-neutral-400">Alamat Surel (Email)</label>
                    <input
                      type="email"
                      required
                      placeholder="contoh@email.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#eadecb] bg-white focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold tracking-wider text-neutral-400">Nomor WhatsApp</label>
                    <input
                      type="tel"
                      required
                      placeholder="0812XXXXXXXX"
                      value={whatsappInput}
                      onChange={(e) => setWhatsappInput(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#eadecb] bg-white focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                </>
              )}

              {authTab === "login" && (
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-neutral-400">Surel (Email) / No. WhatsApp</label>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan email atau nomor WhatsApp"
                    value={identityInput}
                    onChange={(e) => setIdentityInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#eadecb] bg-white focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold tracking-wider text-neutral-400">Kata Sandi (Password)</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#eadecb] bg-white focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-neutral-950 hover:bg-neutral-900 disabled:bg-neutral-200 text-white font-bold uppercase tracking-widest rounded-full transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {authTab === "register" ? "Daftar Akun Baru" : "Masuk Akun"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
              {/* Premium In-app Toast / Notification Alert for OTP */}
              {otpAlert && (
                <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-2 ${
                  otpAlert.type === "success" 
                    ? "bg-emerald-50/80 border-emerald-200/50 text-emerald-800" 
                    : otpAlert.type === "warning"
                    ? "bg-amber-50/80 border-amber-200/50 text-amber-800"
                    : "bg-[#faf8f5] border-[#eadecb] text-neutral-700"
                }`}>
                  <div className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-[9px]">
                    <Shield className="w-3.5 h-3.5 flex-shrink-0 text-gold" />
                    {otpAlert.title}
                  </div>
                  <p>{otpAlert.message}</p>
                  {otpAlert.code && (
                    <div className="mt-2.5 p-2 bg-white border border-neutral-100 rounded-xl flex items-center justify-between">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-neutral-400">Kode OTP Simulasi:</span>
                      <span className="font-mono font-black text-sm tracking-widest text-neutral-950 bg-neutral-100 px-3 py-1 rounded-md">{otpAlert.code}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold tracking-wider text-neutral-400">Kode Verifikasi OTP</label>
                <input
                  type="text"
                  required
                  maxLength={8}
                  placeholder="••••••••"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full text-center tracking-[0.6em] text-lg font-bold px-4 py-2.5 rounded-xl border border-[#eadecb] bg-white focus:outline-none focus:border-gold"
                />
                <p className="text-[9px] text-neutral-400 text-center mt-1 leading-normal">
                  Masukkan kode simulasi (4 digit), kode OTP asli (6/8 digit) dari email, atau klik langsung tombol <strong>&quot;Confirm email address&quot;</strong> di email yang Anda terima untuk masuk secara otomatis.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-neutral-950 hover:bg-neutral-900 disabled:bg-neutral-200 text-white font-bold uppercase tracking-widest rounded-full transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Verifikasi & Masuk Akun"
                )}
              </button>

              <button
                type="button"
                onClick={resendOtp}
                className="w-full text-center text-[10px] text-neutral-400 hover:text-neutral-950 font-bold uppercase tracking-wider mt-2 transition-colors cursor-pointer"
              >
                Kirim Ulang Kode OTP
              </button>
            </form>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[9px] text-neutral-400 pt-2 border-t border-neutral-100/50">
            <Lock className="w-3.5 h-3.5" />
            <span>Sesi terenkripsi aman secara lokal.</span>
          </div>

        </div>
      </div>
    );
  }

  // 2. If authenticated, display dashboard
  const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-[#fdfcf9] py-16 px-6 luxury-pattern">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* User Card Header */}
        <div className="bg-white/70 backdrop-blur-md border border-[#eadecb] p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm luxury-border">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-neutral-950 border border-neutral-800 text-white flex items-center justify-center font-serif text-2xl font-light">
              {avatarLetter}
            </div>
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h2 className="font-serif text-xl font-bold text-neutral-950">{user?.name}</h2>
                <span className="bg-[#f4ead4] text-[#c3a475] text-[8px] uppercase tracking-widest font-sans font-bold px-2.5 py-0.5 rounded-full border border-[#c3a475]/30">
                  Royal Member
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-sans">
                {user?.email || user?.phone}
              </p>
              <p className="text-[9px] text-neutral-400 uppercase tracking-widest">
                Akun Terverifikasi OTP
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 text-xs font-semibold rounded-full transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Keluar Akun
          </button>
        </div>

        {/* Dashboard Tabs & Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

          {/* Left Tabs Menu Column */}
          <div className="md:col-span-3 space-y-2">
            {[
              { id: "subscription", label: "Langganan Aktif", icon: RefreshCw },
              { id: "orders", label: "Riwayat Pesanan", icon: ShoppingBag },
              { id: "address", label: "Alamat Pengiriman", icon: MapPin }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-left transition-all cursor-pointer ${
                    isActive
                      ? "bg-neutral-950 text-white shadow-sm"
                      : "bg-white/50 text-neutral-400 hover:bg-white hover:text-neutral-900 border border-[#eadecb]/30"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Right Sub-Content Column */}
          <div className="md:col-span-9 bg-white/70 backdrop-blur-md border border-[#eadecb] p-6 rounded-3xl shadow-sm luxury-border">

            {activeSubTab === "subscription" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-lg font-bold text-neutral-950">Langganan Replenishment Anda</h3>
                  <p className="text-[10px] text-neutral-400 font-sans mt-0.5">Kelola jadwal pengiriman kosmetik berkala Anda tanpa ribet.</p>
                </div>

                {subscriptions.length === 0 ? (
                  <div className="text-center py-10 bg-white/40 border border-dashed border-[#eadecb] rounded-2xl text-xs text-neutral-400 font-sans">
                    Belum ada langganan aktif.
                  </div>
                ) : (
                  subscriptions.map((sub) => (
                    <div key={sub.id} className="border border-[#eadecb] p-5 rounded-2xl space-y-4 bg-[#fdfcf9] luxury-border">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`text-[8px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                            sub.status === "Aktif" 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200/50" 
                              : "bg-neutral-100 text-neutral-500 border-neutral-200/50"
                          }`}>
                            {sub.status}
                          </span>
                          <h4 className="font-serif font-bold text-base text-neutral-950 mt-2">{sub.productName}</h4>
                          <p className="text-[10px] text-neutral-400 font-sans mt-1">ID Langganan: {sub.id}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-serif font-bold text-sm text-neutral-950 block">{formatRupiah(sub.price)}</span>
                          <span className="text-[9px] text-neutral-400 font-sans mt-0.5 block">Per {sub.frequency}</span>
                        </div>
                      </div>

                      <div className="border-t border-[#eadecb]/40 pt-4 flex flex-wrap gap-4 justify-between items-center text-xs">
                        <div>
                          <span className="text-neutral-400 font-sans block">Pengiriman Berikutnya:</span>
                          <span className="font-bold text-neutral-800">{sub.status === "Dibatalkan" ? "-" : sub.nextShipDate}</span>
                        </div>

                        <div className="flex gap-2">
                          {sub.status === "Aktif" && (
                            <>
                              <button
                                onClick={() => handleCancelSubscription(sub.id)}
                                className="px-3.5 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 text-[10px] font-bold uppercase rounded-full transition-all cursor-pointer"
                              >
                                Batal Langganan
                              </button>
                              <button className="px-3.5 py-1.5 border border-[#eadecb] hover:border-neutral-900 text-neutral-700 hover:text-neutral-950 text-[10px] font-bold uppercase rounded-full transition-all cursor-pointer">
                                Tunda
                              </button>
                              <button className="px-3.5 py-1.5 bg-neutral-950 hover:bg-neutral-900 text-white text-[10px] font-bold uppercase rounded-full transition-all cursor-pointer">
                                Kirim Sekarang
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeSubTab === "orders" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-lg font-bold text-neutral-950">Riwayat Pesanan</h3>
                  <p className="text-[10px] text-neutral-400 font-sans mt-0.5">Daftar transaksi belanja produk kecantikan NEXAMART Anda.</p>
                </div>

                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-10 bg-white/40 border border-dashed border-[#eadecb] rounded-2xl text-xs text-neutral-400 font-sans">
                      Belum ada riwayat pesanan.
                    </div>
                  ) : (
                    orders.map((ord) => (
                      <div key={ord.id} className="border border-[#eadecb]/60 p-4 rounded-xl flex justify-between items-center bg-[#fdfcf9]/50 text-xs">
                        <div>
                          <div className="flex items-center gap-2 font-sans">
                            <span className="font-bold text-neutral-800">{ord.id}</span>
                            <span className="text-neutral-400">|</span>
                            <span className="text-neutral-400">{ord.date}</span>
                          </div>
                          <p className="text-neutral-500 font-sans mt-1 text-[11px]">{ord.items}</p>
                        </div>

                        <div className="flex items-center gap-4">
                          {(ord.status === "Menunggu Pembayaran" || ord.status === "Sedang Diproses") && (
                            <button
                              onClick={() => handleCancelOrder(ord.id)}
                              className="px-3 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 text-[10px] font-bold uppercase rounded-full transition-all cursor-pointer"
                            >
                              Batal Order
                            </button>
                          )}
                          <div className="text-right space-y-1">
                            <span className="font-serif font-bold text-neutral-950 block">{formatRupiah(ord.total)}</span>
                            <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                              ord.status === "Terkirim"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200/50"
                                : ord.status === "Menunggu Pembayaran"
                                ? "bg-amber-50 text-amber-700 border-amber-200/50"
                                : ord.status === "Sedang Diproses"
                                ? "bg-blue-50 text-blue-700 border-blue-200/50"
                                : "bg-neutral-100 text-neutral-500 border-neutral-200/50"
                            }`}>
                              {ord.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeSubTab === "address" && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-neutral-950">Alamat Pengiriman Utama</h3>
                  <p className="text-[10px] text-neutral-400 font-sans">
                    Atur alamat default agar otomatis terisi saat pengisian checkout.
                  </p>
                </div>

                {addressSuccess && (
                  <div className="p-3.5 bg-green-50 border border-green-100 text-green-700 text-xs rounded-xl font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Alamat utama Anda berhasil disimpan!
                  </div>
                )}

                <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
                  
                  {/* Name Sync */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold tracking-wider text-neutral-400">Nama Penerima Paket</label>
                    <input
                      type="text"
                      required
                      value={user?.name || ""}
                      onChange={(e) => updateProfile({ name: e.target.value })}
                      placeholder="Nama Penerima"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#eadecb]"
                    />
                  </div>

                  {/* Country Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold tracking-wider text-neutral-400">Negara</label>
                    <select
                      required
                      value={selectedCountry}
                      onChange={(e) => {
                        setSelectedCountry(e.target.value);
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#eadecb] bg-white cursor-pointer focus:border-gold"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Province Dropdown */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold tracking-wider text-neutral-400">
                        {selectedCountry === "Indonesia" ? "Provinsi" : "Negara Bagian / Wilayah"}
                      </label>
                      <select
                        required
                        value={selectedProvinceId}
                        onChange={(e) => {
                          setSelectedProvinceId(e.target.value);
                          setSelectedCityId("");
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#eadecb] bg-white cursor-pointer focus:border-gold"
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

                    {/* City Dropdown */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold tracking-wider text-neutral-400">Kota / Kabupaten</label>
                      <select
                        required
                        disabled={!selectedProvinceId}
                        value={selectedCityId}
                        onChange={(e) => setSelectedCityId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#eadecb] bg-white disabled:bg-neutral-50 disabled:text-neutral-400 cursor-pointer focus:border-gold"
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
                    {/* District (Kecamatan) Dropdown */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold tracking-wider text-neutral-400">
                        {selectedCountry === "Indonesia" ? "Kecamatan (Data Riil)" : "Kecamatan / Distrik"}
                      </label>
                      <select
                        required
                        disabled={!selectedCityId || districts.length === 0}
                        value={formDistrict}
                        onChange={(e) => setFormDistrict(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#eadecb] bg-white disabled:bg-neutral-50 disabled:text-neutral-400 cursor-pointer focus:border-gold"
                      >
                        {districts.map((d, index) => (
                          <option key={index} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Postal Code */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold tracking-wider text-neutral-400">Kode Pos</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 10310"
                        value={formPostalCode}
                        onChange={(e) => setFormPostalCode(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#eadecb]"
                      />
                    </div>
                  </div>

                  {/* Detailed Street Address */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold tracking-wider text-neutral-400">Alamat Lengkap & Nama Jalan</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Contoh: Jalan Menteng Raya No. 12A, RT 01 / RW 03 (Dekat Kedai Kopi)"
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#eadecb] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAddressSaving}
                    className="px-6 py-3 bg-neutral-950 hover:bg-neutral-900 disabled:bg-neutral-200 text-white font-bold uppercase text-[10px] tracking-wider rounded-full transition-all cursor-pointer shadow-sm flex items-center gap-2"
                  >
                    {isAddressSaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      "Simpan Alamat"
                    )}
                  </button>

                </form>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
