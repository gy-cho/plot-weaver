"use client";

import { useRef, useState } from "react";
import ImageCropModal from "@/components/ImageCropModal";
import { useSignedImageUrl } from "@/lib/useSignedImageUrl";

type Props = {
  value: string | null;
  onChange: (imageUrl: string | null, originalImageUrl: string | null) => void;
};

async function uploadBlob(blob: Blob, filenamePrefix: string): Promise<string> {
  const ext = blob.type === "image/jpeg" ? "jpg" : blob.type === "image/webp" ? "webp" : "png";
  const formData = new FormData();
  formData.append("file", blob, `${filenamePrefix}.${ext}`);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "업로드에 실패했습니다.");
  return data.url;
}

export default function ImageUploadField({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const signedValue = useSignedImageUrl(value);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setCropFile(file); // 바로 업로드하지 않고, 먼저 크롭 모달을 띄웁니다.
    if (inputRef.current) inputRef.current.value = "";
  };

  // 크롭본(평소 화면용)과 원본 처리본(클릭해서 크게 볼 때용)을 각각 업로드합니다.
  const handleCropped = async (croppedBlob: Blob, originalBlob: Blob) => {
    setCropFile(null);
    setUploading(true);
    setError(null);

    try {
      const [croppedUrl, originalUrl] = await Promise.all([
        uploadBlob(croppedBlob, "profile"),
        uploadBlob(originalBlob, "profile-original"),
      ]);
      onChange(croppedUrl, originalUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        {signedValue ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={signedValue}
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
              onClick={() => onChange(null, null)}
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

      {cropFile && (
        <ImageCropModal
          file={cropFile}
          onCropped={handleCropped}
          onCancel={() => setCropFile(null)}
        />
      )}
    </div>
  );
}
