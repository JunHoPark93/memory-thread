"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import BadgeGrid from "@/app/_components/BadgeGrid";
import { getElderSession } from "@/app/_lib/session";

// 뱃지 일일 대화 횟수 임계값 (BadgeGrid와 동일한 기준)
const DAILY_THRESHOLDS = [3, 5, 10, 20, 30, 50];

// 어르신 뱃지 & 포인트 페이지
export default function ElderBadgePage() {
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [dailyChatCount, setDailyChatCount] = useState<number>(0);
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
        if (data.total_points !== undefined) setTotalPoints(data.total_points);
        if (data.daily_chat_count !== undefined) setDailyChatCount(data.daily_chat_count);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // 다음 미획득 뱃지 임계값 계산 (일일 대화 횟수 기준)
  const nextThreshold = DAILY_THRESHOLDS.find((t) => t > dailyChatCount) ?? 50;
  const prevThreshold = DAILY_THRESHOLDS.filter((t) => t <= dailyChatCount).pop() ?? 0;
  const allEarned = dailyChatCount >= 50;
  const countRemaining = allEarned ? 0 : Math.max(nextThreshold - dailyChatCount, 0);
  const progressPercentage = allEarned
    ? 100
    : ((dailyChatCount - prevThreshold) / (nextThreshold - prevThreshold)) * 100;

  return (
    <div className="pt-6 pb-12 space-y-5">
      {/* 총 포인트 + 오늘 대화 횟수 표시 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 p-6 shadow-lg glow-amber">
        <div className="absolute top-[-20px] right-[-20px] w-32 h-32 rounded-full bg-white/10" aria-hidden="true" />
        <div className="absolute bottom-[-30px] left-[-10px] w-24 h-24 rounded-full bg-white/10" aria-hidden="true" />
        <div className="relative flex justify-around text-center">
          <div>
            <p className="text-sm text-white/80 font-medium mb-1">나의 총 포인트</p>
            <div className="flex items-end justify-center gap-1">
              <p className="text-4xl font-bold text-white tracking-tight">
                {loading ? "..." : totalPoints.toLocaleString()}
              </p>
              <p className="text-lg text-white/80 font-semibold mb-0.5">pt</p>
            </div>
          </div>
          <div className="w-px bg-white/20" />
          <div>
            <p className="text-sm text-white/80 font-medium mb-1">오늘 대화</p>
            <div className="flex items-end justify-center gap-1">
              <p className="text-4xl font-bold text-white tracking-tight">
                {loading ? "..." : dailyChatCount}
              </p>
              <p className="text-lg text-white/80 font-semibold mb-0.5">회</p>
            </div>
          </div>
        </div>
      </div>

      {/* 다음 뱃지 진행도 (일일 대화 횟수 기준) */}
      <div className="bg-white rounded-2xl shadow-sm border border-border/60 p-5 space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-base font-semibold text-foreground">다음 뱃지까지</p>
          <p className="text-sm font-bold text-orange-500">
            {loading ? "..." : allEarned ? "모두 획득!" : `${countRemaining}회 남음`}
          </p>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={progressPercentage} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-right">
          {dailyChatCount}회 / {allEarned ? 50 : nextThreshold}회
        </p>
      </div>

      {/* 뱃지 그리드 */}
      <div className="bg-white rounded-2xl shadow-sm border border-border/60 p-5">
        <BadgeGrid dailyChatCount={dailyChatCount} />
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
