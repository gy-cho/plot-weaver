// ============================================
// 파일 경로: app/api/auth/me/route.ts
// (app -> api -> auth -> me 폴더 -> route.ts)
// ============================================
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user: { id: user.id, email: user.email } });
}