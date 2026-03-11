export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { products } from "@/lib/firestore";
import { getAdminFirestore } from "@/lib/firestoreAdmin";

// GET /api/products/[id] - get single product by id or slug
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let product = await products.getProduct(id).catch(() => null);
    if (!product) {
      // try slug lookup
      const db = getAdminFirestore()
      const q = await db.collection('products').where('slug', '==', id).limit(1).get()
      if (!q.empty) product = await products.getProduct(q.docs[0].id)
    }

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

    const existing = await products.getProduct(id);
    if (!existing) return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });

    // slug handling
    let slug = (existing as any).slug;
    if (name && name !== existing.name) {
      const newSlug = slugify(name);
      const db = getAdminFirestore()
      const q = await db.collection('products').where('slug', '==', newSlug).limit(1).get()
      const conflictingId = !q.empty ? q.docs[0].id : null
      slug = conflictingId && conflictingId !== id ? `${newSlug}-${Date.now()}` : newSlug
    }

    // delete existing images if replacing
    if (images !== undefined) {
      const db = getAdminFirestore()
      const imgsRef = db.collection('products').doc(id).collection('images')
      const snap = await imgsRef.get()
      if (!snap.empty) {
        const batch = db.batch()
        snap.docs.forEach(d => batch.delete(d.ref))
        await batch.commit()
      }
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
    }

    await products.updateProduct(id, updatePayload)
    if (images !== undefined && Array.isArray(images)) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i]
        await products.addProductImage(id, { id: img.id, url: img.url, alt: img.alt ?? null, isPrimary: img.isPrimary ?? (i === 0), order: img.order ?? i })
      }
    }

    const product = await products.getProduct(id)
    return NextResponse.json({ success: true, data: product })
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
    await products.deleteProduct(id)
    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("[PRODUCT DELETE]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
