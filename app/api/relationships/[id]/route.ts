import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

async function getOwnedRelationship(relationshipId: string, userId: string) {
  const rel = await prisma.relationship.findUnique({
    where: { id: relationshipId },
    include: { map: true },
  });
  if (!rel || rel.map.ownerId !== userId) return null;
  return rel;
}

// PATCH /api/relationships/[id] — 관계 설명(label) 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const owned = await getOwnedRelationship(id, user.id);
  if (!owned) return NextResponse.json({ error: "관계를 찾을 수 없습니다." }, { status: 404 });

  const { label } = await request.json();
  const relationship = await prisma.relationship.update({
    where: { id },
    data: { label },
  });

  return NextResponse.json(relationship);
}

// DELETE /api/relationships/[id] — 관계 삭제 (선 끊기)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const owned = await getOwnedRelationship(id, user.id);
  if (!owned) return NextResponse.json({ error: "관계를 찾을 수 없습니다." }, { status: 404 });

  await prisma.relationship.delete({ where: { id } });
  return NextResponse.json({ success: true });
}