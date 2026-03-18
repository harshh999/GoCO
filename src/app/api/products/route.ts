export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import * as productsModule from "@/lib/database/products";
import { getAllProducts } from "@/lib/database/products";

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
    
    // If not provided, try to get from authenticated user
    if (!filterStoreId) {
      const user = await getTokenFromRequest(req);
      if (user && user.role === "ADMIN") filterStoreId = user.id;
    }

    let allProducts = []
    if (filterStoreId) {
      // Multi-tenant: filter by storeId
      allProducts = await productsModule.getProductsByStore(filterStoreId)
    } else {
      // SuperAdmin or public: fetch all products
      allProducts = await getAllProducts()
    }

    // apply search, category, featured filters
    const filtered = allProducts.filter((p: any) => {
      if (categoryId && p.categoryId !== categoryId) return false
      if (featured === 'true' && !p.featured) return false
      if (!search) return true
      const hay = ((p.name || '') + ' ' + (p.description || '')).toLowerCase()
      return hay.includes(search)
    })

    const total = filtered.length
    const items = filtered.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)

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
    const { name, description, price, comparePrice, sku, inStock, featured, categoryId, images, storeId } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        { success: false, error: "Name and price are required" },
        { status: 400 }
      );
    }

    // Generate unique slug
    let slug = slugify(name);
    
    // For admin users, use their ID as storeId; for superadmin, use provided storeId
    const productStoreId = user.role === "ADMIN" ? user.id : (storeId || null)
    
    if (!productStoreId) {
      return NextResponse.json(
        { success: false, error: "Store ID is required" },
        { status: 400 }
      );
    }

    // Check if slug exists for this store
    const existingProducts = await productsModule.getProductsByStore(productStoreId)
    const slugExists = existingProducts.some((p: any) => p.slug === slug)
    if (slugExists) slug = `${slug}-${Date.now()}`

    const productId = await productsModule.createProduct(productStoreId, {
      name,
      slug,
      description: description ?? null,
      price: parseFloat(price),
      comparePrice: comparePrice ? parseFloat(comparePrice) : null,
      sku: sku ?? null,
      inStock: inStock ?? true,
      featured: featured ?? false,
      categoryId: categoryId ?? null,
      images,
    })

    return NextResponse.json({ success: true, data: { id: productId } }, { status: 201 });
  } catch (error) {
    console.error("[PRODUCTS POST]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
