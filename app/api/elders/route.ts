import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/_lib/supabase";

// 가족 계정에 연결된 어르신 목록 조회
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const familyUserId = searchParams.get("familyUserId");

  if (!familyUserId) {
    return NextResponse.json({ error: "familyUserId가 필요합니다." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("elders")
    .select("id, name, created_at")
    .eq("family_user_id", familyUserId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "어르신 목록 조회에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ elders: data ?? [] });
}

// 새 어르신 등록
export async function POST(request: NextRequest) {
  const { familyUserId, name, pinCode } = await request.json();

  if (!familyUserId || !name || !pinCode) {
    return NextResponse.json({ error: "필수 정보가 없습니다." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("elders")
    .insert({ family_user_id: familyUserId, name, pin_code: pinCode })
    .select("id, name")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "어르신 등록에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, name: data.name }, { status: 201 });
}
