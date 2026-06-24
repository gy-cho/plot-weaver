// ============================================
// 파일 경로: components/AppConfirmDialog.tsx
// ============================================
"use client";

import { useConfirmDialogState } from "@/components/ConfirmProvider";

export default function AppConfirmDialog() {
  const { state, handleConfirm, handleCancel } = useConfirmDialogState();

  if (!state.visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--bg-overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={handleCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-surface)",
          borderRadius: 12,
          padding: 20,
          width: 340,
          boxShadow: "0 12px 32px var(--shadow-color-strong)",
        }}
      >
        {state.title && (
          <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>{state.title}</h3>
        )}
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "0 0 18px", lineHeight: 1.6 }}>
          {state.message}
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={handleCancel}
            style={{
              fontSize: 13,
              padding: "7px 14px",
              borderRadius: 8,
              border: "1px solid var(--border-strong)",
              background: "var(--bg-surface)",
              color: "var(--text-primary)",
              cursor: "pointer",
            }}
          >
            {state.cancelText ?? "취소"}
          </button>
          <button
            onClick={handleConfirm}
            style={{
              fontSize: 13,
              padding: "7px 14px",
              borderRadius: 8,
              border: state.danger ? "1px solid #ff4444" : "1px solid var(--accent)",
              background: state.danger ? "#ff4444" : "var(--accent)",
              color: state.danger ? "#fff" : "var(--accent-text)",
              cursor: "pointer",
            }}
          >
            {state.confirmText ?? "확인"}
          </button>
        </div>
      </div>
    </div>
  );
}
