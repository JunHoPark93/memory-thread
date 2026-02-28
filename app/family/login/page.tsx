"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { setFamilySession } from "@/app/_lib/session";

// 가족 ID/PW 로그인 페이지
export default function FamilyLoginPage() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id.trim() || !password.trim()) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: id.trim(), password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "로그인에 실패했습니다.");
        return;
      }

      setFamilySession(data.id, data.name);
      router.push("/family/dashboard");
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-8 pb-12">
      {/* 뒤로가기 링크 */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm font-medium mb-8 transition-colors"
      >
        <ChevronLeft className="size-4" />
        뒤로가기
      </Link>

      <Card className="shadow-xl border-border/60 rounded-3xl overflow-hidden">
        <CardHeader className="pb-4 pt-8 px-7 bg-gradient-to-b from-orange-50/60 to-transparent">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
              <span className="text-xl" role="img" aria-hidden="true">🧵</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">가족 관리 로그인</CardTitle>
          <CardDescription className="text-sm">
            어르신의 기억을 함께 보존하세요
          </CardDescription>
        </CardHeader>

        <CardContent className="px-7 pb-8">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* 아이디 입력 */}
            <div className="space-y-1.5">
              <label htmlFor="login-id" className="text-sm font-medium text-foreground">
                아이디
              </label>
              <Input
                id="login-id"
                type="text"
                value={id}
                onChange={(e) => { setId(e.target.value); setError(""); }}
                placeholder="아이디를 입력하세요"
                autoComplete="username"
                className="h-11 rounded-xl border-border/70 bg-muted/30 focus:bg-white transition-colors"
              />
            </div>

            {/* 비밀번호 입력 */}
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="text-sm font-medium text-foreground">
                비밀번호
              </label>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
                className="h-11 rounded-xl border-border/70 bg-muted/30 focus:bg-white transition-colors"
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <p className="text-destructive text-sm font-medium" role="alert">{error}</p>
            )}

            {/* 로그인 버튼 */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60"
              size="lg"
            >
              {loading ? "로그인 중..." : "로그인"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
