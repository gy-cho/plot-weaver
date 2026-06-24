// ============================================
// 파일 경로: components/Sidebar.tsx
// ============================================
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";

type Props = {
  onToggleMapList: () => void;
  mapListOpen: boolean;
  onTogglePersonList: () => void;
  personListOpen: boolean;
};

export default function Sidebar({
  onToggleMapList,
  mapListOpen,
  onTogglePersonList,
  personListOpen,
}: Props) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [expanded, setExpanded] = useState(true);

  const width = expanded ? 256 : 60;

  return (
    <div
      style={{
        width,
        height: "100vh",
        flexShrink: 0,
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border-default)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.15s ease",
        position: "relative",
        zIndex: 20,
      }}
    >
      {/* 앱 이름 + 접기/펼치기 토글 */}
      <div
        style={{
          padding: "16px 14px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: expanded ? "space-between" : "center",
        }}
      >
        {expanded && (
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            Plot Weaver
          </span>
        )}
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "메뉴 접기" : "메뉴 펼치기"}
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1.5" y="2.5" width="13" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
            <line x1="6" y1="2.5" x2="6" y2="13.5" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        </button>
      </div>

      {/* 메뉴 항목 */}
      <nav style={{ flex: 1, padding: "4px 8px" }}>
        <button
          onClick={onToggleMapList}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: expanded ? "9px 10px" : "9px 0",
            justifyContent: expanded ? "flex-start" : "center",
            borderRadius: 8,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: 14,
            color: "var(--text-primary)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="3.5" cy="4" r="1.6" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="14.5" cy="4" r="1.6" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="3.5" cy="14" r="1.6" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="14.5" cy="14" r="1.6" stroke="currentColor" strokeWidth="1.3" />
            <line x1="4.6" y1="5.2" x2="7.6" y2="7.8" stroke="currentColor" strokeWidth="1.1" />
            <line x1="13.4" y1="5.2" x2="10.4" y2="7.8" stroke="currentColor" strokeWidth="1.1" />
            <line x1="4.6" y1="12.8" x2="7.6" y2="10.2" stroke="currentColor" strokeWidth="1.1" />
            <line x1="13.4" y1="12.8" x2="10.4" y2="10.2" stroke="currentColor" strokeWidth="1.1" />
          </svg>
          {expanded && <span>관계도</span>}
        </button>

        <button
          onClick={onTogglePersonList}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: expanded ? "9px 10px" : "9px 0",
            justifyContent: expanded ? "flex-start" : "center",
            borderRadius: 8,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: 14,
            color: "var(--text-primary)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="9" cy="6.5" r="2.8" stroke="currentColor" strokeWidth="1.3" />
            <path
              d="M3.5 15C3.5 11.7 5.96 9.5 9 9.5C12.04 9.5 14.5 11.7 14.5 15"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
          {expanded && <span>인물</span>}
        </button>

        <button
          onClick={toggleTheme}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: expanded ? "9px 10px" : "9px 0",
            justifyContent: expanded ? "flex-start" : "center",
            borderRadius: 8,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: 14,
            color: "var(--text-primary)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          {theme === "light" ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
              <path
                d="M9 2.5V4M9 14V15.5M15.5 9H14M4 9H2.5M13.4 4.6L12.3 5.7M5.7 12.3L4.6 13.4M13.4 13.4L12.3 12.3M5.7 5.7L4.6 4.6"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              <circle cx="9" cy="9" r="3.2" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
              <path
                d="M14.5 10.8C13.6 11.4 12.5 11.8 11.4 11.8C8.1 11.8 5.4 9.1 5.4 5.8C5.4 4.6 5.8 3.5 6.4 2.6C3.6 3.4 1.5 6 1.5 9.1C1.5 12.9 4.6 16 8.4 16C11.5 16 14.1 13.9 14.9 11.1C14.8 11 14.6 10.9 14.5 10.8Z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
            </svg>
          )}
          {expanded && <span>{theme === "light" ? "다크 모드" : "라이트 모드"}</span>}
        </button>
      </nav>

      {/* 하단 계정 정보 */}
      <div
        style={{
          padding: expanded ? "12px 14px" : "12px 8px",
          borderTop: "1px solid var(--border-default)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          justifyContent: expanded ? "flex-start" : "center",
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "var(--accent)",
            color: "var(--accent-text)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          {user ? user.email.slice(0, 1).toUpperCase() : "?"}
        </div>
        {expanded && (
          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 500,
                margin: 0,
                color: "var(--text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user ? user.email : "로그인 필요"}
            </p>
            {user ? (
              <button
                onClick={async () => {
                  await logout();
                  router.push("/login");
                }}
                style={{
                  fontSize: 11,
                  color: "var(--text-tertiary)",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                로그아웃
              </button>
            ) : (
              <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: 0 }}>추후 구현 예정</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
