export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest } from "@/lib/auth";

export async function GET() {
  try {
    let settings = await prisma.storeSettings.findFirst();
    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          storeName: "GoRetail Store",
          currency: "USD",
          currencySymbol: "$",
          primaryColor: "#000000",
          accentColor: "#6366f1",
        },
      });
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
    let settings = await prisma.storeSettings.findFirst();

    if (settings) {
      settings = await prisma.storeSettings.update({ where: { id: settings.id }, data: body });
    } else {
      settings = await prisma.storeSettings.create({ data: body });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("[SETTINGS PUT]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
