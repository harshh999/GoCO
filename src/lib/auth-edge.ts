/**
 * Edge-compatible auth utilities (no next/headers dependency).
 * Used by middleware which runs in Edge Runtime.
 * For server-side session reading in API routes / Server Components, use auth.ts.
 */
import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";
import { NextRequest } from "next/server";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "GUEST";

export interface JWTPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  storeName?: string;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "goretail-default-secret-change-me"
);

const COOKIE_NAME = "goretail_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getTokenFromRequest(
  req: NextRequest
): Promise<JWTPayload | null> {
  const token =
    req.cookies.get(COOKIE_NAME)?.value ??
    req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return verifyToken(token);
}

export function createSessionCookie(token: string): {
  name: string;
  value: string;
  options: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "lax";
    maxAge: number;
    path: string;
  };
} {
  return {
    name: COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_APP_URL?.includes("localhost"),
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    },
  };
}

export function createLogoutCookie() {
  return {
    name: COOKIE_NAME,
    value: "",
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_APP_URL?.includes("localhost"),
      sameSite: "lax" as const,
      maxAge: 0,
      path: "/",
    },
  };
}
