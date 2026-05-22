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

export async function POST(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Format unique filename
    const fileExtension = file.name.split(".").pop() || "png";
    const cleanFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
    const filePath = `uploads/${cleanFilename}`;

    // Upload to Supabase Storage bucket: "nexamart-media"
    const { data, error } = await supabaseAdmin.storage
      .from("nexamart-media")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      // Give a helpful error message to help user check bucket existence
      return NextResponse.json({ 
        error: `Gagal mengunggah file ke Supabase Storage: ${error.message}. Pastikan Anda sudah membuat bucket publik bernama 'nexamart-media' di Storage Supabase Anda.`
      }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from("nexamart-media")
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
      path: data.path
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Upload API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to upload image" }, { status: 500 });
  }
}
export const config = {
  api: {
    bodyParser: false, // Disables Next.js default bodyParser for files
  },
};
