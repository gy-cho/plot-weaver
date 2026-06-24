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
        background: "#FFFFFF",
        border: "1px solid #E5E1D8",
        borderRadius: 12,
        padding: "18px 20px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
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
                  color: "#6B6760",
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
                  stroke="#2C2C2A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onConnectExisting}
              style={{
                fontSize: 13,
                padding: "6px 12px",
                borderRadius: 8,
                border: "1px solid #D8D4CC",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              + 인물 연결하기
            </button>
            <button
              onClick={onRemoveFromMap}
              style={{
                fontSize: 13,
                padding: "6px 12px",
                borderRadius: 8,
                border: "1px solid #E3B8B8",
                background: "#fff",
                color: "#A33B3B",
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
          <p style={{ fontSize: 13, color: "#6B6760", margin: "0 0 12px" }}>
            아직 인물이 등록되지 않은 노드입니다.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onAssignExisting}
              style={{
                fontSize: 13,
                padding: "6px 12px",
                borderRadius: 8,
                border: "1px solid #2C2C2A",
                background: "#2C2C2A",
                color: "#fff",
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
                border: "1px solid #E3B8B8",
                background: "#fff",
                color: "#A33B3B",
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
