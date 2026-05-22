import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

async function verifyAuth(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader === "Bearer nexa_admin_authenticated") {
    return true;
  }
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;
    if (session === "nexa_admin_authenticated") {
      return true;
    }
  } catch {
    // Ignore error
  }
  return false;
}

function escapeCsv(val: unknown): string {
  if (val === null || val === undefined) return "";
  let str = "";
  if (typeof val === "object") {
    str = JSON.stringify(val);
  } else {
    str = String(val);
  }
  // Escape double quotes by doubling them
  str = str.replace(/"/g, '""');
  // Enclose in double quotes
  return `"${str}"`;
}

export async function GET(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (!type || !["orders", "customers", "products", "subscriptions"].includes(type)) {
      return NextResponse.json({ error: "Invalid or missing type param" }, { status: 400 });
    }

    let csvContent = "";
    let headers: string[] = [];
    const rows: string[][] = [];

    // --- 1. EXPORT ORDERS ---
    if (type === "orders") {
      const { data: orders, error } = await supabaseAdmin
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      headers = [
        "Order ID",
        "Total Amount",
        "Payment Status",
        "Shipping Status",
        "Tracking Number",
        "Customer Name",
        "Phone",
        "Email",
        "Address",
        "City",
        "Postal Code",
        "Shipping Cost",
        "Shipping Service",
        "Created At"
      ];

      orders?.forEach((o) => {
        const addr = o.shipping_address || {};
        rows.push([
          o.id,
          String(o.total_amount),
          o.payment_status,
          o.shipping_status,
          o.tracking_number || "-",
          addr.name || "-",
          addr.phone || "-",
          addr.email || "-",
          addr.address || "-",
          addr.city || "-",
          addr.postal_code || "-",
          String(addr.shipping_cost || 0),
          addr.shipping_service || "-",
          o.created_at
        ]);
      });
    }
    // --- 2. EXPORT CUSTOMERS ---
    else if (type === "customers") {
      const { data: orders, error } = await supabaseAdmin
        .from("orders")
        .select("*");

      if (error) throw error;

      // Extract unique customers based on Phone (since email can be missing, phone is unique enough)
      const customerMap = new Map<string, {
        name: string;
        phone: string;
        email: string;
        totalOrders: number;
        totalSpent: number;
        lastAddress: string;
        lastOrderDate: string;
      }>();

      orders?.forEach((o) => {
        const addr = o.shipping_address || {};
        const phone = addr.phone || "unknown-phone";
        const email = addr.email || "-";
        const name = addr.name || "Nama Tidak Diketahui";
        const amount = Number(o.total_amount) || 0;
        const addressText = `${addr.address || ""}, ${addr.city || ""}, ${addr.postal_code || ""}`;

        const existing = customerMap.get(phone);
        if (existing) {
          existing.totalOrders += 1;
          existing.totalSpent += ["settlement", "capture", "paid"].includes(o.payment_status?.toLowerCase()) ? amount : 0;
          if (new Date(o.created_at) > new Date(existing.lastOrderDate)) {
            existing.lastOrderDate = o.created_at;
            existing.lastAddress = addressText;
          }
        } else {
          customerMap.set(phone, {
            name,
            phone,
            email,
            totalOrders: 1,
            totalSpent: ["settlement", "capture", "paid"].includes(o.payment_status?.toLowerCase()) ? amount : 0,
            lastAddress: addressText,
            lastOrderDate: o.created_at
          });
        }
      });

      headers = [
        "Customer Name",
        "Phone",
        "Email",
        "Total Orders",
        "Total Spent (IDR)",
        "Last Shipping Address",
        "Last Order Date"
      ];

      customerMap.forEach((c) => {
        rows.push([
          c.name,
          c.phone,
          c.email,
          String(c.totalOrders),
          String(c.totalSpent),
          c.lastAddress,
          c.lastOrderDate
        ]);
      });
    }
    // --- 3. EXPORT PRODUCTS ---
    else if (type === "products") {
      const { data: products, error } = await supabaseAdmin
        .from("products")
        .select("*, product_variants(*)")
        .order("name", { ascending: true });

      if (error) throw error;

      headers = [
        "Product ID",
        "Product Name",
        "Slug",
        "Base Price (IDR)",
        "SKU Varian",
        "Harga Varian (IDR)",
        "Stok Varian",
        "Created At"
      ];

      products?.forEach((p) => {
        const variants = p.product_variants || [];
        if (variants.length === 0) {
          rows.push([
            p.id,
            p.name,
            p.slug,
            String(p.base_price),
            "-",
            "-",
            "0",
            p.created_at
          ]);
        } else {
          variants.forEach((v: { sku: string; price: number; stock: number }) => {
            rows.push([
              p.id,
              p.name,
              p.slug,
              String(p.base_price),
              v.sku,
              String(v.price),
              String(v.stock),
              p.created_at
            ]);
          });
        }
      });
    }
    // --- 4. EXPORT SUBSCRIPTIONS ---
    else if (type === "subscriptions") {
      const { data: subs, error } = await supabaseAdmin
        .from("subscriptions")
        .select("*, products(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      headers = [
        "Subscription ID",
        "User ID",
        "Product Name",
        "Frequency",
        "Next Billing Date",
        "Status",
        "Created At"
      ];

      subs?.forEach((s) => {
        const prodName = s.products?.name || "Produk Hilang";
        rows.push([
          s.id,
          s.user_id || "Guest / Anon",
          prodName,
          s.frequency,
          s.next_billing_date,
          s.status,
          s.created_at
        ]);
      });
    }

    // Build CSV String
    const headerRow = headers.map(escapeCsv).join(",");
    const bodyRows = rows.map(r => r.map(escapeCsv).join(",")).join("\n");
    csvContent = headerRow + "\n" + bodyRows;

    // Return as downloadable response
    const filename = `${type}_report_${new Date().toISOString().substring(0, 10)}.csv`;
    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error("GET Export API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to generate report" }, { status: 500 });
  }
}
