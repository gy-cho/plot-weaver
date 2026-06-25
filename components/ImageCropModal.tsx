// ============================================
// 파일 경로: components/ImageCropModal.tsx
// ============================================
"use client";

import { useRef, useState, useCallback, useEffect } from "react";

type Props = {
  file: File;
  onCropped: (cropped: Blob, original: Blob) => void;
  onCancel: () => void;
};

// 저장 시 최종 해상도 — 관계도 화면에서 가장 크게 보이는 곳(전체 상세, 220px)의
// 약 2배로 잡아, 레티나(2x) 디스플레이에서도 흐려 보이지 않으면서 용량은 최소화합니다.
const OUTPUT_SIZE = 480;
// WebP 품질 — 0.85 미만으로 내려가면 인물 사진 특유의 피부톤/배경 그라데이션에서
// 블록 노이즈가 눈에 보이기 시작하는 경계라, 그 위쪽인 0.85로 고정합니다.
const OUTPUT_QUALITY = 0.85;

// "원본 크게 보기"용 이미지 처리 기준.
// 27인치 모니터에서 팝업으로 띄울 때 화면을 압도하지 않으면서도 또렷하게 보이는 선이라
// 1920px로 잡았고, 이미 그보다 작고 가벼운 파일(1MB 이하)은 화질 손실 없이 그대로 둡니다.
const ORIGINAL_MAX_SIZE_BYTES = 1024 * 1024; // 1MB
const ORIGINAL_MAX_DIMENSION = 1920;
const ORIGINAL_QUALITY = 0.9;

const PREVIEW_SIZE = 320; // 모달 안에서 보여줄 원형 미리보기 영역 크기 (화면 표시용, 저장 해상도와 무관)

export default function ImageCropModal({ file, onCropped, onCancel }: Props) {
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [minScale, setMinScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // 이미지 중심을 미리보기 중심에서 얼마나 옮겼는지 (px)
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
  const [processing, setProcessing] = useState(false);

  // 파일을 이미지 엘리먼트로 로드하고, 원형 영역을 항상 채울 수 있는 최소 배율을 계산합니다.
  useEffect(() => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const baseScale = PREVIEW_SIZE / Math.min(img.width, img.height);
      setMinScale(baseScale);
      setScale(baseScale);
      setOffset({ x: 0, y: 0 });
      setImageEl(img);
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, offsetX: offset.x, offsetY: offset.y };
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !imageEl) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;

      // 이미지가 원형 영역 밖으로 완전히 빠져나가지 않도록 이동 범위를 제한합니다.
      const scaledW = imageEl.width * scale;
      const scaledH = imageEl.height * scale;
      const maxOffsetX = Math.max(0, (scaledW - PREVIEW_SIZE) / 2);
      const maxOffsetY = Math.max(0, (scaledH - PREVIEW_SIZE) / 2);

      const nextX = Math.min(maxOffsetX, Math.max(-maxOffsetX, dragStart.current.offsetX + dx));
      const nextY = Math.min(maxOffsetY, Math.max(-maxOffsetY, dragStart.current.offsetY + dy));
      setOffset({ x: nextX, y: nextY });
    },
    [dragging, imageEl, scale]
  );

  const handlePointerUp = () => setDragging(false);

  // canvas.toBlob을 await 가능하게 감싸고, webp 인코딩이 안 되는 환경에서는 jpeg로 대체합니다.
  const canvasToBlob = (canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> => {
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
            return;
          }
          canvas.toBlob((fallback) => resolve(fallback), "image/jpeg", quality);
        },
        "image/webp",
        quality
      );
    });
  };

  // 원본 파일이 1MB를 넘으면 1920px 기준으로 리사이즈+재인코딩하고,
  // 1MB 이하면 화질 손실 없이 원본 파일을 그대로 사용합니다.
  const processOriginal = async (sourceFile: File, img: HTMLImageElement): Promise<Blob> => {
    if (sourceFile.size <= ORIGINAL_MAX_SIZE_BYTES) {
      return sourceFile;
    }

    const longerSide = Math.max(img.width, img.height);
    const resizeRatio = Math.min(1, ORIGINAL_MAX_DIMENSION / longerSide);
    const targetW = Math.round(img.width * resizeRatio);
    const targetH = Math.round(img.height * resizeRatio);

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return sourceFile;

    ctx.drawImage(img, 0, 0, targetW, targetH);
    const blob = await canvasToBlob(canvas, ORIGINAL_QUALITY);
    return blob ?? sourceFile;
  };

  const handleScaleChange = (newScale: number) => {
    if (!imageEl) return;
    setScale(newScale);
    // 확대/축소 시에도 이동 범위를 다시 제한해, 빈 공간이 보이지 않게 합니다.
    const scaledW = imageEl.width * newScale;
    const scaledH = imageEl.height * newScale;
    const maxOffsetX = Math.max(0, (scaledW - PREVIEW_SIZE) / 2);
    const maxOffsetY = Math.max(0, (scaledH - PREVIEW_SIZE) / 2);
    setOffset((prev) => ({
      x: Math.min(maxOffsetX, Math.max(-maxOffsetX, prev.x)),
      y: Math.min(maxOffsetY, Math.max(-maxOffsetY, prev.y)),
    }));
  };

  // 마우스 휠로도 확대/축소할 수 있게 합니다. 휠을 위로 굴리면 확대, 아래로 굴리면 축소되며
  // 슬라이더와 동일한 범위(minScale ~ minScale*3) 안에서만 움직입니다.
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!imageEl) return;
      e.preventDefault();
      const sensitivity = minScale * 0.0015;
      const next = scale - e.deltaY * sensitivity;
      const clamped = Math.min(minScale * 3, Math.max(minScale, next));
      handleScaleChange(clamped);
    },
    [imageEl, scale, minScale]
  );

  const handleConfirm = async () => {
    if (!imageEl) return;
    setProcessing(true);

    // 미리보기에서 보이는 영역(PREVIEW_SIZE 기준)을, 원본 이미지 좌표 기준으로 환산해서
    // 그 부분만 OUTPUT_SIZE 크기로 그려냅니다.
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setProcessing(false);
      return;
    }

    const drawScale = (OUTPUT_SIZE / PREVIEW_SIZE) * scale;
    const drawW = imageEl.width * drawScale;
    const drawH = imageEl.height * drawScale;
    const drawX = OUTPUT_SIZE / 2 - drawW / 2 + offset.x * (OUTPUT_SIZE / PREVIEW_SIZE);
    const drawY = OUTPUT_SIZE / 2 - drawH / 2 + offset.y * (OUTPUT_SIZE / PREVIEW_SIZE);

    // 원형 밖 영역은 투명하게 잘라내되, 배경에 칠해진 색이 없는 PNG 투명 대신
    // 사각형 그대로 저장합니다 (노드 표시는 어차피 CSS에서 원형으로 자르므로
    // 저장 단계에서까지 원형으로 자를 필요는 없고, 사각형으로 두면 나중에 다른 모양으로도 재사용 가능합니다).
    ctx.drawImage(imageEl, drawX, drawY, drawW, drawH);

    const croppedBlob = await canvasToBlob(canvas, OUTPUT_QUALITY);
    if (!croppedBlob) {
      setProcessing(false);
      return;
    }

    const originalBlob = await processOriginal(file, imageEl);

    setProcessing(false);
    onCropped(croppedBlob, originalBlob);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--bg-overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
        overflowY: "auto",
        padding: 20,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: "var(--bg-surface)",
          borderRadius: 12,
          padding: 20,
          width: 380,
          maxHeight: "calc(100vh - 40px)",
          overflowY: "auto",
          boxShadow: "0 12px 32px var(--shadow-color-strong)",
        }}
      >
        <h3 style={{ margin: "0 0 14px", fontSize: 15, color: "var(--text-primary)" }}>사진 위치 조정</h3>

        {/* 원형 미리보기 영역 */}
        <div
          style={{
            width: PREVIEW_SIZE,
            height: PREVIEW_SIZE,
            margin: "0 auto 16px",
            borderRadius: "50%",
            overflow: "hidden",
            position: "relative",
            background: "var(--bg-canvas)",
            cursor: dragging ? "grabbing" : "grab",
            touchAction: "none",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onWheel={handleWheel}
        >
          {imageEl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageEl.src}
              alt="크롭 대상"
              draggable={false}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: imageEl.width * scale,
                height: imageEl.height * scale,
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,
                userSelect: "none",
                pointerEvents: "none",
              }}
            />
          )}
        </div>

        <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
          확대/축소 (이미지 위에서 마우스 휠도 가능)
        </label>
        <input
          type="range"
          min={minScale}
          max={minScale * 3}
          step={minScale / 100}
          value={scale}
          onChange={(e) => handleScaleChange(Number(e.target.value))}
          style={{ width: "100%", marginBottom: 16 }}
        />

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleConfirm}
            disabled={!imageEl || processing}
            style={{
              fontSize: 13,
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid var(--accent)",
              background: "var(--accent)",
              color: "var(--accent-text)",
              cursor: "pointer",
            }}
          >
            {processing ? "처리 중..." : "적용"}
          </button>
          <button
            onClick={onCancel}
            style={{
              fontSize: 13,
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid var(--border-strong)",
              background: "var(--bg-surface)",
              color: "var(--text-primary)",
              cursor: "pointer",
            }}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
