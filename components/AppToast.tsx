"use client";

import { useState, useRef } from "react";
import { useToast, type ToastType } from "@/components/ToastProvider";

const TYPE_STYLE: Record<ToastType, { bg: string; color: string }> = {
  success: { bg: "#00C851", color: "#fff" },
  error: { bg: "#ff4444", color: "#fff" },
  warning: { bg: "#ffbb33", color: "#333" },
  info: { bg: "#33b5e5", color: "#fff" },
};

function ToastIcon({ type, copied }: { type: ToastType; copied: boolean }) {
  if (copied) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "success") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M8 12.5L10.8 15.3L16 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "error") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <line x1="12" y1="8" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="16.2" r="1" fill="currentColor" />
      </svg>
    );
  }
  if (type === "warning") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 3.5L21 19.5H3L12 3.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <line x1="12" y1="10" x2="12" y2="14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="17" r="1" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <line x1="12" y1="11" x2="12" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="7.5" r="1" fill="currentColor" />
    </svg>
  );
}

async function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 폴백으로 진행
    }
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

export default function AppToast() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = async () => {
    const ok = await copyText(toast.message);
    if (ok) {
      setCopied(true);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 1200);
    }
  };

  const style = TYPE_STYLE[toast.type];

  return (
    <>
      <style>{`
        @keyframes toast-fade-in {
          from { opacity: 0; transform: translateX(-50%) translateY(16px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .app-toast-wrap {
          animation: toast-fade-in 0.25s ease;
          transition: filter 0.15s ease, opacity 0.25s ease, transform 0.25s ease;
        }
        .app-toast-wrap:hover { filter: brightness(1.05); }
        .app-toast-wrap:active { filter: brightness(0.95); }
      `}</style>
      {toast.visible && (
        <div
          className="app-toast-wrap"
          onClick={handleCopy}
          style={{
            position: "fixed",
            bottom: 30,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            padding: "12px 22px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
            minWidth: 260,
            maxWidth: "min(480px, calc(100vw - 40px))",
            cursor: "pointer",
            whiteSpace: "normal",
            wordBreak: "break-word",
            background: style.bg,
            color: style.color,
          }}
        >
          <span style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", marginTop: 1 }}>
            <ToastIcon type={toast.type} copied={copied} />
          </span>
          <span>{copied ? "복사되었습니다" : toast.message}</span>
        </div>
      )}
    </>
  );
}
