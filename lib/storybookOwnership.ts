// ============================================
// 파일 경로: lib/storybookOwnership.ts
// ============================================
import { prisma } from "@/lib/prisma";

// 주어진 storybookId가 실제로 해당 userId 소유인지 확인합니다.
// 소유가 아니거나 존재하지 않으면 null을 반환합니다.
export async function assertStorybookOwnership(storybookId: string, userId: string) {
  const storybook = await prisma.storybook.findUnique({ where: { id: storybookId } });
  if (!storybook || storybook.ownerId !== userId) return null;
  return storybook;
}
