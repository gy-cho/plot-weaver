// ============================================
// 파일 경로: app/api/upload/route.ts
// (app -> api -> upload 폴더 -> route.ts)
// ============================================
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { supabase, PROFILE_IMAGES_BUCKET } from "@/lib/supabase";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// 클라이언트가 보낸 파일명을 그대로 믿지 않고, 실제 MIME 타입에 맞는 확장자만 허용합니다.
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: NextRequest) {
  // 로그인하지 않은 사용자는 업로드할 수 없습니다.
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

  // 사용자별 폴더 아래에 저장합니다 (예: uploads/{userId}/1700000000-ab12cd.webp).
  // Public bucket이 꺼져 있으므로, 이 경로는 그 자체로는 누구도 직접 열 수 없고,
  // 화면에 보여줄 때는 항상 /api/images/[path]에서 매번 Signed URL을 새로 발급받아야 합니다.
  const filename = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(PROFILE_IMAGES_BUCKET)
    .upload(filename, buffer, { contentType: file.type, upsert: false });

  if (error) {
    return NextResponse.json({ error: `업로드에 실패했습니다: ${error.message}` }, { status: 500 });
  }

  // DB에는 공개 URL이 아니라 "버킷 안의 경로"만 저장합니다.
  // 실제로 화면에 보여줄 URL은 그때그때 /api/images에서 Signed URL로 새로 발급받습니다.
  return NextResponse.json({ url: filename }, { status: 201 });
}
