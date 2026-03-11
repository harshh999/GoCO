export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createLogoutCookie } from "@/lib/auth";

export async function POST() {
  const cookie = createLogoutCookie();
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
