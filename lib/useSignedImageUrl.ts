// ============================================
// 파일 경로: lib/useSignedImageUrl.ts
// ============================================
"use client";

import { useEffect, useState } from "react";

// 간단한 메모리 캐시 — 같은 경로를 여러 컴포넌트(노드, 목록, 패널)에서 동시에 보여줄 때
// 매번 새로 발급받지 않고 재사용합니다. Signed URL의 유효시간(1시간)보다 짧게,
// 5분 정도만 캐시해 두어도 화면 전환 중 중복 요청을 크게 줄일 수 있습니다.
const cache = new Map<string, { url: string; expiresAt: number }>();
const CACHE_DURATION_MS = 5 * 60 * 1000;

// Person.imageUrl / originalImageUrl에 저장된 "버킷 안의 경로"를 받아서,
// 화면에 바로 쓸 수 있는 임시 접근 URL(Signed URL)로 변환합니다.
// path가 null이면 null을 반환합니다 (사진이 없는 인물).
export function useSignedImageUrl(path: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!path) {
      setUrl(null);
      return;
    }

    const cached = cache.get(path);
    if (cached && cached.expiresAt > Date.now()) {
      setUrl(cached.url);
      return;
    }

    let cancelled = false;
    fetch(`/api/images/${path}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        cache.set(path, { url: data.url, expiresAt: Date.now() + CACHE_DURATION_MS });
        setUrl(data.url);
      })
      .catch(() => {
        if (!cancelled) setUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [path]);

  return url;
}
