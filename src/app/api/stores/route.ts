export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { users, products, customers } from "@/lib/firestore";
import getAdminFirestore from "@/lib/firestoreAdmin";

// GET /api/stores - public list of all store admins with their metadata
export async function GET() {
  try {
    // Get Firestore admin instance
    const db = getAdminFirestore();
    
    // Fetch all admin users using proper async/await
    const adminUsersSnap = await db
      .collection("users")
      .where("role", "==", "ADMIN")
      .orderBy("createdAt", "asc")
      .get();

    if (adminUsersSnap.empty) {
      return NextResponse.json({ success: true, data: [] });
    }

    const stores = [];
    for (const d of adminUsersSnap.docs) {
      const u = { id: d.id, ...(d.data() as any) };
      const prods = await products.listProductsByStore(u.id);
      const custs = await customers.getCustomersByStore(u.id);
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
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
