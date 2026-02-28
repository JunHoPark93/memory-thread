import Link from "next/link";
import { Button } from "@/components/ui/button";

// 홈 페이지 - 어르신/가족 진입 선택
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full flex flex-col items-center gap-8">
        {/* 앱 로고 영역 */}
        <div className="flex flex-col items-center gap-4">
          <span className="text-8xl">🧵</span>
          <h1 className="text-4xl font-bold text-orange-800 tracking-tight">
            기억의 실
          </h1>
          <p className="text-xl text-orange-600 text-center leading-relaxed">
            소중한 기억을 대화로 이어가세요
          </p>
        </div>

        {/* 구분선 */}
        <div className="w-full h-px bg-orange-200" />

        {/* 진입 버튼 영역 */}
        <div className="flex flex-col gap-4 w-full">
          {/* 어르신 로그인 버튼 (크게, orange 배경) */}
          <Button
            asChild
            className="h-16 text-xl font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-2xl shadow-lg"
          >
            <Link href="/elder/login">👴 어르신 로그인</Link>
          </Button>

          {/* 가족 관리 버튼 (outline 스타일) */}
          <Button
            asChild
            variant="outline"
            className="h-14 text-lg font-semibold border-2 border-orange-300 text-orange-700 hover:bg-orange-50 rounded-2xl"
          >
            <Link href="/family/login">👨‍👩‍👧 가족 관리</Link>
          </Button>
        </div>

        {/* 서비스 소개 */}
        <p className="text-sm text-gray-500 text-center leading-relaxed">
          AI와의 자연스러운 대화를 통해
          <br />
          어르신의 소중한 기억을 보존합니다
        </p>
      </div>
    </div>
  );
}
