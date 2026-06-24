"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

type ToastState = {
  visible: boolean;
  type: ToastType;
  message: string;
};

type ToastContextValue = {
  toast: ToastState;
  showToast: (type: ToastType, message: string, duration?: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const INITIAL_STATE: ToastState = { visible: false, type: "success", message: "" };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>(INITIAL_STATE);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((type: ToastType, message: string, duration = 3000) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ visible: true, type, message });
    timerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, showToast }}>{children}</ToastContext.Provider>
  );
}

// 사용법: const { showToast } = useToast(); showToast('success', '저장되었습니다');
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast는 ToastProvider 내부에서만 사용할 수 있습니다.");
  }
  return ctx;
}
