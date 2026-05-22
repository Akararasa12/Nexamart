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

// GET all journal posts
export async function GET(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: journals, error } = await supabaseAdmin
      .from("journals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(
      { success: true, journals },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (error: unknown) {
    const err = error as Error;
    console.error("GET Journals API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to retrieve journals" }, { status: 500 });
  }
}

// POST create journal post
export async function POST(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, content, excerpt, category, read_time, author } = body as {
      title: string;
      slug: string;
      content: string;
      excerpt?: string;
      category: string;
      read_time?: string;
      author?: string;
    };

    if (!title || !slug || !content || !category) {
      return NextResponse.json({ error: "Title, Slug, Content, and Category are required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("journals")
      .insert({
        title,
        slug,
        content,
        excerpt: excerpt || "",
        category,
        read_time: read_time || "5 Menit Baca",
        author: author || "dr. Livia W."
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, journal: data });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("POST Journal API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to create journal" }, { status: 500 });
  }
}

// PUT update journal post
export async function PUT(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, slug, content, excerpt, category, read_time, author } = body as {
      id: string;
      title: string;
      slug: string;
      content: string;
      excerpt?: string;
      category: string;
      read_time?: string;
      author?: string;
    };

    if (!id || !title || !slug || !content || !category) {
      return NextResponse.json({ error: "ID, Title, Slug, Content, and Category are required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("journals")
      .update({
        title,
        slug,
        content,
        excerpt,
        category,
        read_time,
        author
      })
      .eq("id", id)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, journal: data });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("PUT Journal API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to update journal" }, { status: 500 });
  }
}

// DELETE journal post
export async function DELETE(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Journal ID is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("journals")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: `Journal ${id} deleted successfully` });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("DELETE Journal API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to delete journal" }, { status: 500 });
  }
}
