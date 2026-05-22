import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { 
  getLandingPageLeads, 
  addLandingPageLead 
} from "@/lib/dbHelper";

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

// GET all landing page leads (admin only)
export async function GET(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const leads = await getLandingPageLeads();
    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    console.error("GET Landing Page Leads error:", error.message);
    return NextResponse.json({ error: error.message || "Failed to retrieve leads" }, { status: 500 });
  }
}

// POST create landing page lead (public)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lp_slug, name, email, whatsapp, message } = body;

    if (!lp_slug || !name || !whatsapp) {
      return NextResponse.json({ error: "Landing page slug, name, and whatsapp are required" }, { status: 400 });
    }

    const lead = await addLandingPageLead({
      lp_slug,
      name,
      email: email || "",
      whatsapp,
      message: message || ""
    });

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    console.error("POST Landing Page Lead error:", error.message);
    return NextResponse.json({ error: error.message || "Failed to save lead" }, { status: 500 });
  }
}
