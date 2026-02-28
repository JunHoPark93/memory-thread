import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/_lib/supabase";

export async function POST(request: NextRequest) {
  const { elderId, sessionId: incomingSessionId, role, content } = await request.json();

  if (!elderId || !role || !content) {
    return NextResponse.json(
      { error: "elderId, role, content가 필요합니다." },
      { status: 400 }
    );
  }

  if (role !== "user" && role !== "assistant") {
    return NextResponse.json({ error: "role은 user 또는 assistant여야 합니다." }, { status: 400 });
  }

  let sessionId = incomingSessionId;
  if (!sessionId) {
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .insert({ elder_id: elderId, message_count: 0 })
      .select("id")
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: "세션 생성에 실패했습니다." }, { status: 500 });
    }
    sessionId = session.id;
  }

  const { error: insertError } = await supabase
    .from("messages")
    .insert({ elder_id: elderId, session_id: sessionId, role, content });

  if (insertError) {
    return NextResponse.json({ error: "메시지 저장에 실패했습니다." }, { status: 500 });
  }

  const { data: sessionData } = await supabase
    .from("sessions")
    .select("message_count")
    .eq("id", sessionId)
    .single();

  const newCount = (sessionData?.message_count ?? 0) + 1;

  await supabase
    .from("sessions")
    .update({ message_count: newCount })
    .eq("id", sessionId);

  return NextResponse.json({ success: true, sessionId });
}
