import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: "file:" + dbPath });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  console.log("🌱 Seeding database...");

  // Check if already seeded
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log("✅ Database already seeded. Skipping.");
    return;
  }

  // Super Admin
  const superAdminPassword = await bcrypt.hash("superadmin123", 12);
  await prisma.user.create({
    data: {
      email: "superadmin@goretail.com",
      password: superAdminPassword,
      name: "Super Admin",
      role: "SUPER_ADMIN",
    },
  });
  console.log("✅ Created SuperAdmin: superadmin@goretail.com / superadmin123");

  // Store Admin
  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.create({
    data: {
      email: "admin@goretail.com",
      password: adminPassword,
      name: "Store Owner",
      role: "ADMIN",
    },
  });
  console.log("✅ Created Admin:      admin@goretail.com / admin123");

  // Store Settings
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
  console.log("✅ Created store settings");

  // Categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Electronics", slug: "electronics", description: "Tech gadgets and devices" } }),
    prisma.category.create({ data: { name: "Clothing", slug: "clothing", description: "Fashion and apparel" } }),
    prisma.category.create({ data: { name: "Accessories", slug: "accessories", description: "Bags, belts, and more" } }),
    prisma.category.create({ data: { name: "Home & Living", slug: "home-living", description: "Furniture and home essentials" } }),
  ]);
  console.log(`✅ Created ${categories.length} categories`);

  // Sample products
  const products = [
    {
      name: "Premium Wireless Headphones",
      slug: "premium-wireless-headphones",
      description: "Experience crystal-clear audio with our premium wireless headphones. Featuring 40-hour battery life, active noise cancellation, and a foldable design perfect for travel.",
      price: 299.99,
      comparePrice: 399.99,
      sku: "ELEC-001",
      categoryId: categories[0].id,
      featured: true,
      images: [{ url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800", alt: "Headphones", isPrimary: true, order: 0 }],
    },
    {
      name: "Minimalist Smart Watch",
      slug: "minimalist-smart-watch",
      description: "A sleek, minimalist smart watch with health tracking, notifications, and a 7-day battery life.",
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
      description: "Clean, versatile white sneakers crafted from premium leather. A timeless style that pairs with everything.",
      price: 120.00,
      comparePrice: 150.00,
      sku: "CLTH-001",
      categoryId: categories[1].id,
      featured: true,
      images: [{ url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800", alt: "Sneakers", isPrimary: true, order: 0 }],
    },
    {
      name: "Merino Wool Sweater",
      slug: "merino-wool-sweater",
      description: "Luxuriously soft merino wool sweater. Naturally temperature-regulating and odor-resistant.",
      price: 89.99,
      sku: "CLTH-002",
      categoryId: categories[1].id,
      featured: false,
      images: [{ url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800", alt: "Sweater", isPrimary: true, order: 0 }],
    },
    {
      name: "Leather Tote Bag",
      slug: "leather-tote-bag",
      description: "Handcrafted genuine leather tote bag. Spacious interior with multiple compartments.",
      price: 195.00,
      comparePrice: 240.00,
      sku: "ACC-001",
      categoryId: categories[2].id,
      featured: true,
      images: [{ url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800", alt: "Tote", isPrimary: true, order: 0 }],
    },
    {
      name: "Minimalist Desk Lamp",
      slug: "minimalist-desk-lamp",
      description: "Elegant adjustable desk lamp with 3 color temperatures and USB charging port.",
      price: 79.99,
      sku: "HOME-001",
      categoryId: categories[3].id,
      featured: false,
      images: [{ url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800", alt: "Desk Lamp", isPrimary: true, order: 0 }],
    },
  ];

  for (const { images, ...rest } of products) {
    await prisma.product.create({
      data: { ...rest, images: { create: images } },
    });
  }
  console.log(`✅ Created ${products.length} sample products`);

  console.log("\n🎉 Database seeded successfully!\n");
  console.log("Login credentials:");
  console.log("  SuperAdmin: superadmin@goretail.com / superadmin123");
  console.log("  Admin:      admin@goretail.com / admin123");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
