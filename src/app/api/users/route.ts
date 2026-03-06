export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getTokenFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getTokenFromRequest(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: users });
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

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, error: "Email already in use" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const newUser = await prisma.user.create({
      data: { email, password: hashed, name, role: role ?? "ADMIN" },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (error) {
    console.error("[USERS POST]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
