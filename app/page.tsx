import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, Users, Sparkles } from "lucide-react";

// 홈 페이지 - 풀스크린 히어로 + 세련된 진입 카드
export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/60 to-white overflow-hidden flex flex-col items-center justify-center px-6">
      {/* 배경 도트 패턴 */}
      <div className="absolute inset-0 bg-dot-pattern opacity-60 pointer-events-none" />

      {/* 배경 그라디언트 블롭 */}
      <div
        className="absolute top-[-10%] right-[-5%] w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #f97316, #f59e0b)" }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-[-10%] left-[-5%] w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #fb923c, #fbbf24)" }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-sm w-full flex flex-col items-center gap-10">
        {/* 앱 로고 영역 */}
        <div className="flex flex-col items-center gap-5">
          {/* 로고 아이콘 - 글래스모피즘 원형 */}
          <div className="w-24 h-24 rounded-3xl glass flex items-center justify-center shadow-xl glow-amber">
            <span className="text-5xl" role="img" aria-label="기억의 실 로고">🧵</span>
          </div>

          {/* 앱 이름 - 그라디언트 텍스트 */}
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-bold tracking-tight text-gradient-amber">
              기억의 실
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              AI와의 대화로 소중한 기억을 이어가세요
            </p>
          </div>
        </div>

        {/* 구분선 */}
        <div className="w-full flex items-center gap-3">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <span className="text-xs text-muted-foreground/60 font-medium uppercase tracking-wider">시작하기</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* 진입 카드 영역 */}
        <div className="flex flex-col gap-3 w-full">
          {/* 대화하기 카드 */}
          <Link
            href="/elder/login?next=chat"
            className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            aria-label="AI 대화하기 페이지로 이동"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <MessageCircle className="size-6 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">대화하기</p>
                  <p className="text-sm text-white/75">AI 친구와 오늘의 이야기</p>
                </div>
              </div>
              <ArrowRight className="size-5 text-white/60 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* 기억복원 카드 */}
          <Link
            href="/elder/login?next=memory"
            className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            aria-label="기억복원 페이지로 이동"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Sparkles className="size-6 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">기억복원</p>
                  <p className="text-sm text-white/75">사진 속 기억을 되살려요</p>
                </div>
              </div>
              <ArrowRight className="size-5 text-white/60 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* 가족 관리 카드 */}
          <Link
            href="/family/login"
            className="group relative overflow-hidden rounded-2xl p-5 bg-white hover:bg-orange-50/50 border border-border hover:border-orange-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            aria-label="가족 관리 페이지로 이동"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* 아이콘 컨테이너 */}
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                  <Users className="size-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">가족 관리</p>
                  <p className="text-sm text-muted-foreground">어르신을 등록하고 관리</p>
                </div>
              </div>
              <ArrowRight className="size-5 text-muted-foreground/40 group-hover:translate-x-0.5 group-hover:text-orange-400 transition-all" />
            </div>
          </Link>
        </div>

        {/* 서비스 소개 */}
        <p className="text-xs text-muted-foreground/60 text-center leading-relaxed">
          소중한 기억을 안전하게 보존합니다
        </p>
      </div>
    </div>
  );
}
