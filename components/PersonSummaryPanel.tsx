"use client";

import type { Person } from "@/types";
import PersonAvatar from "@/components/PersonAvatar";

type Props = {
  person: Person | null;
  onAssignExisting: () => void;
  onConnectExisting: () => void;
  onOpenDetail: () => void;
  onRemoveFromMap: () => void;
  onClose: () => void;
};

export default function PersonSummaryPanel({
  person,
  onAssignExisting,
  onConnectExisting,
  onOpenDetail,
  onRemoveFromMap,
  onClose,
}: Props) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
        maxWidth: 480,
        background: "var(--bg-surface)",
        border: "1px solid var(--border-faint)",
        borderRadius: 12,
        padding: "18px 20px",
        boxShadow: "0 8px 24px var(--shadow-color)",
        zIndex: 10,
      }}
    >
      {person ? (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <PersonAvatar person={person} size={40} fontSize={14} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 500, fontSize: 15, margin: 0 }}>{person.name}</p>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {person.description || "설명 없음"}
              </p>
            </div>
            <button
              onClick={onOpenDetail}
              aria-label="상세보기"
              style={{
                flexShrink: 0,
                width: 32,
                height: 32,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 3.5L10.5 8L6 12.5"
                  stroke="var(--text-primary)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onAssignExisting}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                padding: "6px 12px",
                borderRadius: 8,
                border: "1px solid var(--border-strong)",
                background: "var(--bg-surface)",
                color: "var(--text-primary)",
                cursor: "pointer",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M5 3L2 6L5 9"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M2 6H10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <path
                  d="M11 7L14 10L11 13"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M14 10H5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              인물 변경
            </button>
            <button
              onClick={onConnectExisting}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                padding: "6px 12px",
                borderRadius: 8,
                border: "1px solid var(--border-strong)",
                background: "var(--bg-surface)",
                color: "var(--text-primary)",
                cursor: "pointer",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="3.5" cy="3.5" r="2" stroke="currentColor" strokeWidth="1.3" />
                <circle cx="12.5" cy="12.5" r="2" stroke="currentColor" strokeWidth="1.3" />
                <line x1="5" y1="5" x2="11" y2="11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <line x1="11" y1="5" x2="11" y2="2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <line x1="13.5" y1="4.5" x2="8.5" y2="4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              관계 추가
            </button>
            <button
              onClick={onRemoveFromMap}
              style={{
                fontSize: 13,
                padding: "6px 12px",
                borderRadius: 8,
                border: "1px solid var(--danger-border)",
                background: "var(--bg-surface)",
                color: "var(--danger)",
                cursor: "pointer",
                marginLeft: "auto",
              }}
            >
              노드 삭제
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 12px" }}>
            아직 인물이 등록되지 않은 노드입니다.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onAssignExisting}
              style={{
                fontSize: 13,
                padding: "6px 12px",
                borderRadius: 8,
                border: "1px solid var(--accent)",
                background: "var(--accent)",
                color: "var(--accent-text)",
                cursor: "pointer",
              }}
            >
              인물 등록
            </button>
            <button
              onClick={onRemoveFromMap}
              style={{
                fontSize: 13,
                padding: "6px 12px",
                borderRadius: 8,
                border: "1px solid var(--danger-border)",
                background: "var(--bg-surface)",
                color: "var(--danger)",
                cursor: "pointer",
                marginLeft: "auto",
              }}
            >
              노드 삭제
            </button>
          </div>
        </div>
      )}
    </div>
  );
}