export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getAllUsers } from "@/lib/database/users";
import { getProductsByStore } from "@/lib/database/products";
import { getCustomersByStore } from "@/lib/database/customers";

// GET /api/stores - public list of all store admins with their metadata
export async function GET() {
  try {
    // Get all admin users
    const allUsers = await getAllUsers();
    const adminUsers = allUsers.filter(u => u.role === "ADMIN" || u.role === "admin");

    if (adminUsers.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const stores = [];
    for (const u of adminUsers) {
      const prods = await getProductsByStore(u.id).catch(() => []);
      const custs = await getCustomersByStore(u.id).catch(() => []);
      stores.push({
        id: u.id,
        name: u.name,
        storeName: u.storeName,
        storeDesc: u.storeDesc,
        storeType: u.storeType,
        createdAt: u.createdAt,
        _count: { products: prods.length, customers: custs.length },
      });
    }

    return NextResponse.json({ success: true, data: stores });
  } catch (error) {
    console.error("[STORES GET]", error);
    // Return empty array instead of 500 error
    return NextResponse.json({ success: true, data: [] });
  }
}
