export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";

// GET /api/products/[id] - get single product by id or slug
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }] },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("[PRODUCT GET]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
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
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { name, description, price, comparePrice, sku, inStock, featured, categoryId, images } = body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Update slug if name changed
    let slug = existing.slug;
    if (name && name !== existing.name) {
      const newSlug = slugify(name);
      const conflicting = await prisma.product.findFirst({
        where: { slug: newSlug, NOT: { id } },
      });
      slug = conflicting ? `${newSlug}-${Date.now()}` : newSlug;
    }

    // Handle images: delete old and insert new if provided
    if (images !== undefined) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name, slug }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(comparePrice !== undefined && {
          comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        }),
        ...(sku !== undefined && { sku }),
        ...(inStock !== undefined && { inStock }),
        ...(featured !== undefined && { featured }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(images !== undefined && {
          images: {
            create: images.map(
              (img: { url: string; alt?: string; isPrimary?: boolean; order?: number }, idx: number) => ({
                url: img.url,
                alt: img.alt ?? null,
                isPrimary: img.isPrimary ?? idx === 0,
                order: img.order ?? idx,
              })
            ),
          },
        }),
      },
      include: {
        category: true,
        images: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }] },
      },
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("[PRODUCT PUT]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
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
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("[PRODUCT DELETE]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
