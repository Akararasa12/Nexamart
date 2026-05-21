import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";
import { getEmbedding } from "@/lib/ai";

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

// GET all knowledge base entries (excluding embedding column for payload size optimization)
export async function GET(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: knowledge, error } = await supabaseAdmin
      .from("store_knowledge")
      .select("id, content, metadata, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, knowledge });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("GET Knowledge API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to retrieve knowledge base" }, { status: 500 });
  }
}

// POST: Add new knowledge entry (generates embedding)
export async function POST(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content, metadata } = body as {
      content: string;
      metadata?: Record<string, unknown>;
    };

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    console.log(`Generating embedding for content: "${content.substring(0, 30)}..."`);
    const embedding = await getEmbedding(content);

    const { data, error } = await supabaseAdmin
      .from("store_knowledge")
      .insert([
        {
          content,
          embedding,
          metadata: metadata || {},
        },
      ])
      .select("id, content, metadata, created_at");

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, inserted: data });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("POST Knowledge API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to create knowledge entry" }, { status: 500 });
  }
}

// PUT: Update knowledge entry (regenerates embedding if content changed)
export async function PUT(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, content, metadata } = body as {
      id: string;
      content?: string;
      metadata?: Record<string, unknown>;
    };

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const updateData: {
      content?: string;
      embedding?: number[];
      metadata?: Record<string, unknown>;
    } = {};

    if (metadata !== undefined) {
      updateData.metadata = metadata;
    }

    if (content !== undefined) {
      updateData.content = content;
      console.log(`Regenerating embedding for updated content: "${content.substring(0, 30)}..."`);
      updateData.embedding = await getEmbedding(content);
    }

    const { data, error } = await supabaseAdmin
      .from("store_knowledge")
      .update(updateData)
      .eq("id", id)
      .select("id, content, metadata, created_at");

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, updated: data });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("PUT Knowledge API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to update knowledge entry" }, { status: 500 });
  }
}

// DELETE knowledge entry
export async function DELETE(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("store_knowledge")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, message: `Knowledge entry ${id} deleted successfully` });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("DELETE Knowledge API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to delete knowledge entry" }, { status: 500 });
  }
}
