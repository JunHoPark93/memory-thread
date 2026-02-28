import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/_lib/supabase";

// 가족 ID/PW 인증 API
export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: "아이디와 비밀번호를 입력해주세요." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("family_users")
    .select("id, name")
    .eq("username", username)
    .eq("password", password)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  return NextResponse.json({ id: data.id, name: data.name });
}
