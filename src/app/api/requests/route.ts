export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";
import * as requestsModule from "@/lib/database/requests";

// GET /api/requests - list requests (admin only, filtered by storeId)
export async function GET(req: NextRequest) {
  try {
    const user = await getTokenFromRequest(req);
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const storeId = user.role === "ADMIN" ? user.id : searchParams.get("storeId") || undefined;

    if (!storeId) {
      return NextResponse.json({ success: false, error: "Store ID required" }, { status: 400 });
    }

    const storeRequests = await requestsModule.getRequestsByStore(storeId);
    return NextResponse.json({ success: true, data: storeRequests });
  } catch (error) {
    console.error("[REQUESTS GET]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/requests - create a new request (public for customers)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storeId, productId, customerName, customerPhone, customerEmail, message } = body;

    if (!storeId || !customerName) {
      return NextResponse.json(
        { success: false, error: "Store ID and customer name are required" },
        { status: 400 }
      );
    }

    const requestId = await requestsModule.createRequest(storeId, {
      productId: productId || null,
      customerName,
      customerPhone: customerPhone || null,
      customerEmail: customerEmail || null,
      message: message || null,
      status: 'pending'
    });

    return NextResponse.json({ success: true, data: { id: requestId, storeId } }, { status: 201 });
  } catch (error) {
    console.error("[REQUESTS POST]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
