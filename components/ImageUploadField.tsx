"use client";

import { useRef, useState } from "react";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
};

export default function ImageUploadField({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "업로드에 실패했습니다.");
      } else {
        onChange(data.url);
      }
    } catch {
      setError("업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="프로필 미리보기"
            style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--bg-hover)",
              border: "1px dashed var(--border-strong)",
            }}
          />
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            style={{
              fontSize: 13,
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid var(--border-strong)",
              background: "var(--bg-surface)",
              color: "var(--text-primary)",
              cursor: uploading ? "default" : "pointer",
            }}
          >
            {uploading ? "업로드 중..." : value ? "사진 변경" : "사진 선택"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              style={{
                fontSize: 13,
                padding: "6px 12px",
                borderRadius: 8,
                border: "1px solid var(--border-strong)",
                background: "var(--bg-surface)",
                color: "var(--text-primary)",
                cursor: "pointer",
              }}
            >
              제거
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
      {error && <p style={{ fontSize: 12, color: "var(--danger)", margin: "4px 0 0" }}>{error}</p>}
    </div>
  );
}
