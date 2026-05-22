import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

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

// GET all products with variants
export async function GET(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("*, product_variants(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(
      { success: true, products },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (error: unknown) {
    const err = error as Error;
    console.error("GET Products API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to retrieve products" }, { status: 500 });
  }
}

// POST create product & variant
export async function POST(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, base_price, images, attributes, sku, stock, price } = body as {
      name: string;
      slug: string;
      description?: string;
      base_price: number;
      images?: string[];
      attributes?: Record<string, unknown>;
      sku: string;
      stock: number;
      price: number;
    };

    if (!name || !slug || base_price === undefined || !sku) {
      return NextResponse.json({ error: "Name, Slug, Base Price, and SKU are required" }, { status: 400 });
    }

    // 1. Insert product
    const { data: productData, error: productError } = await supabaseAdmin
      .from("products")
      .insert({
        name,
        slug,
        description: description || "",
        base_price,
        images: images || [],
        attributes: attributes || {}
      })
      .select()
      .single();

    if (productError) throw productError;

    // 2. Insert variant
    const { data: variantData, error: variantError } = await supabaseAdmin
      .from("product_variants")
      .insert({
        product_id: productData.id,
        sku,
        price: price || base_price,
        stock: stock || 0,
        variant_metadata: { shade: "Default", hex: "#000" }
      })
      .select()
      .single();

    if (variantError) throw variantError;

    return NextResponse.json({ success: true, product: productData, variant: variantData });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("POST Product API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to create product" }, { status: 500 });
  }
}

// PUT update product and its variant
export async function PUT(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, slug, description, base_price, images, attributes, sku, stock, price } = body as {
      id: string;
      name: string;
      slug: string;
      description?: string;
      base_price: number;
      images?: string[];
      attributes?: Record<string, unknown>;
      sku?: string;
      stock?: number;
      price?: number;
    };

    if (!id || !name || !slug || base_price === undefined) {
      return NextResponse.json({ error: "ID, Name, Slug, and Base Price are required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      name,
      slug,
      description,
      base_price,
      images: images || [],
    };
    if (attributes !== undefined) {
      updateData.attributes = attributes;
    }

    // 1. Update product
    const { data: updatedProduct, error: productError } = await supabaseAdmin
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select();

    if (productError) throw productError;

    // 2. Update default/first variant if variant info is supplied
    if (sku) {
      // Find the first variant for this product
      const { data: variants } = await supabaseAdmin
        .from("product_variants")
        .select("id")
        .eq("product_id", id)
        .limit(1);

      if (variants && variants.length > 0) {
        const variantId = variants[0].id;
        const { error: variantError } = await supabaseAdmin
          .from("product_variants")
          .update({
            sku,
            price: price !== undefined ? price : base_price,
            stock: stock !== undefined ? stock : 0
          })
          .eq("id", variantId);

        if (variantError) throw variantError;
      } else {
        // If somehow variant does not exist, create it
        const { error: variantError } = await supabaseAdmin
          .from("product_variants")
          .insert({
            product_id: id,
            sku,
            price: price !== undefined ? price : base_price,
            stock: stock !== undefined ? stock : 0,
            variant_metadata: { shade: "Default", hex: "#000" }
          });

        if (variantError) throw variantError;
      }
    }

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("PUT Product API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to update product" }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Deleting product triggers cascade deletion of variants
    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: `Product ${id} and its variants deleted successfully` });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("DELETE Product API error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to delete product" }, { status: 500 });
  }
}
