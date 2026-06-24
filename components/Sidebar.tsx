"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

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
  const [expanded, setExpanded] = useState(true);

  const width = expanded ? 256 : 60;

  return (
    <div
      style={{
        width,
        height: "100vh",
        flexShrink: 0,
        background: "#FAF8F3",
        borderRight: "1px solid #ECE8DF",
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
          <span style={{ fontSize: 15, fontWeight: 600, color: "#2C2C2A", letterSpacing: "-0.01em" }}>
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
            color: "#6B6760",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#ECE8DF")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1.5" y="2.5" width="13" height="11" rx="2" stroke="#6B6760" strokeWidth="1.3" />
            <line x1="6" y1="2.5" x2="6" y2="13.5" stroke="#6B6760" strokeWidth="1.3" />
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
            color: "#2C2C2A",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#ECE8DF")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="9" cy="9" r="2" stroke="#2C2C2A" strokeWidth="1.3" />
            <circle cx="3.5" cy="4" r="1.6" stroke="#2C2C2A" strokeWidth="1.3" />
            <circle cx="14.5" cy="4" r="1.6" stroke="#2C2C2A" strokeWidth="1.3" />
            <circle cx="3.5" cy="14" r="1.6" stroke="#2C2C2A" strokeWidth="1.3" />
            <circle cx="14.5" cy="14" r="1.6" stroke="#2C2C2A" strokeWidth="1.3" />
            <line x1="4.6" y1="5.2" x2="7.6" y2="7.8" stroke="#2C2C2A" strokeWidth="1.1" />
            <line x1="13.4" y1="5.2" x2="10.4" y2="7.8" stroke="#2C2C2A" strokeWidth="1.1" />
            <line x1="4.6" y1="12.8" x2="7.6" y2="10.2" stroke="#2C2C2A" strokeWidth="1.1" />
            <line x1="13.4" y1="12.8" x2="10.4" y2="10.2" stroke="#2C2C2A" strokeWidth="1.1" />
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
            color: "#2C2C2A",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#ECE8DF")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="9" cy="6.5" r="2.8" stroke="#2C2C2A" strokeWidth="1.3" />
            <path
              d="M3.5 15C3.5 11.7 5.96 9.5 9 9.5C12.04 9.5 14.5 11.7 14.5 15"
              stroke="#2C2C2A"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
          {expanded && <span>인물</span>}
        </button>
      </nav>

      {/* 하단 계정 정보 */}
      <div
        style={{
          padding: expanded ? "12px 14px" : "12px 8px",
          borderTop: "1px solid #ECE8DF",
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
            background: "#2C2C2A",
            color: "#fff",
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
                color: "#2C2C2A",
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
                  color: "#9A9690",
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
              <p style={{ fontSize: 11, color: "#9A9690", margin: 0 }}>추후 구현 예정</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
