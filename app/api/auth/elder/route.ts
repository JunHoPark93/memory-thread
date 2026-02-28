import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/_lib/supabase";

// 어르신 PIN 인증 API
export async function POST(request: NextRequest) {
  const { pin } = await request.json();

  if (!pin || typeof pin !== "string") {
    return NextResponse.json({ error: "PIN이 필요합니다." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("elders")
    .select("id, name, total_points, badge_count")
    .eq("pin_code", pin)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "PIN 번호가 올바르지 않습니다." }, { status: 401 });
  }

  return NextResponse.json({ id: data.id, name: data.name, total_points: data.total_points });
}
