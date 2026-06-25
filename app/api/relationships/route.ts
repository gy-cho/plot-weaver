// ============================================
// 파일 경로: app/api/relationships/route.ts
// ============================================
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { assertStorybookOwnership } from "@/lib/storybookOwnership";

// GET /api/relationships?storybookId=... — 특정 스토리북의 관계 목록 조회
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const storybookId = request.nextUrl.searchParams.get("storybookId");
  if (!storybookId) return NextResponse.json({ error: "storybookId가 필요합니다." }, { status: 400 });

  const storybook = await assertStorybookOwnership(storybookId, user.id);
  if (!storybook) return NextResponse.json({ error: "스토리북을 찾을 수 없습니다." }, { status: 404 });

  const relationships = await prisma.relationship.findMany({
    where: { storybookId },
    include: { from: true, to: true },
  });
  return NextResponse.json(relationships);
}

// POST /api/relationships — 새 관계 생성 (body에 storybookId 포함)
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await request.json();
  const { storybookId, fromId, toId, label } = body;

  if (!storybookId) return NextResponse.json({ error: "storybookId가 필요합니다." }, { status: 400 });
  if (!fromId || !toId) {
    return NextResponse.json({ error: "fromId와 toId는 필수입니다." }, { status: 400 });
  }
  if (fromId === toId) {
    return NextResponse.json({ error: "같은 인물끼리는 관계를 만들 수 없습니다." }, { status: 400 });
  }

  const storybook = await assertStorybookOwnership(storybookId, user.id);
  if (!storybook) return NextResponse.json({ error: "스토리북을 찾을 수 없습니다." }, { status: 404 });

  // 이미 어느 방향으로든 관계가 있는지 확인 (A→B든 B→A든 중복 방지)
  const existing = await prisma.relationship.findFirst({
    where: {
      storybookId,
      OR: [
        { fromId, toId },
        { fromId: toId, toId: fromId },
      ],
    },
  });
  if (existing) {
    return NextResponse.json({ error: "두 인물 사이에 이미 관계가 존재합니다." }, { status: 409 });
  }

  const relationship = await prisma.relationship.create({
    data: { storybookId, fromId, toId, label },
  });

  return NextResponse.json(relationship, { status: 201 });
}
