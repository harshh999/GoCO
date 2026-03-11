export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { categories } from "@/lib/firestore";
import { products } from "@/lib/firestore";

export async function GET() {
  try {
    const cats = await categories.getCategories()
    const result = []
    for (const c of cats) {
      const prods = await products.getProductsByCategory(c.id)
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

    const { name, description } = await req.json();
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    let slug = slugify(name);
    const existing = await categories.getCategoryBySlug(slug);
    if (existing) slug = `${slug}-${Date.now()}`;

    const category = await categories.createCategory({ name, slug, description: description ?? null });
    return NextResponse.json({ success: true, data: { ...category, _count: { products: 0 } } }, { status: 201 });
  } catch (error) {
    console.error("[CATEGORIES POST]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
