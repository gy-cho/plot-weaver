// ============================================
// 파일 경로: components/MapContextMenu.tsx
// ============================================
"use client";

export type ContextMenuItem = {
  label: string;
  onClick: () => void;
  danger?: boolean;
};

type Props = {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
};

export default function MapContextMenu({ x, y, items, onClose }: Props) {
  return (
    <>
      {/* 메뉴 바깥을 클릭하면 닫히도록 전체 화면을 덮는 투명 레이어 */}
      <div
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
        style={{ position: "fixed", inset: 0, zIndex: 40 }}
      />
      <div
        style={{
          position: "fixed",
          top: y,
          left: x,
          zIndex: 41,
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          borderRadius: 8,
          boxShadow: "0 8px 24px var(--shadow-color-strong)",
          padding: 4,
          minWidth: 160,
        }}
      >
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              item.onClick();
              onClose();
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              borderRadius: 6,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: 13,
              color: item.danger ? "var(--danger)" : "var(--text-primary)",
              textAlign: "left",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = item.danger ? "var(--danger-bg-hover)" : "var(--bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {item.label === "노드 추가" && (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <line x1="8" y1="2.5" x2="8" y2="13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <line x1="2.5" y1="8" x2="13.5" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            )}
            {(item.label === "인물 등록" || item.label === "인물 변경") && (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5.5" r="2.4" stroke="currentColor" strokeWidth="1.2" />
                <path
                  d="M3.5 13.2C3.5 10.5 5.5 8.8 8 8.8C10.5 8.8 12.5 10.5 12.5 13.2"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            )}
            {item.label === "관계 등록" && (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="3.5" cy="3.5" r="2" stroke="currentColor" strokeWidth="1.3" />
                <circle cx="12.5" cy="12.5" r="2" stroke="currentColor" strokeWidth="1.3" />
                <line x1="5" y1="5" x2="11" y2="11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <line x1="11" y1="5" x2="11" y2="2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <line x1="13.5" y1="4.5" x2="8.5" y2="4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            )}
            {item.label === "노드 삭제" && (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3.5 4.5H12.5M6.5 4.5V3C6.5 2.5 6.9 2 7.5 2H8.5C9.1 2 9.5 2.5 9.5 3V4.5M4.5 4.5L5 12.5C5 13.1 5.5 13.5 6 13.5H10C10.5 13.5 11 13.1 11 12.5L11.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}
