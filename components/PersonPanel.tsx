// ============================================
// 파일 경로: components/PersonPanel.tsx
// ============================================
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Person, PersonField, Relationship } from "@/types";
import PersonAvatar from "@/components/PersonAvatar";
import PersonQuickCreateModal from "@/components/PersonQuickCreateModal";
import { useToast } from "@/components/ToastProvider";

type View = "list" | "detail";

type Props = {
  storybookId: string;
  persons: Person[];
  onPersonsChange: () => void; // 새 인물 등록 등으로 목록이 바뀌었을 때 메인 화면에 알림
  onClose: () => void;
  initialDetailId?: string | null;
};

type PersonDetail = Person & {
  relationshipsFrom: (Relationship & { to: Person })[];
  relationshipsTo: (Relationship & { from: Person })[];
};

// 사이드패널은 "관계도 작업 중 곁눈질로 확인"하는 용도입니다.
// 기본정보(나이/성별/소속/한줄소개)는 여기서 바로 고칠 수 있고,
// 종족 추가 같은 필드 구조 편집이나 상세정보·관계 깊은 작업은 전체화면 상세에서 합니다.
export default function PersonPanel({ storybookId, persons, onPersonsChange, onClose, initialDetailId }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [view, setView] = useState<View>(initialDetailId ? "detail" : "list");
  const [detailId, setDetailId] = useState<string | null>(initialDetailId ?? null);
  const [detail, setDetail] = useState<PersonDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showQuickCreateModal, setShowQuickCreateModal] = useState(false);

  // 기본정보 인라인 편집용 상태
  const [editingBasic, setEditingBasic] = useState(false);
  const [basicFields, setBasicFields] = useState<PersonField[]>([]);
  const [savingBasic, setSavingBasic] = useState(false);

  const openDetail = async (id: string) => {
    setDetailId(id);
    setView("detail");
    setEditingBasic(false);
    setDetailLoading(true);
    const res = await fetch(`/api/persons/${id}`);
    const data: PersonDetail = await res.json();
    setDetail(data);
    setDetailLoading(false);
  };

  useEffect(() => {
    if (initialDetailId) {
      openDetail(initialDetailId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDetailId]);

  const goFullView = (id: string) => {
    router.replace(`/?storybookId=${storybookId}&personId=${id}`, { scroll: false });
  };

  // 목록에서 보여줄 한 줄 요약 — "기본정보" 탭의 "한 줄 소개" 필드를 우선 사용
  const summaryOf = (p: Person) => {
    const intro = p.customFields?.find((f) => f.tab === "basic" && f.label === "한 줄 소개")?.value;
    return intro || p.customFields?.find((f) => f.tab === "basic" && f.value)?.value || "";
  };

  const basicFieldsOf = (p: PersonDetail) => p.customFields?.filter((f) => f.tab === "basic") ?? [];

  const startEditBasic = () => {
    if (!detail) return;
    setBasicFields(basicFieldsOf(detail).map((f) => ({ ...f })));
    setEditingBasic(true);
  };

  const updateBasicField = (id: string, value: string) => {
    setBasicFields((prev) => prev.map((f) => (f.id === id ? { ...f, value } : f)));
  };

  const saveBasicFields = async () => {
    if (!detail) return;
    setSavingBasic(true);
    const otherFields = detail.customFields?.filter((f) => f.tab !== "basic") ?? [];
    const merged = [...basicFields, ...otherFields];

    await fetch(`/api/persons/${detail.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customFields: merged }),
    });
    setSavingBasic(false);
    setEditingBasic(false);
    showToast("success", "기본정보를 저장했습니다.");
    onPersonsChange();
    openDetail(detail.id);
  };

  return (
    <div
      style={{
        width: 360,
        height: "100vh",
        flexShrink: 0,
        background: "var(--bg-surface)",
        borderLeft: "1px solid var(--border-default)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        zIndex: 20,
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "16px 16px 12px",
          borderBottom: "1px solid var(--border-default)",
        }}
      >
        {view !== "list" && (
          <button
            onClick={() => setView("list")}
            aria-label="목록으로"
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: 4,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3.5L5.5 8L10 12.5" stroke="var(--text-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0, flex: 1, color: "var(--text-primary)" }}>
          {view === "list" ? "등록된 인물" : "인물 정보"}
        </h2>
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
            fontSize: 16,
          }}
        >
          ×
        </button>
      </div>

      {/* 본문 */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {view === "list" && (
          <>
            <button
              onClick={() => setShowQuickCreateModal(true)}
              style={{
                width: "100%",
                fontSize: 13,
                padding: "9px 12px",
                borderRadius: 8,
                border: "1px solid var(--accent)",
                background: "var(--accent)",
                color: "var(--accent-text)",
                cursor: "pointer",
                marginBottom: 14,
              }}
            >
              + 새 인물 등록
            </button>

            {persons.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>등록된 인물이 없습니다.</p>
            ) : (
              persons.map((p) => (
                <div
                  key={p.id}
                  onClick={() => openDetail(p.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 10px",
                    border: "1px solid var(--border-default)",
                    borderRadius: 10,
                    marginBottom: 8,
                    cursor: "pointer",
                    transition: "background 0.12s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-canvas)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <PersonAvatar person={p} size={34} fontSize={13} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 500, fontSize: 14, margin: 0, color: "var(--text-primary)" }}>{p.name}</p>
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--text-secondary)",
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {summaryOf(p)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {view === "detail" && (
          <>
            {detailLoading || !detail ? (
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>불러오는 중...</p>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <PersonAvatar person={detail} size={48} fontSize={18} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 500, fontSize: 16, margin: 0, color: "var(--text-primary)" }}>{detail.name}</p>
                  </div>
                  <button
                    onClick={() => goFullView(detail.id)}
                    style={{
                      fontSize: 12,
                      padding: "5px 10px",
                      borderRadius: 6,
                      border: "1px solid var(--border-strong)",
                      background: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      cursor: "pointer",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    전체보기
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M6 3.5L10.5 8L6 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                {/* 기본정보 — 보기/인라인 편집 겸용 */}
                <div style={{ borderTop: "1px solid var(--border-default)", paddingTop: 12, marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: 0 }}>기본정보</p>
                    {!editingBasic && (
                      <button
                        onClick={startEditBasic}
                        aria-label="기본정보 편집"
                        title="기본정보 편집"
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          padding: 2,
                          color: "var(--text-tertiary)",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M11 2.5L13.5 5L5 13.5H2.5V11L11 2.5Z"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                  </div>

                  {editingBasic ? (
                    <>
                      {basicFields.length === 0 ? (
                        <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 10px" }}>
                          기본정보 필드가 없습니다. 전체보기에서 추가할 수 있습니다.
                        </p>
                      ) : (
                        basicFields.map((field) => (
                          <div key={field.id} style={{ marginBottom: 10 }}>
                            <label style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block", marginBottom: 3 }}>
                              {field.label || "(이름 없는 필드)"}
                            </label>
                            <input
                              type="text"
                              value={field.value}
                              onChange={(e) => updateBasicField(field.id, e.target.value)}
                              style={{
                                width: "100%",
                                padding: "6px 8px",
                                borderRadius: 6,
                                border: "1px solid var(--border-strong)",
                                background: "var(--bg-input)",
                                color: "var(--text-primary)",
                                fontSize: 13,
                                boxSizing: "border-box",
                              }}
                            />
                          </div>
                        ))
                      )}
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button
                          onClick={saveBasicFields}
                          disabled={savingBasic}
                          style={{
                            fontSize: 12,
                            padding: "6px 12px",
                            borderRadius: 6,
                            border: "1px solid var(--accent)",
                            background: "var(--accent)",
                            color: "var(--accent-text)",
                            cursor: "pointer",
                          }}
                        >
                          {savingBasic ? "저장 중..." : "저장"}
                        </button>
                        <button
                          onClick={() => setEditingBasic(false)}
                          style={{
                            fontSize: 12,
                            padding: "6px 12px",
                            borderRadius: 6,
                            border: "1px solid var(--border-strong)",
                            background: "var(--bg-surface)",
                            color: "var(--text-primary)",
                            cursor: "pointer",
                          }}
                        >
                          취소
                        </button>
                      </div>
                    </>
                  ) : basicFieldsOf(detail).length > 0 && basicFieldsOf(detail).some((f) => f.value) ? (
                    basicFieldsOf(detail).map((field) => (
                      <div
                        key={field.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 10,
                          padding: "6px 0",
                          borderBottom: "1px solid var(--border-default)",
                        }}
                      >
                        <span style={{ fontSize: 12, color: "var(--text-tertiary)", flexShrink: 0 }}>
                          {field.label || "(이름 없는 필드)"}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            color: "var(--text-primary)",
                            textAlign: "right",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {field.value || "-"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>등록된 기본정보가 없습니다.</p>
                  )}

                  {!editingBasic && (
                    <button
                      onClick={() => goFullView(detail.id)}
                      style={{
                        marginTop: 10,
                        fontSize: 12,
                        color: "var(--text-secondary)",
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      상세정보 등 더 많은 정보는 전체보기에서
                    </button>
                  )}
                </div>

                {/* 관계 — 보기 전용 */}
                <div style={{ borderTop: "1px solid var(--border-default)", paddingTop: 12 }}>
                  <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: "0 0 10px" }}>
                    연결된 관계 (
                    {detail.relationshipsFrom.length + detail.relationshipsTo.length})
                  </p>
                  {[...detail.relationshipsFrom.map((r) => ({ rel: r, other: r.to })),
                    ...detail.relationshipsTo.map((r) => ({ rel: r, other: r.from }))]
                    .map(({ rel, other }) => (
                      <div
                        key={rel.id}
                        onClick={() => openDetail(other.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "9px 10px",
                          border: "1px solid var(--border-default)",
                          borderRadius: 8,
                          marginBottom: 8,
                          cursor: "pointer",
                          transition: "background 0.12s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-canvas)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <PersonAvatar person={other} size={28} fontSize={11} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 500, fontSize: 13, margin: 0, color: "var(--text-primary)" }}>{other.name}</p>
                          {rel.label ? (
                            <span
                              style={{
                                fontSize: 11,
                                display: "inline-block",
                                background: "var(--badge-bg)",
                                color: "var(--badge-text)",
                                padding: "1px 7px",
                                borderRadius: 6,
                                marginTop: 2,
                              }}
                            >
                              {rel.label}
                            </span>
                          ) : (
                            <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: "2px 0 0" }}>
                              관계: 미설정
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  {detail.relationshipsFrom.length + detail.relationshipsTo.length === 0 && (
                    <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>아직 연결된 관계가 없습니다.</p>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {showQuickCreateModal && (
        <PersonQuickCreateModal
          storybookId={storybookId}
          onCreated={() => {
            setShowQuickCreateModal(false);
            onPersonsChange();
          }}
          onClose={() => setShowQuickCreateModal(false)}
        />
      )}
    </div>
  );
}
