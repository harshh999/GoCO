export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { leads } from "@/lib/firestore";

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

    const lead = await leads.createLead({
      name,
      phone,
      reason: reason ?? null,
      message: message ?? null,
      storeId: storeId ?? null,
    });

    return NextResponse.json({ success: true, data: lead }, { status: 201 });
  } catch (error) {
    console.error("[NON-PURCHASE POST]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
