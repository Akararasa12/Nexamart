"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, LayoutDashboard, ShoppingBag, RefreshCw, Database, 
  ArrowRight, Check, X, LogOut, Loader2, Plus, 
  Trash2, Edit, Save, AlertTriangle, Eye, ShieldAlert, BarChart3, 
  TrendingUp, Calendar, Search, Filter, HelpCircle
} from "lucide-react";
import Link from "next/link";

// Types
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variant: string | null;
  isSubscription: boolean;
  subscriptionFrequency: string | null;
}

interface ShippingAddress {
  name: string;
  phone: string;
  email?: string;
  address: string;
  province: string;
  city: string;
  city_id: string;
  postal_code: string;
  shipping_cost: number;
  shipping_service: string;
  items: OrderItem[];
}

interface Order {
  id: string;
  user_id: string | null;
  total_amount: number;
  payment_status: string;
  shipping_status: string;
  tracking_number: string | null;
  shipping_address: ShippingAddress;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  images: string[];
}

interface Subscription {
  id: string;
  user_id: string | null;
  product_id: string;
  frequency: string;
  next_billing_date: string;
  status: string;
  created_at: string;
  products?: Product | null;
}

interface Knowledge {
  id: string;
  content: string;
  metadata: {
    category?: string;
    product_name?: string;
    [key: string]: unknown;
  };
  created_at: string;
}

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  failedOrders: number;
  activeSubscriptions: number;
  totalSubscriptions: number;
  salesHistory: Array<{ date: string; revenue: number }>;
  recentOrders: Order[];
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [authToken, setAuthToken] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "subscriptions" | "knowledge">("overview");

  // Loading States
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(true);
  const [isOrdersLoading, setIsOrdersLoading] = useState<boolean>(true);
  const [isSubsLoading, setIsSubsLoading] = useState<boolean>(true);
  const [isKnowledgeLoading, setIsKnowledgeLoading] = useState<boolean>(true);

  // Data States
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [knowledgeList, setKnowledgeList] = useState<Knowledge[]>([]);

  // Search & Filter States
  const [orderSearch, setOrderSearch] = useState<string>("");
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<string>("all");
  const [orderShippingFilter, setOrderShippingFilter] = useState<string>("all");
  
  const [subSearch, setSubSearch] = useState<string>("");
  const [subStatusFilter, setSubStatusFilter] = useState<string>("all");

  const [knowledgeSearch, setKnowledgeSearch] = useState<string>("");
  const [knowledgeCategoryFilter, setKnowledgeCategoryFilter] = useState<string>("all");

  // Selected details / Modals
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdateOrderLoading, setIsUpdateOrderLoading] = useState<boolean>(false);
  
  // Knowledge Form Modal States
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState<boolean>(false);
  const [knowledgeForm, setKnowledgeForm] = useState<{
    id?: string;
    content: string;
    category: string;
  }>({ content: "", category: "products" });
  const [isKnowledgeSubmitting, setIsKnowledgeSubmitting] = useState<boolean>(false);

  // Action status message
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Check login on load
  useEffect(() => {
    const savedToken = localStorage.getItem("nexa_admin_token");
    if (savedToken) {
      setAuthToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);



  // Alert message auto-close
  useEffect(() => {
    if (actionMessage) {
      const timer = setTimeout(() => setActionMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [actionMessage]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    setIsAuthLoading(true);
    setAuthError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Password salah");
      }

      localStorage.setItem("nexa_admin_token", data.token);
      setAuthToken(data.token);
      setIsAuthenticated(true);
      setActionMessage({ type: "success", text: "Login berhasil. Selamat datang di NEXAMART Admin." });
    } catch (err: unknown) {
      const error = err as Error;
      setAuthError(error.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("nexa_admin_token");
    setAuthToken("");
    setIsAuthenticated(false);
    setPasswordInput("");
    setActionMessage({ type: "success", text: "Berhasil keluar dari admin." });
  };

  // FETCH CALLS
  const fetchStats = async () => {
    setIsStatsLoading(true);
    try {
      const res = await fetch("/api/admin/stats", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setIsStatsLoading(false);
    }
  };

  const fetchOrders = async () => {
    setIsOrdersLoading(true);
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    setIsSubsLoading(true);
    try {
      const res = await fetch("/api/admin/subscriptions", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSubscriptions(data.subscriptions || []);
      }
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
    } finally {
      setIsSubsLoading(false);
    }
  };

  const fetchKnowledge = async () => {
    setIsKnowledgeLoading(true);
    try {
      const res = await fetch("/api/admin/knowledge", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        setKnowledgeList(data.knowledge || []);
      }
    } catch (err) {
      console.error("Error fetching knowledge:", err);
    } finally {
      setIsKnowledgeLoading(false);
    }
  };

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchOrders();
      fetchSubscriptions();
      fetchKnowledge();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authToken]);

  // ORDER ACTIONS
  const handleUpdateOrderStatus = async (orderId: string, updates: { payment_status?: string; shipping_status?: string; tracking_number?: string | null }) => {
    setIsUpdateOrderLoading(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ id: orderId, ...updates })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui pesanan");

      setActionMessage({ type: "success", text: "Status pesanan berhasil diperbarui!" });
      
      // Update local states
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, ...updates } : null);
      }
      fetchStats(); // Refresh stats dashboard
    } catch (err: unknown) {
      const error = err as Error;
      setActionMessage({ type: "error", text: error.message });
    } finally {
      setIsUpdateOrderLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data pesanan ini secara permanen dari database?")) return;

    try {
      const res = await fetch(`/api/admin/orders?id=${orderId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${authToken}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menghapus pesanan");
      }

      setActionMessage({ type: "success", text: `Pesanan ${orderId} berhasil dihapus.` });
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setSelectedOrder(null);
      fetchStats();
    } catch (err: unknown) {
      const error = err as Error;
      setActionMessage({ type: "error", text: error.message });
    }
  };

  // SUBSCRIPTION ACTIONS
  const handleUpdateSubStatus = async (subId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ id: subId, status })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui langganan");

      setActionMessage({ type: "success", text: `Status langganan berhasil diubah menjadi ${status}` });
      setSubscriptions(prev => prev.map(s => s.id === subId ? { ...s, status } : s));
      fetchStats();
    } catch (err: unknown) {
      const error = err as Error;
      setActionMessage({ type: "error", text: error.message });
    }
  };

  const handleDeleteSub = async (subId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus langganan ini? Tindakan ini akan menghentikan pengiriman otomatis.")) return;

    try {
      const res = await fetch(`/api/admin/subscriptions?id=${subId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${authToken}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menghapus langganan");
      }

      setActionMessage({ type: "success", text: "Langganan berhasil dihapus." });
      setSubscriptions(prev => prev.filter(s => s.id !== subId));
      fetchStats();
    } catch (err: unknown) {
      const error = err as Error;
      setActionMessage({ type: "error", text: error.message });
    }
  };

  // KNOWLEDGE ACTIONS (RAG)
  const handleKnowledgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!knowledgeForm.content.trim()) return;

    setIsKnowledgeSubmitting(true);
    try {
      const isEdit = !!knowledgeForm.id;
      const url = "/api/admin/knowledge";
      const method = isEdit ? "PUT" : "POST";
      
      const payload = {
        id: knowledgeForm.id,
        content: knowledgeForm.content,
        metadata: { category: knowledgeForm.category }
      };

      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan basis pengetahuan");

      setActionMessage({ 
        type: "success", 
        text: isEdit ? "Blok pengetahuan berhasil diperbarui!" : "Blok pengetahuan berhasil dibuat & di-vektorisasi!" 
      });

      setIsKnowledgeModalOpen(false);
      setKnowledgeForm({ content: "", category: "products" });
      fetchKnowledge(); // Reload knowledge base list
    } catch (err: unknown) {
      const error = err as Error;
      setActionMessage({ type: "error", text: error.message });
    } finally {
      setIsKnowledgeSubmitting(false);
    }
  };

  const handleEditKnowledgeClick = (k: Knowledge) => {
    setKnowledgeForm({
      id: k.id,
      content: k.content,
      category: k.metadata?.category || "products"
    });
    setIsKnowledgeModalOpen(true);
  };

  const handleDeleteKnowledge = async (kId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus segmen informasi ini dari RAG AI? Bot tidak akan dapat menjawab hal ini lagi.")) return;

    try {
      const res = await fetch(`/api/admin/knowledge?id=${kId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${authToken}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menghapus basis pengetahuan");
      }

      setActionMessage({ type: "success", text: "Blok pengetahuan AI berhasil dihapus." });
      setKnowledgeList(prev => prev.filter(k => k.id !== kId));
    } catch (err: unknown) {
      const error = err as Error;
      setActionMessage({ type: "error", text: error.message });
    }
  };

  // Helper formatting currency
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  // Helper formatting dates
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // FILTER LOGIC
  const filteredOrders = orders.filter((o) => {
    // Search
    const matchesSearch = 
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.shipping_address?.name || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.shipping_address?.phone || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.shipping_address?.email || "").toLowerCase().includes(orderSearch.toLowerCase());

    // Payment Status Filter
    let matchesPayment = true;
    if (orderPaymentFilter === "paid") {
      matchesPayment = ["settlement", "capture", "paid"].includes(o.payment_status?.toLowerCase());
    } else if (orderPaymentFilter === "pending") {
      matchesPayment = o.payment_status?.toLowerCase() === "pending";
    } else if (orderPaymentFilter === "failed") {
      matchesPayment = ["failed", "expire", "deny"].includes(o.payment_status?.toLowerCase());
    }

    // Shipping Status Filter
    let matchesShipping = true;
    if (orderShippingFilter !== "all") {
      matchesShipping = o.shipping_status?.toLowerCase() === orderShippingFilter;
    }

    return matchesSearch && matchesPayment && matchesShipping;
  });

  const filteredSubs = subscriptions.filter((s) => {
    const productName = s.products?.name || "Langganan Produk";
    const matchesSearch = 
      s.id.toLowerCase().includes(subSearch.toLowerCase()) ||
      productName.toLowerCase().includes(subSearch.toLowerCase()) ||
      (s.user_id || "").toLowerCase().includes(subSearch.toLowerCase());

    let matchesStatus = true;
    if (subStatusFilter !== "all") {
      matchesStatus = s.status?.toLowerCase() === subStatusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  const filteredKnowledge = knowledgeList.filter((k) => {
    const matchesSearch = k.content.toLowerCase().includes(knowledgeSearch.toLowerCase());
    
    let matchesCategory = true;
    if (knowledgeCategoryFilter !== "all") {
      matchesCategory = (k.metadata?.category || "").toLowerCase() === knowledgeCategoryFilter;
    }

    return matchesSearch && matchesCategory;
  });

  // RENDER LOGIN OVERLAY
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen luxury-pattern flex flex-col justify-center items-center px-4 font-sans selection:bg-neutral-950 selection:text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white p-8 md:p-10 border border-[#eadecb] rounded-3xl shadow-[0_15px_40px_rgba(28,26,23,0.05)] luxury-border"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#f6f3ed] mb-4 text-[#c3a475]">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-2xl uppercase tracking-[0.2em] text-[#1c1a17]">
              NEXAMART ADMIN
            </h1>
            <p className="text-xs text-neutral-400 mt-2 uppercase tracking-widest">
              Portal Keamanan Administratif
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-2">
                Kata Sandi Admin
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Masukkan kata sandi..."
                className="w-full px-5 py-4 border border-[#eadecb] rounded-xl text-neutral-800 text-sm focus:border-[#c3a475] bg-[#fdfcf9] placeholder-neutral-300 tracking-widest font-semibold"
                disabled={isAuthLoading}
                required
              />
            </div>

            {authError && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-xs font-medium border border-red-100"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-full py-4 bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl font-semibold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:bg-neutral-300"
            >
              {isAuthLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                <>
                  Masuk Sistem
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link 
              href="/" 
              className="text-xs text-neutral-400 hover:text-neutral-950 transition-colors uppercase tracking-widest font-semibold"
            >
              Kembali ke Toko
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfcf9] font-sans selection:bg-neutral-950 selection:text-white pb-16">
      
      {/* 1. TOP HEADER NAVIGATION */}
      <header className="border-b border-[#eadecb]/50 bg-white/70 backdrop-blur-md sticky top-0 z-30 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-serif text-xl font-light tracking-[0.2em] text-[#1c1a17] uppercase hover:opacity-80">
              NEXAMART
            </Link>
            <span className="w-1.5 h-1.5 rounded-full bg-[#c3a475]" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#c3a475] bg-[#f6f3ed] px-3 py-1 rounded-full border border-[#eadecb]/30">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="hidden md:inline-flex text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-950 transition-colors border border-neutral-200 px-4 py-2.5 rounded-full bg-[#fdfcf9]"
            >
              Kunjungi Toko
            </Link>
            
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-950 text-white rounded-full hover:bg-neutral-900 transition-colors text-[10px] font-bold uppercase tracking-widest cursor-pointer shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* ACTION / NOTIFICATION TOAST */}
        <AnimatePresence>
          {actionMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`mb-6 p-4 rounded-xl border flex items-center justify-between text-xs font-semibold uppercase tracking-wider ${
                actionMessage.type === "success" 
                  ? "bg-green-50 text-green-700 border-green-200" 
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {actionMessage.type === "success" ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{actionMessage.text}</span>
              </div>
              <button onClick={() => setActionMessage(null)} className="hover:opacity-60 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. NAVIGATION TABS */}
        <div className="flex border-b border-[#eadecb] gap-8 mb-8 overflow-x-auto no-scrollbar">
          {[
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "orders", label: "Orders", icon: ShoppingBag },
            { id: "subscriptions", label: "Subscriptions", icon: RefreshCw },
            { id: "knowledge", label: "AI Knowledge", icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "overview" | "orders" | "subscriptions" | "knowledge")}
                className={`flex items-center gap-2 pb-4 text-xs font-bold uppercase tracking-widest transition-all relative cursor-pointer outline-none ${
                  isActive ? "text-neutral-950 font-extrabold" : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#c3a475]" : "text-neutral-400"}`} />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="active-admin-tab-bar"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c3a475]"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* 3. TABS CONTENT */}
        <AnimatePresence mode="wait">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <motion.div
              key="overview-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {isStatsLoading ? (
                <div className="py-20 flex justify-center items-center">
                  <Loader2 className="w-10 h-10 animate-spin text-[#c3a475]" />
                </div>
              ) : stats ? (
                <>
                  {/* Grid Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white border border-[#eadecb] p-6 rounded-2xl luxury-card relative overflow-hidden">
                      <div className="flex justify-between items-start text-[#c3a475] mb-4">
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-[10px] font-bold bg-[#f6f3ed] px-2 py-0.5 rounded-full border border-[#eadecb]/40">PENDAPATAN</span>
                      </div>
                      <h3 className="font-serif text-2xl font-light text-[#1c1a17] tracking-wide">
                        {formatIDR(stats.totalSales)}
                      </h3>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-2">
                        Total omset transaksi sukses
                      </p>
                    </div>

                    <div className="bg-white border border-[#eadecb] p-6 rounded-2xl luxury-card relative overflow-hidden">
                      <div className="flex justify-between items-start text-neutral-500 mb-4">
                        <ShoppingBag className="w-5 h-5" />
                        <span className="text-[10px] font-bold bg-neutral-100 px-2 py-0.5 rounded-full">TOTAL PESANAN</span>
                      </div>
                      <h3 className="font-serif text-2xl font-light text-[#1c1a17] tracking-wide">
                        {stats.totalOrders}
                      </h3>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-2">
                        {stats.paidOrders} Lunas • {stats.pendingOrders} Tertunda
                      </p>
                    </div>

                    <div className="bg-white border border-[#eadecb] p-6 rounded-2xl luxury-card relative overflow-hidden">
                      <div className="flex justify-between items-start text-neutral-500 mb-4">
                        <RefreshCw className="w-5 h-5" />
                        <span className="text-[10px] font-bold bg-neutral-100 px-2 py-0.5 rounded-full">LANGGANAN</span>
                      </div>
                      <h3 className="font-serif text-2xl font-light text-[#1c1a17] tracking-wide">
                        {stats.activeSubscriptions}
                      </h3>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-2">
                        Dari total {stats.totalSubscriptions} langganan terdaftar
                      </p>
                    </div>

                    <div className="bg-white border border-[#eadecb] p-6 rounded-2xl luxury-card relative overflow-hidden">
                      <div className="flex justify-between items-start text-neutral-500 mb-4">
                        <BarChart3 className="w-5 h-5" />
                        <span className="text-[10px] font-bold bg-neutral-100 px-2 py-0.5 rounded-full">RASIO SUKSES</span>
                      </div>
                      <h3 className="font-serif text-2xl font-light text-[#1c1a17] tracking-wide">
                        {stats.totalOrders > 0 
                          ? Math.round((stats.paidOrders / stats.totalOrders) * 100) 
                          : 0}%
                      </h3>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-2">
                        {stats.failedOrders} Transaksi gagal/kadaluwarsa
                      </p>
                    </div>
                  </div>

                  {/* Chart & Recent Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Sales Trend Chart */}
                    <div className="bg-white border border-[#eadecb] p-6 rounded-2xl luxury-card lg:col-span-2">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#1c1a17] mb-6 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#c3a475]" />
                        Tren Pendapatan Harian (7 Hari Terakhir)
                      </h4>

                      <div className="h-64 flex items-end justify-between gap-4 pt-4 border-b border-neutral-100">
                        {stats.salesHistory.map((item, index) => {
                          // Find max revenue for height calculation
                          const maxRevenue = Math.max(...stats.salesHistory.map(s => s.revenue), 100000);
                          const pct = (item.revenue / maxRevenue) * 100;
                          
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center h-full justify-end group">
                              {/* Hover Value Pop */}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-neutral-900 text-white text-[9px] px-2 py-1 rounded mb-1 absolute transform -translate-y-12 font-semibold">
                                {formatIDR(item.revenue)}
                              </div>
                              
                              {/* Chart Bar */}
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${Math.max(pct, 4)}%` }}
                                transition={{ delay: index * 0.05, duration: 0.4 }}
                                className={`w-full rounded-t-lg transition-colors cursor-pointer ${
                                  item.revenue > 0 ? "bg-[#c3a475] hover:bg-[#b09163]" : "bg-neutral-100 hover:bg-neutral-200"
                                }`}
                              />

                              {/* Label */}
                              <span className="text-[9px] font-bold text-neutral-400 mt-2 block whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
                                {item.date}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick Stats Summary / Info */}
                    <div className="bg-white border border-[#eadecb] p-6 rounded-2xl luxury-card space-y-6">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#1c1a17] flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-[#c3a475]" />
                        Informasi Gateway
                      </h4>

                      <div className="space-y-4">
                        <div className="border-b border-[#eadecb]/40 pb-3 flex justify-between text-xs">
                          <span className="text-neutral-400 font-medium">Midtrans Environment</span>
                          <span className="font-bold text-green-600 uppercase tracking-wider">Sandbox</span>
                        </div>
                        <div className="border-b border-[#eadecb]/40 pb-3 flex justify-between text-xs">
                          <span className="text-neutral-400 font-medium">RajaOngkir Courier</span>
                          <span className="font-bold text-neutral-800">JNE, POS, TIKI</span>
                        </div>
                        <div className="border-b border-[#eadecb]/40 pb-3 flex justify-between text-xs">
                          <span className="text-neutral-400 font-medium">AI RAG Database</span>
                          <span className="font-bold text-neutral-800">Supabase pgvector</span>
                        </div>
                      </div>

                      <div className="p-4 bg-[#f6f3ed] rounded-xl border border-[#eadecb] text-neutral-600 text-xs leading-relaxed">
                        <p className="font-bold text-[#c3a475] uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5" /> Tips Admin
                        </p>
                        Jika ada pembayaran manual, silakan ubah status pembayaran pesanan ke <strong>Settlement</strong> di tab <strong>Orders</strong> untuk memicu aktivasi pengiriman kurir.
                      </div>
                    </div>
                  </div>

                  {/* Recent 5 Orders list */}
                  <div className="bg-white border border-[#eadecb] rounded-2xl p-6 luxury-card">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#1c1a17] mb-6 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-[#c3a475]" />
                      5 Transaksi Terbaru
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-neutral-100 text-neutral-400 font-bold uppercase tracking-widest text-[9px]">
                            <th className="pb-3">Order ID</th>
                            <th className="pb-3">Tanggal</th>
                            <th className="pb-3">Pelanggan</th>
                            <th className="pb-3">Total</th>
                            <th className="pb-3">Pembayaran</th>
                            <th className="pb-3">Pengiriman</th>
                            <th className="pb-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.recentOrders.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-6 text-center text-neutral-400">
                                Belum ada transaksi tercatat.
                              </td>
                            </tr>
                          ) : (
                            stats.recentOrders.map((o) => (
                              <tr key={o.id} className="border-b border-neutral-50 hover:bg-[#fcfbf9]/60 transition-colors">
                                <td className="py-4 font-mono font-bold text-neutral-900">{o.id}</td>
                                <td className="py-4 text-neutral-500">{formatDate(o.created_at)}</td>
                                <td className="py-4 font-medium">{o.shipping_address?.name || "Guest"}</td>
                                <td className="py-4 font-bold">{formatIDR(o.total_amount)}</td>
                                <td className="py-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                    ["settlement", "capture", "paid"].includes(o.payment_status?.toLowerCase()) 
                                      ? "bg-green-50 text-green-700 border-green-150" 
                                      : o.payment_status?.toLowerCase() === "pending" 
                                      ? "bg-yellow-50 text-yellow-700 border-yellow-150" 
                                      : "bg-red-50 text-red-700 border-red-150"
                                  }`}>
                                    {o.payment_status}
                                  </span>
                                </td>
                                <td className="py-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                    o.shipping_status?.toLowerCase() === "delivered" 
                                      ? "bg-green-100 text-green-800" 
                                      : o.shipping_status?.toLowerCase() === "shipped" 
                                      ? "bg-blue-100 text-blue-800" 
                                      : o.shipping_status?.toLowerCase() === "processing" 
                                      ? "bg-purple-100 text-purple-800" 
                                      : "bg-neutral-100 text-neutral-800"
                                  }`}>
                                    {o.shipping_status}
                                  </span>
                                </td>
                                <td className="py-4 text-right">
                                  <button
                                    onClick={() => {
                                      setSelectedOrder(o);
                                      setActiveTab("orders");
                                    }}
                                    className="p-1.5 hover:bg-[#f6f3ed] rounded-lg transition-colors text-neutral-600 hover:text-neutral-950 font-bold uppercase tracking-widest text-[9px] flex items-center gap-1 ml-auto cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5" /> Detail
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-10 text-center text-neutral-400">Gagal memuat ringkasan data.</div>
              )}
            </motion.div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {activeTab === "orders" && (
            <motion.div
              key="orders-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Filter controls */}
              <div className="bg-white border border-[#eadecb] p-6 rounded-2xl luxury-card flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search */}
                <div className="relative flex-grow max-w-md">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari ID order, nama pelanggan, atau telepon..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-[#eadecb] rounded-xl text-xs bg-[#fdfcf9] placeholder-neutral-400 text-neutral-800 font-medium"
                  />
                </div>

                {/* Dropdown filters */}
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-[#c3a475]" />
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Filter:</span>
                  </div>

                  <select
                    value={orderPaymentFilter}
                    onChange={(e) => setOrderPaymentFilter(e.target.value)}
                    className="px-3 py-2.5 border border-[#eadecb] rounded-xl text-xs bg-[#fdfcf9] text-neutral-800 font-semibold cursor-pointer outline-none"
                  >
                    <option value="all">Semua Pembayaran</option>
                    <option value="paid">Lunas (Paid/Settlement)</option>
                    <option value="pending">Tertunda (Pending)</option>
                    <option value="failed">Gagal/Kadaluwarsa</option>
                  </select>

                  <select
                    value={orderShippingFilter}
                    onChange={(e) => setOrderShippingFilter(e.target.value)}
                    className="px-3 py-2.5 border border-[#eadecb] rounded-xl text-xs bg-[#fdfcf9] text-neutral-800 font-semibold cursor-pointer outline-none"
                  >
                    <option value="all">Semua Pengiriman</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Diproses (Processing)</option>
                    <option value="shipped">Dikirim (Shipped)</option>
                    <option value="delivered">Diterima (Delivered)</option>
                  </select>
                </div>
              </div>

              {/* Order List Table */}
              <div className="bg-white border border-[#eadecb] rounded-2xl p-6 luxury-card overflow-hidden">
                {isOrdersLoading ? (
                  <div className="py-20 flex justify-center items-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#c3a475]" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-100 text-neutral-400 font-bold uppercase tracking-widest text-[9px]">
                          <th className="pb-3">Order ID</th>
                          <th className="pb-3">Tanggal</th>
                          <th className="pb-3">Pelanggan</th>
                          <th className="pb-3">Kurir / Layanan</th>
                          <th className="pb-3">Total Tagihan</th>
                          <th className="pb-3">Pembayaran</th>
                          <th className="pb-3">Pengiriman</th>
                          <th className="pb-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-12 text-center text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                              Tidak ada pesanan yang sesuai dengan filter.
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map((o) => (
                            <tr key={o.id} className="border-b border-neutral-50 hover:bg-[#fcfbf9]/60 transition-colors">
                              <td className="py-4 font-mono font-bold text-neutral-900">{o.id}</td>
                              <td className="py-4 text-neutral-500">{formatDate(o.created_at)}</td>
                              <td className="py-4 font-medium">
                                <div className="font-semibold text-neutral-800">{o.shipping_address?.name || "Guest"}</div>
                                <div className="text-[10px] text-neutral-400 font-normal">{o.shipping_address?.phone || ""}</div>
                              </td>
                              <td className="py-4 font-medium uppercase text-[10px]">
                                <div>{o.shipping_address?.shipping_service || "-"}</div>
                                <div className="text-neutral-400 font-normal lowercase">{formatIDR(o.shipping_address?.shipping_cost || 0)}</div>
                              </td>
                              <td className="py-4 font-bold">{formatIDR(o.total_amount)}</td>
                              <td className="py-4">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                  ["settlement", "capture", "paid"].includes(o.payment_status?.toLowerCase()) 
                                    ? "bg-green-50 text-green-700 border-green-150" 
                                    : o.payment_status?.toLowerCase() === "pending" 
                                    ? "bg-yellow-50 text-yellow-700 border-yellow-150" 
                                    : "bg-red-50 text-red-700 border-red-150"
                                }`}>
                                  {o.payment_status}
                                </span>
                              </td>
                              <td className="py-4">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                  o.shipping_status?.toLowerCase() === "delivered" 
                                    ? "bg-green-100 text-green-800" 
                                    : o.shipping_status?.toLowerCase() === "shipped" 
                                    ? "bg-blue-100 text-blue-800" 
                                    : o.shipping_status?.toLowerCase() === "processing" 
                                    ? "bg-purple-100 text-purple-800" 
                                    : "bg-neutral-100 text-neutral-800"
                                }`}>
                                  {o.shipping_status}
                                </span>
                              </td>
                              <td className="py-4 text-right">
                                <button
                                  onClick={() => setSelectedOrder(o)}
                                  className="px-3 py-1.5 bg-[#f6f3ed] hover:bg-[#eadecb] text-neutral-800 rounded-lg transition-colors font-bold uppercase tracking-widest text-[9px] inline-flex items-center gap-1 cursor-pointer"
                                >
                                  Kelola
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: SUBSCRIPTIONS MANAGEMENT */}
          {activeTab === "subscriptions" && (
            <motion.div
              key="subscriptions-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Filters */}
              <div className="bg-white border border-[#eadecb] p-6 rounded-2xl luxury-card flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-grow max-w-md">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari ID langganan, nama produk, atau ID User..."
                    value={subSearch}
                    onChange={(e) => setSubSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-[#eadecb] rounded-xl text-xs bg-[#fdfcf9] placeholder-neutral-400 text-neutral-800 font-medium"
                  />
                </div>

                <select
                  value={subStatusFilter}
                  onChange={(e) => setSubStatusFilter(e.target.value)}
                  className="px-3 py-2.5 border border-[#eadecb] rounded-xl text-xs bg-[#fdfcf9] text-neutral-800 font-semibold cursor-pointer outline-none"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif (Active)</option>
                  <option value="paused">Dijeda (Paused)</option>
                  <option value="cancelled">Dibatalkan (Cancelled)</option>
                </select>
              </div>

              {/* Subscriptions Grid */}
              <div className="bg-white border border-[#eadecb] rounded-2xl p-6 luxury-card">
                {isSubsLoading ? (
                  <div className="py-20 flex justify-center items-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#c3a475]" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-100 text-neutral-400 font-bold uppercase tracking-widest text-[9px]">
                          <th className="pb-3">ID Langganan</th>
                          <th className="pb-3">Produk</th>
                          <th className="pb-3">Frekuensi</th>
                          <th className="pb-3">Mulai Sejak</th>
                          <th className="pb-3">Billing Berikutnya</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSubs.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                              Tidak ada data langganan yang sesuai.
                            </td>
                          </tr>
                        ) : (
                          filteredSubs.map((s) => {
                            const productName = s.products?.name || "Aura Radiant Essence";
                            const basePrice = s.products?.base_price || 299000;
                            // Subscribe saves 10%
                            const subPrice = Math.round(basePrice * 0.9);
                            
                            return (
                              <tr key={s.id} className="border-b border-neutral-50 hover:bg-[#fcfbf9]/60 transition-colors">
                                <td className="py-4 font-mono font-bold text-neutral-900">{s.id.substring(0, 8)}...</td>
                                <td className="py-4">
                                  <div className="font-semibold text-neutral-800">{productName}</div>
                                  <div className="text-[10px] text-[#c3a475] font-bold">{formatIDR(subPrice)} / botol</div>
                                </td>
                                <td className="py-4 font-medium text-[#c3a475]">
                                  {s.frequency}
                                </td>
                                <td className="py-4 text-neutral-500">{formatDate(s.created_at)}</td>
                                <td className="py-4 font-semibold text-neutral-800">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                                    {formatDate(s.next_billing_date)}
                                  </div>
                                </td>
                                <td className="py-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                    s.status?.toLowerCase() === "active" 
                                      ? "bg-green-50 text-green-700 border border-green-200" 
                                      : s.status?.toLowerCase() === "paused" 
                                      ? "bg-yellow-50 text-yellow-700 border border-yellow-200" 
                                      : "bg-red-50 text-red-700 border border-red-200"
                                  }`}>
                                    {s.status}
                                  </span>
                                </td>
                                <td className="py-4 text-right">
                                  <div className="flex justify-end gap-2">
                                    {s.status === "active" ? (
                                      <button
                                        onClick={() => handleUpdateSubStatus(s.id, "paused")}
                                        className="px-2 py-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 rounded text-[9px] font-bold uppercase tracking-widest cursor-pointer"
                                      >
                                        Jeda
                                      </button>
                                    ) : s.status === "paused" ? (
                                      <button
                                        onClick={() => handleUpdateSubStatus(s.id, "active")}
                                        className="px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded text-[9px] font-bold uppercase tracking-widest cursor-pointer"
                                      >
                                        Aktifkan
                                      </button>
                                    ) : null}

                                    {s.status !== "cancelled" && (
                                      <button
                                        onClick={() => handleUpdateSubStatus(s.id, "cancelled")}
                                        className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded text-[9px] font-bold uppercase tracking-widest cursor-pointer"
                                      >
                                        Batal
                                      </button>
                                    )}

                                    <button
                                      onClick={() => handleDeleteSub(s.id)}
                                      className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors cursor-pointer"
                                      title="Hapus permanen"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 4: AI KNOWLEDGE MANAGEMENT (RAG) */}
          {activeTab === "knowledge" && (
            <motion.div
              key="knowledge-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Header Actions */}
              <div className="bg-white border border-[#eadecb] p-6 rounded-2xl luxury-card flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-grow max-w-md">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari konten teks pengetahuan RAG AI..."
                    value={knowledgeSearch}
                    onChange={(e) => setKnowledgeSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-[#eadecb] rounded-xl text-xs bg-[#fdfcf9] placeholder-neutral-400 text-neutral-800 font-medium"
                  />
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                  <select
                    value={knowledgeCategoryFilter}
                    onChange={(e) => setKnowledgeCategoryFilter(e.target.value)}
                    className="px-3 py-2.5 border border-[#eadecb] rounded-xl text-xs bg-[#fdfcf9] text-neutral-800 font-semibold cursor-pointer outline-none"
                  >
                    <option value="all">Semua Kategori</option>
                    <option value="brand">Brand / Umum</option>
                    <option value="products">Produk (Products)</option>
                    <option value="shipping">Pengiriman (Shipping)</option>
                    <option value="payment">Pembayaran (Payment)</option>
                    <option value="returns">Pengembalian (Returns)</option>
                    <option value="subscriptions">Langganan (Subs)</option>
                    <option value="bundling">Bundling Hemat</option>
                  </select>

                  <button
                    onClick={() => {
                      setKnowledgeForm({ content: "", category: "products" });
                      setIsKnowledgeModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Fakta AI
                  </button>
                </div>
              </div>

              {/* Knowledge Base Grid */}
              {isKnowledgeLoading ? (
                <div className="py-20 flex justify-center items-center bg-white border border-[#eadecb] rounded-2xl luxury-card">
                  <Loader2 className="w-8 h-8 animate-spin text-[#c3a475]" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredKnowledge.length === 0 ? (
                    <div className="col-span-full py-16 text-center bg-white border border-[#eadecb] rounded-2xl luxury-card text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                      Tidak ada rekaman fakta pengetahuan AI yang ditemukan.
                    </div>
                  ) : (
                    filteredKnowledge.map((k) => (
                      <div key={k.id} className="bg-white border border-[#eadecb] p-6 rounded-2xl luxury-card flex flex-col justify-between hover:shadow-md transition-shadow relative">
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <span className="px-2.5 py-1 bg-[#f6f3ed] text-[#c3a475] border border-[#eadecb]/40 rounded-full text-[9px] font-bold uppercase tracking-widest">
                              {k.metadata?.category || "general"}
                            </span>
                            <span className="text-[9px] text-neutral-400 font-bold">
                              {new Date(k.created_at).toLocaleDateString("id-ID")}
                            </span>
                          </div>
                          
                          <p className="text-neutral-700 text-xs leading-relaxed font-sans font-medium whitespace-pre-line">
                            {k.content}
                          </p>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-100">
                          <button
                            onClick={() => handleEditKnowledgeClick(k)}
                            className="p-1.5 hover:bg-[#f6f3ed] text-[#c3a475] rounded transition-colors text-xs font-bold uppercase tracking-widest text-[9px] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" /> Ubah
                          </button>
                          
                          <button
                            onClick={() => handleDeleteKnowledge(k.id)}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors text-xs font-bold uppercase tracking-widest text-[9px] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ============================================================== */}
      {/* 4. MODALS & OVERLAYS */}
      
      {/* ORDER DETAIL MODAL */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl border border-[#eadecb] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] luxury-border"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-[#eadecb]/50 flex justify-between items-center bg-[#fdfcf9]">
                <div>
                  <h3 className="font-serif text-lg text-neutral-900 tracking-wide">
                    Detail Pesanan <span className="font-mono font-bold text-xs text-[#c3a475] ml-1">#{selectedOrder.id}</span>
                  </h3>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">
                    Dibuat pada: {formatDate(selectedOrder.created_at)}
                  </p>
                </div>
                
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-grow text-xs text-neutral-700">
                {/* 2 Column Customer / Shipping */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer details */}
                  <div className="space-y-3 bg-[#fdfcf9] border border-[#eadecb]/50 p-4 rounded-xl">
                    <h5 className="font-bold text-neutral-900 uppercase tracking-widest text-[9px] text-[#c3a475]">
                      Informasi Pelanggan
                    </h5>
                    <div className="space-y-1.5">
                      <div className="flex justify-between"><span className="text-neutral-400">Nama:</span> <span className="font-semibold text-neutral-900">{selectedOrder.shipping_address?.name}</span></div>
                      <div className="flex justify-between"><span className="text-neutral-400">Telepon:</span> <span className="font-semibold text-neutral-900">{selectedOrder.shipping_address?.phone}</span></div>
                      <div className="flex justify-between"><span className="text-neutral-400">Email:</span> <span className="font-semibold text-neutral-900 lowercase">{selectedOrder.shipping_address?.email || "Guest checkout"}</span></div>
                    </div>
                  </div>

                  {/* Shipping address details */}
                  <div className="space-y-3 bg-[#fdfcf9] border border-[#eadecb]/50 p-4 rounded-xl">
                    <h5 className="font-bold text-neutral-900 uppercase tracking-widest text-[9px] text-[#c3a475]">
                      Alamat Pengiriman & Kurir
                    </h5>
                    <div className="space-y-1.5">
                      <div><span className="text-neutral-400 block mb-0.5">Alamat Lengkap:</span> <span className="font-semibold text-neutral-900 leading-normal block">{selectedOrder.shipping_address?.address}, {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.province}, {selectedOrder.shipping_address?.postal_code}</span></div>
                      <div className="flex justify-between"><span className="text-neutral-400">Kurir Servis:</span> <span className="font-semibold text-neutral-900 uppercase">{selectedOrder.shipping_address?.shipping_service}</span></div>
                      <div className="flex justify-between"><span className="text-neutral-400">Ongkos Kirim:</span> <span className="font-semibold text-neutral-900">{formatIDR(selectedOrder.shipping_address?.shipping_cost)}</span></div>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="space-y-3">
                  <h5 className="font-bold text-neutral-900 uppercase tracking-widest text-[9px]">
                    Item Belanja ({selectedOrder.shipping_address?.items?.length || 0})
                  </h5>
                  <div className="border border-neutral-100 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-neutral-50 text-neutral-400 font-bold uppercase tracking-widest text-[8px] border-b border-neutral-100">
                          <th className="p-3">Nama Produk</th>
                          <th className="p-3 text-center">Qty</th>
                          <th className="p-3 text-right">Harga Satuan</th>
                          <th className="p-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.shipping_address?.items?.map((item, idx) => (
                          <tr key={idx} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                            <td className="p-3">
                              <div className="font-semibold text-neutral-800">{item.name}</div>
                              {item.variant && <div className="text-[10px] text-neutral-400">Varian: {item.variant}</div>}
                              {item.isSubscription && (
                                <div className="text-[9px] text-[#c3a475] font-bold mt-0.5 uppercase tracking-wide">
                                  Langganan ({item.subscriptionFrequency}) • Hemat 10%
                                </div>
                              )}
                            </td>
                            <td className="p-3 text-center font-medium">{item.quantity}</td>
                            <td className="p-3 text-right font-medium">{formatIDR(item.price)}</td>
                            <td className="p-3 text-right font-bold text-neutral-900">
                              {formatIDR(item.price * item.quantity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Final invoice summary */}
                  <div className="flex justify-between items-center py-2 px-3 bg-neutral-900 text-white rounded-xl mt-3 font-semibold">
                    <span className="text-[10px] uppercase tracking-wider font-bold">Total Pembayaran</span>
                    <span className="text-sm font-serif font-light tracking-wide">{formatIDR(selectedOrder.total_amount)}</span>
                  </div>
                </div>

                {/* Status Update Actions */}
                <div className="border-t border-neutral-100 pt-6 space-y-4">
                  <h5 className="font-bold text-[#c3a475] uppercase tracking-widest text-[9px] mb-3">
                    Modifikasi Status Administratif
                  </h5>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Payment Status modification */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Status Pembayaran
                      </label>
                      <select
                        value={selectedOrder.payment_status}
                        onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, { payment_status: e.target.value })}
                        disabled={isUpdateOrderLoading}
                        className="w-full px-3 py-2.5 border border-[#eadecb] rounded-xl font-semibold cursor-pointer outline-none bg-[#fdfcf9] text-xs text-neutral-800"
                      >
                        <option value="pending">Pending (Belum Dibayar)</option>
                        <option value="settlement">Settlement (Lunas)</option>
                        <option value="capture">Capture (Lunas Kredit)</option>
                        <option value="paid">Paid (Manual Lunas)</option>
                        <option value="expire">Expire (Kadaluwarsa)</option>
                        <option value="deny">Deny (Ditolak)</option>
                        <option value="failed">Failed (Gagal)</option>
                      </select>
                    </div>

                    {/* Shipping status modification */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Status Pengiriman
                      </label>
                      <select
                        value={selectedOrder.shipping_status}
                        onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, { shipping_status: e.target.value })}
                        disabled={isUpdateOrderLoading}
                        className="w-full px-3 py-2.5 border border-[#eadecb] rounded-xl font-semibold cursor-pointer outline-none bg-[#fdfcf9] text-xs text-neutral-800"
                      >
                        <option value="pending">Pending (Menunggu Pembayaran)</option>
                        <option value="processing">Processing (Sedang Dikemas)</option>
                        <option value="shipped">Shipped (Sedang Dikirim)</option>
                        <option value="delivered">Delivered (Telah Diterima)</option>
                      </select>
                    </div>
                  </div>

                  {/* Tracking Number Input */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                      Nomor Resi Pengiriman (Tracking Number)
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Masukkan nomor resi kurir..."
                        defaultValue={selectedOrder.tracking_number || ""}
                        onBlur={(e) => handleUpdateOrderStatus(selectedOrder.id, { tracking_number: e.target.value || null })}
                        disabled={isUpdateOrderLoading}
                        className="flex-grow px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] text-xs rounded-xl font-medium"
                      />
                      <div className="px-3 py-2.5 bg-neutral-100 border border-neutral-200 rounded-xl text-[9px] font-bold text-neutral-500 uppercase tracking-widest flex items-center justify-center">
                        Auto-Save on blur
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-[#eadecb]/40 bg-[#fdfcf9] flex justify-between">
                <button
                  onClick={() => handleDeleteOrder(selectedOrder.id)}
                  className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Hapus Order
                </button>
                
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-3 bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer shadow-sm"
                >
                  Tutup Detail
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* KNOWLEDGE MODAL (ADD / EDIT) */}
      <AnimatePresence>
        {isKnowledgeModalOpen && (
          <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg border border-[#eadecb] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] luxury-border"
            >
              {/* Header */}
              <div className="p-6 border-b border-[#eadecb]/50 flex justify-between items-center bg-[#fdfcf9]">
                <h3 className="font-serif text-lg text-neutral-900 tracking-wide">
                  {knowledgeForm.id ? "Ubah Fakta RAG AI" : "Tambah Fakta RAG AI Baru"}
                </h3>
                <button 
                  onClick={() => setIsKnowledgeModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleKnowledgeSubmit}>
                <div className="p-6 space-y-6">
                  
                  {/* Category select */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                      Kategori Konten RAG
                    </label>
                    <select
                      value={knowledgeForm.category}
                      onChange={(e) => setKnowledgeForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-3 border border-[#eadecb] bg-[#fdfcf9] rounded-xl text-xs font-semibold cursor-pointer outline-none text-neutral-800"
                    >
                      <option value="brand">Brand / Profil Umum</option>
                      <option value="products">Produk & Bahan (Products/Ingredients)</option>
                      <option value="shipping">Pengiriman & Logistik (Shipping)</option>
                      <option value="payment">Metode Pembayaran (Payment)</option>
                      <option value="returns">Kebijakan Pengembalian (Returns/Refund)</option>
                      <option value="subscriptions">Langganan & Save (Subscriptions)</option>
                      <option value="bundling">Paket Bundling Hemat</option>
                    </select>
                  </div>

                  {/* Content textarea */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                      Konten Informasi / Fakta Tertulis
                    </label>
                    <textarea
                      value={knowledgeForm.content}
                      onChange={(e) => setKnowledgeForm(prev => ({ ...prev, content: e.target.value }))}
                      rows={6}
                      placeholder="Masukkan deskripsi produk secara detail, kebijakan pengembalian, detail tarif ongkos kirim, dsb. Teks ini akan di-vektorisasi agar AI Chatbot dapat memahaminya..."
                      className="w-full px-4 py-3 border border-[#eadecb] bg-[#fdfcf9] text-xs rounded-xl font-medium leading-relaxed"
                      required
                    />
                  </div>

                  <div className="p-4 bg-[#f6f3ed] rounded-xl border border-[#eadecb] text-[11px] text-neutral-600 leading-normal flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#c3a475] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-neutral-800 block mb-0.5">Penjelasan Vektorisasi:</span>
                      Menyimpan atau mengubah fakta ini akan memicu pembuatan embedding 1536-dimensi. Chatbot AI toko akan langsung mengupdate basis pengetahuannya secara instan dan dapat menjawab pertanyaan pembeli berdasarkan teks ini.
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[#eadecb]/40 bg-[#fdfcf9] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsKnowledgeModalOpen(false)}
                    className="px-5 py-3 border border-[#eadecb] rounded-xl text-[10px] font-bold uppercase tracking-widest text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isKnowledgeSubmitting}
                    className="px-6 py-3 bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    {isKnowledgeSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menyimpan & Embedding...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Simpan Informasi
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
