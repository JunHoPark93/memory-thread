import Link from "next/link";
import { Award } from "lucide-react";

// 어르신 영역 헤더 - 반투명 blur 고정 헤더
export default function ElderHeader() {
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
          <span className="text-lg font-bold text-gradient-amber">기억의 실</span>
        </Link>

        {/* 뱃지 페이지 이동 버튼 */}
        <Link
          href="/elder/badge"
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 hover:text-orange-700 transition-colors"
          aria-label="뱃지 및 포인트 보기"
        >
          <Award className="size-4" />
          <span>뱃지</span>
        </Link>
      </div>
    </header>
  );
}
