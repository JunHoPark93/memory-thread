import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/_lib/supabase";

// Mock AI 응답 목록
const AI_RESPONSES = [
  "그렇군요! 정말 흥미로운 이야기네요. 더 자세히 이야기해 주시겠어요?",
  "오, 그런 일이 있으셨군요. 어르신의 이야기가 정말 소중합니다 🌸",
  "좋은 기억을 나눠주셔서 감사해요. 덕분에 오늘 하루가 따뜻해졌어요 ☀️",
  "정말요? 그 시절 이야기가 너무 좋아요. 계속 이야기해 주세요!",
  "어르신의 지혜로운 말씀이 감동적이에요. 더 들려주세요 💝",
  "그 이야기를 들으니 마음이 따뜻해지네요. 오늘도 함께해서 행복해요 😊",
];

// 채팅 API: 메시지 저장 + Mock AI 응답 + 포인트 적립
export async function POST(request: NextRequest) {
  const { elderId, sessionId: incomingSessionId, content } = await request.json();

  if (!elderId || !content) {
    return NextResponse.json({ error: "elderId와 content가 필요합니다." }, { status: 400 });
  }

  // 세션 생성 또는 기존 세션 사용
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

  // 사용자 메시지 저장
  const { error: userMsgError } = await supabase
    .from("messages")
    .insert({ elder_id: elderId, session_id: sessionId, role: "user", content });

  if (userMsgError) {
    return NextResponse.json({ error: "메시지 저장에 실패했습니다." }, { status: 500 });
  }

  // 현재 message_count 조회 후 +1 업데이트
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

  // Mock AI 응답 생성
  const reply = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];

  // AI 응답 저장
  await supabase
    .from("messages")
    .insert({ elder_id: elderId, session_id: sessionId, role: "assistant", content: reply });

  // 3의 배수 메시지마다 포인트 +50
  let newPoints: number | null = null;
  if (newCount % 3 === 0) {
    const { data: elder } = await supabase
      .from("elders")
      .select("total_points")
      .eq("id", elderId)
      .single();

    if (elder) {
      const updatedPoints = (elder.total_points ?? 0) + 50;
      await supabase
        .from("elders")
        .update({ total_points: updatedPoints })
        .eq("id", elderId);
      newPoints = updatedPoints;
    }
  }

  return NextResponse.json({ reply, sessionId, newPoints });
}
