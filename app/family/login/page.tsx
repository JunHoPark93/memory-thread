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

// 가족 ID/PW 로그인 페이지
export default function FamilyLoginPage() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // mock 로그인 핸들러
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!id.trim() || !password.trim()) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    // mock: 어떤 값이든 로그인 성공으로 처리
    router.push("/family/dashboard");
  };

  return (
    <div className="pt-8 pb-12">
      {/* 뒤로가기 링크 */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-gray-600 text-sm mb-6"
      >
        <ChevronLeft className="size-4" />
        뒤로가기
      </Link>

      {/* 로그인 카드 */}
      <Card className="shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">🧵</span>
          </div>
          <CardTitle className="text-2xl">가족 관리 로그인</CardTitle>
          <CardDescription>
            어르신의 기억을 함께 보존하세요
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {/* 아이디 입력 */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-id"
                className="text-sm font-medium text-gray-700"
              >
                아이디
              </label>
              <Input
                id="login-id"
                type="text"
                value={id}
                onChange={(e) => {
                  setId(e.target.value);
                  setError("");
                }}
                placeholder="아이디를 입력하세요"
                autoComplete="username"
              />
            </div>

            {/* 비밀번호 입력 */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="text-sm font-medium text-gray-700"
              >
                비밀번호
              </label>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}

            {/* 로그인 버튼 */}
            <Button
              type="submit"
              className="w-full bg-gray-800 hover:bg-gray-900 text-white"
              size="lg"
            >
              로그인
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
