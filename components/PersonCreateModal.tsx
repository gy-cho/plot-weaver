"use client";

import { useState } from "react";
import { COLOR_BG, COLOR_TEXT, PERSON_COLORS, type Person } from "@/types";
import ImageUploadField from "@/components/ImageUploadField";

type Props = {
  onCreate: (data: { name: string; description: string; color: string; imageUrl: string | null }) => void;
  onClose: () => void;
};

export default function PersonCreateModal({ onCreate, onClose }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<string>(PERSON_COLORS[0]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          width: 360,
          boxShadow: "0 12px 32px rgba(0,0,0,0.16)",
        }}
      >
        <h3 style={{ margin: "0 0 14px", fontSize: 16 }}>새 인물 등록</h3>

        <label style={{ fontSize: 13, color: "#6B6760", display: "block", marginBottom: 4 }}>
          프로필 사진
        </label>
        <div style={{ marginBottom: 14 }}>
          <ImageUploadField value={imageUrl} onChange={setImageUrl} />
        </div>

        <label style={{ fontSize: 13, color: "#6B6760", display: "block", marginBottom: 4 }}>
          프로필 색상
        </label>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {PERSON_COLORS.map((c) => (
            <div
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: COLOR_BG[c],
                border: `2px solid ${color === c ? COLOR_TEXT[c] : "transparent"}`,
                cursor: "pointer",
              }}
            />
          ))}
        </div>

        <label style={{ fontSize: 13, color: "#6B6760", display: "block", marginBottom: 4 }}>
          이름
        </label>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 해리 포터"
          style={{
            width: "100%",
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid #D8D4CC",
            fontSize: 14,
            marginBottom: 12,
            boxSizing: "border-box",
          }}
        />

        <label style={{ fontSize: 13, color: "#6B6760", display: "block", marginBottom: 4 }}>
          상세 설명
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="소속, 성격, 특징 등"
          rows={3}
          style={{
            width: "100%",
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid #D8D4CC",
            fontSize: 14,
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button
            disabled={!name.trim()}
            onClick={() => onCreate({ name: name.trim(), description: description.trim(), color, imageUrl })}
            style={{
              fontSize: 13,
              padding: "6px 14px",
              borderRadius: 8,
              border: "1px solid #2C2C2A",
              background: name.trim() ? "#2C2C2A" : "#B8B4AC",
              color: "#fff",
              cursor: name.trim() ? "pointer" : "not-allowed",
            }}
          >
            등록
          </button>
          <button
            onClick={onClose}
            style={{
              fontSize: 13,
              padding: "6px 14px",
              borderRadius: 8,
              border: "1px solid #D8D4CC",
              background: "#fff",
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
