export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getCustomersByStore, getAllCustomers, createCustomer } from "@/lib/database/customers";
import { getTokenFromRequest } from "@/lib/auth";

// GET /api/customers - list all customers (admin only)
export async function GET(req: NextRequest) {
  try {
    const user = await getTokenFromRequest(req);
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") ?? "").toLowerCase();
    const page = parseInt(searchParams.get("page") ?? "1");
    const pageSize = parseInt(searchParams.get("pageSize") ?? "50");

    const storeId = user.role === "ADMIN" ? user.id : undefined
    let allCustomers = []
    if (storeId) {
      allCustomers = await getCustomersByStore(storeId)
    } else {
      // SUPER_ADMIN: fetch all customers
      allCustomers = await getAllCustomers()
    }

    // simple search filter (contains in name/phone/email/businessName)
    const filtered = search
      ? allCustomers.filter((c: any) => ((c.name || '') + ' ' + (c.phone || '') + ' ' + (c.email || '') + ' ' + (c.businessName || '')).toLowerCase().includes(search))
      : allCustomers

    const total = filtered.length
    const items = filtered.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)

    return NextResponse.json({ success: true, data: { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } });
  } catch (error) {
    console.error("[CUSTOMERS GET]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/customers - create customer (admin or public catalog form)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, businessName, address, city, notes, storeId } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }

    if (!storeId) {
      return NextResponse.json({ success: false, error: "Store ID is required" }, { status: 400 });
    }

    const customerId = await createCustomer(storeId, {
      name,
      phone: phone ?? null,
      email: email ?? null,
      businessName: businessName ?? null,
      address: address ?? null,
      city: city ?? null,
      notes: notes ?? null,
    });

    return NextResponse.json({ success: true, data: { id: customerId, storeId } }, { status: 201 });
  } catch (error) {
    console.error("[CUSTOMERS POST]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
