// ============================================
// 파일 경로: app/api/auth/logout/route.ts
// (app -> api -> auth -> logout 폴더 -> route.ts)
// ============================================
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return response;
}