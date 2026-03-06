export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

// POST /api/seed — one-time database seeder
// Only works if no users exist (prevents re-seeding)
export async function POST(req: NextRequest) {
  try {
    const { secret } = await req.json().catch(() => ({}));
    const expectedSecret = process.env.SEED_SECRET ?? "goretail-seed-2024";

    if (secret !== expectedSecret) {
      return NextResponse.json({ success: false, error: "Invalid seed secret" }, { status: 401 });
    }

    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      return NextResponse.json(
        { success: false, error: "Database already seeded" },
        { status: 400 }
      );
    }

    // Create SuperAdmin
    const superAdminPassword = await bcrypt.hash("superadmin123", 12);
    const superAdmin = await prisma.user.create({
      data: {
        email: "superadmin@goretail.com",
        password: superAdminPassword,
        name: "Super Admin",
        role: "SUPER_ADMIN",
      },
    });

    // Create Admin
    const adminPassword = await bcrypt.hash("admin123", 12);
    const admin = await prisma.user.create({
      data: {
        email: "admin@goretail.com",
        password: adminPassword,
        name: "Store Owner",
        role: "ADMIN",
      },
    });

    // Create Categories
    const categories = await Promise.all([
      prisma.category.create({ data: { name: "Electronics", slug: "electronics", description: "Tech gadgets and devices" } }),
      prisma.category.create({ data: { name: "Clothing", slug: "clothing", description: "Fashion and apparel" } }),
      prisma.category.create({ data: { name: "Accessories", slug: "accessories", description: "Bags, belts, and more" } }),
      prisma.category.create({ data: { name: "Home & Living", slug: "home-living", description: "Furniture and home essentials" } }),
    ]);

    // Create Store Settings
    await prisma.storeSettings.create({
      data: {
        storeName: "GoRetail Store",
        storeTagline: "Discover Our Collection",
        currency: "USD",
        currencySymbol: "$",
        primaryColor: "#0a0a0a",
        accentColor: "#6366f1",
      },
    });

    // Create sample products for each category
    const sampleProducts = [
      {
        name: "Premium Wireless Headphones",
        slug: "premium-wireless-headphones",
        description: "Experience crystal-clear audio with our premium wireless headphones. Featuring 40-hour battery life, active noise cancellation, and a foldable design perfect for travel.",
        price: 299.99,
        comparePrice: 399.99,
        sku: "ELEC-001",
        categoryId: categories[0].id,
        featured: true,
        images: [{ url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800", alt: "Premium Wireless Headphones", isPrimary: true, order: 0 }],
      },
      {
        name: "Minimalist Smart Watch",
        slug: "minimalist-smart-watch",
        description: "A sleek, minimalist smart watch with health tracking, notifications, and a 7-day battery life. Available in multiple band colors.",
        price: 249.99,
        comparePrice: 329.99,
        sku: "ELEC-002",
        categoryId: categories[0].id,
        featured: true,
        images: [{ url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800", alt: "Smart Watch", isPrimary: true, order: 0 }],
      },
      {
        name: "Classic White Sneakers",
        slug: "classic-white-sneakers",
        description: "Clean, versatile white sneakers crafted from premium leather. A timeless style that pairs with everything in your wardrobe.",
        price: 120.00,
        comparePrice: 150.00,
        sku: "CLTH-001",
        categoryId: categories[1].id,
        featured: true,
        images: [{ url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800", alt: "White Sneakers", isPrimary: true, order: 0 }],
      },
      {
        name: "Merino Wool Sweater",
        slug: "merino-wool-sweater",
        description: "Luxuriously soft merino wool sweater. Naturally temperature-regulating and odor-resistant. Perfect for any season.",
        price: 89.99,
        sku: "CLTH-002",
        categoryId: categories[1].id,
        featured: false,
        images: [{ url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800", alt: "Wool Sweater", isPrimary: true, order: 0 }],
      },
      {
        name: "Leather Tote Bag",
        slug: "leather-tote-bag",
        description: "Handcrafted genuine leather tote bag. Spacious interior with multiple compartments. The perfect everyday carry.",
        price: 195.00,
        comparePrice: 240.00,
        sku: "ACC-001",
        categoryId: categories[2].id,
        featured: true,
        images: [{ url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800", alt: "Leather Tote", isPrimary: true, order: 0 }],
      },
      {
        name: "Minimalist Desk Lamp",
        slug: "minimalist-desk-lamp",
        description: "Elegant adjustable desk lamp with 3 color temperatures and 5 brightness levels. USB charging port built in.",
        price: 79.99,
        sku: "HOME-001",
        categoryId: categories[3].id,
        featured: false,
        images: [{ url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800", alt: "Desk Lamp", isPrimary: true, order: 0 }],
      },
    ];

    for (const productData of sampleProducts) {
      const { images, ...rest } = productData;
      await prisma.product.create({
        data: { ...rest, images: { create: images } },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      data: {
        superAdmin: { email: superAdmin.email, role: superAdmin.role },
        admin: { email: admin.email, role: admin.role },
        categories: categories.length,
        products: sampleProducts.length,
      },
    });
  } catch (error) {
    console.error("[SEED]", error);
    return NextResponse.json({ success: false, error: "Seed failed" }, { status: 500 });
  }
}
