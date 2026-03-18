export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import * as leadsModule from "@/lib/database/leads";

// POST /api/non-purchase - submit a non-purchase lead (public)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, reason, message, storeId } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: "Name and phone are required" },
        { status: 400 }
      );
    }

    if (!storeId) {
      return NextResponse.json(
        { success: false, error: "Store ID is required" },
        { status: 400 }
      );
    }

    const leadId = await leadsModule.createLead(storeId, {
      name,
      phone,
      reason: reason ?? null,
      message: message ?? null,
    });

    return NextResponse.json({ success: true, data: { id: leadId, storeId } }, { status: 201 });
  } catch (error) {
    console.error("[NON-PURCHASE POST]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
