// ============================================
// 파일 경로: components/EdgeLabelModal.tsx
// ============================================
"use client";

import { useState } from "react";
import type { Person } from "@/types";

type Props = {
  fromPerson: Person | null;
  toPerson: Person | null;
  initialLabel: string;
  onSave: (label: string) => void;
  onDelete: () => void;
  onClose: () => void;
};

export default function EdgeLabelModal({
  fromPerson,
  toPerson,
  initialLabel,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [label, setLabel] = useState(initialLabel);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--bg-overlay)",
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
          background: "var(--bg-surface)",
          borderRadius: 12,
          padding: 20,
          width: 360,
          boxShadow: "0 12px 32px var(--shadow-color-strong)",
        }}
      >
        <h3 style={{ margin: "0 0 6px", fontSize: 16, color: "var(--text-primary)" }}>관계 편집</h3>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 14px" }}>
          {fromPerson?.name ?? "빈 노드"} ↔ {toPerson?.name ?? "빈 노드"}
        </p>

        <label style={{ fontSize: 13, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
          관계 설명
        </label>
        <input
          autoFocus
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="예: 친구, 스승과 제자, 적대 관계"
          style={{
            width: "100%",
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid var(--border-strong)",
            background: "var(--bg-input)",
            color: "var(--text-primary)",
            fontSize: 14,
            boxSizing: "border-box",
          }}
        />

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button
            onClick={() => onSave(label.trim())}
            style={{
              fontSize: 13,
              padding: "6px 14px",
              borderRadius: 8,
              border: "1px solid var(--accent)",
              background: "var(--accent)",
              color: "var(--accent-text)",
              cursor: "pointer",
            }}
          >
            저장
          </button>
          <button
            onClick={onDelete}
            style={{
              fontSize: 13,
              padding: "6px 14px",
              borderRadius: 8,
              border: "1px solid var(--danger-border)",
              background: "var(--bg-surface)",
              color: "var(--danger)",
              cursor: "pointer",
            }}
          >
            관계 삭제
          </button>
          <button
            onClick={onClose}
            style={{
              fontSize: 13,
              padding: "6px 14px",
              borderRadius: 8,
              border: "1px solid var(--border-strong)",
              background: "var(--bg-surface)",
              color: "var(--text-primary)",
              cursor: "pointer",
              marginLeft: "auto",
            }}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
