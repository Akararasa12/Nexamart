import { supabaseAdmin } from "./supabase";
import fs from "fs";
import path from "path";

// Path for local fallback JSON storage
// Path for local fallback JSON storage (use /tmp in Vercel serverless)
const FALLBACK_FILE = "/tmp/db_fallback.json";

export interface AdminAccount {
  id: string;
  username: string;
  role: "Owner" | "Admin" | "Manager";
  password: string;
  created_at: string;
}

export interface AdminLog {
  id: string;
  username: string;
  role: string;
  action: string;
  timestamp: string;
}

export interface LandingPageBlock {
  type: "hero" | "product_spotlight" | "benefits" | "testimonials" | "faq" | "lead_form";
  id: string;
  content: any; // Dynamic based on block type
}

export interface LandingPage {
  id: string;
  title: string;
  slug: string;
  status: "Draft" | "Published";
  blocks: LandingPageBlock[];
  created_at: string;
  updated_at: string;
}

export interface LandingPageLead {
  id: string;
  lp_slug: string;
  name: string;
  email: string;
  whatsapp: string;
  message: string;
  created_at: string;
}

// Ensure the fallback database file exists
function ensureFallbackDb() {
  if (!fs.existsSync(FALLBACK_FILE)) {
    const initialData = {
      admin_accounts: [
        {
          id: "1",
          username: "owner",
          role: "Owner",
          password: "nexa-admin-2026",
          created_at: new Date().toISOString()
        },
        {
          id: "2",
          username: "admin",
          role: "Admin",
          password: "nexa-admin-2026",
          created_at: new Date().toISOString()
        },
        {
          id: "3",
          username: "manager",
          role: "Manager",
          password: "nexa-admin-2026",
          created_at: new Date().toISOString()
        }
      ],
      admin_logs: [
        {
          id: "1",
          username: "system",
          role: "System",
          action: "Sistem log audit diinisialisasi.",
          timestamp: new Date().toISOString()
        }
      ],
      landing_pages: [
        {
          id: "lp-default-1",
          title: "Promo Eksklusif Aura Radiant Essence",
          slug: "aura-radiant-essence",
          status: "Published",
          blocks: [
            {
              type: "hero",
              id: "hero-1",
              content: {
                title: "Kembalikan Kilau Alami Wajah Anda",
                subtitle: "Formula eksklusif Galactomyces, Niacinamide, dan Rose Extract untuk mencerahkan dan menghaluskan skin-barrier Anda dalam 14 hari.",
                cta_text: "Dapatkan Sekarang",
                bg_gradient: "from-[#faf8f5] to-[#f4ead4]"
              }
            },
            {
              type: "product_spotlight",
              id: "spot-1",
              content: {
                product_slug: "aura-radiant-essence",
                title: "Mengapa Memilih Aura Radiant Essence?",
                description: "Diformulasikan secara ilmiah untuk menghidrasi kulit secara mendalam, mencerahkan bintik hitam, dan menyamarkan garis halus. Dipercaya oleh ribuan Royal Members.",
                btn_text: "Beli Sekarang (Diskon 10%)"
              }
            },
            {
              type: "benefits",
              id: "benefits-1",
              content: {
                title: "Manfaat Nyata Formula Kami",
                items: [
                  { title: "Mencerahkan 3x Lebih Cepat", desc: "Kandungan aktif menghambat sintesis melanin berlebih secara alami." },
                  { title: "Deep Hydration", desc: "Mengunci kelembapan kulit hingga 24 jam dengan kandungan Hyaluronic Acid." },
                  { title: "Memperkuat Skin Barrier", desc: "Fermentasi filtrat ragi mempercepat regenerasi sel kulit baru." }
                ]
              }
            },
            {
              type: "lead_form",
              id: "form-1",
              content: {
                title: "Tertarik Mendapatkan Sampul Sampel Gratis?",
                subtitle: "Isi formulir di bawah ini dan ahli kecantikan kami akan menghubungi Anda untuk konsultasi jenis kulit gratis serta pengiriman sampel.",
                btn_text: "Ajukan Sampel Gratis"
              }
            }
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      landing_page_leads: []
    };
    fs.mkdirSync(path.dirname(FALLBACK_FILE), { recursive: true });
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(initialData, null, 2), "utf-8");
  }
}

function readFallbackDb(): any {
  ensureFallbackDb();
  try {
    const raw = fs.readFileSync(FALLBACK_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeFallbackDb(data: any) {
  try {
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Gagal menulis database fallback:", e);
  }
}

// --- ADMIN ACCOUNTS FUNCTIONS ---
export async function getAdminAccounts(): Promise<AdminAccount[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("admin_accounts")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    // Fallback to local file
    const db = readFallbackDb();
    return db.admin_accounts || [];
  }
}

export async function saveAdminAccount(account: Omit<AdminAccount, "created_at">): Promise<AdminAccount> {
  const newAccount: AdminAccount = {
    ...account,
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabaseAdmin
      .from("admin_accounts")
      .upsert(newAccount)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    const db = readFallbackDb();
    const existingIdx = db.admin_accounts.findIndex((a: any) => a.id === account.id || a.username.toLowerCase() === account.username.toLowerCase());
    if (existingIdx >= 0) {
      db.admin_accounts[existingIdx] = { ...db.admin_accounts[existingIdx], ...account };
      newAccount.created_at = db.admin_accounts[existingIdx].created_at;
    } else {
      db.admin_accounts.push(newAccount);
    }
    writeFallbackDb(db);
    return newAccount;
  }
}

export async function deleteAdminAccount(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("admin_accounts")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (err) {
    const db = readFallbackDb();
    db.admin_accounts = db.admin_accounts.filter((a: any) => a.id !== id);
    writeFallbackDb(db);
    return true;
  }
}

// --- LOGS FUNCTIONS ---
export async function getAdminLogs(): Promise<AdminLog[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("admin_logs")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  } catch (err) {
    const db = readFallbackDb();
    const logs = db.admin_logs || [];
    return [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export async function addAdminLog(username: string, role: string, action: string): Promise<AdminLog> {
  const log: AdminLog = {
    id: Math.random().toString(36).substr(2, 9),
    username,
    role,
    action,
    timestamp: new Date().toISOString()
  };

  try {
    const { data, error } = await supabaseAdmin
      .from("admin_logs")
      .insert(log)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    const db = readFallbackDb();
    if (!db.admin_logs) db.admin_logs = [];
    db.admin_logs.unshift(log);
    // Keep max 200 logs locally
    if (db.admin_logs.length > 200) {
      db.admin_logs = db.admin_logs.slice(0, 200);
    }
    writeFallbackDb(db);
    return log;
  }
}

// --- LANDING PAGES FUNCTIONS ---
export async function getLandingPages(): Promise<LandingPage[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("landing_pages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    const db = readFallbackDb();
    return db.landing_pages || [];
  }
}

export async function getLandingPageBySlug(slug: string): Promise<LandingPage | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("landing_pages")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err) {
    const db = readFallbackDb();
    return db.landing_pages?.find((lp: any) => lp.slug === slug) || null;
  }
}

export async function saveLandingPage(lp: Omit<LandingPage, "created_at" | "updated_at">): Promise<LandingPage> {
  const now = new Date().toISOString();
  const page: LandingPage = {
    ...lp,
    created_at: now,
    updated_at: now
  };

  try {
    const { data, error } = await supabaseAdmin
      .from("landing_pages")
      .upsert(page)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    const db = readFallbackDb();
    if (!db.landing_pages) db.landing_pages = [];
    const idx = db.landing_pages.findIndex((p: any) => p.id === lp.id);
    if (idx >= 0) {
      const existing = db.landing_pages[idx];
      db.landing_pages[idx] = {
        ...existing,
        ...lp,
        updated_at: now
      };
      page.created_at = existing.created_at;
    } else {
      db.landing_pages.push(page);
    }
    writeFallbackDb(db);
    return page;
  }
}

export async function deleteLandingPage(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("landing_pages")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (err) {
    const db = readFallbackDb();
    db.landing_pages = db.landing_pages.filter((p: any) => p.id !== id);
    writeFallbackDb(db);
    return true;
  }
}

// --- LEADS FUNCTIONS ---
export async function getLandingPageLeads(): Promise<LandingPageLead[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("landing_page_leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    const db = readFallbackDb();
    return db.landing_page_leads || [];
  }
}

export async function addLandingPageLead(lead: Omit<LandingPageLead, "id" | "created_at">): Promise<LandingPageLead> {
  const newLead: LandingPageLead = {
    id: Math.random().toString(36).substr(2, 9),
    ...lead,
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabaseAdmin
      .from("landing_page_leads")
      .insert(newLead)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    const db = readFallbackDb();
    if (!db.landing_page_leads) db.landing_page_leads = [];
    db.landing_page_leads.unshift(newLead);
    writeFallbackDb(db);
    return newLead;
  }
}
