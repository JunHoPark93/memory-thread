import Link from "next/link";
import { Button } from "@/components/ui/button";

// 어르신 영역 헤더 - 앱 이름 + 뱃지 아이콘 버튼
export default function ElderHeader() {
  return (
    <header className="bg-orange-500 text-white shadow-md">
      <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
        {/* 앱 로고 및 이름 */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl">🧵</span>
          <span className="text-2xl font-bold">기억의 실</span>
        </Link>

        {/* 뱃지 페이지 이동 버튼 */}
        <Button
          asChild
          variant="ghost"
          className="text-white hover:bg-orange-400 hover:text-white text-2xl px-3 py-2 h-auto"
          aria-label="뱃지 및 포인트 보기"
        >
          <Link href="/elder/badge">🏅</Link>
        </Button>
      </div>
    </header>
  );
}
