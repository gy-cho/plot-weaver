"use client";

import { Handle, Position } from "reactflow";
import { COLOR_BG, COLOR_TEXT, type Person } from "@/types";
import { useSignedImageUrl } from "@/lib/useSignedImageUrl";

export type PersonNodeData = {
  person: Person | null;
  isCenter?: boolean;
  onClick: () => void;
};

// React Flow는 엣지를 그리려면 노드에 최소 1개의 source/target Handle이 필요합니다.
// 우리는 커스텀 엣지(CenterToCenterEdge)에서 노드 중심 좌표를 직접 계산하므로,
// 이 Handle은 화면에 보이지 않고 위치 계산에도 쓰이지 않습니다 (필수 조건 충족용).
const invisibleHandleStyle: React.CSSProperties = {
  width: 1,
  height: 1,
  opacity: 0,
  pointerEvents: "none",
};

export default function PersonNode({ data }: { data: PersonNodeData }) {
  const { person, onClick } = data;
  const size = 96;
  const signedImageUrl = useSignedImageUrl(person?.imageUrl);

  const bg = person ? COLOR_BG[person.color] ?? "var(--bg-hover)" : "var(--bg-surface)";
  const textColor = person ? COLOR_TEXT[person.color] ?? "var(--text-primary)" : "var(--text-tertiary)";
  // 테두리는 본문 텍스트 색이 아니라 항상 연한 회색 계열로 통일
  const borderColor = person ? "var(--node-border-filled)" : "var(--node-border-empty)";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <style>{`
        .person-node-circle {
          transition: transform 0.12s ease;
        }
        .person-node-circle:hover {
          transform: scale(1.04);
        }
      `}</style>
      <div
        className="person-node-circle"
        onClick={onClick}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: signedImageUrl ? undefined : bg,
          backgroundImage: signedImageUrl ? `url(${signedImageUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          border: `1px ${person ? "solid" : "dashed"} ${borderColor}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "grab",
          textAlign: "center",
          padding: "4px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <Handle type="source" position={Position.Top} style={invisibleHandleStyle} isConnectable={false} />
        <Handle type="target" position={Position.Top} style={invisibleHandleStyle} isConnectable={false} />
        {!signedImageUrl && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: textColor,
              lineHeight: 1.3,
              wordBreak: "keep-all",
              pointerEvents: "none",
            }}
          >
            {person ? person.name : "빈 노드"}
          </span>
        )}
      </div>
      {signedImageUrl && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: "var(--text-primary)",
            pointerEvents: "none",
            background: "var(--bg-canvas)",
            padding: "1px 8px",
            borderRadius: 6,
          }}
        >
          {person?.name}
        </span>
      )}
    </div>
  );
}
