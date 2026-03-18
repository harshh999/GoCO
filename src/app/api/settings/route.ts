export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import * as storeSettingsModule from "@/lib/database/storeSettings";
import { getTokenFromRequest } from "@/lib/auth";

export async function GET() {
  try {
    let settings = await storeSettingsModule.getStoreSettings();
    if (!settings) {
      await storeSettingsModule.createStoreSettings(undefined, {
        storeName: "GoRetail Store",
        currency: "USD",
        currencySymbol: "$",
        primaryColor: "#000000",
        accentColor: "#6366f1",
      });
      settings = await storeSettingsModule.getStoreSettings();
    }
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("[SETTINGS GET]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getTokenFromRequest(req);
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const storeId = user.role === "ADMIN" ? user.id : undefined;
    await storeSettingsModule.updateStoreSettings(storeId, body);
    const updated = await storeSettingsModule.getStoreSettings(storeId);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[SETTINGS PUT]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
