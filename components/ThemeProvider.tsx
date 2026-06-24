// ============================================
// 파일 경로: components/ThemeProvider.tsx
// ============================================
"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "plot-weaver-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // 처음 로드시 localStorage에 저장된 값을 복원합니다. (서버에서는 알 수 없으므로 클라이언트에서만 처리)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  // 테마가 확정되기 전 깜빡임을 막기 위해, 복원이 끝나기 전에는 자식만 렌더링하지 않고
  // 그대로 보여줍니다 (라이트 기본값으로 시작 — 깜빡임보다 깨진 화면이 더 나쁘므로).
  if (!mounted) {
    return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme은 ThemeProvider 내부에서만 사용할 수 있습니다.");
  return ctx;
}
