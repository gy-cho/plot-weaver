// ============================================
// 파일 경로: app/api/upload/route.ts
// (app -> api -> upload 폴더 -> route.ts)
// ============================================
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getCurrentUser } from "@/lib/session";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// 클라이언트가 보낸 파일명을 그대로 믿지 않고, 실제 MIME 타입에 맞는 확장자만 허용합니다.
// (file.name으로 들어온 확장자를 그대로 쓰면, 이론상 의도하지 않은 확장자가 섞여 들어올 수 있습니다.)
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: NextRequest) {
  // 로그인하지 않은 사용자는 업로드할 수 없습니다.
  // (이 검사가 없으면 누구나 이 주소로 파일을 올릴 수 있게 되어, 본인/지인 전용 서비스의
  //  의미가 없어지고 서버 저장공간도 외부에 의해 채워질 수 있습니다.)
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  }

  const ext = MIME_TO_EXT[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "jpg, png, webp, gif 형식만 업로드할 수 있습니다." },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "파일 크기는 5MB 이하여야 합니다." }, { status: 400 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  // public 폴더 기준 경로이므로 브라우저에서는 /uploads/파일명 으로 바로 접근 가능
  return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
}