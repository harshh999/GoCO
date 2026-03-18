export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import * as categoriesModule from "@/lib/database/categories";
import * as productsModule from "@/lib/database/products";

export async function GET(req: NextRequest) {
  try {
    const user = await getTokenFromRequest(req);
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    
    // If storeId is provided, filter by store (multi-tenant)
    // Otherwise if admin user, get categories for their store
    let categoryStoreId: string | undefined;
    
    if (storeId) {
      categoryStoreId = storeId;
    } else if (user && user.role === 'ADMIN') {
      categoryStoreId = user.id;
    }
    
    const cats = categoryStoreId 
      ? await categoriesModule.getCategoriesByStore(categoryStoreId)
      : await categoriesModule.getAllCategories();
      
    const result = []
    for (const c of cats) {
      const prods = await productsModule.getProductsByStore(c.storeId!)
        .then(products => products.filter(p => p.categoryId === c.id))
        .catch(() => []);
      result.push({ ...c, _count: { products: prods.length } })
    }
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[CATEGORIES GET]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getTokenFromRequest(req);
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name, description, storeId } = await req.json();
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    let slug = slugify(name);
    
    // For admin users, use their ID as storeId
    const categoryStoreId = user.role === 'ADMIN' ? user.id : (storeId || null);
    
    if (!categoryStoreId) {
      return NextResponse.json(
        { success: false, error: "Store ID is required" },
        { status: 400 }
      );
    }

    // Check if slug exists for this store
    const existingCategories = await categoriesModule.getCategoriesByStore(categoryStoreId);
    const slugExists = existingCategories.some(c => c.slug === slug);
    if (slugExists) slug = `${slug}-${Date.now()}`;

    const categoryId = await categoriesModule.createCategory(categoryStoreId, { 
      name, 
      slug, 
      description: description ?? null
    });
    
    return NextResponse.json({ 
      success: true, 
      data: { 
        id: categoryId,
        storeId: categoryStoreId,
        name, 
        slug, 
        description: description ?? null,
        _count: { products: 0 } 
      } 
    }, { status: 201 });
  } catch (error) {
    console.error("[CATEGORIES POST]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
