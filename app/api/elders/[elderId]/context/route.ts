import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/_lib/supabase";

// 어르신 컨텍스트 6카테고리 조회
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ elderId: string }> }
) {
  const { elderId } = await params;

  const { data, error } = await supabase
    .from("context_texts")
    .select("category, content")
    .eq("elder_id", elderId)
    .order("category");

  if (error) {
    return NextResponse.json({ error: "컨텍스트 조회에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ texts: data ?? [] });
}

// 어르신 컨텍스트 저장 (upsert)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ elderId: string }> }
) {
  const { elderId } = await params;
  const { texts } = await request.json() as {
    texts: { category: string; content: string }[];
  };

  if (!Array.isArray(texts) || texts.length === 0) {
    return NextResponse.json({ error: "texts 배열이 필요합니다." }, { status: 400 });
  }

  // 각 카테고리를 upsert: 기존 레코드 확인 후 update 또는 insert
  for (const { category, content } of texts) {
    const { data: existing } = await supabase
      .from("context_texts")
      .select("id")
      .eq("elder_id", elderId)
      .eq("category", category)
      .single();

    if (existing) {
      await supabase
        .from("context_texts")
        .update({ content })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("context_texts")
        .insert({ elder_id: elderId, category, content });
    }
  }

  return NextResponse.json({ success: true });
}
