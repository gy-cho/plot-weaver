import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// 인물이 속한 map의 소유자가 현재 사용자인지 확인
async function getOwnedPerson(personId: string, userId: string) {
  const person = await prisma.person.findUnique({
    where: { id: personId },
    include: { map: true },
  });
  if (!person || person.map.ownerId !== userId) return null;
  return person;
}

// GET /api/persons/[id] — 인물 상세 + 연결된 관계 목록까지 같이 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const owned = await getOwnedPerson(id, user.id);
  if (!owned) return NextResponse.json({ error: "인물을 찾을 수 없습니다." }, { status: 404 });

  const person = await prisma.person.findUnique({
    where: { id },
    include: {
      relationshipsFrom: { include: { to: true } },
      relationshipsTo: { include: { from: true } },
    },
  });

  return NextResponse.json(person);
}

// PATCH /api/persons/[id] — 인물 정보 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const owned = await getOwnedPerson(id, user.id);
  if (!owned) return NextResponse.json({ error: "인물을 찾을 수 없습니다." }, { status: 404 });

  const body = await request.json();

  // body에 명시적으로 포함된 필드만 업데이트합니다. (예: 위치만 보내는 드래그 저장 요청이
  // name 등 다른 필드를 실수로 비워버리지 않도록)
  const data: Record<string, unknown> = {};
  if ("name" in body) data.name = body.name;
  if ("description" in body) data.description = body.description;
  if ("color" in body) data.color = body.color;
  if ("imageUrl" in body) data.imageUrl = body.imageUrl;
  if ("positionX" in body) data.positionX = body.positionX;
  if ("positionY" in body) data.positionY = body.positionY;

  const person = await prisma.person.update({
    where: { id },
    data,
  });

  return NextResponse.json(person);
}

// DELETE /api/persons/[id] — 인물 삭제 (연결된 관계도 같이 삭제됨, schema의 onDelete: Cascade)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const owned = await getOwnedPerson(id, user.id);
  if (!owned) return NextResponse.json({ error: "인물을 찾을 수 없습니다." }, { status: 404 });

  await prisma.person.delete({ where: { id } });
  return NextResponse.json({ success: true });
}