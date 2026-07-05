// ============================================
// 파일 경로: lib/supabase.ts
// ============================================
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    ".env에 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되어 있지 않습니다."
  );
}

// 서버(API Route)에서만 사용하는 클라이언트입니다.
// anon 키만 사용하며, service_role 키는 절대 쓰지 않습니다 — anon 키는 RLS 정책을 그대로 따르므로
// "이 앱 서버가 일반 사용자보다 더 강한 권한을 갖는" 위험한 상태를 피할 수 있습니다.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 프로필 이미지를 보관하는 버킷 이름. Supabase 대시보드에서 만든 버킷 이름과 정확히 일치해야 합니다.
export const PROFILE_IMAGES_BUCKET = "profile-images";
