"use client";

import { useEffect, useState } from "react";
import { COLOR_BG, COLOR_TEXT, PERSON_COLORS, type Person, type Relationship } from "@/types";
import PersonAvatar from "@/components/PersonAvatar";
import ImageUploadField from "@/components/ImageUploadField";
import { useConfirm } from "@/components/ConfirmProvider";
import { useToast } from "@/components/ToastProvider";

type View = "list" | "form" | "detail";

type Props = {
  mapId: string;
  persons: Person[];
  onPersonsChange: () => void; // 메인 관계도 화면에 변경사항을 알려 다시 불러오게 함
  onClose: () => void;
  initialDetailId?: string | null;
};

type PersonDetail = Person & {
  relationshipsFrom: (Relationship & { to: Person })[];
  relationshipsTo: (Relationship & { from: Person })[];
};

export default function PersonPanel({ mapId, persons, onPersonsChange, onClose, initialDetailId }: Props) {
  const confirm = useConfirm();
  const { showToast } = useToast();
  const [view, setView] = useState<View>(initialDetailId ? "detail" : "list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(initialDetailId ?? null);
  const [detail, setDetail] = useState<PersonDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<string>(PERSON_COLORS[0]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setColor(PERSON_COLORS[0]);
    setImageUrl(null);
  };

  const startCreate = () => {
    resetForm();
    setView("form");
  };

  const startEdit = (p: Person) => {
    setEditingId(p.id);
    setName(p.name);
    setDescription(p.description ?? "");
    setColor(p.color);
    setImageUrl(p.imageUrl ?? null);
    setView("form");
  };

  const openDetail = async (id: string) => {
    setDetailId(id);
    setView("detail");
    setDetailLoading(true);
    const res = await fetch(`/api/persons/${id}`);
    setDetail(await res.json());
    setDetailLoading(false);
  };

  useEffect(() => {
    if (initialDetailId) {
      openDetail(initialDetailId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDetailId]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    if (editingId) {
      await fetch(`/api/persons/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim(), color, imageUrl }),
      });
      showToast("success", "인물 정보를 수정했습니다.");
    } else {
      await fetch("/api/persons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mapId, name: name.trim(), description: description.trim(), color, imageUrl }),
      });
      showToast("success", "새 인물을 등록했습니다.");
    }
    resetForm();
    setView("list");
    onPersonsChange();
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "인물 삭제",
      message: "이 인물을 삭제하시겠습니까? 연결된 관계도 함께 삭제됩니다.",
      confirmText: "삭제",
      danger: true,
    });
    if (!ok) return;
    await fetch(`/api/persons/${id}`, { method: "DELETE" });
    showToast("info", "인물을 삭제했습니다.");
    onPersonsChange();
    setView("list");
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
            onClick={() => {
              if (view === "form") resetForm();
              setView("list");
            }}
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
        <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0, flex: 1 }}>
          {view === "list" && "등록된 인물"}
          {view === "form" && (editingId ? "인물 수정" : "인물 등록")}
          {view === "detail" && "인물 상세"}
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
              onClick={startCreate}
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
                    <p style={{ fontWeight: 500, fontSize: 14, margin: 0 }}>{p.name}</p>
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
                      {p.description || ""}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(p);
                    }}
                    aria-label="수정"
                    style={{
                      fontSize: 12,
                      padding: "4px 8px",
                      borderRadius: 6,
                      border: "1px solid var(--border-strong)",
                      background: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    수정
                  </button>
                </div>
              ))
            )}
          </>
        )}

        {view === "form" && (
          <>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 6px" }}>프로필 사진</p>
            <div style={{ marginBottom: 16 }}>
              <ImageUploadField value={imageUrl} onChange={setImageUrl} />
            </div>

            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 6px" }}>프로필 색상</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {PERSON_COLORS.map((c) => (
                <div
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: COLOR_BG[c],
                    border: `2px solid ${color === c ? COLOR_TEXT[c] : "transparent"}`,
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>

            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 6px" }}>이름</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 해리 포터"
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid var(--border-strong)",
                fontSize: 14,
                marginBottom: 14,
                boxSizing: "border-box",
              }}
            />

            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 6px" }}>상세 설명</p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="소속, 성격, 특징 등"
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid var(--border-strong)",
                fontSize: 14,
                resize: "vertical",
                boxSizing: "border-box",
                marginBottom: 16,
              }}
            />

            <div style={{ display: "flex", gap: 8 }}>
              <button
                disabled={!name.trim()}
                onClick={handleSubmit}
                style={{
                  fontSize: 13,
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid var(--accent)",
                  background: name.trim() ? "var(--accent)" : "var(--text-tertiary)",
                  color: "var(--accent-text)",
                  cursor: name.trim() ? "pointer" : "not-allowed",
                }}
              >
                {editingId ? "수정 저장" : "등록"}
              </button>
              {editingId && (
                <button
                  onClick={() => handleDelete(editingId)}
                  style={{
                    fontSize: 13,
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid var(--danger-border)",
                    background: "var(--bg-surface)",
                    color: "var(--danger)",
                    cursor: "pointer",
                  }}
                >
                  삭제
                </button>
              )}
            </div>
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
                  <div>
                    <p style={{ fontWeight: 500, fontSize: 16, margin: 0 }}>{detail.name}</p>
                    <button
                      onClick={() => startEdit(detail)}
                      style={{
                        fontSize: 12,
                        color: "var(--text-secondary)",
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      수정하기
                    </button>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--border-default)", paddingTop: 12, marginBottom: 12 }}>
                  <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: "0 0 6px" }}>상세 설명</p>
                  <p style={{ fontSize: 13, margin: 0, lineHeight: 1.7 }}>
                    {detail.description || "등록된 설명이 없습니다."}
                  </p>
                </div>

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
                          <p style={{ fontWeight: 500, fontSize: 13, margin: 0 }}>{other.name}</p>
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
    </div>
  );
}
