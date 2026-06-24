import { prisma } from "@/lib/prisma";

// 주어진 mapId가 실제로 해당 userId 소유인지 확인합니다.
// 소유가 아니거나 존재하지 않으면 null을 반환합니다.
export async function assertMapOwnership(mapId: string, userId: string) {
  const map = await prisma.relationshipMap.findUnique({ where: { id: mapId } });
  if (!map || map.ownerId !== userId) return null;
  return map;
}
