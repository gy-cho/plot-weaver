// ============================================
// 파일 경로: app/api/storybooks/route.ts
// ============================================
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// GET /api/storybooks — 내 스토리북 목록
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const storybooks = await prisma.storybook.findMany({
    where: { ownerId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { persons: true } } },
  });

  return NextResponse.json(storybooks);
}

// POST /api/storybooks — 새 스토리북 생성
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const title = typeof body.title === "string" && body.title.trim() ? body.title.trim() : "새 스토리북";

  const storybook = await prisma.storybook.create({
    data: { title, ownerId: user.id },
  });

  return NextResponse.json(storybook, { status: 201 });
}
