"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

// 가족 영역 헤더 - 앱 이름 + 로그아웃 버튼
export default function FamilyHeader() {
  const router = useRouter();

  // mock 로그아웃 처리
  const handleLogout = () => {
    router.push("/");
  };

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* 앱 로고 및 이름 */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🧵</span>
          <span className="text-xl font-bold text-gray-800">기억의 실</span>
        </Link>

        {/* 로그아웃 버튼 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-gray-600 hover:text-gray-900"
        >
          <LogOut className="size-4" />
          <span>로그아웃</span>
        </Button>
      </div>
    </header>
  );
}
