// ============================================
// 파일 경로: app/api/storybooks/[id]/route.ts
// ============================================
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { assertStorybookOwnership } from "@/lib/storybookOwnership";

// GET /api/storybooks/[id] — 스토리북 상세(제목 등) 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const storybook = await assertStorybookOwnership(id, user.id);
  if (!storybook) return NextResponse.json({ error: "스토리북을 찾을 수 없습니다." }, { status: 404 });

  return NextResponse.json(storybook);
}

// PATCH /api/storybooks/[id] — 제목/설명 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const storybook = await assertStorybookOwnership(id, user.id);
  if (!storybook) return NextResponse.json({ error: "스토리북을 찾을 수 없습니다." }, { status: 404 });

  const { title, description } = await request.json();
  const data: Record<string, unknown> = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;

  const updated = await prisma.storybook.update({ where: { id }, data });
  return NextResponse.json(updated);
}

// DELETE /api/storybooks/[id] — 스토리북 삭제 (소속 인물/관계 함께 삭제)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const storybook = await assertStorybookOwnership(id, user.id);
  if (!storybook) return NextResponse.json({ error: "스토리북을 찾을 수 없습니다." }, { status: 404 });

  await prisma.storybook.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
