export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import * as categoriesModule from "@/lib/database/categories";
import * as productsModule from "@/lib/database/products";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get all categories and find by id or slug
    const allCategories = await categoriesModule.getAllCategories();
    const category = allCategories.find(c => c.id === id || c.slug === id);
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }
    
    const prods = await productsModule.getProductsByStore(category.storeId!)
      .then(products => products.filter(p => p.categoryId === category!.id));
    
    const result = { ...category, products: prods, _count: { products: prods.length } }
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[CATEGORY GET]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const { name, description } = await req.json();

    // Get all categories to find the existing one
    const allCategories = await categoriesModule.getAllCategories();
    const existing = allCategories.find(c => c.id === id);
    
    if (!existing) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    let slug = (existing as any).slug;
    if (name && name !== existing.name) {
      const newSlug = slugify(name);
      const conflict = allCategories.find(c => c.slug === newSlug && c.id !== id);
      slug = conflict ? `${newSlug}-${Date.now()}` : newSlug;
    }

    await categoriesModule.updateCategory(existing.storeId!, id, { 
      ...(name !== undefined && { name, slug }), 
      ...(description !== undefined && { description }) 
    });
    
    const prods = await productsModule.getProductsByStore(existing.storeId!)
      .then(products => products.filter(p => p.categoryId === id));
    
    return NextResponse.json({ success: true, data: { ...existing, _count: { products: prods.length } } });
  } catch (error) {
    console.error("[CATEGORY PUT]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

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
    
    // Get all categories to find the existing one
    const allCategories = await categoriesModule.getAllCategories();
    const existing = allCategories.find(c => c.id === id);
    
    if (!existing) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    // Unassign products before deleting
    const prods = await productsModule.getProductsByStore(existing.storeId!)
      .then(products => products.filter(p => p.categoryId === id));
    
    for (const p of prods) {
      await productsModule.updateProduct(existing.storeId!, p.id, { categoryId: null });
    }
    
    await categoriesModule.deleteCategory(existing.storeId!, id);
    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("[CATEGORY DELETE]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
