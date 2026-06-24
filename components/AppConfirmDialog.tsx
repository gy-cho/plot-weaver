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
        background: "rgba(0,0,0,0.3)",
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
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          width: 340,
          boxShadow: "0 12px 32px rgba(0,0,0,0.16)",
        }}
      >
        {state.title && (
          <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600 }}>{state.title}</h3>
        )}
        <p style={{ fontSize: 14, color: "#3A3A3A", margin: "0 0 18px", lineHeight: 1.6 }}>
          {state.message}
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={handleCancel}
            style={{
              fontSize: 13,
              padding: "7px 14px",
              borderRadius: 8,
              border: "1px solid #D8D4CC",
              background: "#fff",
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
              border: state.danger ? "1px solid #ff4444" : "1px solid #2C2C2A",
              background: state.danger ? "#ff4444" : "#2C2C2A",
              color: "#fff",
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
