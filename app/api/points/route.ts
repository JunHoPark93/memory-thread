import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/_lib/supabase";

// 어르신 포인트 및 뱃지 조회
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const elderId = searchParams.get("elderId");

  if (!elderId) {
    return NextResponse.json({ error: "elderId가 필요합니다." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("elders")
    .select("total_points, badge_count, daily_chat_count, last_chat_date")
    .eq("id", elderId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "포인트 조회에 실패했습니다." }, { status: 404 });
  }

  // 날짜가 바뀌었으면 일일 대화 횟수 0으로 반환 (KST 기준)
  const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split("T")[0];
  const effectiveDailyCount = data.last_chat_date === today ? (data.daily_chat_count ?? 0) : 0;

  return NextResponse.json({
    total_points: data.total_points ?? 0,
    badge_count: data.badge_count ?? 0,
    daily_chat_count: effectiveDailyCount,
  });
}
