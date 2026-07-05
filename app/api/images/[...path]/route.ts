// ============================================
// 파일 경로: app/api/images/[...path]/route.ts
// ============================================
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { supabase, PROFILE_IMAGES_BUCKET } from "@/lib/supabase";

// Signed URL의 유효시간. 너무 짧으면 화면을 오래 보고 있을 때 이미지가 깨질 수 있고,
// 너무 길면 한 번 발급된 URL이 노출됐을 때 위험 기간이 길어집니다. 1시간으로 절충합니다.
const SIGNED_URL_EXPIRES_IN = 60 * 60;

// GET /api/images/[...path] — 버킷 안의 경로(예: userId/123-abc.webp)를 받아
// 그 자리에서 1시간짜리 임시 접근 URL을 발급해 돌려줍니다.
// (Public bucket을 꺼두었기 때문에, 화면에서 이미지를 보여줄 때마다 이 API를 거쳐야 합니다.)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { path: pathSegments } = await params;
  const objectPath = pathSegments.join("/");

  const { data, error } = await supabase.storage
    .from(PROFILE_IMAGES_BUCKET)
    .createSignedUrl(objectPath, SIGNED_URL_EXPIRES_IN);

  if (error || !data) {
    return NextResponse.json({ error: "이미지를 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ url: data.signedUrl });
}
