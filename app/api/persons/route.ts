import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { assertMapOwnership } from "@/lib/mapOwnership";

// GET /api/persons?mapId=... — 특정 관계도의 인물 목록 조회
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const mapId = request.nextUrl.searchParams.get("mapId");
  if (!mapId) return NextResponse.json({ error: "mapId가 필요합니다." }, { status: 400 });

  const map = await assertMapOwnership(mapId, user.id);
  if (!map) return NextResponse.json({ error: "관계도를 찾을 수 없습니다." }, { status: 404 });

  const persons = await prisma.person.findMany({
    where: { mapId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(persons);
}

// POST /api/persons — 새 인물 등록 (body에 mapId 포함)
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await request.json();
  const { mapId, name, description, color, imageUrl, positionX, positionY } = body;

  if (!mapId) return NextResponse.json({ error: "mapId가 필요합니다." }, { status: 400 });
  if (!name) return NextResponse.json({ error: "이름은 필수입니다." }, { status: 400 });

  const map = await assertMapOwnership(mapId, user.id);
  if (!map) return NextResponse.json({ error: "관계도를 찾을 수 없습니다." }, { status: 404 });

  const person = await prisma.person.create({
    data: { mapId, name, description, color, imageUrl, positionX, positionY },
  });

  return NextResponse.json(person, { status: 201 });
}