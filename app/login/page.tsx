// ============================================
// 파일 경로: app/login/page.tsx
// (프로젝트 루트의 app 폴더 -> login 폴더 -> page.tsx)
// ============================================
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login, signup } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    setSubmitting(true);
    const result = mode === "login" ? await login(email.trim(), password) : await signup(email.trim(), password);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? "처리 중 오류가 발생했습니다.");
      return;
    }
    showToast("success", mode === "login" ? "로그인되었습니다." : "회원가입이 완료되었습니다.");
    router.push("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FAF8F3",
      }}
    >
      <div
        style={{
          width: 360,
          background: "#fff",
          borderRadius: 14,
          border: "1px solid #ECE8DF",
          padding: "32px 28px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 4px", color: "#2C2C2A" }}>
          Plot Weaver
        </h1>
        <p style={{ fontSize: 13, color: "#6B6760", margin: "0 0 24px" }}>
          {mode === "login" ? "로그인하고 내 관계도를 관리하세요." : "계정을 만들고 관계도를 시작하세요."}
        </p>

        <label style={{ fontSize: 13, color: "#6B6760", display: "block", marginBottom: 4 }}>
          이메일
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{
            width: "100%",
            padding: "9px 11px",
            borderRadius: 8,
            border: "1px solid #D8D4CC",
            fontSize: 14,
            marginBottom: 14,
            boxSizing: "border-box",
          }}
        />

        <label style={{ fontSize: 13, color: "#6B6760", display: "block", marginBottom: 4 }}>
          비밀번호
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === "signup" ? "8자 이상" : ""}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          style={{
            width: "100%",
            padding: "9px 11px",
            borderRadius: 8,
            border: "1px solid #D8D4CC",
            fontSize: 14,
            marginBottom: 8,
            boxSizing: "border-box",
          }}
        />

        {error && (
          <p style={{ fontSize: 12, color: "#A33B3B", margin: "0 0 12px" }}>{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: "100%",
            padding: "10px 0",
            borderRadius: 8,
            border: "1px solid #2C2C2A",
            background: "#2C2C2A",
            color: "#fff",
            fontSize: 14,
            cursor: submitting ? "default" : "pointer",
            marginTop: 8,
          }}
        >
          {submitting ? "처리 중..." : mode === "login" ? "로그인" : "회원가입"}
        </button>

        <p style={{ fontSize: 13, color: "#6B6760", textAlign: "center", marginTop: 16 }}>
          {mode === "login" ? "계정이 없으신가요? " : "이미 계정이 있으신가요? "}
          <button
            onClick={() => {
                console.log('clicked'); 
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
            }}
            style={{
              background: "none",
              border: "none",
              color: "#2C2C2A",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: 13,
              padding: 0,
            }}
          >
            {mode === "login" ? "회원가입" : "로그인"}
          </button>
        </p>
      </div>
    </div>
  );
}