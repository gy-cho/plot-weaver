import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionToken, SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS } from "@/lib/auth";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15분

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "이메일과 비밀번호를 입력해주세요." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  // 짧은 시간에 너무 많이 틀리면 잠시 잠가서 무차별 대입 시도를 방어합니다.
  if (user.failedLoginCount >= MAX_FAILED_ATTEMPTS && user.lastFailedLoginAt) {
    const elapsed = Date.now() - user.lastFailedLoginAt.getTime();
    if (elapsed < LOCKOUT_DURATION_MS) {
      const remainingMin = Math.ceil((LOCKOUT_DURATION_MS - elapsed) / 60000);
      return NextResponse.json(
        { error: `로그인 시도가 너무 많습니다. ${remainingMin}분 후 다시 시도해주세요.` },
        { status: 429 }
      );
    }
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: { increment: 1 }, lastFailedLoginAt: new Date() },
    });
    return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  // 로그인 성공 시 실패 기록 초기화
  if (user.failedLoginCount > 0) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lastFailedLoginAt: null },
    });
  }

  const token = await createSessionToken(user.id);
  const response = NextResponse.json({ id: user.id, email: user.email });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION_SECONDS,
    path: "/",
  });
  return response;
}
