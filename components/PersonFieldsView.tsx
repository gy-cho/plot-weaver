// ============================================
// 파일 경로: components/PersonFieldsView.tsx
// ============================================
"use client";

import type { PersonField } from "@/types";

type Props = {
  fields: PersonField[];
};

export default function PersonFieldsView({ fields }: Props) {
  const filled = fields.filter((f) => f.label.trim() || f.value.trim());

  if (filled.length === 0) {
    return <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>등록된 정보가 없습니다.</p>;
  }

  return (
    <div>
      {filled.map((field) => (
        <div key={field.id} style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: "0 0 4px" }}>
            {field.label || "(이름 없는 필드)"}
          </p>
          <p
            style={{
              fontSize: 14,
              margin: 0,
              lineHeight: 1.7,
              color: "var(--text-primary)",
              whiteSpace: "pre-wrap",
            }}
          >
            {field.value || "-"}
          </p>
        </div>
      ))}
    </div>
  );
}
