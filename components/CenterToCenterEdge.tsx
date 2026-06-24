"use client";

import { useStore, type EdgeProps, type ReactFlowState } from "reactflow";

// 노드 원의 고정 지름. PersonNode.tsx의 size 값과 반드시 일치해야 합니다.
// (라벨이 붙어 노드 전체 높이가 늘어나도, 시각적인 원은 항상 이 크기로 고정되어 있습니다.)
const NODE_DIAMETER = 80;

// 노드의 "원 중심" 좌표를 구하기 위한 헬퍼.
// node.height는 이름 라벨이 붙으면 늘어나므로 사용하지 않고, 항상 고정된 원 지름의 절반만 더합니다.
function useNodeCenter(nodeId: string) {
  return useStore((state: ReactFlowState) => {
    const node = state.nodeInternals.get(nodeId);
    if (!node) return null;
    // 원의 가로/세로 중심 모두 고정 지름 기준으로 계산합니다.
    // (라벨이 텍스트 길이에 따라 wrapper 폭을 넓힐 수 있어, width도 height와 마찬가지로 신뢰하지 않습니다.)
    return {
      x: node.positionAbsolute ? node.positionAbsolute.x + NODE_DIAMETER / 2 : 0,
      y: node.positionAbsolute ? node.positionAbsolute.y + NODE_DIAMETER / 2 : 0,
    };
  });
}

export default function CenterToCenterEdge({ id, source, target, label, style, labelStyle, labelBgStyle }: EdgeProps) {
  const sourceCenter = useNodeCenter(source);
  const targetCenter = useNodeCenter(target);

  if (!sourceCenter || !targetCenter) return null;

  const midX = (sourceCenter.x + targetCenter.x) / 2;
  const midY = (sourceCenter.y + targetCenter.y) / 2;

  return (
    <>
      {/* 클릭 판정 영역을 넓히기 위한 투명한 두꺼운 선 */}
      <path
        d={`M ${sourceCenter.x},${sourceCenter.y} L ${targetCenter.x},${targetCenter.y}`}
        fill="none"
        stroke="transparent"
        strokeWidth={16}
        style={{ cursor: "pointer" }}
      />
      <path
        id={id}
        d={`M ${sourceCenter.x},${sourceCenter.y} L ${targetCenter.x},${targetCenter.y}`}
        fill="none"
        style={style}
      />
      {label ? (
        <g transform={`translate(${midX}, ${midY})`}>
          <rect
            x={-((String(label).length * 6) / 2 + 8)}
            y={-10}
            width={String(label).length * 6 + 16}
            height={20}
            rx={6}
            style={labelBgStyle}
          />
          <text textAnchor="middle" dominantBaseline="central" style={labelStyle}>
            {label}
          </text>
        </g>
      ) : null}
    </>
  );
}
