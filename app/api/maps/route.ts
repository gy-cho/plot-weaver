import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// GET /api/maps — 내 관계도 목록
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const maps = await prisma.relationshipMap.findMany({
    where: { ownerId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { persons: true } } },
  });

  return NextResponse.json(maps);
}

// POST /api/maps — 새 관계도 생성
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const title = typeof body.title === "string" && body.title.trim() ? body.title.trim() : "새 관계도";

  const map = await prisma.relationshipMap.create({
    data: { title, ownerId: user.id },
  });

  return NextResponse.json(map, { status: 201 });
}
