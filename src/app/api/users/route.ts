export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAllUsers, getUserByEmail, createUser } from "@/lib/database/users";
import { getTokenFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getTokenFromRequest(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // list users (super admin only)
    const allUsers = await getAllUsers();
    return NextResponse.json({ success: true, data: allUsers });
  } catch (error) {
    console.error("[USERS GET]", error);
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getTokenFromRequest(req);
    if (!authUser || authUser.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { email, password, name, role, storeId } = await req.json();
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    const existing = await getUserByEmail(email)
    if (existing) {
      return NextResponse.json({ success: false, error: "Email already in use" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);
    
    // Generate a unique ID for the user
    const userId = email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() + '_' + Date.now();
    
    await createUser(userId, { 
      email, 
      passwordHash: hashed, 
      name, 
      role: role ?? "ADMIN",
      storeId: storeId ?? null
    })
    
    return NextResponse.json({ 
      success: true, 
      data: { 
        id: userId, 
        email, 
        name, 
        role: role ?? "ADMIN",
        storeId,
        createdAt: Date.now() 
      } 
    }, { status: 201 });
  } catch (error) {
    console.error("[USERS POST]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
