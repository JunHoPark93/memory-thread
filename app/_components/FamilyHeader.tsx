"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

// 가족 영역 헤더 - 반투명 blur 고정 헤더
export default function FamilyHeader() {
  const router = useRouter();

  // mock 로그아웃 처리
  const handleLogout = () => {
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50 shadow-sm">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* 앱 로고 및 이름 */}
        <Link
          href="/"
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          aria-label="홈으로 이동"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm">
            <span className="text-base" role="img" aria-hidden="true">🧵</span>
          </div>
          <span className="text-lg font-bold text-foreground">기억의 실</span>
        </Link>

        {/* 로그아웃 버튼 */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="로그아웃"
        >
          <LogOut className="size-4" />
          <span>로그아웃</span>
        </button>
      </div>
    </header>
  );
}
