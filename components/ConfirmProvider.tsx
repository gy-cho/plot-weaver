"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean; // true면 확인 버튼이 위험(삭제 등) 색상으로 표시됨
};

type ConfirmState = ConfirmOptions & { visible: boolean };

type ConfirmContextValue = {
  state: ConfirmState;
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
  handleConfirm: () => void;
  handleCancel: () => void;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

const INITIAL_STATE: ConfirmState = { visible: false, message: "" };

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmState>(INITIAL_STATE);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  // 사용법: const ok = await confirm("삭제하시겠습니까?"); if (ok) { ... }
  const confirm = useCallback((options: ConfirmOptions | string): Promise<boolean> => {
    const normalized: ConfirmOptions = typeof options === "string" ? { message: options } : options;
    setState({ ...normalized, visible: true });
    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
    resolverRef.current?.(true);
    resolverRef.current = null;
  }, []);

  const handleCancel = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
    resolverRef.current?.(false);
    resolverRef.current = null;
  }, []);

  return (
    <ConfirmContext.Provider value={{ state, confirm, handleConfirm, handleCancel }}>
      {children}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm은 ConfirmProvider 내부에서만 사용할 수 있습니다.");
  }
  return ctx.confirm;
}

// AppConfirmDialog 컴포넌트에서만 사용하는 내부 훅
export function useConfirmDialogState() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirmDialogState는 ConfirmProvider 내부에서만 사용할 수 있습니다.");
  }
  return ctx;
}
