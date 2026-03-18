export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/lib/database/users";
import { signToken, createSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // --- Hardcoded Fallback Users (For Vercel Persistence) ---
    const HARDCODED_USERS = [
      {
        id: "hardcoded-super-admin",
        email: "superadmin@goretail.com",
        password: "$2b$12$suOAwlqBnqeA7j3mf39qiuhS9M13eI3FLo3vp.WyFlaAvYabeQYhi", // SuperAdmin@123
        name: "System Administrator",
        role: "SUPER_ADMIN",
        storeId: "goretail-platform",
        storeName: "GoCo Platform",
      },
      {
        id: "hardcoded-store-admin",
        email: "admin1@freshcafe.com",
        password: "$2b$12$m3TM4FVMrGXrGXC4rbeWtOTk7OAoQiFWMV36ndsa8XDiG174E79O2", // Admin@123
        name: "Sarah Chen",
        role: "ADMIN",
        storeId: "fresh-cafe",
        storeName: "Fresh Organic Café",
      },
      {
        id: "hardcoded-store-admin-2",
        email: "admin2@urbanfashion.com",
        password: "$2b$12$m3TM4FVMrGXrGXC4rbeWtOTk7OAoQiFWMV36ndsa8XDiG174E79O2", // Admin@123
        name: "Marcus Rodriguez",
        role: "ADMIN",
        storeId: "urban-fashion",
        storeName: "Urban Fashion Boutique",
      },
      {
        id: "hardcoded-store-admin-3",
        email: "admin3@techgadgets.com",
        password: "$2b$12$m3TM4FVMrGXrGXC4rbeWtOTk7OAoQiFWMV36ndsa8XDiG174E79O2", // Admin@123
        name: "Priya Sharma",
        role: "ADMIN",
        storeId: "tech-gadgets",
        storeName: "Tech Gadgets Hub",
      }
    ];

    let user = await getUserByEmail(email);
    
    // If not in DB, check hardcoded users
    if (!user) {
      const fallbackUser = HARDCODED_USERS.find(u => u.email === email);
      if (fallbackUser) {
        // Cast to unknown first then to any to bypass strict checks if necessary, 
        // or just match the expected properties for the logic below.
        user = fallbackUser as unknown as typeof user;
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check password - support both password and passwordHash fields
    const passwordToCompare = (user as any).password || (user as any).passwordHash;
    const valid = await bcrypt.compare(password, passwordToCompare);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && user.role !== "superadmin" && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "SUPER_ADMIN" | "ADMIN" | "GUEST",
      storeId: (user as any).storeId ?? undefined,
      storeName: user.storeName ?? undefined,
    });

    const cookie = createSessionCookie(token);
    const response = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        storeName: user.storeName,
      },
    });

    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch (error) {
    console.error("[AUTH LOGIN]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
