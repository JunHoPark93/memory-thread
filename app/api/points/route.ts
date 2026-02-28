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
    .select("total_points, badge_count")
    .eq("id", elderId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "포인트 조회에 실패했습니다." }, { status: 404 });
  }

  return NextResponse.json({ total_points: data.total_points, badge_count: data.badge_count });
}
