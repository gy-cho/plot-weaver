// ============================================
// 파일 경로: components/MapListPanel.tsx
// ============================================
"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmProvider";

type MapSummary = {
  id: string;
  title: string;
  updatedAt: string;
  _count: { persons: number };
};

type Props = {
  activeMapId: string | null;
  onSelectMap: (mapId: string) => void;
  onActiveMapDeleted: () => void;
  onClose: () => void;
};

export default function MapListPanel({ activeMapId, onSelectMap, onActiveMapDeleted, onClose }: Props) {
  const { showToast } = useToast();
  const confirm = useConfirm();

  const [maps, setMaps] = useState<MapSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const loadMaps = async () => {
    const res = await fetch("/api/maps");
    if (res.ok) {
      setMaps(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMaps();
  }, []);

  const filteredMaps = useMemo(() => {
    if (!query.trim()) return maps;
    const q = query.trim().toLowerCase();
    return maps.filter((m) => m.title.toLowerCase().includes(q));
  }, [maps, query]);

  const createMap = async () => {
    const res = await fetch("/api/maps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "새 관계도" }),
    });
    if (!res.ok) {
      showToast("error", "관계도를 만들지 못했습니다.");
      return;
    }
    const created = await res.json();
    const newMap: MapSummary = { ...created, _count: { persons: 0 } };
    setMaps((prev) => [newMap, ...prev]);
    onSelectMap(newMap.id);
    setEditingId(newMap.id);
    setEditingTitle(newMap.title);
  };

  const startEditTitle = (m: MapSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(m.id);
    setEditingTitle(m.title);
  };

  const saveTitle = async (id: string) => {
    const title = editingTitle.trim() || "제목 없는 관계도";
    await fetch(`/api/maps/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setMaps((prev) => prev.map((m) => (m.id === id ? { ...m, title } : m)));
    setEditingId(null);
  };

  const deleteMap = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await confirm({
      title: "관계도 삭제",
      message: "이 관계도와 안의 모든 인물·관계가 삭제됩니다.",
      confirmText: "삭제",
      danger: true,
    });
    if (!ok) return;
    await fetch(`/api/maps/${id}`, { method: "DELETE" });
    setMaps((prev) => prev.filter((m) => m.id !== id));
    showToast("info", "관계도를 삭제했습니다.");
    if (activeMapId === id) {
      onActiveMapDeleted();
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
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>관계도</h2>
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
            placeholder="관계도 검색..."
            style={{
              width: "100%",
              padding: "8px 10px 8px 30px",
              borderRadius: 8,
              border: "1px solid var(--border-default)",
              fontSize: 13,
              boxSizing: "border-box",
              background: "var(--bg-canvas)",
            }}
          />
        </div>
      </div>

      {/* 새 관계도 버튼 */}
      <div style={{ padding: "0 16px 12px" }}>
        <button
          onClick={createMap}
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
          새 관계도
        </button>
      </div>

      {/* 목록 */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 16px" }}>
        {loading ? (
          <p style={{ fontSize: 13, color: "var(--text-secondary)", padding: "0 8px" }}>불러오는 중...</p>
        ) : filteredMaps.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-secondary)", padding: "0 8px" }}>
            {query ? "검색 결과가 없습니다." : "아직 만든 관계도가 없습니다."}
          </p>
        ) : (
          filteredMaps.map((m) => (
            <div
              key={m.id}
              onClick={() => onSelectMap(m.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 10px",
                borderRadius: 8,
                marginBottom: 2,
                cursor: "pointer",
                background: activeMapId === m.id ? "var(--bg-hover)" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (activeMapId !== m.id) e.currentTarget.style.background = "var(--bg-canvas)";
              }}
              onMouseLeave={(e) => {
                if (activeMapId !== m.id) e.currentTarget.style.background = "transparent";
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                {editingId === m.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={editingTitle}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveTitle(m.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    onBlur={() => saveTitle(m.id)}
                    style={{
                      width: "100%",
                      fontSize: 14,
                      padding: "3px 6px",
                      borderRadius: 6,
                      border: "1px solid var(--text-primary)",
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
                      {m.title}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: "2px 0 0" }}>
                      인물 {m._count.persons}명
                    </p>
                  </>
                )}
              </div>
              {editingId !== m.id && (
                <button
                  onClick={(e) => startEditTitle(m, e)}
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
                onClick={(e) => deleteMap(m.id, e)}
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
