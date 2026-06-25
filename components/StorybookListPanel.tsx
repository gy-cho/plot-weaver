// ============================================
// 파일 경로: components/StorybookListPanel.tsx
// ============================================
"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmProvider";

type StorybookSummary = {
  id: string;
  title: string;
  updatedAt: string;
  _count: { persons: number };
};

type Props = {
  activeStorybookId: string | null;
  onSelectStorybook: (storybookId: string) => void;
  onActiveStorybookDeleted: () => void;
  onClose: () => void;
};

export default function StorybookListPanel({
  activeStorybookId,
  onSelectStorybook,
  onActiveStorybookDeleted,
  onClose,
}: Props) {
  const { showToast } = useToast();
  const confirm = useConfirm();

  const [storybooks, setStorybooks] = useState<StorybookSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const loadStorybooks = async () => {
    const res = await fetch("/api/storybooks");
    if (res.ok) {
      setStorybooks(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStorybooks();
  }, []);

  const filteredStorybooks = useMemo(() => {
    if (!query.trim()) return storybooks;
    const q = query.trim().toLowerCase();
    return storybooks.filter((s) => s.title.toLowerCase().includes(q));
  }, [storybooks, query]);

  const createStorybook = async () => {
    const res = await fetch("/api/storybooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "새 스토리북" }),
    });
    if (!res.ok) {
      showToast("error", "스토리북을 만들지 못했습니다.");
      return;
    }
    const created = await res.json();
    const newStorybook: StorybookSummary = { ...created, _count: { persons: 0 } };
    setStorybooks((prev) => [newStorybook, ...prev]);
    onSelectStorybook(newStorybook.id);
    setEditingId(newStorybook.id);
    setEditingTitle(newStorybook.title);
  };

  const startEditTitle = (s: StorybookSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditingTitle(s.title);
  };

  const saveTitle = async (id: string) => {
    const title = editingTitle.trim() || "제목 없는 스토리북";
    await fetch(`/api/storybooks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setStorybooks((prev) => prev.map((s) => (s.id === id ? { ...s, title } : s)));
    setEditingId(null);
  };

  const deleteStorybook = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await confirm({
      title: "스토리북 삭제",
      message: "이 스토리북과 안의 모든 인물·관계가 삭제됩니다.",
      confirmText: "삭제",
      danger: true,
    });
    if (!ok) return;
    await fetch(`/api/storybooks/${id}`, { method: "DELETE" });
    setStorybooks((prev) => prev.filter((s) => s.id !== id));
    showToast("info", "스토리북을 삭제했습니다.");
    if (activeStorybookId === id) {
      onActiveStorybookDeleted();
    }
  };

  return (
    <div
      style={{
        width: 300,
        height: "100vh",
        flexShrink: 0,
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border-default)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        zIndex: 19,
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 16px 12px",
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: "var(--text-primary)" }}>스토리북</h2>
        <button
          onClick={onClose}
          aria-label="패널 닫기"
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            padding: 4,
            color: "var(--text-tertiary)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2L14 14M14 2L2 14" stroke="var(--text-tertiary)" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* 검색창 */}
      <div style={{ padding: "0 16px 12px" }}>
        <div style={{ position: "relative" }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}
          >
            <circle cx="7" cy="7" r="5" stroke="var(--text-tertiary)" strokeWidth="1.3" />
            <line x1="10.8" y1="10.8" x2="14" y2="14" stroke="var(--text-tertiary)" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="스토리북 검색..."
            style={{
              width: "100%",
              padding: "8px 10px 8px 30px",
              borderRadius: 8,
              border: "1px solid var(--border-default)",
              background: "var(--bg-canvas)",
              color: "var(--text-primary)",
              fontSize: 13,
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* 새 스토리북 버튼 */}
      <div style={{ padding: "0 16px 12px" }}>
        <button
          onClick={createStorybook}
          style={{
            width: "100%",
            fontSize: 13,
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid var(--border-strong)",
            background: "var(--bg-surface)",
            color: "var(--text-primary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <line x1="8" y1="2.5" x2="8" y2="13.5" stroke="var(--text-primary)" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="2.5" y1="8" x2="13.5" y2="8" stroke="var(--text-primary)" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          새 스토리북
        </button>
      </div>

      {/* 목록 */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 16px" }}>
        {loading ? (
          <p style={{ fontSize: 13, color: "var(--text-secondary)", padding: "0 8px" }}>불러오는 중...</p>
        ) : filteredStorybooks.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-secondary)", padding: "0 8px" }}>
            {query ? "검색 결과가 없습니다." : "아직 만든 스토리북이 없습니다."}
          </p>
        ) : (
          filteredStorybooks.map((s) => (
            <div
              key={s.id}
              onClick={() => onSelectStorybook(s.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 10px",
                borderRadius: 8,
                marginBottom: 2,
                cursor: "pointer",
                background: activeStorybookId === s.id ? "var(--bg-hover)" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (activeStorybookId !== s.id) e.currentTarget.style.background = "var(--bg-canvas)";
              }}
              onMouseLeave={(e) => {
                if (activeStorybookId !== s.id) e.currentTarget.style.background = "transparent";
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                {editingId === s.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={editingTitle}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveTitle(s.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    onBlur={() => saveTitle(s.id)}
                    style={{
                      width: "100%",
                      fontSize: 14,
                      padding: "3px 6px",
                      borderRadius: 6,
                      border: "1px solid var(--accent)",
                      background: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      boxSizing: "border-box",
                    }}
                  />
                ) : (
                  <>
                    <p
                      style={{
                        fontWeight: 500,
                        fontSize: 14,
                        margin: 0,
                        color: "var(--text-primary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.title}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: "2px 0 0" }}>
                      인물 {s._count.persons}명
                    </p>
                  </>
                )}
              </div>
              {editingId !== s.id && (
                <button
                  onClick={(e) => startEditTitle(s, e)}
                  aria-label="이름 수정"
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
                    <path
                      d="M11 2.5L13.5 5L5 13.5H2.5V11L11 2.5Z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
              <button
                onClick={(e) => deleteStorybook(s.id, e)}
                aria-label="삭제"
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
                  <path
                    d="M3.5 4.5H12.5M6.5 4.5V3C6.5 2.5 6.9 2 7.5 2H8.5C9.1 2 9.5 2.5 9.5 3V4.5M4.5 4.5L5 12.5C5 13.1 5.5 13.5 6 13.5H10C10.5 13.5 11 13.1 11 12.5L11.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
