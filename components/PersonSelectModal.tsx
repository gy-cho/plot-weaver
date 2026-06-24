"use client";

import { type Person } from "@/types";
import PersonAvatar from "@/components/PersonAvatar";

type Props = {
  persons: Person[];
  excludeIds: string[];
  onSelect: (person: Person) => void;
  onClose: () => void;
};

export default function PersonSelectModal({ persons, excludeIds, onSelect, onClose }: Props) {
  const available = persons.filter((p) => !excludeIds.includes(p.id));

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
          maxHeight: "70vh",
          overflowY: "auto",
          boxShadow: "0 12px 32px rgba(0,0,0,0.16)",
        }}
      >
        <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>등록된 인물 선택</h3>
        {available.length === 0 ? (
          <p style={{ fontSize: 13, color: "#6B6760" }}>
            선택 가능한 인물이 없습니다. 먼저 인물을 등록해주세요.
          </p>
        ) : (
          available.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelect(p)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                border: "1px solid #ECE8DF",
                borderRadius: 8,
                marginBottom: 8,
                cursor: "pointer",
              }}
            >
              <PersonAvatar person={p} size={32} fontSize={12} />
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 500, fontSize: 14, margin: 0 }}>{p.name}</p>
                <p
                  style={{
                    fontSize: 12,
                    color: "#6B6760",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.description || ""}
                </p>
              </div>
            </div>
          ))
        )}
        <button
          onClick={onClose}
          style={{
            marginTop: 8,
            fontSize: 13,
            padding: "6px 12px",
            borderRadius: 8,
            border: "1px solid #D8D4CC",
            background: "#fff",
            cursor: "pointer",
            width: "100%",
          }}
        >
          취소
        </button>
      </div>
    </div>
  );
}
