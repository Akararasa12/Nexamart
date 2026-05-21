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
    // Ignore error in non-request contexts
  }
  return false;
}

export async function GET(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch all orders for aggregation
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (ordersError) {
      throw ordersError;
    }

    // 2. Fetch subscriptions count
    const { count: activeSubsCount, error: subsError } = await supabaseAdmin
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    if (subsError) {
      throw subsError;
    }

    const { count: totalSubsCount } = await supabaseAdmin
      .from("subscriptions")
      .select("*", { count: "exact", head: true });

    // 3. Compute stats
    let totalSales = 0;
    let paidOrdersCount = 0;
    let pendingOrdersCount = 0;
    let failedOrdersCount = 0;

    orders?.forEach((order) => {
      const isPaid = ["settlement", "capture", "paid"].includes(order.payment_status?.toLowerCase());
      const isFailed = ["failed", "expire", "deny"].includes(order.payment_status?.toLowerCase());
      
      if (isPaid) {
        totalSales += Number(order.total_amount) || 0;
        paidOrdersCount++;
      } else if (isFailed) {
        failedOrdersCount++;
      } else {
        pendingOrdersCount++;
      }
    });

    // 4. Group sales by date for simple chart (last 7 days)
    const salesHistoryMap: { [key: string]: number } = {};
    const today = new Date();
    
    // Initialize last 7 days with 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateString = d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
      salesHistoryMap[dateString] = 0;
    }

    orders?.forEach((order) => {
      const isPaid = ["settlement", "capture", "paid"].includes(order.payment_status?.toLowerCase());
      if (isPaid && order.created_at) {
        const orderDate = new Date(order.created_at);
        // check if order is within last 7 days
        const diffTime = Math.abs(today.getTime() - orderDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 7) {
          const dateString = orderDate.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
          if (salesHistoryMap[dateString] !== undefined) {
            salesHistoryMap[dateString] += Number(order.total_amount) || 0;
          }
        }
      }
    });

    const salesHistory = Object.keys(salesHistoryMap).map((date) => ({
      date,
      revenue: salesHistoryMap[date],
    }));

    // 5. Get recent 5 orders
    const recentOrders = orders ? orders.slice(0, 5) : [];

    return NextResponse.json({
      success: true,
      stats: {
        totalSales,
        totalOrders: orders ? orders.length : 0,
        paidOrders: paidOrdersCount,
        pendingOrders: pendingOrdersCount,
        failedOrders: failedOrdersCount,
        activeSubscriptions: activeSubsCount || 0,
        totalSubscriptions: totalSubsCount || 0,
        salesHistory,
        recentOrders,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Stats API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to retrieve statistics" }, { status: 500 });
  }
}
