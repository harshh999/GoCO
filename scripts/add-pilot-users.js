// Adds/updates pilot accounts and store settings for the GoRetail pilot demo
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const path = require("path");

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: "file:" + dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Adding pilot accounts...\n");

  // 1 — SuperAdmin (GoCo)
  const saHash = await bcrypt.hash("GoCo@123", 12);
  await prisma.user.upsert({
    where: { email: "superadmin@goco.com" },
    update: { password: saHash, name: "GoCo SuperAdmin", role: "SUPER_ADMIN" },
    create: { email: "superadmin@goco.com", password: saHash, name: "GoCo SuperAdmin", role: "SUPER_ADMIN" },
  });
  console.log("✅ SuperAdmin:        superadmin@goco.com / GoCo@123");

  // Legacy superadmin
  const legacySaHash = await bcrypt.hash("superadmin123", 12);
  await prisma.user.upsert({
    where: { email: "superadmin@goretail.com" },
    update: { role: "SUPER_ADMIN" },
    create: { email: "superadmin@goretail.com", password: legacySaHash, name: "Super Admin", role: "SUPER_ADMIN" },
  });

  // 2 — Urban Threads admin
  const utHash = await bcrypt.hash("Urban@123", 12);
  await prisma.user.upsert({
    where: { email: "admin@urbanthreads.com" },
    update: { password: utHash, storeName: "Urban Threads" },
    create: { email: "admin@urbanthreads.com", password: utHash, name: "Urban Threads Admin", role: "ADMIN", storeName: "Urban Threads" },
  });
  console.log("✅ Urban Threads:     admin@urbanthreads.com / Urban@123");

  // 3 — Sneaker Lab admin
  const slHash = await bcrypt.hash("Sneaker@123", 12);
  await prisma.user.upsert({
    where: { email: "admin@sneakerlab.com" },
    update: { password: slHash, storeName: "Sneaker Lab" },
    create: { email: "admin@sneakerlab.com", password: slHash, name: "Sneaker Lab Admin", role: "ADMIN", storeName: "Sneaker Lab" },
  });
  console.log("✅ Sneaker Lab:       admin@sneakerlab.com / Sneaker@123");

  // Update legacy admin store name
  await prisma.user.update({
    where: { email: "admin@goretail.com" },
    data: { storeName: "GoRetail Store" },
  }).catch(() => {/* not critical if missing */});

  // 4 — Update store settings to ₹
  const existing = await prisma.storeSettings.findFirst();
  if (existing) {
    await prisma.storeSettings.update({
      where: { id: existing.id },
      data: {
        currency: "INR",
        currencySymbol: "₹",
        storeName: "GoRetail Store",
        storeTagline: "Discover Our Collection",
      },
    });
    console.log("✅ Store settings:    currency updated to ₹");
  } else {
    await prisma.storeSettings.create({
      data: {
        storeName: "GoRetail Store",
        storeTagline: "Discover Our Collection",
        currency: "INR",
        currencySymbol: "₹",
        primaryColor: "#0a0a0a",
        accentColor: "#6366f1",
      },
    });
    console.log("✅ Store settings:    created with ₹");
  }

  console.log("\n🎉 Pilot accounts ready!\n");
  console.log("─────────────────────────────────────────");
  console.log("  Role         Email                   Password");
  console.log("─────────────────────────────────────────");
  console.log("  SuperAdmin   superadmin@goco.com     GoCo@123");
  console.log("  Admin        admin@urbanthreads.com  Urban@123");
  console.log("  Admin        admin@sneakerlab.com    Sneaker@123");
  console.log("  Guest        (no login required)");
  console.log("─────────────────────────────────────────");

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
