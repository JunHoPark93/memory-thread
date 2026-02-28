"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import BadgeGrid from "@/app/_components/BadgeGrid";
import { getElderSession } from "@/app/_lib/session";

// 다음 뱃지 획득 기준 포인트
const NEXT_BADGE_POINTS = 200;

// 어르신 뱃지 & 포인트 페이지
export default function ElderBadgePage() {
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const elderId = getElderSession();
    if (!elderId) {
      setLoading(false);
      return;
    }

    fetch(`/api/points?elderId=${elderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.total_points !== undefined) {
          setTotalPoints(data.total_points);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pointsRemaining = Math.max(NEXT_BADGE_POINTS - totalPoints, 0);
  const progressPercentage = Math.min((totalPoints / NEXT_BADGE_POINTS) * 100, 100);

  return (
    <div className="pt-6 pb-12 space-y-5">
      {/* 총 포인트 표시 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 p-6 text-center shadow-lg glow-amber">
        <div className="absolute top-[-20px] right-[-20px] w-32 h-32 rounded-full bg-white/10" aria-hidden="true" />
        <div className="absolute bottom-[-30px] left-[-10px] w-24 h-24 rounded-full bg-white/10" aria-hidden="true" />
        <p className="relative text-base text-white/80 font-medium mb-1">나의 총 포인트</p>
        <div className="relative flex items-end justify-center gap-2">
          <p className="text-7xl font-bold text-white tracking-tight">
            {loading ? "..." : totalPoints.toLocaleString()}
          </p>
          <p className="text-2xl text-white/80 font-semibold mb-2">pt</p>
        </div>
      </div>

      {/* 다음 뱃지 진행도 */}
      <div className="bg-white rounded-2xl shadow-sm border border-border/60 p-5 space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-base font-semibold text-foreground">다음 뱃지까지</p>
          <p className="text-sm font-bold text-orange-500">
            {loading ? "..." : `${pointsRemaining}pt 남음`}
          </p>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={progressPercentage} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-right">
          {totalPoints}pt / {NEXT_BADGE_POINTS}pt
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
