import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminLogs, addAdminLog } from "@/lib/dbHelper";

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

// GET all admin activity logs
export async function GET(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logs = await getAdminLogs();
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error("GET Admin Logs API error:", error.message);
    return NextResponse.json({ error: error.message || "Failed to retrieve logs" }, { status: 500 });
  }
}

// POST create admin activity log manually
export async function POST(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body as { action: string };

    if (!action) {
      return NextResponse.json({ error: "Action content is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const username = cookieStore.get("admin_username")?.value || "system";
    const role = cookieStore.get("admin_role")?.value || "System";

    const log = await addAdminLog(username, role, action);
    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    console.error("POST Admin Log API error:", error.message);
    return NextResponse.json({ error: error.message || "Failed to log action" }, { status: 500 });
  }
}
