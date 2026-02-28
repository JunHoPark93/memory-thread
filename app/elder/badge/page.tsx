import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import BadgeGrid from "@/app/_components/BadgeGrid";

// mock 포인트 데이터
const MOCK_POINTS = 150;
const NEXT_BADGE_POINTS = 200;
const POINTS_REMAINING = NEXT_BADGE_POINTS - MOCK_POINTS;
const PROGRESS_PERCENTAGE = (MOCK_POINTS / NEXT_BADGE_POINTS) * 100;

// 어르신 뱃지 & 포인트 페이지
export default function ElderBadgePage() {
  return (
    <div className="pt-6 pb-12 space-y-5">
      {/* 총 포인트 표시 - 그라디언트 카드 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 p-6 text-center shadow-lg glow-amber">
        {/* 배경 장식 원 */}
        <div
          className="absolute top-[-20px] right-[-20px] w-32 h-32 rounded-full bg-white/10"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-[-30px] left-[-10px] w-24 h-24 rounded-full bg-white/10"
          aria-hidden="true"
        />
        <p className="relative text-base text-white/80 font-medium mb-1">나의 총 포인트</p>
        <div className="relative flex items-end justify-center gap-2">
          <p className="text-7xl font-bold text-white tracking-tight">
            {MOCK_POINTS.toLocaleString()}
          </p>
          <p className="text-2xl text-white/80 font-semibold mb-2">pt</p>
        </div>
      </div>

      {/* 다음 뱃지 진행도 */}
      <div className="bg-white rounded-2xl shadow-sm border border-border/60 p-5 space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-base font-semibold text-foreground">
            다음 뱃지까지
          </p>
          <p className="text-sm font-bold text-orange-500">
            {POINTS_REMAINING}pt 남음
          </p>
        </div>
        {/* 세련된 진행 바 - 그라디언트 */}
        <div className="h-3 rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={PROGRESS_PERCENTAGE} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
            style={{ width: `${PROGRESS_PERCENTAGE}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-right">
          {MOCK_POINTS}pt / {NEXT_BADGE_POINTS}pt
        </p>
      </div>

      {/* 뱃지 그리드 */}
      <div className="bg-white rounded-2xl shadow-sm border border-border/60 p-5">
        <BadgeGrid />
      </div>

      {/* 오늘의 대화 계속하기 버튼 */}
      <Button
        asChild
        className="w-full h-16 text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
      >
        <Link href="/elder/chat">💬 오늘의 대화 계속하기</Link>
      </Button>
    </div>
  );
}
