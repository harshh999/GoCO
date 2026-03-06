export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await prisma.category.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        products: {
          include: { images: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }] } },
        },
        _count: { select: { products: true } },
      },
    });
    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: category });
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

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing)
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    let slug = existing.slug;
    if (name && name !== existing.name) {
      const newSlug = slugify(name);
      const conflict = await prisma.category.findFirst({ where: { slug: newSlug, NOT: { id } } });
      slug = conflict ? `${newSlug}-${Date.now()}` : newSlug;
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name, slug }),
        ...(description !== undefined && { description }),
      },
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json({ success: true, data: category });
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
    await prisma.product.updateMany({ where: { categoryId: id }, data: { categoryId: null } });
    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("[CATEGORY DELETE]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
