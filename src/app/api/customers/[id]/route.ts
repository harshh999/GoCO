export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { customers } from "@/lib/firestore";
import { getTokenFromRequest } from "@/lib/auth";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/customers/[id]
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = await getTokenFromRequest(req);
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const customer = await customers.getCustomer(id)
    if (!customer) {
      return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    console.error("[CUSTOMER GET]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/customers/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const user = await getTokenFromRequest(req);
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, phone, email, businessName, address, city, notes, totalPurchases, lastPurchaseDate } = body;

    const existing = await customers.getCustomer(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
    }

    const updated = await customers.updateCustomer(id, {
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(businessName !== undefined && { businessName }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(notes !== undefined && { notes }),
      ...(totalPurchases !== undefined && { totalPurchases: parseFloat(totalPurchases) }),
      ...(lastPurchaseDate !== undefined && { lastPurchaseDate: lastPurchaseDate ? new Date(lastPurchaseDate) : null }),
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[CUSTOMER PUT]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/customers/[id]
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await getTokenFromRequest(req);
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await customers.getCustomer(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
    }

    await customers.deleteCustomer(id);
    return NextResponse.json({ success: true, message: "Customer deleted" });
  } catch (error) {
    console.error("[CUSTOMER DELETE]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
