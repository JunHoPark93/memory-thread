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
    <div className="pt-6 pb-12 space-y-8">
      {/* 총 포인트 표시 */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 text-center">
        <p className="text-lg text-gray-500 mb-2">나의 총 포인트</p>
        <p className="text-6xl font-bold text-orange-500 mb-1">
          {MOCK_POINTS.toLocaleString()}
        </p>
        <p className="text-2xl text-orange-400">pt</p>
      </div>

      {/* 다음 뱃지 진행도 */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold text-gray-700">
            다음 뱃지까지
          </p>
          <p className="text-lg font-bold text-orange-500">
            {POINTS_REMAINING}pt 남았습니다
          </p>
        </div>
        <Progress
          value={PROGRESS_PERCENTAGE}
          className="h-4 rounded-full"
        />
        <p className="text-sm text-gray-400 text-right">
          {MOCK_POINTS}pt / {NEXT_BADGE_POINTS}pt
        </p>
      </div>

      {/* 뱃지 그리드 */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
        <BadgeGrid />
      </div>

      {/* 오늘의 대화 계속하기 버튼 */}
      <Button
        asChild
        className="w-full h-16 text-xl font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-2xl shadow-lg"
      >
        <Link href="/elder/chat">💬 오늘의 대화 계속하기</Link>
      </Button>
    </div>
  );
}
