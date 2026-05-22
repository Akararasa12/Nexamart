import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { 
  getLandingPages, 
  getLandingPageBySlug, 
  saveLandingPage, 
  deleteLandingPage, 
  addAdminLog 
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

// GET landing pages (all or by slug)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const page = await getLandingPageBySlug(slug);
      if (!page) {
        return NextResponse.json({ error: "Landing page not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, landingPage: page });
    }

    // Listing pages requires admin authentication
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pages = await getLandingPages();
    return NextResponse.json({ success: true, landingPages: pages });
  } catch (error: any) {
    console.error("GET Landing Pages error:", error.message);
    return NextResponse.json({ error: error.message || "Failed to retrieve landing pages" }, { status: 500 });
  }
}

// POST create landing page
export async function POST(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cookieStore = await cookies();
    const currentUsername = cookieStore.get("admin_username")?.value || "system";
    const currentRole = cookieStore.get("admin_role")?.value || "System";

    const body = await request.json();
    const { id, title, slug, status, blocks } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
    }

    const lpId = id || "lp-" + Math.random().toString(36).substr(2, 9);
    const saved = await saveLandingPage({
      id: lpId,
      title,
      slug: slug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, ""),
      status: status || "Draft",
      blocks: blocks || []
    });

    await addAdminLog(
      currentUsername,
      currentRole,
      `Membuat landing page baru: ${title} (/lp/${saved.slug})`
    );

    return NextResponse.json({ success: true, landingPage: saved });
  } catch (error: any) {
    console.error("POST Landing Page error:", error.message);
    return NextResponse.json({ error: error.message || "Failed to save landing page" }, { status: 500 });
  }
}

// PUT update landing page
export async function PUT(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cookieStore = await cookies();
    const currentUsername = cookieStore.get("admin_username")?.value || "system";
    const currentRole = cookieStore.get("admin_role")?.value || "System";

    const body = await request.json();
    const { id, title, slug, status, blocks } = body;

    if (!id || !title || !slug) {
      return NextResponse.json({ error: "ID, title, and slug are required" }, { status: 400 });
    }

    const saved = await saveLandingPage({
      id,
      title,
      slug: slug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, ""),
      status: status || "Draft",
      blocks: blocks || []
    });

    await addAdminLog(
      currentUsername,
      currentRole,
      `Memperbarui landing page: ${title} (/lp/${saved.slug})`
    );

    return NextResponse.json({ success: true, landingPage: saved });
  } catch (error: any) {
    console.error("PUT Landing Page error:", error.message);
    return NextResponse.json({ error: error.message || "Failed to update landing page" }, { status: 500 });
  }
}

// DELETE landing page
export async function DELETE(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cookieStore = await cookies();
    const currentUsername = cookieStore.get("admin_username")?.value || "system";
    const currentRole = cookieStore.get("admin_role")?.value || "System";

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const title = searchParams.get("title") || "unknown";

    if (!id) {
      return NextResponse.json({ error: "Landing page ID is required" }, { status: 400 });
    }

    await deleteLandingPage(id);

    await addAdminLog(
      currentUsername,
      currentRole,
      `Menghapus landing page: ${title}`
    );

    return NextResponse.json({ success: true, message: "Landing page deleted successfully" });
  } catch (error: any) {
    console.error("DELETE Landing Page error:", error.message);
    return NextResponse.json({ error: error.message || "Failed to delete landing page" }, { status: 500 });
  }
}
