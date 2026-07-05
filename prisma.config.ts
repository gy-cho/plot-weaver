import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// 이 파일의 datasource.url은 Prisma CLI(마이그레이션 등)가 사용하는 연결입니다.
// 런타임에 앱이 실제로 쿼리를 보낼 때는 lib/prisma.ts의 PrismaPg 어댑터가 따로
// DATABASE_URL(풀링, 6543)을 사용하므로, 여기서는 항상 DIRECT_URL(직접 연결, 5432)을 씁니다.
// Supabase의 풀링 연결(PgBouncer)은 테이블 구조를 바꾸는 마이그레이션 명령과 호환이 안 됩니다.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});