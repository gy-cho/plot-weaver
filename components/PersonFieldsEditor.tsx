// ============================================
// 파일 경로: components/PersonFieldsEditor.tsx
// ============================================
"use client";

import type { PersonField, PersonFieldType, PersonTabId } from "@/types";

type Props = {
  tabId: PersonTabId;
  fields: PersonField[]; // 이 탭에 속한 필드만 전달받습니다.
  onChange: (fields: PersonField[]) => void;
};

function makeFieldId() {
  return `f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function PersonFieldsEditor({ tabId, fields, onChange }: Props) {
  // "기본정보" 탭은 한 줄 필드만 허용합니다 — 사이드패널처럼 좁은 공간에 노출되는 정보라
  // 길게 적는 내용이 들어오면 레이아웃이 깨지기 때문입니다.
  const isBasicTab = tabId === "basic";

  const updateField = (id: string, patch: Partial<PersonField>) => {
    onChange(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const removeField = (id: string) => {
    onChange(fields.filter((f) => f.id !== id));
  };

  const addField = (type: PersonFieldType) => {
    onChange([
      ...fields,
      { id: makeFieldId(), label: "", type: isBasicTab ? "text" : type, value: "", tab: tabId },
    ]);
  };

  return (
    <div>
      {fields.map((field) => (
        <div
          key={field.id}
          style={{
            border: "1px solid var(--border-default)",
            borderRadius: 8,
            padding: 10,
            marginBottom: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <input
              type="text"
              value={field.label}
              onChange={(e) => updateField(field.id, { label: e.target.value })}
              placeholder={isBasicTab ? "필드 이름 (예: 종족, 키)" : "필드 이름 (예: 트라우마, MBTI)"}
              style={{
                flex: 1,
                padding: "5px 8px",
                borderRadius: 6,
                border: "1px solid var(--border-strong)",
                background: "var(--bg-input)",
                color: "var(--text-primary)",
                fontSize: 12,
                fontWeight: 500,
                boxSizing: "border-box",
              }}
            />
            <button
              onClick={() => removeField(field.id)}
              aria-label="필드 삭제"
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: 4,
                color: "var(--text-tertiary)",
                flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3.5 4.5H12.5M6.5 4.5V3C6.5 2.5 6.9 2 7.5 2H8.5C9.1 2 9.5 2.5 9.5 3V4.5M4.5 4.5L5 12.5C5 13.1 5.5 13.5 6 13.5H10C10.5 13.5 11 13.1 11 12.5L11.5 4.5"
                  stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          {field.type === "textarea" ? (
            <textarea
              value={field.value}
              onChange={(e) => updateField(field.id, { value: e.target.value })}
              rows={3}
              placeholder="내용을 입력하세요"
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid var(--border-strong)",
                background: "var(--bg-input)",
                color: "var(--text-primary)",
                fontSize: 13,
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          ) : (
            <input
              type="text"
              value={field.value}
              onChange={(e) => updateField(field.id, { value: e.target.value })}
              placeholder="내용을 입력하세요"
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid var(--border-strong)",
                background: "var(--bg-input)",
                color: "var(--text-primary)",
                fontSize: 13,
                boxSizing: "border-box",
              }}
            />
          )}
        </div>
      ))}

      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button
          type="button"
          onClick={() => addField("text")}
          style={{
            fontSize: 12,
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid var(--border-strong)",
            background: "var(--bg-surface)",
            color: "var(--text-primary)",
            cursor: "pointer",
          }}
        >
          + 한 줄 필드
        </button>
        {!isBasicTab && (
          <button
            type="button"
            onClick={() => addField("textarea")}
            style={{
              fontSize: 12,
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid var(--border-strong)",
              background: "var(--bg-surface)",
              color: "var(--text-primary)",
              cursor: "pointer",
            }}
          >
            + 여러 줄 필드
          </button>
        )}
      </div>
    </div>
  );
}
