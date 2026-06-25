// ============================================
// 파일 경로: components/PersonQuickCreateModal.tsx
// ============================================
"use client";

import { useState } from "react";
import {
  COLOR_BG,
  COLOR_TEXT,
  PERSON_COLORS,
  createDefaultPersonFields,
  type Person,
  type PersonField,
} from "@/types";
import { useToast } from "@/components/ToastProvider";

type Props = {
  storybookId: string;
  onCreated: (person: Person) => void;
  onClose: () => void;
};

// 관계도 화면 등에서 "지금 당장 노드를 채우고 싶다"는 요구를 빠르게 해결하는 간단 등록 모달입니다.
// 이름 + 기본정보(나이/성별/소속/한 줄 소개)만 다루고, 종족 추가나 상세정보 등 깊은 편집은
// 전체화면 상세에서 하도록 안내합니다.
export default function PersonQuickCreateModal({ storybookId, onCreated, onClose }: Props) {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(PERSON_COLORS[0]);
  const [fields, setFields] = useState<PersonField[]>(createDefaultPersonFields());
  const [submitting, setSubmitting] = useState(false);

  const updateField = (id: string, value: string) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, value } : f)));
  };

  const handleSubmit = async () => {
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    const cleanedFields = fields.filter((f) => f.value.trim());

    const res = await fetch("/api/persons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storybookId, name: name.trim(), color, customFields: cleanedFields }),
    });
    setSubmitting(false);

    if (!res.ok) {
      showToast("error", "인물을 등록하지 못했습니다.");
      return;
    }
    const created: Person = await res.json();
    showToast("success", "새 인물을 등록했습니다.");
    onCreated(created);
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
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-surface)",
          borderRadius: 12,
          padding: 20,
          width: 360,
          maxHeight: "calc(100vh - 40px)",
          overflowY: "auto",
          boxShadow: "0 12px 32px var(--shadow-color-strong)",
        }}
      >
        <h3 style={{ margin: "0 0 14px", fontSize: 15, color: "var(--text-primary)" }}>새 인물 등록</h3>

        <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
          프로필 색상
        </label>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {PERSON_COLORS.map((c) => (
            <div
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: COLOR_BG[c],
                border: `2px solid ${color === c ? COLOR_TEXT[c] : "transparent"}`,
                cursor: "pointer",
              }}
            />
          ))}
        </div>

        <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
          이름 <span style={{ color: "var(--danger)" }}>*</span>
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
            border: "1px solid var(--border-strong)",
            background: "var(--bg-input)",
            color: "var(--text-primary)",
            fontSize: 14,
            marginBottom: 14,
            boxSizing: "border-box",
          }}
        />

        {fields.map((field) => (
          <div key={field.id} style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
              {field.label}
            </label>
            <input
              type="text"
              value={field.value}
              onChange={(e) => updateField(field.id, e.target.value)}
              style={{
                width: "100%",
                padding: "7px 10px",
                borderRadius: 8,
                border: "1px solid var(--border-strong)",
                background: "var(--bg-input)",
                color: "var(--text-primary)",
                fontSize: 13,
                boxSizing: "border-box",
              }}
            />
          </div>
        ))}

        <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: "4px 0 16px" }}>
          사진, 상세정보 등은 등록 후 전체보기에서 추가할 수 있습니다.
        </p>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || submitting}
            style={{
              fontSize: 13,
              padding: "8px 16px",
              borderRadius: 8,
              border: name.trim() ? "1px solid var(--accent)" : "1px solid var(--border-default)",
              background: name.trim() ? "var(--accent)" : "transparent",
              color: name.trim() ? "var(--accent-text)" : "var(--text-tertiary)",
              cursor: name.trim() ? "pointer" : "default",
            }}
          >
            {submitting ? "등록 중..." : "등록"}
          </button>
          <button
            onClick={onClose}
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
