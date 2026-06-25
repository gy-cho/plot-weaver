// ============================================
// 파일 경로: app/api/persons/route.ts
// ============================================
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { assertStorybookOwnership } from "@/lib/storybookOwnership";

// GET /api/persons?storybookId=... — 특정 스토리북의 인물 목록 조회
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const storybookId = request.nextUrl.searchParams.get("storybookId");
  if (!storybookId) return NextResponse.json({ error: "storybookId가 필요합니다." }, { status: 400 });

  const storybook = await assertStorybookOwnership(storybookId, user.id);
  if (!storybook) return NextResponse.json({ error: "스토리북을 찾을 수 없습니다." }, { status: 404 });

  const persons = await prisma.person.findMany({
    where: { storybookId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(persons);
}

// POST /api/persons — 새 인물 등록 (body에 storybookId 포함). 필수 항목은 name 하나뿐입니다.
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await request.json();
  const { storybookId, name, color, imageUrl, originalImageUrl, positionX, positionY, customFields } = body;

  if (!storybookId) return NextResponse.json({ error: "storybookId가 필요합니다." }, { status: 400 });
  if (!name) return NextResponse.json({ error: "이름은 필수입니다." }, { status: 400 });

  const storybook = await assertStorybookOwnership(storybookId, user.id);
  if (!storybook) return NextResponse.json({ error: "스토리북을 찾을 수 없습니다." }, { status: 404 });

  const person = await prisma.person.create({
    data: {
      storybookId,
      name,
      color,
      imageUrl,
      originalImageUrl,
      positionX,
      positionY,
      customFields: customFields ?? [],
    },
  });

  return NextResponse.json(person, { status: 201 });
}
