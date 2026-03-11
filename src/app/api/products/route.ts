export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { products } from "@/lib/firestore";
import { getAdminFirestore } from "@/lib/firestoreAdmin";

// GET /api/products - list all products (public, with optional filters)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") ?? "").toLowerCase();
    const categoryId = searchParams.get("categoryId") ?? undefined;
    const featured = searchParams.get("featured");
    const page = parseInt(searchParams.get("page") ?? "1");
    const pageSize = parseInt(searchParams.get("pageSize") ?? "20");

    const storeIdParam = searchParams.get("storeId") ?? undefined;
    let filterStoreId: string | undefined = storeIdParam;
    if (!filterStoreId) {
      const user = await getTokenFromRequest(req);
      if (user && user.role === "ADMIN") filterStoreId = user.id;
    }

    let allProducts: any[] = []
    if (filterStoreId) {
      allProducts = await products.listProductsByStore(filterStoreId)
    } else {
      // fetch all products
      const db = getAdminFirestore()
      const snap = await db.collection('products').orderBy('createdAt','desc').get()
      allProducts = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
      // fetch images for each product lazily in mapping below when needed
    }

    // apply search, category, featured filters
    let filtered = allProducts.filter(p => {
      if (categoryId && p.categoryId !== categoryId) return false
      if (featured === 'true' && !p.featured) return false
      if (!search) return true
      const hay = ((p.name || '') + ' ' + (p.description || '')).toLowerCase()
      return hay.includes(search)
    })

    const total = filtered.length
    const items = filtered.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)

    // attach images for returned items
    for (let i = 0; i < items.length; i++) {
      const prod = items[i]
      const imgs = await products.getProductImages(prod.id)
      prod.images = imgs
    }

    return NextResponse.json({ success: true, data: { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } })
  } catch (error) {
    console.error("[PRODUCTS GET]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/products - create product (admin only)
export async function POST(req: NextRequest) {
  try {
    const user = await getTokenFromRequest(req);
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, description, price, comparePrice, sku, inStock, featured, categoryId, images } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        { success: false, error: "Name and price are required" },
        { status: 400 }
      );
    }

    // Generate unique slug
    let slug = slugify(name);
    const db = getAdminFirestore()
    const q = await db.collection('products').where('slug', '==', slug).limit(1).get()
    if (!q.empty) slug = `${slug}-${Date.now()}`

    const storeId = user.role === "ADMIN" ? user.id : null
    const created = await products.createProduct(undefined, {
      name,
      slug,
      description: description ?? null,
      price: parseFloat(price),
      comparePrice: comparePrice ? parseFloat(comparePrice) : null,
      sku: sku ?? null,
      inStock: inStock ?? true,
      featured: featured ?? false,
      categoryId: categoryId ?? null,
      storeId,
      images,
    })

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error("[PRODUCTS POST]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
