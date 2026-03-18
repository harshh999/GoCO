export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import * as productsModule from "@/lib/database/products";

// GET /api/products/[id] - get single product by id or slug
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Try to get by product ID directly - we need storeId for RTDB
    // For now, search through all products
    const allProducts = await productsModule.getAllProducts();
    const product = allProducts.find(p => p.id === id || p.slug === id) || null;

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("[PRODUCT GET]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/products/[id] - update product
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getTokenFromRequest(req);
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, description, price, comparePrice, sku, inStock, featured, categoryId, images } = body;

    // Find the product first to get storeId
    const allProducts = await productsModule.getAllProducts();
    const existing = allProducts.find(p => p.id === id);
    
    if (!existing) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    // slug handling
    let slug = (existing as any).slug;
    if (name && name !== existing.name) {
      const newSlug = slugify(name);
      const storeProducts = await productsModule.getProductsByStore(existing.storeId!);
      const conflicting = storeProducts.find(p => p.slug === newSlug && p.id !== id);
      slug = conflicting ? `${newSlug}-${Date.now()}` : newSlug;
    }

    const updatePayload: any = {
      ...(name !== undefined && { name, slug }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(comparePrice !== undefined && { comparePrice: comparePrice ? parseFloat(comparePrice) : null }),
      ...(sku !== undefined && { sku }),
      ...(inStock !== undefined && { inStock }),
      ...(featured !== undefined && { featured }),
      ...(categoryId !== undefined && { categoryId: categoryId || null }),
      ...(images !== undefined && { images }),
    }

    await productsModule.updateProduct(existing.storeId!, id, updatePayload)

    const updated = await productsModule.getProduct(existing.storeId!, id)
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error("[PRODUCT PUT]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/products/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getTokenFromRequest(req);
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // Find the product first to get storeId
    const allProducts = await productsModule.getAllProducts();
    const existing = allProducts.find(p => p.id === id);
    
    if (!existing) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    await productsModule.deleteProduct(existing.storeId!, id)
    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("[PRODUCT DELETE]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
