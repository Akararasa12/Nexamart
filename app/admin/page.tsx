"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, LayoutDashboard, ShoppingBag, RefreshCw, Database, 
  ArrowRight, Check, X, LogOut, Loader2, Plus, 
  Trash2, Edit, Save, AlertTriangle, Eye, ShieldAlert, BarChart3, 
  TrendingUp, Calendar, Search, Filter, HelpCircle,
  Package, BookOpen, Tag, MessageSquare, Download, Printer,
  Globe, Mail, Users, Smartphone, Copy, ExternalLink, History, Paperclip,
  Sparkles
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

interface ProductAttributes {
  category?: string;
  tags?: string[];
  ingredients?: string;
  howToUse?: string;
  rating?: number;
  reviewsCount?: number;
  reviews?: Array<{
    name: string;
    rating: number;
    date: string;
    text: string;
  }>;
  [key: string]: unknown;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  description?: string;
  images: string[];
  attributes?: ProductAttributes;
  product_variants?: Array<{
    id: string;
    sku: string;
    price: number;
    stock: number;
  }>;
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

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_purchase: number;
  active: boolean;
  created_at: string;
}

interface Journal {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  read_time: string;
  author: string;
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
  const [usernameInput, setUsernameInput] = useState<string>("owner");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [authToken, setAuthToken] = useState<string>("");
  const [adminUsername, setAdminUsername] = useState<string>("");
  const [adminRole, setAdminRole] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "orders" | "subscriptions" | "products" | "jurnal" | "coupons" | "landing_pages" | "marketing_blast" | "root_access" | "knowledge" | "chatbot" | "spreadsheets"
  >("overview");

  // Root Access & Accounts & Logs States
  const [adminAccountsList, setAdminAccountsList] = useState<any[]>([]);
  const [isAdminAccountsLoading, setIsAdminAccountsLoading] = useState<boolean>(false);
  const [adminLogsList, setAdminLogsList] = useState<any[]>([]);
  const [isAdminLogsLoading, setIsAdminLogsLoading] = useState<boolean>(false);
  const [newAccUsername, setNewAccUsername] = useState<string>("");
  const [newAccRole, setNewAccRole] = useState<"Owner" | "Admin" | "Manager">("Admin");
  const [newAccPassword, setNewAccPassword] = useState<string>("");
  const [isAccSubmitting, setIsAccSubmitting] = useState<boolean>(false);

  // Landing Page Builder States
  const [landingPages, setLandingPages] = useState<any[]>([]);
  const [isLpsLoading, setIsLpsLoading] = useState<boolean>(false);
  const [leadsList, setLeadsList] = useState<any[]>([]);
  const [isLeadsLoading, setIsLeadsLoading] = useState<boolean>(false);
  
  // LP Editor Form States
  const [isLpModalOpen, setIsLpModalOpen] = useState<boolean>(false);
  const [lpForm, setLpForm] = useState<{
    id?: string;
    title: string;
    slug: string;
    status: "Draft" | "Published";
    blocks: any[];
  }>({
    title: "",
    slug: "",
    status: "Draft",
    blocks: []
  });
  const [isLpSubmitting, setIsLpSubmitting] = useState<boolean>(false);
  const [lpPreviewMode, setLpPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [leadsSearch, setLeadsSearch] = useState<string>("");

  // Email & WhatsApp Blast States
  const [blastType, setBlastType] = useState<"email" | "whatsapp">("email");
  // Email States
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [emailTemplate, setEmailTemplate] = useState<"promo" | "newsletter" | "discount">("promo");
  const [emailAudience, setEmailAudience] = useState<"all" | "royal" | "active" | "custom">("all");
  const [emailCsvText, setEmailCsvText] = useState<string>("");
  const [emailSendingStatus, setEmailSendingStatus] = useState<"idle" | "sending" | "completed">("idle");
  const [emailProgress, setEmailProgress] = useState<number>(0);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [emailStats, setEmailStats] = useState<any>(null);
  const [emailHistory, setEmailHistory] = useState<any[]>([]);

  // WhatsApp States
  const [waMessage, setWaMessage] = useState<string>("");
  const [waImage, setWaImage] = useState<string>("");
  const [waAudience, setWaAudience] = useState<"all" | "royal" | "active" | "custom">("all");
  const [waCsvText, setWaCsvText] = useState<string>("");
  const [waSendingStatus, setWaSendingStatus] = useState<"idle" | "sending" | "completed">("idle");
  const [waProgress, setWaProgress] = useState<number>(0);
  const [waLogs, setWaLogs] = useState<any[]>([]);
  const [waChatMessages, setWaChatMessages] = useState<any[]>([]);
  const [waHistory, setWaHistory] = useState<any[]>([]);
  const [waStats, setWaStats] = useState<any>(null);

  // Loading States
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(true);
  const [isOrdersLoading, setIsOrdersLoading] = useState<boolean>(true);
  const [isSubsLoading, setIsSubsLoading] = useState<boolean>(true);
  const [isKnowledgeLoading, setIsKnowledgeLoading] = useState<boolean>(true);
  const [isProductsLoading, setIsProductsLoading] = useState<boolean>(true);
  const [isJournalsLoading, setIsJournalsLoading] = useState<boolean>(true);
  const [isCouponsLoading, setIsCouponsLoading] = useState<boolean>(true);

  // Data States
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [knowledgeList, setKnowledgeList] = useState<Knowledge[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [journalsList, setJournalsList] = useState<Journal[]>([]);
  const [couponsList, setCouponsList] = useState<Coupon[]>([]);

  // Search & Filter States
  const [orderSearch, setOrderSearch] = useState<string>("");
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<string>("all");
  const [orderShippingFilter, setOrderShippingFilter] = useState<string>("all");
  
  const [subSearch, setSubSearch] = useState<string>("");
  const [subStatusFilter, setSubStatusFilter] = useState<string>("all");

  const [knowledgeSearch, setKnowledgeSearch] = useState<string>("");
  const [knowledgeCategoryFilter, setKnowledgeCategoryFilter] = useState<string>("all");

  const [productSearch, setProductSearch] = useState<string>("");
  const [journalSearch, setJournalSearch] = useState<string>("");
  const [couponSearch, setCouponSearch] = useState<string>("");

  // Selected details / Modals
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdateOrderLoading, setIsUpdateOrderLoading] = useState<boolean>(false);
  
  // Form Modal States
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState<boolean>(false);
  const [knowledgeForm, setKnowledgeForm] = useState<{
    id?: string;
    content: string;
    category: string;
  }>({ content: "", category: "products" });
  const [isKnowledgeSubmitting, setIsKnowledgeSubmitting] = useState<boolean>(false);

  // Products Form Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [productForm, setProductForm] = useState<{
    id?: string;
    name: string;
    slug: string;
    description: string;
    base_price: number;
    images: string[];
    sku: string;
    price: number;
    stock: number;
    category: string;
    tags: string;
    ingredients: string;
    howToUse: string;
    originalAttributes?: ProductAttributes;
  }>({
    name: "",
    slug: "",
    description: "",
    base_price: 0,
    images: [],
    sku: "",
    price: 0,
    stock: 0,
    category: "Skincare",
    tags: "Skincare",
    ingredients: "",
    howToUse: ""
  });
  const [isProductSubmitting, setIsProductSubmitting] = useState<boolean>(false);

  // Journals Form Modal States
  const [isJournalModalOpen, setIsJournalModalOpen] = useState<boolean>(false);
  const [journalForm, setJournalForm] = useState<{
    id?: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    category: string;
    read_time: string;
    author: string;
  }>({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    category: "Bahan Aktif",
    read_time: "5 Menit Baca",
    author: "dr. Livia W."
  });
  const [isJournalSubmitting, setIsJournalSubmitting] = useState<boolean>(false);

  // Coupons Form Modal States
  const [isCouponModalOpen, setIsCouponModalOpen] = useState<boolean>(false);
  const [couponForm, setCouponForm] = useState<{
    id?: string;
    code: string;
    discount_type: string;
    discount_value: number;
    min_purchase: number;
    active: boolean;
  }>({
    code: "",
    discount_type: "percentage",
    discount_value: 0,
    min_purchase: 0,
    active: true
  });
  const [isCouponSubmitting, setIsCouponSubmitting] = useState<boolean>(false);

  // AI Chatbot States
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    { role: "assistant", content: "Halo Admin! Saya adalah NEXAMART Admin Copilot. Ada yang bisa saya bantu hari ini terkait performa toko, pembuatan kupon promo, draf jurnal kecantikan, atau pengelolaan produk?" }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isChatSending, setIsChatSending] = useState<boolean>(false);

  // Spreadsheet Export States
  const [exporting, setExporting] = useState<Record<string, boolean>>({});

  // Image Upload state
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Action status message
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Check login on load
  useEffect(() => {
    const savedToken = localStorage.getItem("nexa_admin_token");
    const savedUsername = localStorage.getItem("nexa_admin_username");
    const savedRole = localStorage.getItem("nexa_admin_role");
    if (savedToken) {
      setAuthToken(savedToken);
      setAdminUsername(savedUsername || "owner");
      setAdminRole(savedRole || "Owner");
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
        body: JSON.stringify({ 
          username: usernameInput, 
          password: passwordInput 
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Username atau password salah");
      }

      localStorage.setItem("nexa_admin_token", data.token);
      localStorage.setItem("nexa_admin_username", data.username);
      localStorage.setItem("nexa_admin_role", data.role);
      
      setAuthToken(data.token);
      setAdminUsername(data.username);
      setAdminRole(data.role);
      setIsAuthenticated(true);
      setActionMessage({ type: "success", text: `Login berhasil. Selamat datang ${data.username} (${data.role}).` });
    } catch (err: unknown) {
      const error = err as Error;
      setAuthError(error.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("nexa_admin_token");
    localStorage.removeItem("nexa_admin_username");
    localStorage.removeItem("nexa_admin_role");
    setAuthToken("");
    setAdminUsername("");
    setAdminRole("");
    setIsAuthenticated(false);
    setPasswordInput("");
    setActionMessage({ type: "success", text: "Berhasil keluar dari admin." });
  };

  // EXTENDED FETCH CALLS
  const fetchAdminAccounts = async () => {
    setIsAdminAccountsLoading(true);
    try {
      const res = await fetch("/api/admin/accounts", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminAccountsList(data.accounts || []);
      }
    } catch (err) {
      console.error("Error fetching accounts:", err);
    } finally {
      setIsAdminAccountsLoading(false);
    }
  };

  const fetchAdminLogs = async () => {
    setIsAdminLogsLoading(true);
    try {
      const res = await fetch("/api/admin/logs", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminLogsList(data.logs || []);
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setIsAdminLogsLoading(false);
    }
  };

  const fetchLandingPages = async () => {
    setIsLpsLoading(true);
    try {
      const res = await fetch("/api/admin/landing-pages", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLandingPages(data.landingPages || []);
      }
    } catch (err) {
      console.error("Error fetching landing pages:", err);
    } finally {
      setIsLpsLoading(false);
    }
  };

  const fetchLeads = async () => {
    setIsLeadsLoading(true);
    try {
      const res = await fetch("/api/admin/landing-pages/leads", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLeadsList(data.leads || []);
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
    } finally {
      setIsLeadsLoading(false);
    }
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

  const fetchProducts = async () => {
    setIsProductsLoading(true);
    try {
      const res = await fetch("/api/admin/products", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProductsList(data.products || []);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setIsProductsLoading(false);
    }
  };

  const fetchJournals = async () => {
    setIsJournalsLoading(true);
    try {
      const res = await fetch("/api/admin/journals", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        setJournalsList(data.journals || []);
      }
    } catch (err) {
      console.error("Error fetching journals:", err);
    } finally {
      setIsJournalsLoading(false);
    }
  };

  const fetchCoupons = async () => {
    setIsCouponsLoading(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCouponsList(data.coupons || []);
      }
    } catch (err) {
      console.error("Error fetching coupons:", err);
    } finally {
      setIsCouponsLoading(false);
    }
  };

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchOrders();
      fetchSubscriptions();
      fetchKnowledge();
      fetchProducts();
      fetchJournals();
      fetchCoupons();
      fetchAdminAccounts();
      fetchAdminLogs();
      fetchLandingPages();
      fetchLeads();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authToken]);

  // Root Access / Accounts handlers
  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccUsername || !newAccPassword) return;

    setIsAccSubmitting(true);
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          username: newAccUsername,
          role: newAccRole,
          password: newAccPassword
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({ type: "success", text: `Akun admin ${newAccUsername} (${newAccRole}) berhasil disimpan/diperbarui.` });
        setNewAccUsername("");
        setNewAccPassword("");
        fetchAdminAccounts();
        fetchAdminLogs();
      } else {
        setActionMessage({ type: "error", text: data.error || "Gagal menyimpan akun admin." });
      }
    } catch (err) {
      console.error(err);
      setActionMessage({ type: "error", text: "Terjadi kesalahan koneksi saat menyimpan akun." });
    } finally {
      setIsAccSubmitting(false);
    }
  };

  const handleAccountDelete = async (id: string, username: string) => {
    if (id === "1" || username === "owner") {
      setActionMessage({ type: "error", text: "Akun owner utama tidak dapat dihapus." });
      return;
    }
    if (!confirm(`Apakah Anda yakin ingin menghapus akun admin: ${username}?`)) return;

    try {
      const res = await fetch(`/api/admin/accounts?id=${id}&username=${username}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({ type: "success", text: `Akun admin ${username} berhasil dihapus.` });
        fetchAdminAccounts();
        fetchAdminLogs();
      } else {
        setActionMessage({ type: "error", text: data.error || "Gagal menghapus akun." });
      }
    } catch (err) {
      console.error(err);
      setActionMessage({ type: "error", text: "Terjadi kesalahan koneksi saat menghapus akun." });
    }
  };

  // Landing Page Builder handlers
  const addLpBlock = (type: "hero" | "product_spotlight" | "benefits" | "testimonials" | "faq" | "lead_form") => {
    const id = `block-${Math.random().toString(36).substr(2, 9)}`;
    let content = {};
    if (type === "hero") {
      content = {
        title: "Kembalikan Kilau Alami Wajah Anda",
        subtitle: "Formula esens premium untuk memperkuat skin barrier Anda dalam 14 hari.",
        cta_text: "Dapatkan Sekarang",
        bg_gradient: "from-[#faf8f5] to-[#f4ead4]",
        image_url: ""
      };
    } else if (type === "product_spotlight") {
      content = {
        id: "prod-lp-direct",
        name: "Aura Radiant Essence",
        price: 289000,
        image_url: "https://images.unsplash.com/photo-1608248597481-496100c8c836?w=600&auto=format&fit=crop&q=60",
        variant: "Standard",
        title: "Mengapa Memilih Kami?",
        description: "Diformulasikan secara ilmiah untuk menghidrasi kulit secara mendalam dan menyamarkan garis halus.",
        btn_text: "Beli Sekarang (Diskon 10%)"
      };
    } else if (type === "benefits") {
      content = {
        title: "Manfaat Hasil Studi Klinis",
        items: [
          { title: "Mencerahkan 3x Lebih Cepat", desc: "Kandungan aktif menghambat sintesis melanin berlebih secara alami." },
          { title: "Deep Hydration", desc: "Mengunci kelembapan kulit hingga 24 jam dengan kandungan Hyaluronic Acid." },
          { title: "Bebas Paraben & Alkohol", desc: "Sangat aman bagi jenis kulit sensitif, berjerawat, maupun bumil." }
        ]
      };
    } else if (type === "testimonials") {
      content = {
        title: "Apa Kata Pelanggan Setia NEXAMART",
        items: [
          { quote: "Kulit jadi sangat kenyal dan noda hitam memudar hanya dalam waktu 10 hari pemakaian!", author: "Syifa A. (Royal Member)", rating: 5 },
          { quote: "Sensasi esens sangat menenangkan di wajah sensitif. Sangat direkomendasikan dokter kulit saya.", author: "Ratih P.", rating: 5 }
        ]
      };
    } else if (type === "faq") {
      content = {
        title: "Tanya Jawab (FAQ)",
        items: [
          { q: "Apakah produk ini aman untuk bumil & busui?", a: "Ya, formula kami bebas dari paraben, alkohol, pewangi buatan, serta retinoid yang aman bagi ibu hamil & menyusui." },
          { q: "Kapan hasil pemakaian mulai terlihat?", a: "Rata-rata customer kami mendapati kulit terasa lebih lembap instan sejak hari pertama dan kecerahan meningkat dalam 14 hari pemakaian rutin pagi & malam." }
        ]
      };
    } else if (type === "lead_form") {
      content = {
        title: "Konsultasikan Jenis Kulit Anda",
        subtitle: "Dapatkan konsultasi gratis & kupon sampel produk kecantikan eksklusif dengan mengisi formulir di bawah ini.",
        btn_text: "Klaim Konsultasi Gratis"
      };
    }

    setLpForm(prev => ({
      ...prev,
      blocks: [...(prev.blocks || []), { type, id, content }]
    }));
  };

  const removeLpBlock = (id: string) => {
    setLpForm(prev => ({
      ...prev,
      blocks: (prev.blocks || []).filter(b => b.id !== id)
    }));
  };

  const updateLpBlockContent = (id: string, updatedFields: any) => {
    setLpForm(prev => ({
      ...prev,
      blocks: (prev.blocks || []).map(b => {
        if (b.id === id) {
          return { ...b, content: { ...b.content, ...updatedFields } };
        }
        return b;
      })
    }));
  };

  const moveLpBlock = (index: number, direction: "up" | "down") => {
    const blocks = [...(lpForm.blocks || [])];
    if (direction === "up" && index > 0) {
      const temp = blocks[index];
      blocks[index] = blocks[index - 1];
      blocks[index - 1] = temp;
    } else if (direction === "down" && index < blocks.length - 1) {
      const temp = blocks[index];
      blocks[index] = blocks[index + 1];
      blocks[index + 1] = temp;
    }
    setLpForm(prev => ({ ...prev, blocks }));
  };

  const handleLpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lpForm.title || !lpForm.slug) return;

    setIsLpSubmitting(true);
    try {
      const isEdit = !!lpForm.id;
      const res = await fetch("/api/admin/landing-pages", {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(lpForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({
          type: "success",
          text: `Landing page "${lpForm.title}" berhasil ${isEdit ? 'diperbarui' : 'dibuat'}.`
        });
        setIsLpModalOpen(false);
        fetchLandingPages();
        fetchAdminLogs();
      } else {
        setActionMessage({ type: "error", text: data.error || "Gagal menyimpan landing page." });
      }
    } catch (err) {
      console.error(err);
      setActionMessage({ type: "error", text: "Terjadi kesalahan koneksi." });
    } finally {
      setIsLpSubmitting(false);
    }
  };

  const handleLpDelete = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus landing page "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/landing-pages?id=${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({ type: "success", text: `Landing page "${title}" berhasil dihapus.` });
        fetchLandingPages();
        fetchAdminLogs();
      } else {
        setActionMessage({ type: "error", text: data.error || "Gagal menghapus landing page." });
      }
    } catch (err) {
      console.error(err);
      setActionMessage({ type: "error", text: "Terjadi kesalahan koneksi." });
    }
  };

  // Leads export
  const handleExportLeadsCSV = () => {
    if (leadsList.length === 0) return;
    
    const headers = ["ID", "Landing Page Slug", "Nama Lengkap", "WhatsApp", "Email", "Pesan", "Tanggal"];
    const rows = leadsList.map(l => [
      l.id,
      l.lp_slug,
      l.name,
      l.whatsapp,
      l.email || "",
      l.message || "",
      l.created_at
    ]);
    
    const csvContent = [headers, ...rows]
      .map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
      .join("\n");
      
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Email Blast simulated sender
  const handleStartEmailBlast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSubject) return;

    setEmailSendingStatus("sending");
    setEmailProgress(0);
    setEmailLogs([]);
    setEmailStats(null);

    const customers = [
      { name: "Syifa Amelia", email: "syifa.amelia@gmail.com" },
      { name: "Ratih Paramitha", email: "ratih.paramitha@yahoo.com" },
      { name: "Budi Santoso", email: "budi.santoso@outlook.com" },
      { name: "Dewi Lestari", email: "dewi.lestari@gmail.com" },
      { name: "Ahmad Faisal", email: "ahmad.faisal@corp.id" },
      { name: "Citra Kirana", email: "citra.kirana@royalmember.id" }
    ];

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setEmailProgress(currentProgress);

      const customerIndex = Math.floor((currentProgress / 100) * (customers.length - 1));
      const customer = customers[customerIndex];
      
      if (customer) {
        const statuses = [
          `Mengirim email ke ${customer.name} <${customer.email}>...`,
          `✓ Sukses terkirim ke ${customer.name}`,
          currentProgress % 3 === 0 ? `✉ Dibuka oleh ${customer.name}` : null,
          currentProgress % 5 === 0 ? `➔ Klik tautan promo oleh ${customer.name}` : null,
          currentProgress % 9 === 0 ? `🛒 Konversi transaksi oleh ${customer.name}` : null,
        ].filter(Boolean);

        setEmailLogs(prev => [...prev, ...statuses.map(text => ({ text: text!, time: new Date().toLocaleTimeString() }))]);
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        setEmailSendingStatus("completed");
        
        const finalStats = {
          delivered: 100,
          openRate: 72,
          clickRate: 35,
          conversionRate: 12,
          totalSent: emailAudience === "all" ? 420 : emailAudience === "royal" ? 180 : emailAudience === "active" ? 240 : 10
        };
        setEmailStats(finalStats);

        const newCampaign = {
          id: `camp-em-${Date.now()}`,
          subject: emailSubject,
          template: emailTemplate,
          audience: emailAudience,
          sentAt: new Date().toISOString(),
          stats: finalStats
        };
        setEmailHistory(prev => [newCampaign, ...prev]);
        setActionMessage({ type: "success", text: "Email Blast selesai disimulasikan." });
      }
    }, 400);
  };

  // WhatsApp Blast simulated sender
  const handleStartWaBlast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waMessage) return;

    setWaSendingStatus("sending");
    setWaProgress(0);
    setWaLogs([]);
    setWaChatMessages([]);

    const phones = [
      { name: "Syifa (Royal Member)", number: "0812-7762-1102" },
      { name: "Ratih Paramitha", number: "0857-1192-3841" },
      { name: "Dewi Lestari", number: "0819-3329-8871" },
      { name: "Citra (Manager)", number: "0821-4402-9982" }
    ];

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 25;
      setWaProgress(currentProgress);

      const recipientIndex = Math.floor((currentProgress / 100) * (phones.length - 1));
      const r = phones[recipientIndex];

      if (r) {
        setWaLogs(prev => [
          ...prev,
          { text: `Mengirim pesan WA ke ${r.name} (${r.number})...`, time: new Date().toLocaleTimeString() },
          { text: `✓ Terkirim ke ${r.name} (${r.number})`, time: new Date().toLocaleTimeString() },
          { text: `✓✓ Dibaca oleh ${r.name}`, time: new Date().toLocaleTimeString() }
        ]);

        const formattedMsg = waMessage
          .replace("{customer_name}", r.name)
          .replace("{discount_code}", "NEXAROYAL10");

        setWaChatMessages(prev => [
          ...prev,
          {
            id: `msg-${Date.now()}-${recipientIndex}`,
            sender: "me",
            recipientName: r.name,
            number: r.number,
            text: formattedMsg,
            image: waImage || null,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        setWaSendingStatus("completed");

        const finalStats = {
          totalSent: waAudience === "all" ? 420 : waAudience === "royal" ? 180 : waAudience === "active" ? 240 : 10,
          readRate: 94,
          replyRate: 28
        };
        setWaStats(finalStats);

        const newCampaign = {
          id: `camp-wa-${Date.now()}`,
          message: waMessage,
          image: waImage,
          audience: waAudience,
          sentAt: new Date().toISOString(),
          stats: finalStats
        };
        setWaHistory(prev => [newCampaign, ...prev]);
        setActionMessage({ type: "success", text: "Simulasi WhatsApp Blast selesai." });
      }
    }, 600);
  };

  // IMAGE UPLOAD HELPER
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "product" | "journal") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${authToken}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengunggah gambar");

      if (target === "product") {
        setProductForm(prev => ({
          ...prev,
          images: [...(prev.images || []), data.url]
        }));
      } else if (target === "journal") {
        // Automatically inject the banner image as a markdown block at the top of content
        setJournalForm(prev => ({
          ...prev,
          content: `![Banner Image](${data.url})\n\n${prev.content}`
        }));
      }
      setActionMessage({ type: "success", text: "Gambar berhasil diunggah!" });
    } catch (err: unknown) {
      setActionMessage({ type: "error", text: err instanceof Error ? err.message : "Terjadi kesalahan" });
    } finally {
      setIsUploading(false);
    }
  };

  // PRODUCT CRUD ACTIONS
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.slug || !productForm.sku) return;

    setIsProductSubmitting(true);
    try {
      const isEdit = !!productForm.id;
      const url = "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";

      const tagsArray = productForm.tags
        ? productForm.tags.split(",").map(t => t.trim()).filter(Boolean)
        : ["Skincare"];

      const payload = {
        id: productForm.id,
        name: productForm.name,
        slug: productForm.slug,
        description: productForm.description,
        base_price: productForm.base_price,
        images: productForm.images,
        sku: productForm.sku,
        price: productForm.price,
        stock: productForm.stock,
        attributes: {
          ...(productForm.originalAttributes || {}),
          category: productForm.category,
          tags: tagsArray,
          ingredients: productForm.ingredients,
          howToUse: productForm.howToUse
        }
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
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan produk");

      setActionMessage({
        type: "success",
        text: isEdit ? "Produk berhasil diperbarui!" : "Produk baru berhasil ditambahkan!"
      });

      setIsProductModalOpen(false);
      setProductForm({
        name: "",
        slug: "",
        description: "",
        base_price: 0,
        images: [],
        sku: "",
        price: 0,
        stock: 0,
        category: "Skincare",
        tags: "Skincare",
        ingredients: "",
        howToUse: ""
      });
      fetchProducts();
    } catch (err: unknown) {
      setActionMessage({ type: "error", text: err instanceof Error ? err.message : "Terjadi kesalahan" });
    } finally {
      setIsProductSubmitting(false);
    }
  };

  const handleEditProductClick = (p: Product) => {
    const variant = p.product_variants?.[0] || { sku: "", price: 0, stock: 0, id: "" };
    const attrs = p.attributes || {};
    setProductForm({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description || "",
      base_price: p.base_price,
      images: p.images || [],
      sku: variant.sku || "",
      price: variant.price || p.base_price,
      stock: variant.stock || 0,
      category: attrs.category || "Skincare",
      tags: Array.isArray(attrs.tags) ? attrs.tags.join(", ") : "Skincare",
      ingredients: attrs.ingredients || "",
      howToUse: attrs.howToUse || "",
      originalAttributes: attrs
    });
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (pId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini beserta seluruh variannya? Tindakan ini tidak dapat dibatalkan.")) return;

    try {
      const res = await fetch(`/api/admin/products?id=${pId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${authToken}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menghapus produk");
      }

      setActionMessage({ type: "success", text: "Produk berhasil dihapus." });
      setProductsList(prev => prev.filter(p => p.id !== pId));
    } catch (err: unknown) {
      setActionMessage({ type: "error", text: err instanceof Error ? err.message : "Terjadi kesalahan" });
    }
  };

  // JOURNAL CRUD ACTIONS
  const handleJournalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalForm.title || !journalForm.slug || !journalForm.content) return;

    setIsJournalSubmitting(true);
    try {
      const isEdit = !!journalForm.id;
      const url = "/api/admin/journals";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(journalForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan jurnal");

      setActionMessage({
        type: "success",
        text: isEdit ? "Artikel jurnal berhasil diperbarui!" : "Artikel jurnal baru berhasil diterbitkan!"
      });

      setIsJournalModalOpen(false);
      setJournalForm({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        category: "Bahan Aktif",
        read_time: "5 Menit Baca",
        author: "dr. Livia W."
      });
      fetchJournals();
    } catch (err: unknown) {
      setActionMessage({ type: "error", text: err instanceof Error ? err.message : "Terjadi kesalahan" });
    } finally {
      setIsJournalSubmitting(false);
    }
  };

  const handleEditJournalClick = (j: Journal) => {
    setJournalForm({
      id: j.id,
      title: j.title,
      slug: j.slug,
      content: j.content,
      excerpt: j.excerpt || "",
      category: j.category,
      read_time: j.read_time || "5 Menit Baca",
      author: j.author || "dr. Livia W."
    });
    setIsJournalModalOpen(true);
  };

  const handleDeleteJournal = async (jId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus artikel jurnal ini?")) return;

    try {
      const res = await fetch(`/api/admin/journals?id=${jId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${authToken}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menghapus jurnal");
      }

      setActionMessage({ type: "success", text: "Artikel jurnal berhasil dihapus." });
      setJournalsList(prev => prev.filter(j => j.id !== jId));
    } catch (err: unknown) {
      setActionMessage({ type: "error", text: err instanceof Error ? err.message : "Terjadi kesalahan" });
    }
  };

  // COUPONS CRUD ACTIONS
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code || couponForm.discount_value <= 0) return;

    setIsCouponSubmitting(true);
    try {
      const isEdit = !!couponForm.id;
      const url = "/api/admin/coupons";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(couponForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan kupon");

      setActionMessage({
        type: "success",
        text: isEdit ? "Voucher kupon berhasil diperbarui!" : "Voucher kupon baru berhasil dibuat!"
      });

      setIsCouponModalOpen(false);
      setCouponForm({
        code: "",
        discount_type: "percentage",
        discount_value: 0,
        min_purchase: 0,
        active: true
      });
      fetchCoupons();
    } catch (err: unknown) {
      setActionMessage({ type: "error", text: err instanceof Error ? err.message : "Terjadi kesalahan" });
    } finally {
      setIsCouponSubmitting(false);
    }
  };

  const handleEditCouponClick = (c: Coupon) => {
    setCouponForm({
      id: c.id,
      code: c.code,
      discount_type: c.discount_type,
      discount_value: Number(c.discount_value),
      min_purchase: Number(c.min_purchase || 0),
      active: c.active
    });
    setIsCouponModalOpen(true);
  };

  const handleToggleCouponActive = async (c: Coupon) => {
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          id: c.id,
          code: c.code,
          discount_type: c.discount_type,
          discount_value: Number(c.discount_value),
          min_purchase: Number(c.min_purchase || 0),
          active: !c.active
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui kupon");

      setActionMessage({
        type: "success",
        text: `Voucher ${c.code} berhasil ${!c.active ? "diaktifkan" : "dinonaktifkan"}!`
      });
      fetchCoupons();
    } catch (err: unknown) {
      setActionMessage({ type: "error", text: err instanceof Error ? err.message : "Terjadi kesalahan" });
    }
  };

  const handleDeleteCoupon = async (cId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus voucher diskon ini?")) return;

    try {
      const res = await fetch(`/api/admin/coupons?id=${cId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${authToken}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menghapus kupon");
      }

      setActionMessage({ type: "success", text: "Voucher diskon berhasil dihapus." });
      setCouponsList(prev => prev.filter(c => c.id !== cId));
    } catch (err: unknown) {
      setActionMessage({ type: "error", text: err instanceof Error ? err.message : "Terjadi kesalahan" });
    }
  };

  // AI ASSISTANT CHAT ACTION
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatSending) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsChatSending(true);

    // Create a temporary message placeholder for the assistant
    setChatMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      const bodyPayload = {
        messages: [
          ...chatMessages.map(m => ({ role: m.role, content: m.content })),
          { role: "user", content: userMsg }
        ].filter(m => m.content !== ""),
        dashboardStats: stats
      };

      const res = await fetch("/api/admin/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(bodyPayload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal memproses AI Chatbot");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("Gagal membaca aliran teks streaming");

      let assistantContent = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;
        
        setChatMessages(prev => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1] = { role: "assistant", content: assistantContent };
          }
          return updated;
        });
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Terjadi kesalahan";
      console.error(err);
      setChatMessages(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1] = { 
            role: "assistant", 
            content: `Maaf, terjadi kesalahan: ${errMsg}. Pastikan kunci API AI Anda sudah dikonfigurasi.` 
          };
        }
        return updated;
      });
    } finally {
      setIsChatSending(false);
    }
  };

  // SPREADSHEET EXPORT ACTION
  const handleExportCSV = async (type: string) => {
    setExporting(prev => ({ ...prev, [type]: true }));
    try {
      const res = await fetch(`/api/admin/export?type=${type}`, {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (!res.ok) throw new Error("Gagal mengunduh laporan");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}_report_${new Date().toISOString().substring(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setActionMessage({ type: "success", text: `Laporan ${type} berhasil diunduh.` });
    } catch (err: unknown) {
      setActionMessage({ type: "error", text: err instanceof Error ? err.message : "Terjadi kesalahan" });
    } finally {
      setExporting(prev => ({ ...prev, [type]: false }));
    }
  };

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

  const filteredProducts = productsList.filter((p) => {
    return p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
           p.slug.toLowerCase().includes(productSearch.toLowerCase()) ||
           (p.product_variants?.[0]?.sku || "").toLowerCase().includes(productSearch.toLowerCase());
  });

  const filteredJournals = journalsList.filter((j) => {
    return j.title.toLowerCase().includes(journalSearch.toLowerCase()) ||
           j.category.toLowerCase().includes(journalSearch.toLowerCase()) ||
           (j.excerpt || "").toLowerCase().includes(journalSearch.toLowerCase());
  });

  const filteredCoupons = couponsList.filter((c) => {
    return c.code.toLowerCase().includes(couponSearch.toLowerCase());
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
                Username / Akun Admin
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Masukkan username..."
                className="w-full px-5 py-4 border border-[#eadecb] rounded-xl text-neutral-800 text-sm focus:border-[#c3a475] bg-[#fdfcf9] placeholder-neutral-300 font-semibold outline-none"
                disabled={isAuthLoading}
                required
              />
              <div className="flex gap-2 mt-2">
                {["owner", "admin", "manager"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setUsernameInput(role)}
                    className={`px-3 py-1 text-[9px] uppercase font-bold tracking-wider rounded-md border transition-all ${
                      usernameInput.toLowerCase() === role 
                        ? "border-neutral-950 bg-neutral-950 text-white shadow-sm" 
                        : "border-[#eadecb]/60 text-neutral-500 hover:bg-[#f6f3ed]"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

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
            <span className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-widest text-[#c3a475] bg-[#f6f3ed] px-3.5 py-2 border border-[#eadecb]/30 rounded-full">
              Sesi: {adminUsername} ({adminRole})
            </span>
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
            { id: "products", label: "Products", icon: Package },
            { id: "jurnal", label: "Jurnal", icon: BookOpen },
            { id: "coupons", label: "Voucher", icon: Tag },
            { id: "landing_pages", label: "Landing Page", icon: Globe },
            { id: "marketing_blast", label: "Marketing Blast", icon: Mail },
            { id: "root_access", label: "Root Access", icon: Users },
            { id: "knowledge", label: "AI Knowledge", icon: Database },
            { id: "chatbot", label: "AI Chatbot", icon: MessageSquare },
            { id: "spreadsheets", label: "Spreadsheets", icon: Download },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
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

          {/* TAB 5: PRODUCTS MANAGEMENT */}
          {activeTab === "products" && (
            <motion.div
              key="products-content"
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
                    placeholder="Cari nama produk, slug, atau SKU..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-[#eadecb] rounded-xl text-xs bg-[#fdfcf9] placeholder-neutral-400 text-neutral-800 font-medium"
                  />
                </div>

                <button
                  onClick={() => {
                    setProductForm({
                      name: "",
                      slug: "",
                      description: "",
                      base_price: 0,
                      images: [],
                      sku: "",
                      price: 0,
                      stock: 0,
                      category: "Skincare",
                      tags: "Skincare",
                      ingredients: "",
                      howToUse: ""
                    });
                    setIsProductModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Produk
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-white border border-[#eadecb] rounded-2xl p-6 luxury-card overflow-hidden">
                {isProductsLoading ? (
                  <div className="py-20 flex justify-center items-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#c3a475]" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-100 text-neutral-400 font-bold uppercase tracking-widest text-[9px]">
                          <th className="pb-3 w-16">Gambar</th>
                          <th className="pb-3">Nama Produk</th>
                          <th className="pb-3">Slug</th>
                          <th className="pb-3">Harga Base</th>
                          <th className="pb-3">SKU Utama</th>
                          <th className="pb-3">Stok</th>
                          <th className="pb-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                              Tidak ada produk ditemukan.
                            </td>
                          </tr>
                        ) : (
                          filteredProducts.map((p) => {
                            const variant = p.product_variants?.[0] || { sku: "", price: 0, stock: 0, id: "" };
                            return (
                              <tr key={p.id} className="border-b border-neutral-50 hover:bg-[#fcfbf9]/60 transition-colors">
                                <td className="py-3">
                                  {p.images && p.images.length > 0 ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img 
                                      src={p.images[0]} 
                                      alt={p.name} 
                                      className="w-10 h-10 object-cover rounded-lg border border-[#eadecb]/50 bg-[#fdfcf9]" 
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg border border-neutral-200 bg-neutral-50 flex items-center justify-center text-neutral-400">
                                      <Package className="w-5 h-5" />
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 font-semibold text-neutral-800">{p.name}</td>
                                <td className="py-3 text-neutral-500 font-mono text-[10px]">{p.slug}</td>
                                <td className="py-3 font-bold text-neutral-800">{formatIDR(p.base_price)}</td>
                                <td className="py-3 font-mono text-[10px] text-neutral-600">{variant.sku || "-"}</td>
                                <td className="py-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                    (variant.stock || 0) > 10 
                                      ? "bg-green-50 text-green-700 border border-green-200" 
                                      : (variant.stock || 0) > 0 
                                      ? "bg-yellow-50 text-yellow-705 border border-yellow-200" 
                                      : "bg-red-50 text-red-700 border-red-200"
                                  }`}>
                                    {variant.stock !== undefined ? variant.stock : 0} pcs
                                  </span>
                                </td>
                                <td className="py-3 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => handleEditProductClick(p)}
                                      className="p-1.5 hover:bg-[#f6f3ed] text-[#c3a475] rounded transition-colors text-xs font-bold uppercase tracking-widest text-[9px] inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <Edit className="w-3.5 h-3.5" /> Ubah
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProduct(p.id)}
                                      className="p-1.5 hover:bg-red-50 text-red-650 rounded transition-colors text-xs font-bold uppercase tracking-widest text-[9px] inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" /> Hapus
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

          {/* TAB 6: JURNAL KECANTIKAN (BLOG) */}
          {activeTab === "jurnal" && (
            <motion.div
              key="jurnal-content"
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
                    placeholder="Cari judul artikel, kategori, atau kutipan..."
                    value={journalSearch}
                    onChange={(e) => setJournalSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-[#eadecb] rounded-xl text-xs bg-[#fdfcf9] placeholder-neutral-400 text-neutral-800 font-medium"
                  />
                </div>

                <button
                  onClick={() => {
                    setJournalForm({
                      title: "",
                      slug: "",
                      content: "",
                      excerpt: "",
                      category: "Bahan Aktif",
                      read_time: "5 Menit Baca",
                      author: "dr. Livia W."
                    });
                    setIsJournalModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Tulis Artikel
                </button>
              </div>

              {/* Journal Grid */}
              {isJournalsLoading ? (
                <div className="py-20 flex justify-center items-center bg-white border border-[#eadecb] rounded-2xl luxury-card">
                  <Loader2 className="w-8 h-8 animate-spin text-[#c3a475]" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredJournals.length === 0 ? (
                    <div className="col-span-full py-16 text-center bg-white border border-[#eadecb] rounded-2xl luxury-card text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                      Tidak ada artikel jurnal ditemukan.
                    </div>
                  ) : (
                    filteredJournals.map((j) => (
                      <div key={j.id} className="bg-white border border-[#eadecb] p-6 rounded-2xl luxury-card flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <span className="px-2.5 py-1 bg-[#f6f3ed] text-[#c3a475] border border-[#eadecb]/40 rounded-full text-[9px] font-bold uppercase tracking-widest">
                              {j.category}
                            </span>
                            <span className="text-[9px] text-neutral-400 font-bold">
                              {j.read_time} • {new Date(j.created_at).toLocaleDateString("id-ID")}
                            </span>
                          </div>
                          
                          <h4 className="font-serif text-base text-[#1c1a17] font-semibold mb-2 leading-snug">
                            {j.title}
                          </h4>
                          
                          <p className="text-neutral-500 text-xs line-clamp-3 mb-4 leading-relaxed font-sans">
                            {j.excerpt || "Tidak ada ringkasan..."}
                          </p>

                          <div className="text-[10px] text-neutral-400 font-semibold tracking-wider uppercase mb-2">
                            Penulis: <span className="text-[#1c1a17] font-bold">{j.author}</span>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                          <button
                            onClick={() => handleEditJournalClick(j)}
                            className="p-1.5 hover:bg-[#f6f3ed] text-[#c3a475] rounded transition-colors text-xs font-bold uppercase tracking-widest text-[9px] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" /> Ubah
                          </button>
                          
                          <button
                            onClick={() => handleDeleteJournal(j.id)}
                            className="p-1.5 hover:bg-red-50 text-red-650 rounded transition-colors text-xs font-bold uppercase tracking-widest text-[9px] inline-flex items-center gap-1 cursor-pointer"
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

          {/* TAB 7: COUPONS & VOUCHERS */}
          {activeTab === "coupons" && (
            <motion.div
              key="coupons-content"
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
                    placeholder="Cari kode kupon diskon..."
                    value={couponSearch}
                    onChange={(e) => setCouponSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-[#eadecb] rounded-xl text-xs bg-[#fdfcf9] placeholder-neutral-400 text-neutral-800 font-medium"
                  />
                </div>

                <button
                  onClick={() => {
                    setCouponForm({
                      code: "",
                      discount_type: "percentage",
                      discount_value: 0,
                      min_purchase: 0,
                      active: true
                    });
                    setIsCouponModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Buat Voucher
                </button>
              </div>

              {/* Coupons List */}
              <div className="bg-white border border-[#eadecb] rounded-2xl p-6 luxury-card overflow-hidden">
                {isCouponsLoading ? (
                  <div className="py-20 flex justify-center items-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#c3a475]" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-100 text-neutral-400 font-bold uppercase tracking-widest text-[9px]">
                          <th className="pb-3">Kode Kupon</th>
                          <th className="pb-3">Tipe Potongan</th>
                          <th className="pb-3">Nilai Diskon</th>
                          <th className="pb-3">Minimal Belanja</th>
                          <th className="pb-3">Dibuat Sejak</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCoupons.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                              Tidak ada kupon diskon aktif.
                            </td>
                          </tr>
                        ) : (
                          filteredCoupons.map((c) => (
                            <tr key={c.id} className="border-b border-neutral-50 hover:bg-[#fcfbf9]/60 transition-colors">
                              <td className="py-4">
                                <span className="font-mono font-bold text-neutral-950 bg-[#f6f3ed] px-3 py-1 rounded-md border border-[#eadecb] text-xs tracking-wider">
                                  {c.code}
                                </span>
                              </td>
                              <td className="py-4 font-semibold text-neutral-800 uppercase text-[10px]">
                                {c.discount_type === "percentage" ? "Persentase (%)" : "Nominal Tetap (Rp)"}
                              </td>
                              <td className="py-4 font-bold text-neutral-950">
                                {c.discount_type === "percentage" ? `${c.discount_value}%` : formatIDR(c.discount_value)}
                              </td>
                              <td className="py-4 text-neutral-600 font-semibold">
                                {c.min_purchase > 0 ? formatIDR(c.min_purchase) : "Tanpa minimal"}
                              </td>
                              <td className="py-4 text-neutral-400 font-medium">
                                {new Date(c.created_at).toLocaleDateString("id-ID")}
                              </td>
                              <td className="py-4">
                                <button
                                  type="button"
                                  onClick={() => handleToggleCouponActive(c)}
                                  className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                                    c.active 
                                      ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" 
                                      : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                  }`}
                                >
                                  {c.active ? "Aktif" : "Non-Aktif"}
                                </button>
                              </td>
                              <td className="py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => handleEditCouponClick(c)}
                                    className="p-1.5 hover:bg-[#f6f3ed] text-[#c3a475] rounded transition-colors text-xs font-bold uppercase tracking-widest text-[9px] inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <Edit className="w-3.5 h-3.5" /> Ubah
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCoupon(c.id)}
                                    className="p-1.5 hover:bg-red-550 text-red-650 rounded transition-colors text-xs font-bold uppercase tracking-widest text-[9px] inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                                  </button>
                                </div>
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

          {/* TAB 8: AI ASSISTANT CHATBOT */}
          {activeTab === "chatbot" && (
            <motion.div
              key="chatbot-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="bg-white border border-[#eadecb] rounded-3xl luxury-card overflow-hidden flex flex-col h-[600px]">
                {/* Chat Header */}
                <div className="p-4 border-b border-[#eadecb]/60 bg-[#fdfcf9] flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 rounded-full bg-[#f6f3ed] flex items-center justify-center text-[#c3a475] border border-[#eadecb]/50">
                      <MessageSquare className="w-4 h-4" />
                      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-550 border-2 border-white animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm text-[#1c1a17] font-semibold leading-none">
                        NEXAMART Admin Copilot
                      </h4>
                      <p className="text-[9px] text-green-600 uppercase tracking-widest font-bold mt-1">
                        Sistem Asisten AI Aktif
                      </p>
                    </div>
                  </div>
                  <div className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider bg-neutral-100 px-3 py-1 rounded-full">
                    Context: Performa & Database Toko Real-time
                  </div>
                </div>

                {/* Chat Bubbles */}
                <div className="flex-grow p-6 overflow-y-auto bg-[#fdfcf9]/30 space-y-4">
                  {chatMessages.map((msg, index) => {
                    const isAi = msg.role === "assistant";
                    return (
                      <div 
                        key={index}
                        className={`flex ${isAi ? "justify-start" : "justify-end"} items-start gap-2.5`}
                      >
                        {isAi && (
                          <div className="w-7 h-7 rounded-full bg-[#f6f3ed] text-[#c3a475] flex items-center justify-center shrink-0 text-xs border border-[#eadecb]/50">
                            AI
                          </div>
                        )}
                        <div className={`max-w-[75%] p-4 rounded-2xl text-xs leading-relaxed font-sans ${
                          isAi 
                            ? "bg-white text-neutral-800 border border-[#eadecb] rounded-tl-none shadow-sm" 
                            : "bg-neutral-900 text-white rounded-tr-none shadow-sm"
                        }`}>
                          <p className="whitespace-pre-line font-medium">{msg.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Chat Input form */}
                <form onSubmit={handleSendChatMessage} className="p-4 border-t border-[#eadecb]/60 bg-white flex gap-3">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={isChatSending}
                    placeholder="Tanyakan performa toko hari ini, ide marketing, draf voucher promo..."
                    className="flex-grow px-4 py-3 border border-[#eadecb] bg-[#fdfcf9] text-xs rounded-xl focus:border-[#c3a475] outline-none text-neutral-800 font-medium"
                  />
                  <button
                    type="submit"
                    disabled={isChatSending || !chatInput.trim()}
                    className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] cursor-pointer disabled:bg-neutral-250 disabled:text-neutral-450 transition-colors flex items-center gap-1.5"
                  >
                    {isChatSending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Mengolah...
                      </>
                    ) : (
                      "Kirim"
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* TAB 9: SPREADSHEET REPORTS CENTER */}
          {activeTab === "spreadsheets" && (
            <motion.div
              key="spreadsheets-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="p-4 bg-[#f6f3ed] rounded-xl border border-[#eadecb] text-[11px] text-neutral-600 leading-normal flex items-start gap-2.5 max-w-2xl">
                <AlertTriangle className="w-5 h-5 text-[#c3a475] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-neutral-900 block mb-0.5">Sinkronisasi & Automasi Ekspor CSV:</span>
                  Data penjualan, daftar pelanggan, stok produk, dan status langganan otomatis diupdate secara real-time. Klik tombol unduh di bawah untuk mengunduh laporan spreadsheet CSV segar secara instan.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    type: "orders",
                    title: "Laporan Penjualan & Transaksi",
                    desc: "Memuat seluruh invoice pesanan, rincian biaya, ongkos kirim, status pembayaran, kurir, dan nomor resi pengiriman.",
                    icon: ShoppingBag,
                  },
                  {
                    type: "customers",
                    title: "Basis Data Akun Customer",
                    desc: "Daftar kontak telepon pelanggan, histori alamat, email, serta preferensi pengiriman dari transaksi checkout.",
                    icon: LogOut,
                  },
                  {
                    type: "products",
                    title: "Daftar Inventori Produk",
                    desc: "Daftar produk, slug URL, harga jual dasar, SKU unik, dan ketersediaan stok fisik saat ini di gudang.",
                    icon: Package,
                  },
                  {
                    type: "subscriptions",
                    title: "Log Langganan (Subscriptions)",
                    desc: "Histori langganan produk kecantikan otomatis, frekuensi pengantaran, billing terdekat, dan status langganan aktif.",
                    icon: RefreshCw,
                  }
                ].map((item) => {
                  const Icon = item.icon;
                  const isLoading = exporting[item.type];
                  return (
                    <div 
                      key={item.type}
                      className="bg-white border border-[#eadecb] p-6 rounded-2xl luxury-card flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#f6f3ed] text-[#c3a475] flex items-center justify-center shrink-0 border border-[#eadecb]/30">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-serif text-sm font-semibold text-[#1c1a17] leading-none mb-2">
                            {item.title}
                          </h4>
                          <p className="text-neutral-500 text-xs leading-relaxed font-sans">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-end">
                        <button
                          onClick={() => handleExportCSV(item.type)}
                          disabled={isLoading}
                          className="px-5 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] cursor-pointer disabled:bg-neutral-300 transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Mengekspor...
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              Unduh CSV Laporan
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 10: LANDING PAGES */}
          {activeTab === "landing_pages" && (
            <motion.div
              key="landing-pages-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Header stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-[#eadecb] p-6 rounded-2xl luxury-card animate-fadeIn">
                  <h5 className="text-[9px] text-[#c3a475] uppercase tracking-widest font-bold mb-1">Total Halaman Landing</h5>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-serif font-bold text-neutral-900">{landingPages.length}</span>
                    <span className="text-[10px] text-neutral-400 font-bold">halaman</span>
                  </div>
                </div>
                <div className="bg-white border border-[#eadecb] p-6 rounded-2xl luxury-card animate-fadeIn">
                  <h5 className="text-[9px] text-[#c3a475] uppercase tracking-widest font-bold mb-1">Total Leads Masuk</h5>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-serif font-bold text-neutral-900">{leadsList.length}</span>
                    <span className="text-[10px] text-neutral-400 font-bold">leads terdaftar</span>
                  </div>
                </div>
                <div className="bg-white border border-[#eadecb] p-6 rounded-2xl luxury-card flex items-center justify-between animate-fadeIn">
                  <div>
                    <h5 className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold mb-1">Landing Page Builder</h5>
                    <p className="text-[11px] text-neutral-500 font-medium">Buat penawaran iklan khusus</p>
                  </div>
                  <button
                    onClick={() => {
                      setLpForm({
                        title: "",
                        slug: "",
                        status: "Draft",
                        blocks: [
                          {
                            id: `block-${Math.random().toString(36).substr(2, 9)}`,
                            type: "hero",
                            content: {
                              title: "Kembalikan Kilau Alami Wajah Anda",
                              subtitle: "Formula esens premium untuk memperkuat skin barrier Anda dalam 14 hari.",
                              cta_text: "Dapatkan Sekarang",
                              bg_gradient: "from-[#faf8f5] to-[#f4ead4]",
                              image_url: ""
                            }
                          }
                        ]
                      });
                      setIsLpModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl font-bold uppercase tracking-widest text-[9px] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Buat Baru
                  </button>
                </div>
              </div>

              {/* List Landing Pages */}
              <div className="bg-white border border-[#eadecb] rounded-3xl luxury-card overflow-hidden">
                <div className="p-6 border-b border-[#eadecb]/50 bg-[#fdfcf9] flex justify-between items-center">
                  <h4 className="font-serif text-sm font-semibold text-[#1c1a17]">
                    Kelola Halaman Penawaran Khusus (Landing Page)
                  </h4>
                </div>

                {isLpsLoading ? (
                  <div className="p-12 text-center text-xs text-[#c3a475] flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Sedang memuat halaman...
                  </div>
                ) : landingPages.length === 0 ? (
                  <div className="p-12 text-center text-xs text-neutral-400 font-medium italic">
                    Belum ada halaman landing. Silakan klik "Buat Baru" untuk memulai.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#eadecb]/60 bg-[#fdfcf9] text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                          <th className="py-4 px-6">Nama Halaman</th>
                          <th className="py-4 px-6">Slug/URL</th>
                          <th className="py-4 px-6">Status</th>
                          <th className="py-4 px-6">Jumlah Blok</th>
                          <th className="py-4 px-6 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {landingPages.map((lp) => (
                          <tr key={lp.id} className="border-b border-neutral-100 hover:bg-[#faf8f5]/50 transition-colors">
                            <td className="py-4 px-6 font-semibold text-neutral-950">{lp.title}</td>
                            <td className="py-4 px-6 font-mono text-[10px] text-neutral-500">
                              <span className="bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">/lp/{lp.slug}</span>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                lp.status === "Published" ? "bg-green-50 text-green-700 border border-green-200" : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                              }`}>
                                {lp.status === "Published" ? "Published" : "Draft"}
                              </span>
                            </td>
                            <td className="py-4 px-6 font-medium">{lp.blocks?.length || 0} blok</td>
                            <td className="py-4 px-6">
                              <div className="flex justify-end gap-2.5">
                                <Link
                                  href={`/lp/${lp.slug}`}
                                  target="_blank"
                                  className="p-1.5 hover:bg-[#f6f3ed] text-neutral-600 rounded transition-colors text-[9px] font-bold uppercase tracking-widest inline-flex items-center gap-1 font-sans"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" /> Buka
                                </Link>
                                <button
                                  onClick={() => {
                                    setLpForm({
                                      id: lp.id,
                                      title: lp.title,
                                      slug: lp.slug,
                                      status: lp.status,
                                      blocks: lp.blocks || []
                                    });
                                    setIsLpModalOpen(true);
                                  }}
                                  className="p-1.5 hover:bg-[#f6f3ed] text-[#c3a475] rounded transition-colors text-[9px] font-bold uppercase tracking-widest inline-flex items-center gap-1 cursor-pointer font-sans"
                                >
                                  <Edit className="w-3.5 h-3.5" /> Ubah
                                </button>
                                <button
                                  onClick={() => handleLpDelete(lp.id, lp.title)}
                                  className="p-1.5 hover:bg-red-50 text-[#c3a475] rounded transition-colors text-[9px] font-bold uppercase tracking-widest inline-flex items-center gap-1 cursor-pointer font-sans"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Hapus
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Leads Viewer */}
              <div className="bg-white border border-[#eadecb] rounded-3xl luxury-card overflow-hidden">
                <div className="p-6 border-b border-[#eadecb]/50 bg-[#fdfcf9] flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-[#1c1a17]">
                      Daftar Masuk Leads & Konsultasi Pelanggan
                    </h4>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mt-1">
                      Data leads dari formulir kontak landing page
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                      <input
                        type="text"
                        value={leadsSearch}
                        onChange={(e) => setLeadsSearch(e.target.value)}
                        placeholder="Cari leads..."
                        className="pl-9 pr-4 py-2 border border-[#eadecb] bg-[#fdfcf9] text-xs rounded-xl focus:border-[#c3a475] outline-none text-neutral-800 font-medium w-48"
                      />
                    </div>
                    <button
                      onClick={handleExportLeadsCSV}
                      disabled={leadsList.length === 0}
                      className="px-4 py-2.5 border border-[#eadecb] hover:bg-[#f6f3ed] text-neutral-700 rounded-xl font-bold uppercase tracking-widest text-[9px] transition-colors flex items-center gap-1.5 cursor-pointer disabled:bg-neutral-50 disabled:text-neutral-350"
                    >
                      <Download className="w-3.5 h-3.5" /> Ekspor CSV
                    </button>
                  </div>
                </div>

                {isLeadsLoading ? (
                  <div className="p-12 text-center text-xs text-[#c3a475] flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Sedang memuat leads...
                  </div>
                ) : leadsList.length === 0 ? (
                  <div className="p-12 text-center text-xs text-neutral-400 font-medium italic">
                    Belum ada leads masuk dari landing page.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#eadecb]/60 bg-[#fdfcf9] text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                          <th className="py-4 px-6">Nama</th>
                          <th className="py-4 px-6">WhatsApp</th>
                          <th className="py-4 px-6">Email</th>
                          <th className="py-4 px-6">Pesan/Masalah</th>
                          <th className="py-4 px-6">Halaman</th>
                          <th className="py-4 px-6">Tanggal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leadsList
                          .filter(lead => {
                            const q = leadsSearch.toLowerCase();
                            return (
                              lead.name?.toLowerCase().includes(q) ||
                              lead.whatsapp?.toLowerCase().includes(q) ||
                              lead.lp_slug?.toLowerCase().includes(q) ||
                              lead.email?.toLowerCase().includes(q) ||
                              lead.message?.toLowerCase().includes(q)
                            );
                          })
                          .map((lead) => (
                            <tr key={lead.id} className="border-b border-neutral-100 hover:bg-[#faf8f5]/50 transition-colors">
                              <td className="py-4 px-6 font-semibold text-neutral-950">{lead.name}</td>
                              <td className="py-4 px-6">
                                <a 
                                  href={`https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  className="text-neutral-700 hover:underline font-mono text-[11px] font-semibold flex items-center gap-1"
                                >
                                  {lead.whatsapp}
                                </a>
                              </td>
                              <td className="py-4 px-6 lowercase text-neutral-500 font-medium">{lead.email || "-"}</td>
                              <td className="py-4 px-6 font-sans text-[11px] text-neutral-600 max-w-xs truncate" title={lead.message}>
                                {lead.message || "-"}
                              </td>
                              <td className="py-4 px-6">
                                <span className="bg-neutral-100 px-2 py-0.5 rounded text-neutral-600 font-mono text-[10px]">
                                  /lp/{lead.lp_slug}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-neutral-400 text-[10px] font-semibold">{formatDate(lead.created_at)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 11: MARKETING BLAST (EMAIL & WA) */}
          {activeTab === "marketing_blast" && (
            <motion.div
              key="marketing-blast-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Selector Subtab */}
              <div className="flex border-b border-[#eadecb] gap-6 mb-6">
                {[
                  { id: "email", label: "Email Blast Simulator", icon: Mail },
                  { id: "whatsapp", label: "WhatsApp Blast Simulator", icon: Smartphone }
                ].map(b => (
                  <button
                    key={b.id}
                    onClick={() => setBlastType(b.id as any)}
                    className={`flex items-center gap-2 pb-3 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer outline-none ${
                      blastType === b.id ? "text-neutral-950 font-extrabold" : "text-neutral-400 hover:text-neutral-600"
                    }`}
                  >
                    <b.icon className={`w-4 h-4 ${blastType === b.id ? "text-[#c3a475]" : "text-neutral-400"}`} />
                    {b.label}
                    {blastType === b.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c3a475]" />
                    )}
                  </button>
                ))}
              </div>

              {blastType === "email" ? (
                // EMAIL BLAST SIMULATOR LAYOUT
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left form config */}
                  <div className="lg:col-span-5 space-y-6">
                    <form onSubmit={handleStartEmailBlast} className="bg-white border border-[#eadecb] p-6 rounded-3xl luxury-card space-y-5">
                      <h4 className="font-serif text-sm font-semibold text-[#1c1a17] pb-2 border-b border-neutral-100">
                        Konfigurasi Kampanye Email
                      </h4>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                          Subjek Email
                        </label>
                        <input
                          type="text"
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          placeholder="Misal: Rahasia Kulit Radiant 14 Hari! ✨"
                          required
                          disabled={emailSendingStatus === "sending"}
                          className="w-full px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] rounded-xl text-neutral-800 focus:border-[#c3a475] outline-none text-xs animate-fadeIn"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                          Template Email
                        </label>
                        <select
                          value={emailTemplate}
                          onChange={(e: any) => setEmailTemplate(e.target.value)}
                          disabled={emailSendingStatus === "sending"}
                          className="w-full px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] rounded-xl text-neutral-800 outline-none text-xs cursor-pointer"
                        >
                          <option value="promo">Promo Launching Produk Baru</option>
                          <option value="newsletter">Buletin Mingguan Tips Cantik</option>
                          <option value="discount">Diskon Eksklusif Anggota Royal (10%)</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                          Target Audien
                        </label>
                        <select
                          value={emailAudience}
                          onChange={(e: any) => setEmailAudience(e.target.value)}
                          disabled={emailSendingStatus === "sending"}
                          className="w-full px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] rounded-xl text-neutral-800 outline-none text-xs cursor-pointer"
                        >
                          <option value="all">Semua Customer (420 kontak)</option>
                          <option value="royal">Anggota Royal Member (180 kontak)</option>
                          <option value="active">Pelanggan Aktif 30 Hari Terakhir (240 kontak)</option>
                          <option value="custom">Daftar Kontak Khusus (Input Manual)</option>
                        </select>
                      </div>

                      {emailAudience === "custom" && (
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                            Daftar Kontak (Nama, Email - Satu per baris)
                          </label>
                          <textarea
                            rows={3}
                            value={emailCsvText}
                            onChange={(e) => setEmailCsvText(e.target.value)}
                            disabled={emailSendingStatus === "sending"}
                            placeholder="Ayu, ayu@nexa.id&#10;Bimo, bimo@yahoo.com"
                            className="w-full px-3 py-2 border border-[#eadecb] bg-[#fdfcf9] rounded-xl text-neutral-800 focus:border-[#c3a475] outline-none text-xs resize-none"
                          />
                        </div>
                      )}

                      <div className="p-3 bg-[#f6f3ed]/60 rounded-xl border border-[#eadecb]/40 text-[10px] text-neutral-500 leading-normal space-y-1">
                        <p className="font-bold text-neutral-700">💡 Tips Personalisasi:</p>
                        <p>Gunakan tag berikut di subjek/isi email untuk personalisasi data pelanggan otomatis:</p>
                        <ul className="list-disc pl-4 space-y-0.5 font-sans">
                          <li><code className="bg-white px-1.5 py-0.5 rounded font-bold text-[#c3a475] font-mono">{`{customer_name}`}</code> - Nama lengkap pelanggan</li>
                          <li><code className="bg-white px-1.5 py-0.5 rounded font-bold text-[#c3a475] font-mono">{`{discount_code}`}</code> - Kode voucher otomatis</li>
                        </ul>
                      </div>

                      <button
                        type="submit"
                        disabled={emailSendingStatus === "sending" || !emailSubject}
                        className="w-full py-3.5 bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-neutral-300"
                      >
                        {emailSendingStatus === "sending" ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Mengirim Simulasi...
                          </>
                        ) : (
                          <>
                            <Mail className="w-3.5 h-3.5" />
                            Kirim Email Blast
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Right side simulator view */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Live Progress Simulator */}
                    {(emailSendingStatus === "sending" || emailSendingStatus === "completed") && (
                      <div className="bg-white border border-[#eadecb] p-6 rounded-3xl luxury-card space-y-5">
                        <div className="flex justify-between items-center">
                          <h4 className="font-serif text-sm font-semibold text-[#1c1a17]">
                            Proses Simulasi Pengiriman
                          </h4>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            emailSendingStatus === "sending" ? "bg-amber-50 text-amber-600 border border-amber-200 animate-pulse" : "bg-green-50 text-green-700 border border-green-200"
                          }`}>
                            {emailSendingStatus === "sending" ? "Mengirim..." : "Selesai"}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                            <span>Progres Kirim</span>
                            <span>{emailProgress}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden border border-[#eadecb]/30">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-[#c3a475] to-neutral-900"
                              initial={{ width: 0 }}
                              animate={{ width: `${emailProgress}%` }}
                              transition={{ duration: 0.1 }}
                            />
                          </div>
                        </div>

                        {/* Stats Metrics (Simulated) */}
                        {emailStats && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                            <div className="bg-[#faf8f5] border border-neutral-100 p-3.5 rounded-xl text-center shadow-sm">
                              <span className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Delivered</span>
                              <span className="font-serif text-base font-bold text-[#1c1a17]">{emailStats.delivered}%</span>
                            </div>
                            <div className="bg-[#faf8f5] border border-neutral-100 p-3.5 rounded-xl text-center shadow-sm">
                              <span className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Open Rate</span>
                              <span className="font-serif text-base font-bold text-[#c3a475]">{emailStats.openRate}%</span>
                            </div>
                            <div className="bg-[#faf8f5] border border-neutral-100 p-3.5 rounded-xl text-center shadow-sm">
                              <span className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Click Rate</span>
                              <span className="font-serif text-base font-bold text-amber-800">{emailStats.clickRate}%</span>
                            </div>
                            <div className="bg-[#faf8f5] border border-neutral-100 p-3.5 rounded-xl text-center shadow-sm">
                              <span className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Konversi</span>
                              <span className="font-serif text-base font-bold text-green-700">{emailStats.conversionRate}%</span>
                            </div>
                          </div>
                        )}

                        {/* Terminal Logger */}
                        <div className="space-y-1.5">
                          <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Console Logs Pengiriman</span>
                          <div className="h-44 overflow-y-auto bg-neutral-950 text-[10px] text-green-400 font-mono p-4 rounded-xl space-y-1.5 border border-neutral-800 shadow-inner no-scrollbar">
                            {emailLogs.length === 0 ? (
                              <p className="text-neutral-500 italic">Mulai pengiriman untuk melihat log console...</p>
                            ) : (
                              emailLogs.map((log, i) => (
                                <div key={i} className="flex gap-2.5 items-start">
                                  <span className="text-neutral-600 font-bold shrink-0">[{log.time}]</span>
                                  <span>{log.text}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Email Campaign History */}
                    <div className="bg-white border border-[#eadecb] p-6 rounded-3xl luxury-card space-y-4">
                      <h4 className="font-serif text-sm font-semibold text-[#1c1a17]">
                        Riwayat Kampanye Email Blast
                      </h4>
                      {emailHistory.length === 0 ? (
                        <p className="text-xs text-neutral-400 italic font-medium">Belum ada riwayat pengiriman email blast.</p>
                      ) : (
                        <div className="space-y-3">
                          {emailHistory.map((h) => (
                            <div key={h.id} className="p-4 border border-[#eadecb]/50 rounded-2xl bg-[#faf8f5] flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs font-sans">
                              <div>
                                <h5 className="font-semibold text-neutral-900 font-serif">{h.subject}</h5>
                                <div className="flex gap-3 text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-1">
                                  <span>Template: {h.template}</span>
                                  <span>•</span>
                                  <span>Terkirim: {formatDate(h.sentAt)}</span>
                                </div>
                              </div>
                              <div className="flex gap-4 text-[10px] font-mono font-bold">
                                <span className="text-neutral-500">Total: {h.stats.totalSent}</span>
                                <span className="text-[#c3a475]">Opens: {h.stats.openRate}%</span>
                                <span className="text-green-700">Convs: {h.stats.conversionRate}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // WHATSAPP BLAST SIMULATOR LAYOUT
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Form config */}
                  <div className="lg:col-span-5 space-y-6">
                    <form onSubmit={handleStartWaBlast} className="bg-white border border-[#eadecb] p-6 rounded-3xl luxury-card space-y-5">
                      <h4 className="font-serif text-sm font-semibold text-[#1c1a17] pb-2 border-b border-neutral-100">
                        Konfigurasi Pesan WhatsApp
                      </h4>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                          Pesan Kampanye WA
                        </label>
                        <textarea
                          rows={5}
                          value={waMessage}
                          onChange={(e) => setWaMessage(e.target.value)}
                          placeholder="Halo {customer_name}, dapatkan penawaran esens eksklusif hari ini! Masukkan kode voucher {discount_code} untuk diskon 10%."
                          required
                          disabled={waSendingStatus === "sending"}
                          className="w-full px-3 py-2 border border-[#eadecb] bg-[#fdfcf9] rounded-xl text-neutral-800 focus:border-[#c3a475] outline-none text-xs resize-none leading-relaxed"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                          URL Lampiran Gambar (Opsional)
                        </label>
                        <input
                          type="text"
                          value={waImage}
                          onChange={(e) => setWaImage(e.target.value)}
                          placeholder="https://images.unsplash.com/photo-..."
                          disabled={waSendingStatus === "sending"}
                          className="w-full px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] rounded-xl text-neutral-800 focus:border-[#c3a475] outline-none text-xs"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                          Target Penerima WA
                        </label>
                        <select
                          value={waAudience}
                          onChange={(e: any) => setWaAudience(e.target.value)}
                          disabled={waSendingStatus === "sending"}
                          className="w-full px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] rounded-xl text-neutral-800 outline-none text-xs cursor-pointer"
                        >
                          <option value="all">Semua Kontak Customer (420 nomor)</option>
                          <option value="royal">Anggota Royal Member (180 nomor)</option>
                          <option value="active">Pelanggan Aktif 30 Hari Terakhir (240 nomor)</option>
                          <option value="custom">Daftar Kontak Khusus (Input Manual)</option>
                        </select>
                      </div>

                      {waAudience === "custom" && (
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                            Nomor Penerima (Nama, Nomor Telepon - Satu per baris)
                          </label>
                          <textarea
                            rows={3}
                            value={waCsvText}
                            onChange={(e) => setWaCsvText(e.target.value)}
                            disabled={waSendingStatus === "sending"}
                            placeholder="Ayu, 08123456789&#10;Bimo, 08198765432"
                            className="w-full px-3 py-2 border border-[#eadecb] bg-[#fdfcf9] rounded-xl text-neutral-800 focus:border-[#c3a475] outline-none text-xs resize-none"
                          />
                        </div>
                      )}

                      <div className="p-3 bg-[#f6f3ed]/60 rounded-xl border border-[#eadecb]/40 text-[10px] text-neutral-500 leading-normal space-y-1">
                        <p className="font-bold text-neutral-700">💡 Variabel Personalisasi:</p>
                        <p>Dukung tag otomatis berikut dalam pesan:</p>
                        <ul className="list-disc pl-4 space-y-0.5 font-sans">
                          <li><code className="bg-white px-1.5 py-0.5 rounded font-bold text-[#c3a475] font-mono">{`{customer_name}`}</code> - Nama Lengkap</li>
                          <li><code className="bg-white px-1.5 py-0.5 rounded font-bold text-[#c3a475] font-mono">{`{discount_code}`}</code> - NEXAROYAL10</li>
                        </ul>
                      </div>

                      <button
                        type="submit"
                        disabled={waSendingStatus === "sending" || !waMessage}
                        className="w-full py-3.5 bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-neutral-300"
                      >
                        {waSendingStatus === "sending" ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Mengirim Simulasi...
                          </>
                        ) : (
                          <>
                            <Smartphone className="w-3.5 h-3.5" />
                            Kirim WA Blast
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Right side live simulated smartphone and logs */}
                  <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Simulated Smartphone Preview (6 cols) */}
                    <div className="md:col-span-6 flex justify-center">
                      <div className="relative w-full max-w-[280px] h-[500px] border-[10px] border-neutral-950 bg-[#efeae2] rounded-[36px] shadow-2xl overflow-hidden flex flex-col">
                        {/* Speaker & camera slot */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-neutral-950 rounded-b-xl z-20 flex items-center justify-center gap-1.5">
                          <div className="w-8 h-1 bg-neutral-800 rounded-full" />
                          <div className="w-2 h-2 bg-neutral-900 rounded-full" />
                        </div>

                        {/* WhatsApp App Mock Header */}
                        <div className="pt-6 pb-2.5 px-3 bg-[#075e54] text-white flex items-center gap-2.5 z-10 shrink-0 shadow-md">
                          <div className="w-6 h-6 rounded-full bg-teal-800 flex items-center justify-center text-[9px] font-bold uppercase border border-teal-600">
                            N
                          </div>
                          <div>
                            <h5 className="text-[10px] font-semibold leading-none">NEXAMART INFO</h5>
                            <p className="text-[7px] text-teal-200 font-bold uppercase tracking-widest mt-0.5">Online</p>
                          </div>
                        </div>

                        {/* WhatsApp Mock Chat Screen */}
                        <div className="flex-grow p-3 bg-[#efeae2] overflow-y-auto space-y-3 flex flex-col-reverse justify-start no-scrollbar relative">
                          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'contain' }} />

                          {waChatMessages.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-center p-4">
                              <p className="text-[10px] text-neutral-400 font-sans italic">
                                Belum ada simulasi pesan dikirim. Konfigurasikan form kiri dan klik "Kirim WA Blast".
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3 z-10 w-full flex flex-col justify-end">
                              {waChatMessages.map((msg) => (
                                <div key={msg.id} className="bg-white border border-[#e2d8c3] rounded-2xl rounded-tr-none p-3 max-w-[90%] shadow-sm self-end text-neutral-800 font-sans text-[10px] space-y-1.5 animate-fadeIn">
                                  {msg.image && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={msg.image} alt="Attachment" className="w-full h-24 object-cover rounded-lg" />
                                  )}
                                  <p className="font-semibold text-teal-800 text-[8px] leading-none mb-1">Ke: {msg.recipientName} ({msg.number})</p>
                                  <p className="leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
                                  <span className="block text-right text-[7px] text-neutral-400 font-bold">{msg.time} ✓✓</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Logs and Stats (6 cols) */}
                    <div className="md:col-span-6 space-y-6">
                      {/* Live Progress */}
                      {(waSendingStatus === "sending" || waSendingStatus === "completed") && (
                        <div className="bg-white border border-[#eadecb] p-4.5 rounded-2xl shadow-sm space-y-4">
                          <div className="flex justify-between items-center">
                            <h5 className="font-serif text-xs font-semibold text-[#1c1a17]">
                              Progres WhatsApp Blast
                            </h5>
                            <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
                              {waSendingStatus === "sending" ? "Mengirim..." : "Selesai"}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden border border-[#eadecb]/20">
                              <motion.div 
                                className="h-full bg-teal-650"
                                initial={{ width: 0 }}
                                animate={{ width: `${waProgress}%` }}
                                transition={{ duration: 0.1 }}
                              />
                            </div>
                            <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest">{waProgress}% Terkirim</span>
                          </div>

                          {/* Terminal Logger */}
                          <div className="space-y-1">
                            <span className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Console Logs</span>
                            <div className="h-32 overflow-y-auto bg-neutral-950 text-[9px] text-[#22c55e] font-mono p-3 rounded-lg space-y-1 border border-neutral-800 no-scrollbar">
                              {waLogs.map((log, idx) => (
                                <div key={idx} className="flex gap-1.5 items-start">
                                  <span className="text-neutral-600 shrink-0 font-bold">[{log.time}]</span>
                                  <span>{log.text}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* WA Campaign History */}
                      <div className="bg-white border border-[#eadecb] p-4.5 rounded-2xl shadow-sm space-y-3 animate-fadeIn">
                        <h5 className="font-serif text-xs font-semibold text-[#1c1a17]">
                          Riwayat WhatsApp Blast
                        </h5>
                        {waHistory.length === 0 ? (
                          <p className="text-[10px] text-neutral-400 italic font-medium">Belum ada riwayat WA Blast.</p>
                        ) : (
                          <div className="space-y-2">
                            {waHistory.map((h) => (
                              <div key={h.id} className="p-3 border border-[#eadecb]/30 rounded-xl bg-[#faf8f5] text-[10px] font-sans">
                                <p className="font-semibold text-neutral-800 truncate">{h.message}</p>
                                <div className="flex justify-between text-[8px] text-neutral-400 font-bold uppercase tracking-wider mt-1">
                                  <span>Audien: {h.audience}</span>
                                  <span>Terkirim: {formatDate(h.sentAt)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 12: ROOT ACCESS & MULTI-ROLE */}
          {activeTab === "root_access" && (
            <motion.div
              key="root-access-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Alert Warning Root Access */}
              <div className="p-4 bg-[#fdfaf2] border border-[#eadecb] rounded-2xl flex items-start gap-3 max-w-3xl animate-fadeIn">
                <ShieldAlert className="w-5 h-5 text-[#c3a475] shrink-0 mt-0.5" />
                <div className="text-xs text-neutral-700 leading-normal">
                  <span className="font-bold text-neutral-900 block mb-0.5">Pusat Manajemen Root Access & Hak Istimewa Admin:</span>
                  Hanya peran <strong>Owner</strong> dan <strong>Admin</strong> utama yang dapat mendaftarkan, mengubah password, atau menghapus akun administrator. Setiap aktivitas pencatatan log audit akan terekam secara otomatis di database.
                </div>
              </div>

              {/* Grid 2 Column Form vs Table Accounts */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Account */}
                <div className="lg:col-span-4">
                  <form onSubmit={handleAccountSubmit} className="bg-white border border-[#eadecb] p-6 rounded-3xl luxury-card space-y-5 shadow-sm animate-fadeIn">
                    <h4 className="font-serif text-sm font-semibold text-[#1c1a17] pb-2 border-b border-neutral-100">
                      Tambah / Ubah Akun Admin
                    </h4>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Username Admin
                      </label>
                      <input
                        type="text"
                        value={newAccUsername}
                        onChange={(e) => setNewAccUsername(e.target.value)}
                        placeholder="Contoh: ratih_admin"
                        required
                        className="w-full px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] rounded-xl text-neutral-800 focus:border-[#c3a475] outline-none text-xs font-semibold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Peran / Hak Akses (Role)
                      </label>
                      <select
                        value={newAccRole}
                        onChange={(e: any) => setNewAccRole(e.target.value)}
                        className="w-full px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] rounded-xl text-neutral-800 outline-none text-xs cursor-pointer font-semibold"
                      >
                        <option value="Owner">Owner (Akses Penuh)</option>
                        <option value="Admin">Admin (Kelola Produk & Jurnal)</option>
                        <option value="Manager">Manager (Kelola Voucher & AI)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Kata Sandi (Password)
                      </label>
                      <input
                        type="password"
                        value={newAccPassword}
                        onChange={(e) => setNewAccPassword(e.target.value)}
                        placeholder="Minimal 6 karakter..."
                        required
                        className="w-full px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] rounded-xl text-neutral-800 focus:border-[#c3a475] outline-none text-xs font-semibold"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isAccSubmitting || !newAccUsername || !newAccPassword}
                      className="w-full py-3.5 bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-neutral-300"
                    >
                      {isAccSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Menyimpan Akun...
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          Simpan Akun Admin
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Table Accounts List */}
                <div className="lg:col-span-8 bg-white border border-[#eadecb] rounded-3xl luxury-card overflow-hidden">
                  <div className="p-6 border-b border-[#eadecb]/50 bg-[#fdfcf9]">
                    <h4 className="font-serif text-sm font-semibold text-[#1c1a17]">
                      Daftar Akun Administrator Aktif
                    </h4>
                  </div>

                  {isAdminAccountsLoading ? (
                    <div className="p-12 text-center text-xs text-[#c3a475] flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Sedang memuat akun...
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#eadecb]/60 bg-[#fdfcf9] text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                            <th className="py-4 px-6">Username</th>
                            <th className="py-4 px-6">Peran (Role)</th>
                            <th className="py-4 px-6">Dibuat Pada</th>
                            <th className="py-4 px-6 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminAccountsList.map((acc) => (
                            <tr key={acc.id} className="border-b border-neutral-100 hover:bg-[#faf8f5]/50 transition-colors">
                              <td className="py-4 px-6 font-semibold text-neutral-950">{acc.username}</td>
                              <td className="py-4 px-6">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                  acc.role === "Owner" ? "bg-[#fcf7ee] text-amber-800 border border-amber-200 font-bold" :
                                  acc.role === "Admin" ? "bg-blue-50 text-blue-700 border border-blue-200 font-bold" :
                                  "bg-neutral-100 text-neutral-500 border border-neutral-200 font-bold"
                                }`}>
                                  {acc.role}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-neutral-400 font-semibold">{formatDate(acc.created_at)}</td>
                              <td className="py-4 px-6">
                                <div className="flex justify-end">
                                  <button
                                    onClick={() => handleAccountDelete(acc.id, acc.username)}
                                    disabled={acc.username === "owner" || acc.id === "1"}
                                    className="p-1.5 hover:bg-red-50 text-red-650 rounded transition-colors text-[9px] font-bold uppercase tracking-widest inline-flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed font-sans"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom full-width Log Aktivitas Audit */}
              <div className="bg-white border border-[#eadecb] rounded-3xl luxury-card overflow-hidden animate-fadeIn">
                <div className="p-6 border-b border-[#eadecb]/50 bg-[#fdfcf9]">
                  <h4 className="font-serif text-sm font-semibold text-[#1c1a17]">
                    Log Audit Aktivitas Administrator (Audit Logs)
                  </h4>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mt-1">
                    Histori tindakan administratif real-time di sistem
                  </p>
                </div>

                {isAdminLogsLoading ? (
                  <div className="p-12 text-center text-xs text-[#c3a475] flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Sedang memuat log...
                  </div>
                ) : adminLogsList.length === 0 ? (
                  <div className="p-12 text-center text-xs text-neutral-400 font-medium italic">
                    Belum ada log aktivitas yang tercatat.
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-80 overflow-y-auto no-scrollbar">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#eadecb]/60 bg-[#fdfcf9] sticky top-0 text-[10px] font-bold text-neutral-400 uppercase tracking-widest z-10">
                          <th className="py-4 px-6 bg-[#fdfcf9]">Timestamp</th>
                          <th className="py-4 px-6 bg-[#fdfcf9]">Username</th>
                          <th className="py-4 px-6 bg-[#fdfcf9]">Role</th>
                          <th className="py-4 px-6 bg-[#fdfcf9]">Aksi / Tindakan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminLogsList.map((log) => (
                          <tr key={log.id} className="border-b border-neutral-100 hover:bg-[#faf8f5]/50 transition-colors">
                            <td className="py-3 px-6 text-neutral-400 font-mono text-[10px]">{formatDate(log.created_at)}</td>
                            <td className="py-3 px-6 font-semibold text-neutral-900">{log.username}</td>
                            <td className="py-3 px-6 text-[10px] uppercase font-bold text-[#c3a475]">{log.role}</td>
                            <td className="py-3 px-6 font-sans text-neutral-600 font-medium">{log.action}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
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
              className="bg-white w-full max-w-2xl border border-[#eadecb] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] luxury-border print-invoice-area"
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
                  className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer no-print"
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
                <div className="border-t border-neutral-100 pt-6 space-y-4 no-print">
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
              <div className="p-6 border-t border-[#eadecb]/40 bg-[#fdfcf9] flex justify-between no-print">
                <button
                  onClick={() => handleDeleteOrder(selectedOrder.id)}
                  className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-655 border border-red-200 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Hapus Order
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-3 bg-[#f6f3ed] hover:bg-[#eadecb] text-neutral-800 border border-[#eadecb] rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" /> Cetak Resi
                  </button>
                  
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-6 py-3 bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer shadow-sm"
                  >
                    Tutup Detail
                  </button>
                </div>
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

      {/* PRODUCT MODAL (ADD / EDIT) */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-xl border border-[#eadecb] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] luxury-border"
            >
              <div className="p-6 border-b border-[#eadecb]/50 flex justify-between items-center bg-[#fdfcf9]">
                <h3 className="font-serif text-lg text-neutral-900 tracking-wide">
                  {productForm.id ? "Ubah Informasi Produk" : "Tambah Produk Baru"}
                </h3>
                <button 
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="flex-grow overflow-y-auto">
                <div className="p-6 space-y-4 text-xs text-neutral-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Nama Produk
                      </label>
                      <input
                        type="text"
                        value={productForm.name}
                        onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Contoh: Aura Radiant Serum"
                        className="w-full px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] rounded-xl text-neutral-800 focus:border-[#c3a475] outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Slug URL unik
                      </label>
                      <input
                        type="text"
                        value={productForm.slug}
                        onChange={(e) => setProductForm(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-') }))}
                        placeholder="aura-radiant-serum"
                        className="w-full px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] rounded-xl font-mono text-neutral-800 focus:border-[#c3a475] outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                      Deskripsi Lengkap Produk
                    </label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      placeholder="Masukkan deskripsi produk secara detail, khasiat, cara pemakaian..."
                      className="w-full px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] rounded-xl leading-relaxed text-neutral-800 focus:border-[#c3a475] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Harga Jual Base (Rp)
                      </label>
                      <input
                        type="number"
                        value={productForm.base_price || ""}
                        onChange={(e) => setProductForm(prev => ({ ...prev, base_price: Number(e.target.value) }))}
                        className="w-full px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] rounded-xl text-neutral-800 focus:border-[#c3a475] outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        SKU Varian Utama
                      </label>
                      <input
                        type="text"
                        value={productForm.sku}
                        onChange={(e) => setProductForm(prev => ({ ...prev, sku: e.target.value }))}
                        placeholder="NEXA-RAD-SRM"
                        className="w-full px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] rounded-xl font-mono uppercase text-neutral-800 focus:border-[#c3a475] outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Harga Varian Utama (Rp)
                      </label>
                      <input
                        type="number"
                        value={productForm.price || ""}
                        onChange={(e) => setProductForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                        className="w-full px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] rounded-xl text-neutral-800 focus:border-[#c3a475] outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Stok Fisik Awal
                      </label>
                      <input
                        type="number"
                        value={productForm.stock === 0 ? "" : productForm.stock}
                        onChange={(e) => setProductForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                        className="w-full px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] rounded-xl text-neutral-800 focus:border-[#c3a475] outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Kategori Produk
                      </label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] rounded-xl text-neutral-800 focus:border-[#c3a475] outline-none cursor-pointer font-sans"
                      >
                        <option value="Skincare">Skincare</option>
                        <option value="Makeup">Makeup</option>
                        <option value="Anti-Aging">Anti-Aging</option>
                        <option value="Organik">Organik</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Tags / Label (pisahkan dengan koma)
                      </label>
                      <input
                        type="text"
                        value={productForm.tags}
                        onChange={(e) => setProductForm(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="Contoh: Skincare, Organik, Best Seller, Baru"
                        className="w-full px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] rounded-xl text-neutral-800 focus:border-[#c3a475] outline-none font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Kandungan Bahan Aktif (Ingredients)
                      </label>
                      <textarea
                        value={productForm.ingredients}
                        onChange={(e) => setProductForm(prev => ({ ...prev, ingredients: e.target.value }))}
                        rows={3}
                        placeholder="Kandungan bahan utama produk..."
                        className="w-full px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] rounded-xl leading-relaxed text-neutral-800 focus:border-[#c3a475] outline-none font-sans"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Cara Pemakaian (How to Use)
                      </label>
                      <textarea
                        value={productForm.howToUse}
                        onChange={(e) => setProductForm(prev => ({ ...prev, howToUse: e.target.value }))}
                        rows={3}
                        placeholder="Cara pemakaian produk..."
                        className="w-full px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] rounded-xl leading-relaxed text-neutral-800 focus:border-[#c3a475] outline-none font-sans"
                      />
                    </div>
                  </div>

                  {/* Images Upload / Preview list */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                      Foto & Galeri Produk
                    </label>
                    
                    <div className="flex flex-wrap gap-3 items-center">
                      {productForm.images?.map((imgUrl, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-xl border border-[#eadecb] overflow-hidden group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setProductForm(prev => ({
                              ...prev,
                              images: prev.images.filter((_, idx) => idx !== i)
                            }))}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {/* File upload trigger */}
                      <label className="w-16 h-16 border border-dashed border-[#c3a475] rounded-xl flex flex-col justify-center items-center cursor-pointer hover:bg-[#f6f3ed]/45 text-[#c3a475] transition-colors relative">
                        {isUploading ? (
                          <Loader2 className="w-5 h-5 animate-spin text-[#c3a475]" />
                        ) : (
                          <>
                            <Plus className="w-5 h-5" />
                            <span className="text-[8px] uppercase font-bold mt-1 text-center">Upload</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, "product")}
                          disabled={isUploading}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-[#eadecb]/40 bg-[#fdfcf9] flex justify-end gap-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-5 py-3 border border-[#eadecb] rounded-xl text-[10px] font-bold uppercase tracking-widest text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isProductSubmitting}
                    className="px-6 py-3 bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    {isProductSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Simpan Produk
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* JOURNAL MODAL (ADD / EDIT) */}
      <AnimatePresence>
        {isJournalModalOpen && (
          <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-xl border border-[#eadecb] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] luxury-border"
            >
              <div className="p-6 border-b border-[#eadecb]/50 flex justify-between items-center bg-[#fdfcf9]">
                <h3 className="font-serif text-lg text-neutral-900 tracking-wide">
                  {journalForm.id ? "Ubah Artikel Jurnal" : "Tulis Artikel Baru"}
                </h3>
                <button 
                  type="button"
                  onClick={() => setIsJournalModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleJournalSubmit} className="flex-grow overflow-y-auto">
                <div className="p-6 space-y-4 text-xs text-neutral-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Judul Artikel
                      </label>
                      <input
                        type="text"
                        value={journalForm.title}
                        onChange={(e) => setJournalForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Contoh: Rahasia Kulit Glowing Alami"
                        className="w-full px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] rounded-xl text-neutral-800 focus:border-[#c3a475] outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Slug URL unik
                      </label>
                      <input
                        type="text"
                        value={journalForm.slug}
                        onChange={(e) => setJournalForm(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-') }))}
                        placeholder="rahasia-kulit-glowing"
                        className="w-full px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] rounded-xl font-mono text-neutral-800 focus:border-[#c3a475] outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Kategori Jurnal
                      </label>
                      <select
                        value={journalForm.category}
                        onChange={(e) => setJournalForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] rounded-xl cursor-pointer text-neutral-800 outline-none"
                      >
                        <option value="Bahan Aktif">Bahan Aktif</option>
                        <option value="Tips Kulit">Tips Kulit</option>
                        <option value="Perawatan">Perawatan</option>
                        <option value="Sains Kecantikan">Sains Kecantikan</option>
                        <option value="Info Produk">Info Produk</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Waktu Baca
                      </label>
                      <input
                        type="text"
                        value={journalForm.read_time}
                        onChange={(e) => setJournalForm(prev => ({ ...prev, read_time: e.target.value }))}
                        placeholder="5 Menit Baca"
                        className="w-full px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] rounded-xl text-neutral-800 focus:border-[#c3a475] outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Penulis
                      </label>
                      <input
                        type="text"
                        value={journalForm.author}
                        onChange={(e) => setJournalForm(prev => ({ ...prev, author: e.target.value }))}
                        placeholder="dr. Livia W."
                        className="w-full px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] rounded-xl text-neutral-800 focus:border-[#c3a475] outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                      Kutipan Ringkas (Excerpt)
                    </label>
                    <input
                      type="text"
                      value={journalForm.excerpt}
                      onChange={(e) => setJournalForm(prev => ({ ...prev, excerpt: e.target.value }))}
                      placeholder="Ringkasan pendek 2-3 baris untuk kartu artikel..."
                      className="w-full px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] rounded-xl text-neutral-800 focus:border-[#c3a475] outline-none"
                    />
                  </div>

                  {/* Image Upload helper inside editor */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Unggah Foto Banner & Ilustrasi
                      </label>
                      <label className="text-[9px] font-bold text-[#c3a475] uppercase tracking-widest cursor-pointer hover:opacity-85 inline-flex items-center gap-1">
                        {isUploading ? (
                          <Loader2 className="w-3 animate-spin text-[#c3a475]" />
                        ) : (
                          <Plus className="w-3 h-3" />
                        )}
                        Unggah Gambar
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, "journal")}
                          disabled={isUploading}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                      Isi Artikel Jurnal (Markdown format)
                    </label>
                    <textarea
                      value={journalForm.content}
                      onChange={(e) => setJournalForm(prev => ({ ...prev, content: e.target.value }))}
                      rows={10}
                      placeholder="Masukkan konten lengkap artikel Anda dalam format Markdown..."
                      className="w-full px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] rounded-xl leading-relaxed font-mono text-neutral-800 focus:border-[#c3a475] outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-[#eadecb]/40 bg-[#fdfcf9] flex justify-end gap-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => setIsJournalModalOpen(false)}
                    className="px-5 py-3 border border-[#eadecb] rounded-xl text-[10px] font-bold uppercase tracking-widest text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isJournalSubmitting}
                    className="px-6 py-3 bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    {isJournalSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Terbitkan Artikel
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COUPON MODAL (ADD / EDIT) */}
      <AnimatePresence>
        {isCouponModalOpen && (
          <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md border border-[#eadecb] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] luxury-border"
            >
              <div className="p-6 border-b border-[#eadecb]/50 flex justify-between items-center bg-[#fdfcf9]">
                <h3 className="font-serif text-lg text-neutral-900 tracking-wide">
                  {couponForm.id ? "Ubah Voucher Diskon" : "Buat Voucher Baru"}
                </h3>
                <button 
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCouponSubmit}>
                <div className="p-6 space-y-4 text-xs text-neutral-700">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                      Kode Kupon / Voucher
                    </label>
                    <input
                      type="text"
                      value={couponForm.code}
                      onChange={(e) => setCouponForm(prev => ({ ...prev, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") }))}
                      placeholder="Contoh: GLOWING50"
                      className="w-full px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] rounded-xl font-mono font-bold text-sm tracking-widest text-neutral-800 focus:border-[#c3a475] outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Tipe Potongan
                      </label>
                      <select
                        value={couponForm.discount_type}
                        onChange={(e) => setCouponForm(prev => ({ ...prev, discount_type: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] rounded-xl cursor-pointer text-neutral-800 outline-none"
                      >
                        <option value="percentage">Persentase (%)</option>
                        <option value="fixed">Nominal Tetap (Rp)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Nilai Potongan
                      </label>
                      <input
                        type="number"
                        value={couponForm.discount_value || ""}
                        onChange={(e) => setCouponForm(prev => ({ ...prev, discount_value: Number(e.target.value) }))}
                        placeholder={couponForm.discount_type === "percentage" ? "10 (% )" : "15000 (Rp)"}
                        className="w-full px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] rounded-xl text-neutral-800 focus:border-[#c3a475] outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                      Minimal Belanja (Rp)
                    </label>
                    <input
                      type="number"
                      value={couponForm.min_purchase === 0 ? "" : couponForm.min_purchase}
                      onChange={(e) => setCouponForm(prev => ({ ...prev, min_purchase: Number(e.target.value) }))}
                      placeholder="0 (Tanpa Minimal)"
                      className="w-full px-3 py-2.5 border border-[#eadecb] bg-[#fdfcf9] rounded-xl text-neutral-800 focus:border-[#c3a475] outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 py-2">
                    <input
                      type="checkbox"
                      id="coupon-active-checkbox"
                      checked={couponForm.active}
                      onChange={(e) => setCouponForm(prev => ({ ...prev, active: e.target.checked }))}
                      className="w-4 h-4 rounded cursor-pointer accent-neutral-950"
                    />
                    <label htmlFor="coupon-active-checkbox" className="text-xs font-semibold text-neutral-800 cursor-pointer">
                      Aktifkan Voucher secara instan di Toko
                    </label>
                  </div>
                </div>

                <div className="p-6 border-t border-[#eadecb]/40 bg-[#fdfcf9] flex justify-end gap-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => setIsCouponModalOpen(false)}
                    className="px-5 py-3 border border-[#eadecb] rounded-xl text-[10px] font-bold uppercase tracking-widest text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isCouponSubmitting}
                    className="px-6 py-3 bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    {isCouponSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Simpan Voucher
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LANDING PAGE BUILDER MODAL (ADD / EDIT) */}
      <AnimatePresence>
        {isLpModalOpen && (
          <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-6xl border border-[#eadecb] rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh] luxury-border animate-fadeIn"
            >
              {/* Header */}
              <div className="p-6 border-b border-[#eadecb]/50 flex justify-between items-center bg-[#fdfcf9]">
                <div>
                  <h3 className="font-serif text-lg text-neutral-900 tracking-wide">
                    {lpForm.id ? "Ubah Landing Page" : "Buat Landing Page Baru"}
                  </h3>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">
                    Modul Simulator & Landing Page Builder
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                      Status
                    </label>
                    <select
                      value={lpForm.status}
                      onChange={(e) => setLpForm(prev => ({ ...prev, status: e.target.value as "Draft" | "Published" }))}
                      className="px-3 py-1.5 border border-[#eadecb] bg-white rounded-xl text-xs font-semibold outline-none cursor-pointer"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                    </select>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsLpModalOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body Layout: Split Screen */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left Side: Editor Form */}
                <div className="w-[45%] border-r border-[#eadecb]/40 overflow-y-auto p-6 space-y-6">
                  {/* Meta Settings */}
                  <div className="bg-[#fdfcf9] border border-[#eadecb]/60 p-4 rounded-2xl space-y-4">
                    <h4 className="text-[10px] font-bold text-[#c3a475] uppercase tracking-widest">
                      Pengaturan Meta Halaman
                    </h4>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                          Judul Halaman (Campaign Name)
                        </label>
                        <input
                          type="text"
                          value={lpForm.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLpForm(prev => ({
                              ...prev,
                              title: val,
                              slug: prev.id ? prev.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                            }));
                          }}
                          placeholder="Masukkan judul kampanye..."
                          className="w-full px-3 py-2 border border-[#eadecb] bg-white rounded-xl text-xs text-neutral-800 focus:border-[#c3a475] outline-none"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                          Slug URL
                        </label>
                        <div className="flex gap-2">
                          <span className="self-center text-[10px] font-mono text-neutral-400">/lp/</span>
                          <input
                            type="text"
                            value={lpForm.slug}
                            onChange={(e) => setLpForm(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                            placeholder="nama-slug-url"
                            className="flex-1 px-3 py-2 border border-[#eadecb] bg-white rounded-xl text-xs font-mono text-neutral-800 focus:border-[#c3a475] outline-none"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setLpForm(prev => ({
                              ...prev,
                              slug: prev.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                            }))}
                            className="px-3 py-1.5 border border-[#eadecb] rounded-xl text-[9px] font-bold uppercase tracking-widest text-neutral-500 hover:bg-neutral-50 cursor-pointer"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Add Block */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                      Tambah Blok Konten
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-[9px] font-bold tracking-widest uppercase">
                      <button
                        type="button"
                        onClick={() => addLpBlock("hero")}
                        className="py-2.5 border border-[#eadecb] rounded-xl hover:bg-[#faf8f5] flex items-center justify-center gap-1.5 cursor-pointer text-neutral-700 font-bold"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#c3a475]" /> Hero Section
                      </button>
                      <button
                        type="button"
                        onClick={() => addLpBlock("product_spotlight")}
                        className="py-2.5 border border-[#eadecb] rounded-xl hover:bg-[#faf8f5] flex items-center justify-center gap-1.5 cursor-pointer text-neutral-700 font-bold"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-[#c3a475]" /> Sorotan Produk
                      </button>
                      <button
                        type="button"
                        onClick={() => addLpBlock("benefits")}
                        className="py-2.5 border border-[#eadecb] rounded-xl hover:bg-[#faf8f5] flex items-center justify-center gap-1.5 cursor-pointer text-neutral-700 font-bold"
                      >
                        <Check className="w-3.5 h-3.5 text-[#c3a475]" /> Manfaat Klinis
                      </button>
                      <button
                        type="button"
                        onClick={() => addLpBlock("testimonials")}
                        className="py-2.5 border border-[#eadecb] rounded-xl hover:bg-[#faf8f5] flex items-center justify-center gap-1.5 cursor-pointer text-neutral-700 font-bold"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#c3a475]" /> Testimoni
                      </button>
                      <button
                        type="button"
                        onClick={() => addLpBlock("faq")}
                        className="py-2.5 border border-[#eadecb] rounded-xl hover:bg-[#faf8f5] flex items-center justify-center gap-1.5 cursor-pointer text-neutral-700 font-bold"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-[#c3a475]" /> Tanya Jawab (FAQ)
                      </button>
                      <button
                        type="button"
                        onClick={() => addLpBlock("lead_form")}
                        className="py-2.5 border border-[#eadecb] rounded-xl hover:bg-[#faf8f5] flex items-center justify-center gap-1.5 cursor-pointer text-neutral-700 font-bold"
                      >
                        <Users className="w-3.5 h-3.5 text-[#c3a475]" /> Formulir Lead
                      </button>
                    </div>
                  </div>

                  {/* Block Editor list */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                      Struktur Blok Halaman ({lpForm.blocks?.length || 0} Blok)
                    </h4>
                    {(!lpForm.blocks || lpForm.blocks.length === 0) ? (
                      <div className="p-8 text-center text-xs text-neutral-400 border border-dashed border-[#eadecb] rounded-2xl">
                        Belum ada blok. Silakan tambah blok dari pilihan di atas.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {lpForm.blocks.map((block, idx) => {
                          const { id, type, content } = block;
                          return (
                            <div 
                              key={id}
                              className="border border-[#eadecb] rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                              {/* Block Header */}
                              <div className="p-3 bg-[#fdfcf9] border-b border-[#eadecb]/50 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-neutral-700">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 font-mono text-[9px]">
                                    {idx + 1}
                                  </span>
                                  <span className="text-[#1c1a17]">
                                    {type === "hero" ? "Hero Banner" :
                                     type === "product_spotlight" ? "Sorotan Produk" :
                                     type === "benefits" ? "Daftar Manfaat" :
                                     type === "testimonials" ? "Ulasan / Testimoni" :
                                     type === "faq" ? "Pertanyaan (FAQ)" :
                                     type === "lead_form" ? "Formulir Registrasi Lead" : type}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => moveLpBlock(idx, "up")}
                                    disabled={idx === 0}
                                    className="p-1 hover:bg-neutral-100 rounded disabled:opacity-30 text-neutral-500 cursor-pointer font-bold text-xs"
                                    title="Pindahkan Ke Atas"
                                  >
                                    ↑
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveLpBlock(idx, "down")}
                                    disabled={idx === lpForm.blocks.length - 1}
                                    className="p-1 hover:bg-neutral-100 rounded disabled:opacity-30 text-neutral-500 cursor-pointer font-bold text-xs"
                                    title="Pindahkan Ke Bawah"
                                  >
                                    ↓
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => removeLpBlock(id)}
                                    className="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded cursor-pointer"
                                    title="Hapus Blok"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Block Form Content */}
                              <div className="p-4 space-y-3 text-xs text-neutral-700">
                                {type === "hero" && (
                                  <>
                                    <div className="space-y-1">
                                      <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-widest">Judul Utama</label>
                                      <input 
                                        type="text" 
                                        value={content.title || ""} 
                                        onChange={(e) => updateLpBlockContent(id, { title: e.target.value })}
                                        className="w-full px-2 py-1.5 border border-[#eadecb] rounded-lg bg-[#faf8f5] text-xs outline-none"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-widest">Sub-Judul / Penjelasan</label>
                                      <textarea 
                                        rows={2} 
                                        value={content.subtitle || ""} 
                                        onChange={(e) => updateLpBlockContent(id, { subtitle: e.target.value })}
                                        className="w-full px-2 py-1.5 border border-[#eadecb] rounded-lg bg-[#faf8f5] text-xs outline-none resize-none"
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="space-y-1">
                                        <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-widest">Teks Tombol CTA</label>
                                        <input 
                                          type="text" 
                                          value={content.cta_text || ""} 
                                          onChange={(e) => updateLpBlockContent(id, { cta_text: e.target.value })}
                                          className="w-full px-2 py-1.5 border border-[#eadecb] rounded-lg bg-[#faf8f5] text-xs outline-none"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-widest">Background Gradient</label>
                                        <select 
                                          value={content.bg_gradient || "from-[#faf8f5] to-[#f4ead4]"} 
                                          onChange={(e) => updateLpBlockContent(id, { bg_gradient: e.target.value })}
                                          className="w-full px-2 py-1.5 border border-[#eadecb] rounded-lg bg-[#faf8f5] text-xs outline-none cursor-pointer"
                                        >
                                          <option value="from-[#faf8f5] to-[#f4ead4]">Gold Cream</option>
                                          <option value="from-[#ffffff] to-[#faf8f5]">Ivory Soft</option>
                                          <option value="from-[#f7f5f0] to-[#eadecb]">Vintage Earth</option>
                                          <option value="from-[#fdfbf7] to-[#fcf5e3]">Luxe Champagne</option>
                                        </select>
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-widest">URL Gambar Produk</label>
                                      <input 
                                        type="text" 
                                        value={content.image_url || ""} 
                                        onChange={(e) => updateLpBlockContent(id, { image_url: e.target.value })}
                                        placeholder="Kosongkan untuk menggunakan gambar bawaan"
                                        className="w-full px-2 py-1.5 border border-[#eadecb] rounded-lg bg-[#faf8f5] text-xs outline-none font-mono"
                                      />
                                    </div>
                                  </>
                                )}

                                {type === "product_spotlight" && (
                                  <>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="space-y-1">
                                        <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-widest">Nama Produk</label>
                                        <input 
                                          type="text" 
                                          value={content.name || ""} 
                                          onChange={(e) => updateLpBlockContent(id, { name: e.target.value })}
                                          className="w-full px-2 py-1.5 border border-[#eadecb] rounded-lg bg-[#faf8f5] text-xs outline-none"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-widest">Harga Khusus (Rp)</label>
                                        <input 
                                          type="number" 
                                          value={content.price || ""} 
                                          onChange={(e) => updateLpBlockContent(id, { price: Number(e.target.value) })}
                                          className="w-full px-2 py-1.5 border border-[#eadecb] rounded-lg bg-[#faf8f5] text-xs outline-none"
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-widest">Judul Sorotan</label>
                                      <input 
                                        type="text" 
                                        value={content.title || ""} 
                                        onChange={(e) => updateLpBlockContent(id, { title: e.target.value })}
                                        className="w-full px-2 py-1.5 border border-[#eadecb] rounded-lg bg-[#faf8f5] text-xs outline-none"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-widest">Deskripsi Sorotan</label>
                                      <textarea 
                                        rows={2} 
                                        value={content.description || ""} 
                                        onChange={(e) => updateLpBlockContent(id, { description: e.target.value })}
                                        className="w-full px-2 py-1.5 border border-[#eadecb] rounded-lg bg-[#faf8f5] text-xs outline-none resize-none"
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="space-y-1">
                                        <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-widest">Teks Tombol Beli</label>
                                        <input 
                                          type="text" 
                                          value={content.btn_text || ""} 
                                          onChange={(e) => updateLpBlockContent(id, { btn_text: e.target.value })}
                                          className="w-full px-2 py-1.5 border border-[#eadecb] rounded-lg bg-[#faf8f5] text-xs outline-none"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-widest">Varian Produk</label>
                                        <input 
                                          type="text" 
                                          value={content.variant || ""} 
                                          onChange={(e) => updateLpBlockContent(id, { variant: e.target.value })}
                                          className="w-full px-2 py-1.5 border border-[#eadecb] rounded-lg bg-[#faf8f5] text-xs outline-none"
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-widest">URL Gambar Sorotan</label>
                                      <input 
                                        type="text" 
                                        value={content.image_url || ""} 
                                        onChange={(e) => updateLpBlockContent(id, { image_url: e.target.value })}
                                        placeholder="Kosongkan untuk menggunakan gambar bawaan"
                                        className="w-full px-2 py-1.5 border border-[#eadecb] rounded-lg bg-[#faf8f5] text-xs outline-none font-mono"
                                      />
                                    </div>
                                  </>
                                )}

                                {type === "benefits" && (
                                  <>
                                    <div className="space-y-1">
                                      <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-widest">Judul Bagian Manfaat</label>
                                      <input 
                                        type="text" 
                                        value={content.title || ""} 
                                        onChange={(e) => updateLpBlockContent(id, { title: e.target.value })}
                                        className="w-full px-2 py-1.5 border border-[#eadecb] rounded-lg bg-[#faf8f5] text-xs outline-none"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="block text-[8px] font-bold text-[#c3a475] uppercase tracking-widest">Daftar Item Manfaat</label>
                                      <div className="space-y-2">
                                        {(content.items || []).map((item: any, i: number) => (
                                          <div key={i} className="p-2 border border-[#eadecb]/60 bg-[#faf8f5] rounded-xl space-y-1 relative">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const items = (content.items || []).filter((_: any, idx: number) => idx !== i);
                                                updateLpBlockContent(id, { items });
                                              }}
                                              className="absolute top-2 right-2 text-red-400 hover:text-red-600 font-bold text-xs"
                                              title="Hapus Manfaat"
                                            >
                                              ×
                                            </button>
                                            <input 
                                              type="text" 
                                              value={item.title || ""} 
                                              placeholder="Judul Manfaat"
                                              onChange={(e) => {
                                                const items = [...(content.items || [])];
                                                items[i] = { ...items[i], title: e.target.value };
                                                updateLpBlockContent(id, { items });
                                              }}
                                              className="w-[90%] px-1.5 py-0.5 border border-neutral-200 bg-white rounded text-xs outline-none font-semibold"
                                            />
                                            <textarea 
                                              rows={1.5}
                                              value={item.desc || ""} 
                                              placeholder="Penjelasan singkat..."
                                              onChange={(e) => {
                                                const items = [...(content.items || [])];
                                                items[i] = { ...items[i], desc: e.target.value };
                                                updateLpBlockContent(id, { items });
                                              }}
                                              className="w-full px-1.5 py-0.5 border border-neutral-200 bg-white rounded text-xs outline-none resize-none"
                                            />
                                          </div>
                                        ))}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const items = [...(content.items || []), { title: "Manfaat Baru", desc: "Deskripsi singkat..." }];
                                            updateLpBlockContent(id, { items });
                                          }}
                                          className="text-[9px] font-bold text-[#c3a475] uppercase tracking-wider hover:underline animate-pulse"
                                        >
                                          + Tambah Manfaat
                                        </button>
                                      </div>
                                    </div>
                                  </>
                                )}

                                {type === "testimonials" && (
                                  <>
                                    <div className="space-y-1">
                                      <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-widest">Judul Bagian Testimoni</label>
                                      <input 
                                        type="text" 
                                        value={content.title || ""} 
                                        onChange={(e) => updateLpBlockContent(id, { title: e.target.value })}
                                        className="w-full px-2 py-1.5 border border-[#eadecb] rounded-lg bg-[#faf8f5] text-xs outline-none"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="block text-[8px] font-bold text-[#c3a475] uppercase tracking-widest">Daftar Review Pelanggan</label>
                                      <div className="space-y-2">
                                        {(content.items || []).map((item: any, i: number) => (
                                          <div key={i} className="p-2 border border-[#eadecb]/60 bg-[#faf8f5] rounded-xl space-y-1 relative">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const items = (content.items || []).filter((_: any, idx: number) => idx !== i);
                                                updateLpBlockContent(id, { items });
                                              }}
                                              className="absolute top-2 right-2 text-red-400 hover:text-red-600 font-bold text-xs"
                                              title="Hapus Testimoni"
                                            >
                                              ×
                                            </button>
                                            <textarea 
                                              rows={1.5}
                                              value={item.quote || ""} 
                                              placeholder="Ulasan pelanggan..."
                                              onChange={(e) => {
                                                const items = [...(content.items || [])];
                                                items[i] = { ...items[i], quote: e.target.value };
                                                updateLpBlockContent(id, { items });
                                              }}
                                              className="w-[90%] px-1.5 py-0.5 border border-neutral-200 bg-white rounded text-xs outline-none resize-none font-serif italic"
                                            />
                                            <div className="flex gap-2">
                                              <input 
                                                type="text" 
                                                value={item.author || ""} 
                                                placeholder="Nama Pelanggan"
                                                onChange={(e) => {
                                                  const items = [...(content.items || [])];
                                                  items[i] = { ...items[i], author: e.target.value };
                                                  updateLpBlockContent(id, { items });
                                                }}
                                                className="w-2/3 px-1.5 py-0.5 border border-neutral-200 bg-white rounded text-xs outline-none"
                                              />
                                              <select
                                                value={item.rating || 5}
                                                onChange={(e) => {
                                                  const items = [...(content.items || [])];
                                                  items[i] = { ...items[i], rating: Number(e.target.value) };
                                                  updateLpBlockContent(id, { items });
                                                }}
                                                className="w-1/3 px-1.5 py-0.5 border border-neutral-200 bg-white rounded text-xs outline-none cursor-pointer"
                                              >
                                                <option value="5">⭐⭐⭐⭐⭐</option>
                                                <option value="4">⭐⭐⭐⭐</option>
                                                <option value="3">⭐⭐⭐</option>
                                              </select>
                                            </div>
                                          </div>
                                        ))}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const items = [...(content.items || []), { quote: "Ulasan baru...", author: "Nama Pengguna", rating: 5 }];
                                            updateLpBlockContent(id, { items });
                                          }}
                                          className="text-[9px] font-bold text-[#c3a475] uppercase tracking-wider hover:underline animate-pulse"
                                        >
                                          + Tambah Review
                                        </button>
                                      </div>
                                    </div>
                                  </>
                                )}

                                {type === "faq" && (
                                  <>
                                    <div className="space-y-1">
                                      <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-widest">Judul Bagian FAQ</label>
                                      <input 
                                        type="text" 
                                        value={content.title || ""} 
                                        onChange={(e) => updateLpBlockContent(id, { title: e.target.value })}
                                        className="w-full px-2 py-1.5 border border-[#eadecb] rounded-lg bg-[#faf8f5] text-xs outline-none"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="block text-[8px] font-bold text-[#c3a475] uppercase tracking-widest">Daftar Pertanyaan & Jawaban</label>
                                      <div className="space-y-2">
                                        {(content.items || []).map((item: any, i: number) => (
                                          <div key={i} className="p-2 border border-[#eadecb]/60 bg-[#faf8f5] rounded-xl space-y-1 relative">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const items = (content.items || []).filter((_: any, idx: number) => idx !== i);
                                                updateLpBlockContent(id, { items });
                                              }}
                                              className="absolute top-2 right-2 text-red-400 hover:text-red-600 font-bold text-xs"
                                              title="Hapus FAQ"
                                            >
                                              ×
                                            </button>
                                            <input 
                                              type="text" 
                                              value={item.q || ""} 
                                              placeholder="Pertanyaan?"
                                              onChange={(e) => {
                                                const items = [...(content.items || [])];
                                                items[i] = { ...items[i], q: e.target.value };
                                                updateLpBlockContent(id, { items });
                                              }}
                                              className="w-[90%] px-1.5 py-0.5 border border-neutral-200 bg-white rounded text-xs outline-none font-semibold"
                                            />
                                            <textarea 
                                              rows={2}
                                              value={item.a || ""} 
                                              placeholder="Jawaban..."
                                              onChange={(e) => {
                                                const items = [...(content.items || [])];
                                                items[i] = { ...items[i], a: e.target.value };
                                                updateLpBlockContent(id, { items });
                                              }}
                                              className="w-full px-1.5 py-0.5 border border-neutral-200 bg-white rounded text-xs outline-none resize-none"
                                            />
                                          </div>
                                        ))}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const items = [...(content.items || []), { q: "Pertanyaan Baru?", a: "Jawaban pertanyaan." }];
                                            updateLpBlockContent(id, { items });
                                          }}
                                          className="text-[9px] font-bold text-[#c3a475] uppercase tracking-wider hover:underline animate-pulse"
                                        >
                                          + Tambah FAQ
                                        </button>
                                      </div>
                                    </div>
                                  </>
                                )}

                                {type === "lead_form" && (
                                  <>
                                    <div className="space-y-1">
                                      <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-widest">Judul Formulir</label>
                                      <input 
                                        type="text" 
                                        value={content.title || ""} 
                                        onChange={(e) => updateLpBlockContent(id, { title: e.target.value })}
                                        className="w-full px-2 py-1.5 border border-[#eadecb] rounded-lg bg-[#faf8f5] text-xs outline-none"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-widest">Deskripsi / Sub-judul</label>
                                      <textarea 
                                        rows={2} 
                                        value={content.subtitle || ""} 
                                        onChange={(e) => updateLpBlockContent(id, { subtitle: e.target.value })}
                                        className="w-full px-2 py-1.5 border border-[#eadecb] rounded-lg bg-[#faf8f5] text-xs outline-none resize-none"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="block text-[8px] font-bold text-neutral-400 uppercase tracking-widest">Teks Tombol Kirim</label>
                                      <input 
                                        type="text" 
                                        value={content.btn_text || ""} 
                                        onChange={(e) => updateLpBlockContent(id, { btn_text: e.target.value })}
                                        className="w-full px-2 py-1.5 border border-[#eadecb] rounded-lg bg-[#faf8f5] text-xs outline-none"
                                      />
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Interactive Preview */}
                <div className="w-[55%] bg-neutral-50 flex flex-col overflow-hidden select-none">
                  {/* Selector Bar */}
                  <div className="p-4 border-b border-[#eadecb]/40 bg-white flex justify-between items-center shrink-0">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                      Live Preview Simulator
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setLpPreviewMode("desktop")}
                        className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 ${
                          lpPreviewMode === "desktop"
                            ? "bg-neutral-900 text-white"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        }`}
                      >
                        <Globe className="w-3 h-3" /> Desktop
                      </button>
                      <button
                        type="button"
                        onClick={() => setLpPreviewMode("mobile")}
                        className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 ${
                          lpPreviewMode === "mobile"
                            ? "bg-neutral-900 text-white"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        }`}
                      >
                        <Smartphone className="w-3 h-3" /> Mobile
                      </button>
                    </div>
                  </div>

                  {/* Simulator Area */}
                  <div className="flex-1 overflow-y-auto p-8 flex items-start justify-center">
                    {lpPreviewMode === "desktop" ? (
                      /* Desktop Simulator View */
                      <div className="w-full bg-white border border-[#eadecb] rounded-2xl shadow-lg overflow-hidden flex flex-col min-h-[600px]">
                        {/* Browser Bar */}
                        <div className="bg-[#fcfbf9] px-4 py-2 border-b border-[#eadecb]/50 flex items-center gap-2 shrink-0">
                          <div className="flex gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                          </div>
                          <div className="flex-1 bg-white border border-[#eadecb]/30 rounded px-3 py-0.5 text-[9px] text-neutral-400 font-mono flex items-center justify-between">
                            <span>nexamart.com/lp/{lpForm.slug || "nama-slug-url"}</span>
                            <span className="text-[8px] bg-green-50 text-green-600 px-1 rounded font-bold uppercase">Public</span>
                          </div>
                        </div>

                        {/* Rendering Page Content inside simulated viewport */}
                        <div className="flex-1 bg-[#fdfcf9] overflow-y-auto text-neutral-800 text-left">
                          <header className="border-b border-[#eadecb]/40 bg-white/70 backdrop-blur-md px-6 py-4 flex justify-between items-center">
                            <span className="font-serif text-xs font-bold tracking-[0.2em] text-[#1c1a17]">
                              NEXAMART
                            </span>
                            <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-400 border border-neutral-200 px-3 py-1 rounded-full">
                              Pesan Sekarang
                            </span>
                          </header>

                          <main>
                            {(!lpForm.blocks || lpForm.blocks.length === 0) ? (
                              <div className="py-24 text-center text-xs text-neutral-400 font-sans italic">
                                Preview kosong. Tambahkan blok konten di panel kiri untuk mulai mendesain.
                              </div>
                            ) : (
                              lpForm.blocks.map((block) => {
                                const { id, type, content } = block;
                                return (
                                  <div key={id} className="relative group border-b border-neutral-100/50">
                                    {/* Component Indicator Badge */}
                                    <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900/80 text-white text-[7px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                                      {type} Block
                                    </div>

                                    {type === "hero" && (
                                      <section className={`bg-gradient-to-br ${content.bg_gradient || "from-[#faf8f5] to-[#f4ead4]"} py-10 px-8 grid grid-cols-2 gap-4 items-center`}>
                                        <div className="space-y-3">
                                          <div className="flex items-center gap-1 text-[#c3a475] text-[8px] font-bold uppercase tracking-widest">
                                            <Sparkles className="w-3 h-3 animate-pulse" /> Penawaran Eksklusif
                                          </div>
                                          <h1 className="font-serif text-lg font-light text-neutral-900 leading-tight">
                                            {content.title || "Kembalikan Kilau Alami Wajah Anda"}
                                          </h1>
                                          <p className="text-[10px] text-neutral-500 leading-relaxed">
                                            {content.subtitle || "Formula esens premium untuk memperkuat skin barrier Anda."}
                                          </p>
                                          <span className="inline-block px-5 py-2 bg-neutral-950 text-white text-[8px] font-bold uppercase tracking-widest rounded-full shadow-sm">
                                            {content.cta_text || "Dapatkan Sekarang"}
                                          </span>
                                        </div>
                                        <div className="flex justify-center">
                                          <div className="w-36 h-36 rounded-2xl overflow-hidden border border-[#eadecb]/50 shadow bg-white p-2">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img 
                                              src={content.image_url || "https://images.unsplash.com/photo-1608248597481-496100c8c836?w=600&auto=format&fit=crop&q=60"}
                                              alt="Preview Hero"
                                              className="w-full h-full object-cover rounded-xl"
                                            />
                                          </div>
                                        </div>
                                      </section>
                                    )}

                                    {type === "product_spotlight" && (
                                      <section className="py-10 px-8 bg-white grid grid-cols-2 gap-4 items-center">
                                        <div className="flex justify-center">
                                          <div className="w-28 h-36 rounded-xl overflow-hidden shadow-sm">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img 
                                              src={content.image_url || "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=60"}
                                              alt="Preview Spotlight"
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                        </div>
                                        <div className="space-y-3">
                                          <span className="text-[7px] font-bold uppercase tracking-widest text-[#c3a475] bg-[#f6f3ed] px-2 py-0.5 rounded-full inline-block">Sorotan Produk</span>
                                          <h2 className="font-serif text-sm font-light text-neutral-900 leading-snug">
                                            {content.title || "Mengapa Memilih Kami?"}
                                          </h2>
                                          <p className="text-[10px] text-neutral-500 leading-relaxed">
                                            {content.description || "Diformulasikan secara ilmiah untuk menghidrasi kulit secara mendalam."}
                                          </p>
                                          {content.price && (
                                            <div className="text-xs font-serif font-bold text-amber-800">
                                              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(content.price)}
                                            </div>
                                          )}
                                          <span className="inline-block px-5 py-2 bg-neutral-950 text-white text-[8px] font-bold uppercase tracking-widest rounded-full shadow-sm">
                                            {content.btn_text || "Beli Sekarang"}
                                          </span>
                                        </div>
                                      </section>
                                    )}

                                    {type === "benefits" && (
                                      <section className="py-10 px-8 bg-[#fdfcf9]">
                                        <h2 className="font-serif text-sm font-light text-neutral-950 text-center mb-6">
                                          {content.title || "Manfaat Hasil Studi Klinis"}
                                        </h2>
                                        <div className="grid grid-cols-3 gap-3">
                                          {(content.items || []).map((benefit: any, idx: number) => (
                                            <div key={idx} className="bg-white border border-[#eadecb] p-3 rounded-xl space-y-1">
                                              <div className="w-5 h-5 rounded-full bg-[#f6f3ed] flex items-center justify-center text-[#c3a475] text-[9px] font-bold">
                                                ✓
                                              </div>
                                              <h4 className="font-serif text-[10px] font-semibold text-neutral-900 leading-tight">
                                                {benefit.title || "Manfaat"}
                                              </h4>
                                              <p className="text-neutral-400 text-[8px] leading-relaxed">
                                                {benefit.desc || "Deskripsi..."}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      </section>
                                    )}

                                    {type === "testimonials" && (
                                      <section className="py-10 px-8 bg-white space-y-6">
                                        <h3 className="font-serif text-xs text-center font-light text-neutral-900">
                                          {content.title || "Apa Kata Pelanggan Setia"}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                          {(content.items || []).map((testi: any, idx: number) => (
                                            <div key={idx} className="bg-[#fdfcf9] border border-[#eadecb]/50 p-4 rounded-xl space-y-2">
                                              <div className="text-amber-500 text-[8px] flex gap-0.5">
                                                {Array.from({ length: testi.rating || 5 }).map((_, i) => <span key={i}>★</span>)}
                                              </div>
                                              <p className="text-[9px] text-neutral-600 font-serif italic leading-relaxed">
                                                &ldquo;{testi.quote}&rdquo;
                                              </p>
                                              <div className="flex items-center gap-1.5 pt-1">
                                                <div className="w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center text-[8px] font-bold text-neutral-500 font-sans">
                                                  {testi.author ? testi.author.charAt(0) : "U"}
                                                </div>
                                                <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-500 font-sans">{testi.author || "User"}</span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </section>
                                    )}

                                    {type === "faq" && (
                                      <section className="py-10 px-8 bg-[#fdfcf9] space-y-4">
                                        <h3 className="font-serif text-xs text-center font-light text-neutral-900">
                                          {content.title || "Tanya Jawab (FAQ)"}
                                        </h3>
                                        <div className="space-y-2">
                                          {(content.items || []).map((faq: any, idx: number) => (
                                            <div key={idx} className="bg-white border border-[#eadecb] rounded-lg p-3">
                                              <div className="font-serif text-[10px] font-bold text-neutral-800 flex justify-between">
                                                <span>{faq.q}</span>
                                                <span className="text-amber-600 font-sans font-bold">↓</span>
                                              </div>
                                              <p className="text-neutral-400 text-[9px] leading-relaxed mt-1 border-t border-neutral-50 pt-1">
                                                {faq.a}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      </section>
                                    )}

                                    {type === "lead_form" && (
                                      <section className="py-10 px-8 bg-white flex justify-center">
                                        <div className="bg-[#fdfcf9] border border-[#eadecb] p-6 rounded-2xl w-full max-w-sm space-y-4">
                                          <div className="text-center space-y-1">
                                            <h3 className="font-serif text-xs font-bold text-neutral-950">
                                              {content.title || "Konsultasikan Jenis Kulit Anda"}
                                            </h3>
                                            <p className="text-[8px] text-neutral-400 leading-normal">
                                              {content.subtitle || "Silakan lengkapi formulir di bawah ini."}
                                            </p>
                                          </div>
                                          <div className="space-y-2 text-[9px] font-sans">
                                            <input type="text" placeholder="Nama Lengkap" disabled className="w-full px-2 py-1.5 border border-[#eadecb] rounded bg-white text-[9px] outline-none" />
                                            <div className="grid grid-cols-2 gap-2">
                                              <input type="text" placeholder="No WhatsApp" disabled className="w-full px-2 py-1.5 border border-[#eadecb] rounded bg-white text-[9px] outline-none" />
                                              <input type="text" placeholder="Email" disabled className="w-full px-2 py-1.5 border border-[#eadecb] rounded bg-white text-[9px] outline-none" />
                                            </div>
                                            <textarea rows={1} placeholder="Catatan Masalah..." disabled className="w-full px-2 py-1.5 border border-[#eadecb] rounded bg-white text-[9px] outline-none resize-none" />
                                            <span className="w-full py-2 bg-neutral-950 text-white rounded text-[8px] font-bold uppercase tracking-widest text-center block">
                                              {content.btn_text || "Kirim Data"}
                                            </span>
                                          </div>
                                        </div>
                                      </section>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </main>

                          <footer className="border-t border-[#eadecb]/40 py-6 bg-[#faf8f5] text-center text-[8px] text-neutral-400">
                            <p className="font-serif text-neutral-500 font-bold mb-1">NEXAMART BEAUTY CLINICAL</p>
                            <p>© 2026 NEXAMART. Dibuat eksklusif untuk iklan & penawaran khusus.</p>
                          </footer>
                        </div>
                      </div>
                    ) : (
                      /* Mobile iPhone Frame View */
                      <div className="w-[320px] bg-neutral-950 border-[8px] border-neutral-900 rounded-[36px] shadow-2xl relative overflow-hidden flex flex-col shrink-0 min-h-[540px] max-h-[540px]">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-neutral-900 rounded-b-xl z-50 flex items-center justify-center">
                          <span className="w-8 h-1 bg-neutral-800 rounded-full mb-0.5"></span>
                        </div>

                        {/* Rendering Page Content inside simulated portrait viewport */}
                        <div className="flex-1 bg-[#fdfcf9] overflow-y-auto text-neutral-800 text-left pt-4">
                          <header className="border-b border-[#eadecb]/40 bg-white/70 backdrop-blur-md px-4 py-2.5 flex justify-between items-center">
                            <span className="font-serif text-[10px] font-bold tracking-[0.2em] text-[#1c1a17]">
                              NEXAMART
                            </span>
                            <span className="text-[7px] font-bold uppercase tracking-wider text-neutral-400 border border-neutral-200 px-2 py-0.5 rounded-full">
                              Pesan
                            </span>
                          </header>

                          <main>
                            {(!lpForm.blocks || lpForm.blocks.length === 0) ? (
                              <div className="py-24 text-center text-[10px] text-neutral-400 font-sans italic px-4">
                                Preview kosong. Tambahkan blok konten di panel kiri untuk mulai mendesain.
                              </div>
                            ) : (
                              lpForm.blocks.map((block) => {
                                const { id, type, content } = block;
                                return (
                                  <div key={id} className="relative group border-b border-neutral-100/50">
                                    {type === "hero" && (
                                      <section className={`bg-gradient-to-br ${content.bg_gradient || "from-[#faf8f5] to-[#f4ead4]"} py-8 px-4 flex flex-col gap-4 items-center text-center`}>
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-center gap-1 text-[#c3a475] text-[7px] font-bold uppercase tracking-widest">
                                            <Sparkles className="w-2.5 h-2.5 animate-pulse" /> Penawaran Eksklusif
                                          </div>
                                          <h1 className="font-serif text-sm font-light text-neutral-900 leading-tight">
                                            {content.title || "Kembalikan Kilau Alami Wajah Anda"}
                                          </h1>
                                          <p className="text-[9px] text-neutral-500 leading-normal">
                                            {content.subtitle || "Formula esens premium untuk memperkuat skin barrier Anda."}
                                          </p>
                                          <span className="inline-block px-4 py-1.5 bg-neutral-950 text-white text-[7px] font-bold uppercase tracking-widest rounded-full shadow-sm mt-1">
                                            {content.cta_text || "Dapatkan Sekarang"}
                                          </span>
                                        </div>
                                        <div className="flex justify-center">
                                          <div className="w-28 h-28 rounded-xl overflow-hidden border border-[#eadecb]/50 shadow bg-white p-1.5">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img 
                                              src={content.image_url || "https://images.unsplash.com/photo-1608248597481-496100c8c836?w=600&auto=format&fit=crop&q=60"}
                                              alt="Preview Hero"
                                              className="w-full h-full object-cover rounded-lg"
                                            />
                                          </div>
                                        </div>
                                      </section>
                                    )}

                                    {type === "product_spotlight" && (
                                      <section className="py-8 px-4 bg-white flex flex-col gap-4 items-center text-center">
                                        <div className="flex justify-center">
                                          <div className="w-24 h-32 rounded-xl overflow-hidden shadow-sm">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img 
                                              src={content.image_url || "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=60"}
                                              alt="Preview Spotlight"
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                          <span className="text-[7px] font-bold uppercase tracking-widest text-[#c3a475] bg-[#f6f3ed] px-2 py-0.5 rounded-full inline-block">Sorotan Produk</span>
                                          <h2 className="font-serif text-xs font-light text-neutral-900 leading-snug">
                                            {content.title || "Mengapa Memilih Kami?"}
                                          </h2>
                                          <p className="text-[9px] text-neutral-500 leading-normal">
                                            {content.description || "Diformulasikan secara ilmiah untuk menghidrasi kulit secara mendalam."}
                                          </p>
                                          {content.price && (
                                            <div className="text-[10px] font-serif font-bold text-amber-800">
                                              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(content.price)}
                                            </div>
                                          )}
                                          <span className="inline-block px-4 py-1.5 bg-neutral-950 text-white text-[7px] font-bold uppercase tracking-widest rounded-full shadow-sm">
                                            {content.btn_text || "Beli Sekarang"}
                                          </span>
                                        </div>
                                      </section>
                                    )}

                                    {type === "benefits" && (
                                      <section className="py-8 px-4 bg-[#fdfcf9]">
                                        <h2 className="font-serif text-xs font-light text-neutral-950 text-center mb-4">
                                          {content.title || "Manfaat Hasil Studi Klinis"}
                                        </h2>
                                        <div className="flex flex-col gap-2">
                                          {(content.items || []).map((benefit: any, idx: number) => (
                                            <div key={idx} className="bg-white border border-[#eadecb] p-2.5 rounded-xl space-y-1">
                                              <div className="w-4 h-4 rounded-full bg-[#f6f3ed] flex items-center justify-center text-[#c3a475] text-[7px] font-bold">
                                                ✓
                                              </div>
                                              <h4 className="font-serif text-[9px] font-semibold text-neutral-900 leading-tight">
                                                {benefit.title || "Manfaat"}
                                              </h4>
                                              <p className="text-neutral-400 text-[8px] leading-relaxed">
                                                {benefit.desc || "Deskripsi..."}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      </section>
                                    )}

                                    {type === "testimonials" && (
                                      <section className="py-8 px-4 bg-white space-y-4">
                                        <h3 className="font-serif text-[10px] text-center font-light text-neutral-900">
                                          {content.title || "Apa Kata Pelanggan Setia"}
                                        </h3>
                                        <div className="flex flex-col gap-3">
                                          {(content.items || []).map((testi: any, idx: number) => (
                                            <div key={idx} className="bg-[#fdfcf9] border border-[#eadecb]/50 p-3 rounded-xl space-y-1.5">
                                              <div className="text-amber-500 text-[7px] flex gap-0.5">
                                                {Array.from({ length: testi.rating || 5 }).map((_, i) => <span key={i}>★</span>)}
                                              </div>
                                              <p className="text-[8px] text-neutral-600 font-serif italic leading-relaxed">
                                                &ldquo;{testi.quote}&rdquo;
                                              </p>
                                              <div className="flex items-center gap-1.5 pt-0.5">
                                                <div className="w-4 h-4 rounded-full bg-neutral-200 flex items-center justify-center text-[7px] font-bold text-neutral-500 font-sans">
                                                  {testi.author ? testi.author.charAt(0) : "U"}
                                                </div>
                                                <span className="text-[7px] font-bold uppercase tracking-wider text-neutral-500 font-sans">{testi.author || "User"}</span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </section>
                                    )}

                                    {type === "faq" && (
                                      <section className="py-8 px-4 bg-[#fdfcf9] space-y-3">
                                        <h3 className="font-serif text-[10px] text-center font-light text-neutral-900">
                                          {content.title || "Tanya Jawab (FAQ)"}
                                        </h3>
                                        <div className="space-y-1.5">
                                          {(content.items || []).map((faq: any, idx: number) => (
                                            <div key={idx} className="bg-white border border-[#eadecb] rounded-lg p-2.5">
                                              <div className="font-serif text-[9px] font-bold text-neutral-800 flex justify-between">
                                                <span>{faq.q}</span>
                                                <span className="text-amber-600 font-sans font-bold">↓</span>
                                              </div>
                                              <p className="text-neutral-400 text-[8px] leading-relaxed mt-1 border-t border-neutral-50 pt-1">
                                                {faq.a}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      </section>
                                    )}

                                    {type === "lead_form" && (
                                      <section className="py-8 px-4 bg-white flex justify-center">
                                        <div className="bg-[#fdfcf9] border border-[#eadecb] p-4 rounded-xl w-full space-y-3">
                                          <div className="text-center space-y-1">
                                            <h3 className="font-serif text-[10px] font-bold text-neutral-950">
                                              {content.title || "Konsultasikan Jenis Kulit Anda"}
                                            </h3>
                                            <p className="text-[7px] text-neutral-400 leading-normal">
                                              {content.subtitle || "Silakan lengkapi formulir di bawah ini."}
                                            </p>
                                          </div>
                                          <div className="space-y-1.5 text-[8px] font-sans">
                                            <input type="text" placeholder="Nama Lengkap" disabled className="w-full px-2 py-1 border border-[#eadecb] rounded bg-white text-[8px] outline-none" />
                                            <input type="text" placeholder="No WhatsApp" disabled className="w-full px-2 py-1 border border-[#eadecb] rounded bg-white text-[8px] outline-none" />
                                            <input type="text" placeholder="Email" disabled className="w-full px-2 py-1 border border-[#eadecb] rounded bg-white text-[8px] outline-none" />
                                            <textarea rows={1} placeholder="Catatan Masalah..." disabled className="w-full px-2 py-1 border border-[#eadecb] rounded bg-white text-[8px] outline-none resize-none" />
                                            <span className="w-full py-1.5 bg-neutral-950 text-white rounded text-[7px] font-bold uppercase tracking-widest text-center block">
                                              {content.btn_text || "Kirim Data"}
                                            </span>
                                          </div>
                                        </div>
                                      </section>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </main>

                          <footer className="border-t border-[#eadecb]/40 py-4 bg-[#faf8f5] text-center text-[7px] text-neutral-400">
                            <p className="font-serif text-neutral-500 font-bold mb-0.5">NEXAMART BEAUTY CLINICAL</p>
                            <p>© 2026 NEXAMART.</p>
                          </footer>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Footer Actions */}
              <div className="p-6 border-t border-[#eadecb]/40 bg-[#fdfcf9] flex justify-between items-center shrink-0 font-sans">
                <div className="text-[9px] text-neutral-400 font-bold font-mono">
                  JSON SIZE: {JSON.stringify(lpForm.blocks).length} bytes
                </div>
                <div className="flex gap-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => setIsLpModalOpen(false)}
                    className="px-5 py-3 border border-[#eadecb] rounded-xl text-[10px] font-bold uppercase tracking-widest text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleLpSubmit(e as any)}
                    disabled={isLpSubmitting}
                    className="px-6 py-3 bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    {isLpSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Simpan Halaman
                      </>
                    )}
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print-invoice-area, .print-invoice-area * {
            visibility: visible;
          }
          .print-invoice-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
            height: 0 !important;
            width: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
          }
        }
      `}} />

    </div>
  );
}
