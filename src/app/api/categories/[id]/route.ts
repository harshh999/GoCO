export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { categories } from "@/lib/firestore";
import { products } from "@/lib/firestore";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let category = await categories.getCategoryById(id);
    if (!category) category = await categories.getCategoryBySlug(id);
    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }
    const prods = await products.getProductsByCategory(category.id)
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

    const existing = await categories.getCategoryById(id);
    if (!existing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    let slug = (existing as any).slug;
    if (name && name !== existing.name) {
      const newSlug = slugify(name);
      const conflict = await categories.getCategoryBySlug(newSlug);
      slug = conflict && conflict.id !== id ? `${newSlug}-${Date.now()}` : newSlug;
    }

    const updated = await categories.updateCategory(id, { ...(name !== undefined && { name, slug }), ...(description !== undefined && { description }) });
    const prods = await products.getProductsByCategory(id);
    return NextResponse.json({ success: true, data: { ...updated, _count: { products: prods.length } } });
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
    // Unassign products before deleting
    const prods = await products.getProductsByCategory(id);
    for (const p of prods) {
      await products.updateProduct((p as any).id, { categoryId: null });
    }
    await categories.deleteCategory(id);
    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("[CATEGORY DELETE]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
