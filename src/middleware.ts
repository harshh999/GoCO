import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth-edge";

const LOGIN_PATH = "/login";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /dashboard routes (admin)
  if (pathname.startsWith("/dashboard")) {
    const user = await getTokenFromRequest(req);
    if (!user) {
      const url = new URL(LOGIN_PATH, req.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Protect /superadmin routes
  if (pathname.startsWith("/superadmin")) {
    const user = await getTokenFromRequest(req);
    if (!user) {
      const url = new URL(LOGIN_PATH, req.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    if (user.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Redirect already-logged-in users away from /login
  if (pathname === LOGIN_PATH || pathname === "/admin/login") {
    const user = await getTokenFromRequest(req);
    if (user) {
      if (user.role === "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/superadmin/dashboard", req.url));
      }
      if (user.role === "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/superadmin/:path*", "/login", "/admin/login"],
};
