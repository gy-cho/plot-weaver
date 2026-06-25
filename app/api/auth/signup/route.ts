import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionToken, SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "이메일과 비밀번호를 입력해주세요." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "비밀번호는 8자 이상이어야 합니다." }, { status: 400 });
  }

  // 화이트리스트에 없는 이메일은 가입할 수 없습니다. (공개 서비스가 아니므로)
  const allowed = await prisma.allowedEmail.findUnique({ where: { email } });
  if (!allowed) {
    return NextResponse.json(
      { error: "가입이 허용되지 않은 이메일입니다. 관리자에게 문의해주세요." },
      { status: 403 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "이미 가입된 이메일입니다." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, passwordHash } });

  // 가입과 동시에 첫 스토리북을 하나 만들어줍니다 (빈 화면으로 시작하지 않도록)
  await prisma.storybook.create({
    data: { title: "첫 번째 스토리북", ownerId: user.id },
  });

  const token = await createSessionToken(user.id);
  const response = NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION_SECONDS,
    path: "/",
  });
  return response;
}
