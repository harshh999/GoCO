export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";
import * as subscriptionsModule from "@/lib/database/subscriptions";
import * as storesModule from "@/lib/database/stores";

// GET /api/subscriptions - get subscription by storeId (admin or superadmin)
export async function GET(req: NextRequest) {
  try {
    const user = await getTokenFromRequest(req);
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const storeId = user.role === "ADMIN" ? user.id : searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json({ success: false, error: "Store ID required" }, { status: 400 });
    }

    const subscriptions = await subscriptionsModule.getSubscriptionsByStore(storeId);
    return NextResponse.json({ success: true, data: subscriptions });
  } catch (error) {
    console.error("[SUBSCRIPTIONS GET]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/subscriptions - create subscription (superadmin only)
export async function POST(req: NextRequest) {
  try {
    const user = await getTokenFromRequest(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { storeId, plan, startDate, endDate } = body;

    if (!storeId || !plan) {
      return NextResponse.json(
        { success: false, error: "Store ID and plan are required" },
        { status: 400 }
      );
    }

    // Create subscription with Unix timestamps
    const subscriptionId = await subscriptionsModule.createSubscription(storeId, {
      plan: plan,
      startDate: startDate ? new Date(startDate).getTime() : Date.now(),
      endDate: endDate ? new Date(endDate).getTime() : undefined,
      status: 'active'
    });

    // Update store with subscription info
    await storesModule.updateStore(storeId, {
      plan: plan,
      subscriptionStart: Date.now(),
      subscriptionEnd: endDate ? new Date(endDate).getTime() : undefined,
      status: 'active'
    });

    return NextResponse.json({ success: true, data: { id: subscriptionId, storeId, plan, status: 'active' } }, { status: 201 });
  } catch (error) {
    console.error("[SUBSCRIPTIONS POST]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/subscriptions - update subscription (superadmin only)
export async function PUT(req: NextRequest) {
  try {
    const user = await getTokenFromRequest(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { storeId, subscriptionId, status, endDate } = body;

    if (!subscriptionId) {
      return NextResponse.json({ success: false, error: "Subscription ID required" }, { status: 400 });
    }

    await subscriptionsModule.updateSubscription(storeId, subscriptionId, {
      status: status || undefined,
      endDate: endDate ? new Date(endDate).getTime() : undefined
    });

    return NextResponse.json({ success: true, message: "Subscription updated" });
  } catch (error) {
    console.error("[SUBSCRIPTIONS PUT]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
