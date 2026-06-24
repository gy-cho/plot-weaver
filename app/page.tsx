"use client";

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
  useReactFlow,
  applyNodeChanges,
  type Edge,
  type Node,
  type NodeChange,
  type NodeMouseHandler,
  type EdgeMouseHandler,
} from "reactflow";
import "reactflow/dist/style.css";

import PersonNode from "@/components/PersonNode";
import CenterToCenterEdge from "@/components/CenterToCenterEdge";
import PersonSummaryPanel from "@/components/PersonSummaryPanel";
import PersonSelectModal from "@/components/PersonSelectModal";
import EdgeLabelModal from "@/components/EdgeLabelModal";
import Sidebar from "@/components/Sidebar";
import MapListPanel from "@/components/MapListPanel";
import MapContextMenu from "@/components/MapContextMenu";
import PersonPanel from "@/components/PersonPanel";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmProvider";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import type { Person, Relationship } from "@/types";

const nodeTypes = { personNode: PersonNode };
const edgeTypes = { centerToCenter: CenterToCenterEdge };

// 화면에 보일 "노드 슬롯". personId가 비어 있으면 빈 노드.
type NodeSlot = {
  id: string;
  personId: string | null;
  x: number;
  y: number;
  isCenter?: boolean;
};

const CENTER_X = 400;
const CENTER_Y = 320;
const RADIUS = 260;

function defaultLayout(persons: Person[]): NodeSlot[] {
  if (persons.length === 0) {
    return [{ id: "slot-center", personId: null, x: CENTER_X, y: CENTER_Y, isCenter: true }];
  }
  return persons.map((p, i) => {
    // 저장된 좌표가 있으면 그대로 사용 (드래그로 옮겨서 저장된 위치)
    if (p.positionX != null && p.positionY != null) {
      return { id: `slot-${p.id}`, personId: p.id, x: p.positionX, y: p.positionY, isCenter: i === 0 };
    }
    if (i === 0) {
      return { id: `slot-${p.id}`, personId: p.id, x: CENTER_X, y: CENTER_Y, isCenter: true };
    }
    const angleStep = (2 * Math.PI) / Math.max(persons.length - 1, 1);
    const angle = angleStep * (i - 1);
    return {
      id: `slot-${p.id}`,
      personId: p.id,
      x: CENTER_X + RADIUS * Math.cos(angle),
      y: CENTER_Y + RADIUS * Math.sin(angle),
    };
  });
}

function MapPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mapId = searchParams.get("mapId");

  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [persons, setPersons] = useState<Person[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [slots, setSlots] = useState<NodeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  // React Flow는 SVG 속성(stroke, fill)에 CSS 변수 문자열을 직접 못 쓰므로,
  // 실제 색상값을 테마에 따라 직접 정의합니다.
  // (getComputedStyle로 DOM에서 읽어오는 방식은 브라우저의 스타일 재계산 타이밍과
  //  경쟁 상태가 생겨, 테마 전환 직후 옛 값을 읽어버리는 문제가 있었습니다.)
  // → 나중에 CI 색상이 정해지면 globals.css와 이 두 객체를 함께 맞춰주면 됩니다.
  const LIGHT_EDGE_COLORS = {
    stroke: "#6B6760",
    labelFill: "#6B6760",
    labelBg: "#FAF8F3",
    grid: "#ECE7DC",
  };
  const DARK_EDGE_COLORS = {
    stroke: "#B0ABA0",
    labelFill: "#B0ABA0",
    labelBg: "#25241F",
    grid: "#2A2922",
  };
  const edgeColors = theme === "dark" ? DARK_EDGE_COLORS : LIGHT_EDGE_COLORS;

  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [selectModalMode, setSelectModalMode] = useState<"assign" | "connect">("assign");
  const [activeEdgeId, setActiveEdgeId] = useState<string | null>(null);
  const [showPersonPanel, setShowPersonPanel] = useState(false);
  const [panelDetailId, setPanelDetailId] = useState<string | null>(null);
  const [showMapList, setShowMapList] = useState(false);
  const [contextMenu, setContextMenu] = useState<
    | { type: "pane"; x: number; y: number; flowX: number; flowY: number }
    | { type: "node"; x: number; y: number; slotId: string }
    | null
  >(null);

  const { screenToFlowPosition } = useReactFlow();

  // 로그인하지 않았으면 로그인 화면으로 보냅니다. mapId가 없는 것은 더 이상 에러가 아니라
  // "관계도를 선택/생성해주세요"라는 정상적인 빈 상태로 같은 화면 안에서 처리합니다.
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // 다른 관계도로 전환했을 때 이전 관계도의 데이터가 잠깐 보이지 않도록 초기화
  useEffect(() => {
    setPersons([]);
    setRelationships([]);
    setSlots([]);
    setLoading(true);
    setActiveSlotId(null);
    setActiveEdgeId(null);
  }, [mapId]);

  const loadData = useCallback(async () => {
    if (!mapId) return;
    const [pRes, rRes] = await Promise.all([
      fetch(`/api/persons?mapId=${mapId}`),
      fetch(`/api/relationships?mapId=${mapId}`),
    ]);
    if (!pRes.ok || !rRes.ok) {
      showToast("error", "관계도를 불러오지 못했습니다.");
      setLoading(false);
      return;
    }
    const personsData: Person[] = await pRes.json();
    const relsData: Relationship[] = await rRes.json();
    setPersons(personsData);
    setRelationships(relsData);
    setSlots((prev) => (prev.length === 0 ? defaultLayout(personsData) : prev));
    setLoading(false);
  }, [mapId, showToast]);

  useEffect(() => {
    if (!mapId) {
      setLoading(false);
      return;
    }
    if (user) {
      loadData();
    }
  }, [mapId, user, loadData]);

  const getPerson = useCallback(
    (id: string | null) => (id ? persons.find((p) => p.id === id) ?? null : null),
    [persons]
  );

  const activeSlot = slots.find((s) => s.id === activeSlotId) ?? null;
  const activePerson = activeSlot ? getPerson(activeSlot.personId) : null;

  const handleNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setActiveSlotId(node.id);
    setActiveEdgeId(null);
  }, []);

  const handleEdgeClick: EdgeMouseHandler = useCallback((_, edge) => {
    setActiveEdgeId(edge.id);
    setActiveSlotId(null);
  }, []);

  // 캔버스 빈 공간 우클릭 → 커스텀 컨텍스트 메뉴 표시
  const handlePaneContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      event.preventDefault();
      const flowPos = screenToFlowPosition({ x: (event as MouseEvent).clientX, y: (event as MouseEvent).clientY });
      setContextMenu({
        type: "pane",
        x: (event as MouseEvent).clientX,
        y: (event as MouseEvent).clientY,
        flowX: flowPos.x,
        flowY: flowPos.y,
      });
    },
    [screenToFlowPosition]
  );

  // 노드 위에서 우클릭 → "노드 삭제" 메뉴 표시
  const handleNodeContextMenu: NodeMouseHandler = useCallback((event, node) => {
    event.preventDefault();
    setContextMenu({
      type: "node",
      x: event.clientX,
      y: event.clientY,
      slotId: node.id,
    });
  }, []);

  // 컨텍스트 메뉴의 "노드 추가" — 우클릭한 자리가 노드의 중심이 되도록 빈 노드를 만듭니다.
  const handleAddNodeFromContextMenu = useCallback(() => {
    if (!contextMenu || contextMenu.type !== "pane") return;
    const newSlot: NodeSlot = {
      id: `slot-empty-${Date.now()}`,
      personId: null,
      x: contextMenu.flowX - 40,
      y: contextMenu.flowY - 40,
    };
    setSlots((prev) => [...prev, newSlot]);
    setActiveSlotId(newSlot.id);
  }, [contextMenu]);

  // 특정 노드에 인물을 등록/변경하려는 요청 — 이미 어떤 노드에든 배정된 인물은 선택할 수 없으므로
  // (변경의 경우 "다른" 인물로 바꾸는 것이 목적이라 현재 배정된 인물 자신도 후보에서 제외합니다),
  // 실제로 "배정 가능한 인물"이 있는지를 기준으로 분기합니다.
  // 가능한 인물이 있으면 선택 모달을, 없으면 안내 토스트와 함께 인물 등록 패널을 띄웁니다.
  const requestAssignPerson = useCallback(
    (slotId: string) => {
      setActiveSlotId(slotId);
      setActiveEdgeId(null);

      const placedIds = new Set(
        slots.map((s) => s.personId).filter((id): id is string => !!id)
      );
      const assignable = persons.filter((p) => !placedIds.has(p.id));

      if (assignable.length === 0) {
        showToast(
          "info",
          persons.length === 0
            ? "등록된 인물이 없습니다. 인물을 먼저 등록해주세요."
            : "배정 가능한 인물이 없습니다. 새 인물을 등록해주세요."
        );
        setPanelDetailId(null);
        setShowPersonPanel(true);
        return;
      }
      setSelectModalMode("assign");
      setShowSelectModal(true);
    },
    [persons, slots, showToast]
  );

  // 빈 노드에 기존 인물 배정, 또는 등록된 인물에 새 관계 연결
  const handleSelectPerson = async (person: Person) => {
    if (selectModalMode === "assign") {
      if (!activeSlotId) return;
      setSlots((prev) =>
        prev.map((s) => (s.id === activeSlotId ? { ...s, personId: person.id } : s))
      );
    } else {
      // connect 모드: 현재 활성 인물과 선택한 인물 사이에 관계 생성
      if (!activePerson) return;
      const res = await fetch("/api/relationships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mapId, fromId: activePerson.id, toId: person.id, label: "" }),
      });
      if (res.ok) {
        const newRel: Relationship = await res.json();
        setRelationships((prev) => [...prev, newRel]);
        // 선택한 인물이 아직 화면에 슬롯이 없으면 새 슬롯도 만들어줌
        setSlots((prev) => {
          const exists = prev.some((s) => s.personId === person.id);
          if (exists) return prev;
          const base = activeSlot ?? { x: CENTER_X, y: CENTER_Y };
          const angle = Math.random() * 2 * Math.PI;
          return [
            ...prev,
            {
              id: `slot-${person.id}`,
              personId: person.id,
              x: base.x + 200 * Math.cos(angle),
              y: base.y + 200 * Math.sin(angle),
            },
          ];
        });
      } else {
        const err = await res.json();
        showToast("error", err.error || "관계를 연결하지 못했습니다.");
      }
    }
    setShowSelectModal(false);
  };

  // 노드를 관계도에서 제거 (인물 데이터 자체는 삭제하지 않고, 이 관계도에서의 연결과 배치만 제거)
  const handleRemoveFromMap = async (slotId: string) => {
    const slot = slots.find((s) => s.id === slotId);
    if (!slot) return;

    const linkedRelIds = slot.personId
      ? relationships
          .filter((r) => r.fromId === slot.personId || r.toId === slot.personId)
          .map((r) => r.id)
      : [];

    const ok = await confirm({
      title: "노드 삭제",
      message:
        linkedRelIds.length > 0
          ? "이 노드를 관계도에서 제거합니다. 연결된 관계도 함께 삭제되며, 인물 정보 자체는 삭제되지 않습니다."
          : "이 노드를 관계도에서 제거합니다.",
      confirmText: "삭제",
      danger: true,
    });
    if (!ok) return;

    // 연결된 관계들을 서버에서 삭제
    await Promise.all(
      linkedRelIds.map((id) => fetch(`/api/relationships/${id}`, { method: "DELETE" }))
    );
    if (linkedRelIds.length > 0) {
      setRelationships((prev) => prev.filter((r) => !linkedRelIds.includes(r.id)));
    }

    setSlots((prev) => prev.filter((s) => s.id !== slotId));
    setActiveSlotId((prev) => (prev === slotId ? null : prev));
    showToast("info", "노드를 삭제했습니다.");
  };

  // 관계 저장/수정
  const activeEdgeRel = relationships.find((r) => r.id === activeEdgeId) ?? null;
  const activeEdgeFromSlot = activeEdgeRel
    ? slots.find((s) => s.personId === activeEdgeRel.fromId)
    : null;
  const activeEdgeToSlot = activeEdgeRel
    ? slots.find((s) => s.personId === activeEdgeRel.toId)
    : null;

  const handleSaveEdgeLabel = async (label: string) => {
    if (!activeEdgeRel) return;
    const res = await fetch(`/api/relationships/${activeEdgeRel.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
    const updated: Relationship = await res.json();
    setRelationships((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setActiveEdgeId(null);
  };

  const handleDeleteEdge = async () => {
    if (!activeEdgeRel) return;
    await fetch(`/api/relationships/${activeEdgeRel.id}`, { method: "DELETE" });
    setRelationships((prev) => prev.filter((r) => r.id !== activeEdgeRel.id));
    setActiveEdgeId(null);
  };

  // React Flow 노드 — 위치는 드래그로 직접 바뀔 수 있으므로 별도 state로 관리하고,
  // slots(인물 배정 등)이 바뀔 때만 다시 동기화합니다.
  const [flowNodes, setFlowNodes] = useState<Node[]>([]);

  useEffect(() => {
    setFlowNodes((prevNodes) =>
      slots.map((s) => {
        const existing = prevNodes.find((n) => n.id === s.id);
        return {
          id: s.id,
          type: "personNode",
          // 이미 화면에 있던 노드라면 사용자가 드래그한 현재 위치를 유지하고,
          // 새로 생긴 슬롯이라면 슬롯의 기본 좌표를 사용합니다.
          position: existing ? existing.position : { x: s.x, y: s.y },
          data: {
            person: getPerson(s.personId),
            isCenter: s.isCenter,
            onClick: () => {
              setActiveSlotId(s.id);
              setActiveEdgeId(null);
            },
          },
          draggable: true,
        };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots, persons]);

  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    setFlowNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  // 노드 드래그가 끝나면, 그 노드가 등록된 인물이라면 좌표를 서버에 저장합니다.
  // 빈 노드는 DB에 저장할 인물이 없으므로 화면에서만 위치가 유지됩니다.
  //
  // - 짧은 시간 안에 같은 인물을 연속으로 드래그하면(배치를 다듬는 중) 마지막 위치만 저장합니다 (디바운스).
  // - 클릭만 하고 실제로 위치가 바뀌지 않았으면 요청을 보내지 않습니다.
  const dragSaveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const lastSavedPosition = useRef<Record<string, { x: number; y: number }>>({});

  const handleNodeDragStop: NodeMouseHandler = useCallback(
    (_, node) => {
      const slot = slots.find((s) => s.id === node.id);
      if (!slot?.personId) return;
      const personId = slot.personId;
      const { x, y } = node.position;

      // 마지막으로 저장한 좌표와 거의 같으면(클릭만 한 경우 등) 요청 생략
      const last = lastSavedPosition.current[personId];
      const moved = !last || Math.abs(last.x - x) > 1 || Math.abs(last.y - y) > 1;
      if (!moved) return;

      // 같은 인물에 대한 이전 예약 저장이 있으면 취소하고 새로 예약 (디바운스)
      if (dragSaveTimers.current[personId]) {
        clearTimeout(dragSaveTimers.current[personId]);
      }
      dragSaveTimers.current[personId] = setTimeout(() => {
        lastSavedPosition.current[personId] = { x, y };
        fetch(`/api/persons/${personId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ positionX: x, positionY: y }),
        }).catch(() => {
          showToast("error", "위치를 저장하지 못했습니다.");
        });
        delete dragSaveTimers.current[personId];
      }, 600);
    },
    [slots, showToast]
  );

  // 다른 관계도로 이동하거나 화면을 떠날 때, 아직 저장되지 않은 예약된 위치 저장을 정리합니다.
  useEffect(() => {
    return () => {
      Object.values(dragSaveTimers.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const flowEdges: Edge[] = useMemo(() => {
    return relationships
      .map((r) => {
        const fromSlot = slots.find((s) => s.personId === r.fromId);
        const toSlot = slots.find((s) => s.personId === r.toId);
        if (!fromSlot || !toSlot) return null;
        return {
          id: r.id,
          source: fromSlot.id,
          target: toSlot.id,
          type: "centerToCenter",
          label: r.label || "",
          style: { stroke: edgeColors.stroke, strokeWidth: 1 },
          labelStyle: { fontSize: 11, fill: edgeColors.labelFill },
          labelBgStyle: { fill: edgeColors.labelBg },
        } as Edge;
      })
      .filter((e): e is Edge => e !== null);
  }, [relationships, slots, edgeColors]);

  if (authLoading || !user) {
    return (
      <div style={{ padding: 40, fontSize: 14, color: "var(--text-secondary)" }}>불러오는 중...</div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex" }}>
      <Sidebar
        mapListOpen={showMapList}
        onToggleMapList={() => setShowMapList((v) => !v)}
        personListOpen={showPersonPanel}
        onTogglePersonList={() => {
          if (!showPersonPanel) setPanelDetailId(null);
          setShowPersonPanel((v) => !v);
        }}
      />

      {showMapList && (
        <MapListPanel
          activeMapId={mapId}
          onSelectMap={(id) => {
            router.replace(`/?mapId=${id}`, { scroll: false });
          }}
          onActiveMapDeleted={() => {
            router.replace("/", { scroll: false });
          }}
          onClose={() => setShowMapList(false)}
        />
      )}

      <div style={{ flex: 1, height: "100vh", position: "relative", background: "var(--bg-canvas)" }}>
        {!mapId ? (
          // 관계도가 선택되지 않은 상태 — 다른 페이지로 보내지 않고 같은 화면에서 안내합니다.
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
            }}
          >
            <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
              아직 선택된 관계도가 없습니다.
            </p>
            <button
              onClick={() => setShowMapList(true)}
              style={{
                fontSize: 13,
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid var(--accent)",
                background: "var(--accent)",
                color: "var(--accent-text)",
                cursor: "pointer",
              }}
            >
              관계도 목록 열기
            </button>
          </div>
        ) : loading ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              color: "var(--text-secondary)",
            }}
          >
            관계도를 불러오는 중...
          </div>
        ) : (
          <>
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodesChange={handleNodesChange}
              onNodeClick={handleNodeClick}
              onNodeDragStop={handleNodeDragStop}
              onNodeContextMenu={handleNodeContextMenu}
              onEdgeClick={handleEdgeClick}
              onPaneContextMenu={handlePaneContextMenu}
              onPaneClick={() => {
                setActiveSlotId(null);
                setActiveEdgeId(null);
              }}
              fitView
            >
              <Background key={theme} color={edgeColors.grid} gap={20} size={1} />
              <Controls position="bottom-right" />
            </ReactFlow>

            {activeSlot && (
              <PersonSummaryPanel
                person={activePerson}
                onAssignExisting={() => activeSlot && requestAssignPerson(activeSlot.id)}
                onConnectExisting={() => {
                  setSelectModalMode("connect");
                  setShowSelectModal(true);
                }}
                onOpenDetail={() => {
                  if (activePerson) {
                    setPanelDetailId(activePerson.id);
                    setShowPersonPanel(true);
                  }
                }}
                onRemoveFromMap={() => activeSlot && handleRemoveFromMap(activeSlot.id)}
                onClose={() => setActiveSlotId(null)}
              />
            )}

            {showSelectModal && (
              <PersonSelectModal
                persons={persons}
                excludeIds={
                  selectModalMode === "assign"
                    ? slots.map((s) => s.personId).filter((id): id is string => !!id)
                    : activePerson
                    ? [
                        activePerson.id,
                        ...relationships
                          .filter((r) => r.fromId === activePerson.id || r.toId === activePerson.id)
                          .map((r) => (r.fromId === activePerson.id ? r.toId : r.fromId)),
                      ]
                    : []
                }
                onSelect={handleSelectPerson}
                onClose={() => setShowSelectModal(false)}
              />
            )}

            {activeEdgeRel && (
              <EdgeLabelModal
                fromPerson={getPerson(activeEdgeRel.fromId)}
                toPerson={getPerson(activeEdgeRel.toId)}
                initialLabel={activeEdgeRel.label ?? ""}
                onSave={handleSaveEdgeLabel}
                onDelete={handleDeleteEdge}
                onClose={() => setActiveEdgeId(null)}
              />
            )}

            {contextMenu?.type === "pane" && (
              <MapContextMenu
                x={contextMenu.x}
                y={contextMenu.y}
                items={[{ label: "노드 추가", onClick: handleAddNodeFromContextMenu }]}
                onClose={() => setContextMenu(null)}
              />
            )}

            {contextMenu?.type === "node" && (
              <MapContextMenu
                x={contextMenu.x}
                y={contextMenu.y}
                items={[
                  {
                    label: slots.find((s) => s.id === contextMenu.slotId)?.personId
                      ? "인물 변경"
                      : "인물 등록",
                    onClick: () => requestAssignPerson(contextMenu.slotId),
                  },
                  {
                    label: "노드 삭제",
                    danger: true,
                    onClick: () => handleRemoveFromMap(contextMenu.slotId),
                  },
                ]}
                onClose={() => setContextMenu(null)}
              />
            )}
          </>
        )}
      </div>

      {showPersonPanel && mapId && (
        <PersonPanel
          mapId={mapId}
          persons={persons}
          initialDetailId={panelDetailId}
          onPersonsChange={loadData}
          onClose={() => setShowPersonPanel(false)}
        />
      )}
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense
      fallback={<div style={{ padding: 40, fontSize: 14, color: "var(--text-secondary)" }}>불러오는 중...</div>}
    >
      <ReactFlowProvider>
        <MapPageInner />
      </ReactFlowProvider>
    </Suspense>
  );
}