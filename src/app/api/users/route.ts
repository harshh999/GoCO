export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { users } from "@/lib/firestore";
import { getTokenFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getTokenFromRequest(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // list users (super admin only)
    const db = (await import('@/lib/firestoreAdmin')).then(m => m.getAdminFirestore())
    const snap = await (await db).collection('users').orderBy('createdAt','desc').get()
    const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    console.error("[USERS GET]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getTokenFromRequest(req);
    if (!authUser || authUser.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { email, password, name, role } = await req.json();
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    const existing = await users.getUserByEmail(email)
    if (existing) {
      return NextResponse.json({ success: false, error: "Email already in use" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const newUser = await users.createUser({ email, password: hashed, name, role: role ?? "ADMIN" })
    return NextResponse.json({ success: true, data: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role, createdAt: newUser.createdAt } }, { status: 201 });
  } catch (error) {
    console.error("[USERS POST]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
