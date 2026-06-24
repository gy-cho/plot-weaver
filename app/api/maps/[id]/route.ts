import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

async function assertOwnership(mapId: string, userId: string) {
  const map = await prisma.relationshipMap.findUnique({ where: { id: mapId } });
  if (!map || map.ownerId !== userId) return null;
  return map;
}

// PATCH /api/maps/[id] — 관계도 제목 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const map = await assertOwnership(id, user.id);
  if (!map) return NextResponse.json({ error: "관계도를 찾을 수 없습니다." }, { status: 404 });

  const { title } = await request.json();
  const updated = await prisma.relationshipMap.update({
    where: { id },
    data: { title },
  });
  return NextResponse.json(updated);
}

// DELETE /api/maps/[id] — 관계도 삭제 (소속 인물/관계도 함께 삭제)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const map = await assertOwnership(id, user.id);
  if (!map) return NextResponse.json({ error: "관계도를 찾을 수 없습니다." }, { status: 404 });

  await prisma.relationshipMap.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
