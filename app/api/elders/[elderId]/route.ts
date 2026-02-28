import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/_lib/supabase";

// 특정 어르신 정보 조회 (포인트·뱃지 포함)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ elderId: string }> }
) {
  const { elderId } = await params;

  const { data, error } = await supabase
    .from("elders")
    .select("id, name, total_points, badge_count")
    .eq("id", elderId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "어르신 정보를 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ elderId: string }> }
) {
  const { elderId } = await params;
  const body = await request.json();

  const { error } = await supabase
    .from("elders")
    .update(body)
    .eq("id", elderId);

  if (error) {
    return NextResponse.json({ error: "수정에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ elderId: string }> }
) {
  const { elderId } = await params;

  const { error } = await supabase
    .from("elders")
    .delete()
    .eq("id", elderId);

  if (error) {
    return NextResponse.json({ error: "삭제에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
