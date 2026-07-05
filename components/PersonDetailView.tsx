// ============================================
// 파일 경로: components/PersonDetailView.tsx
// ============================================
"use client";

import { useEffect, useState } from "react";
import {
  COLOR_BG,
  COLOR_TEXT,
  PERSON_COLORS,
  PERSON_TABS,
  createDefaultPersonFields,
  type Person,
  type PersonField,
  type PersonTabId,
  type Relationship,
} from "@/types";
import ImageUploadField from "@/components/ImageUploadField";
import PersonFieldsEditor from "@/components/PersonFieldsEditor";
import PersonFieldsView from "@/components/PersonFieldsView";
import { useConfirm } from "@/components/ConfirmProvider";
import { useToast } from "@/components/ToastProvider";
import { useSignedImageUrl } from "@/lib/useSignedImageUrl";

type PersonDetail = Person & {
  relationshipsFrom: (Relationship & { to: Person })[];
  relationshipsTo: (Relationship & { from: Person })[];
};

type Props = {
  storybookId: string;
  personId: string; // "new"이면 신규 등록 모드
  onClose: () => void; // 관계도로 돌아가기
  onNavigateToPerson: (personId: string) => void; // 관계 탭에서 다른 인물로 이동
  onPersonCreated: (personId: string) => void; // 신규 등록 완료 후 그 인물 상세로 전환
  onPersonChanged: () => void; // 저장/삭제 후 메인 화면(노드 라벨 등)을 새로고침하도록 알림
  onDeleted: () => void; // 삭제 후 관계도로 돌아가기
  onDirtyChange: (dirty: boolean) => void; // 저장하지 않은 변경사항이 있는지를 부모(사이드바 등)에 알림
};

export default function PersonDetailView({
  storybookId,
  personId,
  onClose,
  onNavigateToPerson,
  onPersonCreated,
  onPersonChanged,
  onDeleted,
  onDirtyChange,
}: Props) {
  const confirm = useConfirm();
  const { showToast } = useToast();
  // "new"이면 신규 등록 모드. 지금은 관계도 쪽 진입 경로가 모두 간단 등록 모달(PersonQuickCreateModal)로
  // 옮겨갔지만, 전체화면 안에서 새 인물을 만드는 경로가 필요해질 때를 위해 이 모드는 그대로 둡니다.
  const isNew = personId === "new";

  const [person, setPerson] = useState<PersonDetail | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [activeTab, setActiveTab] = useState<PersonTabId>(PERSON_TABS[0].id);
  const [isEditing, setIsEditing] = useState(isNew); // 신규 등록은 처음부터 편집 화면으로 시작

  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(PERSON_COLORS[0]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const signedImageUrl = useSignedImageUrl(imageUrl);
  const signedOriginalImageUrl = useSignedImageUrl(originalImageUrl);
  const [fields, setFields] = useState<PersonField[]>(isNew ? createDefaultPersonFields() : []);
  const [dirty, setDirty] = useState(false);
  const [showOriginalPreview, setShowOriginalPreview] = useState(false);

  const loadPerson = async () => {
    if (isNew) return;
    setLoading(true);
    const res = await fetch(`/api/persons/${personId}`);
    if (!res.ok) {
      showToast("error", "인물을 불러오지 못했습니다.");
      setLoading(false);
      return;
    }
    const data: PersonDetail = await res.json();
    setPerson(data);
    setName(data.name);
    setColor(data.color);
    setImageUrl(data.imageUrl);
    setOriginalImageUrl(data.originalImageUrl);
    setFields(data.customFields && data.customFields.length > 0 ? data.customFields : createDefaultPersonFields());
    setActiveTab(PERSON_TABS[0].id);
    setIsEditing(false);
    setDirty(false);
    setLoading(false);
  };

  useEffect(() => {
    loadPerson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personId]);

  // 편집 중 저장 안 된 변경사항이 있는지를 부모(사이드바 메뉴 등)에 알립니다.
  useEffect(() => {
    onDirtyChange(isEditing && dirty);
  }, [isEditing, dirty, onDirtyChange]);

  // 컴포넌트가 사라질 때(다른 화면으로 완전히 전환될 때) 깃발을 내려줍니다.
  useEffect(() => {
    return () => onDirtyChange(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markDirty = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setDirty(true);
  };

  // 편집 중 저장하지 않은 변경사항이 있는 상태로 화면을 벗어나려고 하면 확인을 거칩니다.
  // (탭 이동은 화면을 벗어나는 게 아니므로 이 가드를 거치지 않습니다.)
  const guardLeave = async (proceed: () => void) => {
    if (isEditing && dirty) {
      const ok = await confirm({
        title: "저장하지 않은 변경사항",
        message: "수정한 내용이 저장되지 않습니다. 그래도 나가시겠습니까?",
        confirmText: "나가기",
        danger: true,
      });
      if (!ok) return;
    }
    proceed();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showToast("error", "이름은 비워둘 수 없습니다.");
      return;
    }
    const cleanedFields = fields.filter((f) => f.label.trim() || f.value.trim());

    if (isNew) {
      const res = await fetch("/api/persons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storybookId, name: name.trim(), color, imageUrl, originalImageUrl, customFields: cleanedFields }),
      });
      const created = await res.json();
      showToast("success", "새 인물을 등록했습니다.");
      onPersonChanged();
      onPersonCreated(created.id);
      return;
    }

    await fetch(`/api/persons/${personId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), color, imageUrl, originalImageUrl, customFields: cleanedFields }),
    });
    showToast("success", "저장되었습니다.");
    setDirty(false);
    setIsEditing(false);
    onPersonChanged();
    loadPerson();
  };

  // 편집을 취소하면, 마지막으로 불러온(저장된) 값으로 되돌립니다.
  const handleCancelEdit = () => {
    if (person) {
      setName(person.name);
      setColor(person.color);
      setImageUrl(person.imageUrl);
      setOriginalImageUrl(person.originalImageUrl);
      setFields(person.customFields && person.customFields.length > 0 ? person.customFields : createDefaultPersonFields());
    }
    setDirty(false);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: "인물 삭제",
      message: "이 인물을 삭제하시겠습니까? 연결된 관계도 함께 삭제됩니다.",
      confirmText: "삭제",
      danger: true,
    });
    if (!ok) return;
    await fetch(`/api/persons/${personId}`, { method: "DELETE" });
    showToast("info", "인물을 삭제했습니다.");
    onPersonChanged();
    onDeleted();
  };

  if (loading) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>불러오는 중...</p>
      </div>
    );
  }

  if (!isNew && !person) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>인물을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const fieldsInTab = fields.filter((f) => f.tab === activeTab);
  const allRelations = person
    ? [
        ...person.relationshipsFrom.map((r) => ({ rel: r, other: r.to })),
        ...person.relationshipsTo.map((r) => ({ rel: r, other: r.from })),
      ]
    : [];

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "var(--bg-canvas)" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 24px",
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-default)",
        }}
      >
        <button
          onClick={() => guardLeave(onClose)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: 13,
            color: "var(--text-primary)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3.5L5.5 8L10 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          관계도로 돌아가기
        </button>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {isEditing ? (
            <>
              {dirty && (
                <span style={{ fontSize: 12, color: "var(--text-tertiary)", marginRight: 4 }}>
                  저장되지 않은 변경사항
                </span>
              )}
              {!isNew && (
                <button
                  onClick={handleCancelEdit}
                  aria-label="취소"
                  title="취소"
                  style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 8,
                    border: "none",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
                    <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              )}
              {isNew ? (
                <button
                  onClick={handleSave}
                  disabled={!name.trim()}
                  style={{
                    fontSize: 13,
                    padding: "7px 14px",
                    borderRadius: 8,
                    border: name.trim() ? "1px solid var(--accent)" : "1px solid var(--border-default)",
                    background: name.trim() ? "var(--accent)" : "transparent",
                    color: name.trim() ? "var(--accent-text)" : "var(--text-tertiary)",
                    cursor: name.trim() ? "pointer" : "default",
                  }}
                >
                  등록
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={!dirty}
                  aria-label="저장"
                  title="저장"
                  style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 8,
                    border: "none",
                    background: "transparent",
                    color: dirty ? "var(--accent)" : "var(--text-tertiary)",
                    cursor: dirty ? "pointer" : "default",
                  }}
                  onMouseEnter={(e) => dirty && (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8.5L6.2 11.7L13 4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={handleDelete}
                aria-label="삭제"
                title="삭제"
                style={{
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  border: "none",
                  background: "transparent",
                  color: "var(--danger)",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--danger-bg-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3.5 4.5H12.5M6.5 4.5V3C6.5 2.5 6.9 2 7.5 2H8.5C9.1 2 9.5 2.5 9.5 3V4.5M4.5 4.5L5 12.5C5 13.1 5.5 13.5 6 13.5H10C10.5 13.5 11 13.1 11 12.5L11.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                onClick={() => setIsEditing(true)}
                aria-label="편집"
                title="편집"
                style={{
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  border: "none",
                  background: "transparent",
                  color: "var(--accent)",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M11 2.5L13.5 5L5 13.5H2.5V11L11 2.5Z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ display: "flex", gap: 28, marginBottom: 36, alignItems: "flex-start" }}>
          <div style={{ flexShrink: 0 }}>
            {signedImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={signedImageUrl}
                alt={name}
                onClick={() => !isEditing && originalImageUrl && setShowOriginalPreview(true)}
                style={{
                  width: 220,
                  height: 220,
                  borderRadius: 16,
                  objectFit: "cover",
                  border: "1px solid var(--border-default)",
                  cursor: !isEditing && originalImageUrl ? "zoom-in" : "default",
                }}
              />
            ) : (
              <div
                style={{
                  width: 220,
                  height: 220,
                  borderRadius: 16,
                  background: COLOR_BG[color] ?? "var(--bg-hover)",
                  color: COLOR_TEXT[color] ?? "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 64,
                  fontWeight: 500,
                }}
              >
                {name.slice(0, 1)}
              </div>
            )}
            <div style={{ marginTop: 10 }}>
              {isEditing ? (
                <ImageUploadField
                  value={imageUrl}
                  onChange={(newImageUrl, newOriginalUrl) => {
                    markDirty(setImageUrl)(newImageUrl);
                    setOriginalImageUrl(newOriginalUrl);
                    setDirty(true);
                  }}
                />
              ) : (
                originalImageUrl && (
                  <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: 0, textAlign: "center" }}>
                    클릭하면 원본 크기로 보기
                  </p>
                )
              )}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
            {isEditing ? (
              <>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                  이름 <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => markDirty(setName)(e.target.value)}
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "1px solid var(--border-strong)",
                    background: "var(--bg-input)",
                    color: "var(--text-primary)",
                    width: "100%",
                    boxSizing: "border-box",
                    marginBottom: 16,
                  }}
                />

                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                  프로필 색상 (사진이 없을 때 표시)
                </label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {PERSON_COLORS.map((c) => (
                    <div
                      key={c}
                      onClick={() => markDirty(setColor)(c)}
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
              </>
            ) : (
              <h1 style={{ fontSize: 26, fontWeight: 600, margin: 0, color: "var(--text-primary)" }}>{name}</h1>
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 4,
            borderBottom: "1px solid var(--border-default)",
            marginBottom: 20,
          }}
        >
          {PERSON_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 16px",
                border: "none",
                borderBottom: activeTab === tab.id ? "2px solid var(--accent)" : "2px solid transparent",
                background: "transparent",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: activeTab === tab.id ? 600 : 400,
                color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-secondary)",
                marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          ))}
          {!isNew && (
            <button
              onClick={() => setActiveTab("__relations__" as PersonTabId)}
              style={{
                padding: "10px 16px",
                border: "none",
                borderBottom: activeTab === ("__relations__" as PersonTabId) ? "2px solid var(--accent)" : "2px solid transparent",
                background: "transparent",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: activeTab === ("__relations__" as PersonTabId) ? 600 : 400,
                color: activeTab === ("__relations__" as PersonTabId) ? "var(--text-primary)" : "var(--text-secondary)",
                marginBottom: -1,
              }}
            >
              관계 ({allRelations.length})
            </button>
          )}
        </div>

        {activeTab === ("__relations__" as PersonTabId) ? (
          <div>
            {allRelations.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>아직 연결된 관계가 없습니다.</p>
            ) : (
              allRelations.map(({ rel, other }) => (
                <div
                  key={rel.id}
                  onClick={() => guardLeave(() => onNavigateToPerson(other.id))}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    border: "1px solid var(--border-default)",
                    borderRadius: 10,
                    marginBottom: 8,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: COLOR_BG[other.color] ?? "var(--bg-hover)",
                      color: COLOR_TEXT[other.color] ?? "var(--text-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 500,
                      fontSize: 14,
                      flexShrink: 0,
                      overflow: "hidden",
                    }}
                  >
                    {other.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={other.imageUrl} alt={other.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      other.name.slice(0, 1)
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 500, fontSize: 14, margin: 0, color: "var(--text-primary)" }}>{other.name}</p>
                    {rel.label ? (
                      <span
                        style={{
                          fontSize: 12,
                          display: "inline-block",
                          background: "var(--badge-bg)",
                          color: "var(--badge-text)",
                          padding: "1px 8px",
                          borderRadius: 6,
                          marginTop: 2,
                        }}
                      >
                        {rel.label}
                      </span>
                    ) : (
                      <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: "2px 0 0" }}>관계: 미설정</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : isEditing ? (
          <PersonFieldsEditor
            tabId={activeTab}
            fields={fieldsInTab}
            onChange={(updatedTabFields) => {
              markDirty(setFields)([...fields.filter((f) => f.tab !== activeTab), ...updatedTabFields]);
            }}
          />
        ) : (
          <PersonFieldsView fields={fieldsInTab} />
        )}
      </div>

      {showOriginalPreview && originalImageUrl && (
        <div
          onClick={() => setShowOriginalPreview(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "var(--bg-overlay)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 70,
            cursor: "zoom-out",
            padding: 40,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={signedOriginalImageUrl ?? undefined}
            alt={name}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              borderRadius: 8,
              boxShadow: "0 16px 48px var(--shadow-color-strong)",
            }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowOriginalPreview(false);
            }}
            aria-label="닫기"
            style={{
              position: "fixed",
              top: 20,
              right: 24,
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "none",
              background: "rgba(0,0,0,0.4)",
              color: "#fff",
              fontSize: 20,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
