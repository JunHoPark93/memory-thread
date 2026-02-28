import { NextRequest, NextResponse } from "next/server";
import { geminiModel } from "@/app/_lib/gemini";
import { supabase } from "@/app/_lib/supabase";

interface ChatTurn {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

interface GeminiApiError {
  name?: string;
  message?: string;
  status?: number;
  errorDetails?: Array<{
    "@type"?: string;
    retryDelay?: string;
  }>;
}

function parseRetrySeconds(err: GeminiApiError): number | null {
  const details = err.errorDetails;
  if (!Array.isArray(details)) return null;

  const retryInfo = details.find((d) => d?.["@type"]?.includes("RetryInfo"));
  const delay = retryInfo?.retryDelay;
  if (!delay) return null;

  const matched = /^(\d+)(?:\.\d+)?s$/.exec(delay);
  if (!matched) return null;
  return Number(matched[1]);
}

// 채팅 API: 메시지 저장 + Gemini 응답 + 포인트 적립
export async function POST(request: NextRequest) {
  const { elderId, sessionId: incomingSessionId, content, history = [] } = await request.json() as {
    elderId: string;
    sessionId?: string;
    content: string;
    history?: ChatTurn[];
  };

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

  // 어르신 context_texts (고향/가족/직업 등) 조회 → 초기 프롬프트 개인화
  const { data: contextTexts } = await supabase
    .from("context_texts")
    .select("category, content")
    .eq("elder_id", elderId);

  const contextSummary = contextTexts?.length
    ? contextTexts
        .map((c: { category: string; content: string }) => `[${c.category}] ${c.content}`)
        .join("\n")
    : "";

  const validatedHistory = history.length > 0 && history[0].role !== "user"
    ? history.slice(1)
    : history;

  const chat = geminiModel.startChat({ history: validatedHistory });

  const firstTurnInstruction = `당신은 따뜻하고 친절한 AI 친구입니다. 어르신과 한국어로 대화하며 기억과 감정을 공감해 주세요.${
    contextSummary ? `\n\n어르신에 대한 배경 정보:\n${contextSummary}` : ""
  }\n\n아래 어르신 메시지에 공감 어린 짧은 답변과, 이어갈 수 있는 질문 1개를 함께 해주세요.\n\n어르신 메시지: ${content}`;

  const userParts: Array<{ text: string }> = [
    { text: validatedHistory.length === 0 ? firstTurnInstruction : content },
  ];

  let reply = "";
  try {
    const result = await chat.sendMessage(userParts as Parameters<typeof chat.sendMessage>[0]);
    reply = result.response.text();
  } catch (err) {
    const apiErr = err as GeminiApiError;
    if (apiErr?.status === 429) {
      const retrySeconds = parseRetrySeconds(apiErr);
      const retryHint = retrySeconds
        ? `약 ${retrySeconds}초 뒤 다시 시도해주세요.`
        : "잠시 후 다시 시도해주세요.";
      return NextResponse.json(
        { error: `현재 Gemini 사용량 한도에 도달했습니다. ${retryHint}` },
        { status: 429 }
      );
    }
    console.error("[chat]", err);
    return NextResponse.json({ error: "AI 처리 중 오류가 발생했습니다." }, { status: 500 });
  }

  // AI 응답 저장
  await supabase
    .from("messages")
    .insert({ elder_id: elderId, session_id: sessionId, role: "assistant", content: reply });

    // 어르신 일일 대화 횟수 + 포인트 업데이트
  const DAILY_THRESHOLDS = [3, 5, 10, 20, 30, 50];
  let newPoints: number | null = null;

  const { data: elder } = await supabase
    .from("elders")
    .select("total_points, daily_chat_count, last_chat_date")
    .eq("id", elderId)
    .single();

  if (elder) {
    // KST 기준 오늘 날짜 (UTC+9)
    const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split("T")[0];
    const isNewDay = elder.last_chat_date !== today;
    const currentDaily = isNewDay ? 0 : (elder.daily_chat_count ?? 0);
    const newDailyCount = currentDaily + 1;

    // 일일 대화 횟수 기준 뱃지 계산
    const newBadgeCount = DAILY_THRESHOLDS.filter((t) => t <= newDailyCount).length;

    // 세션 메시지 3의 배수마다 포인트 +50 (기존 유지)
    const updatedPoints =
      newCount % 3 === 0 ? (elder.total_points ?? 0) + 50 : (elder.total_points ?? 0);
    if (newCount % 3 === 0) newPoints = updatedPoints;

    await supabase
      .from("elders")
      .update({
        total_points: updatedPoints,
        daily_chat_count: newDailyCount,
        last_chat_date: today,
        badge_count: newBadgeCount,
      })
      .eq("id", elderId);
  }

  return NextResponse.json({ reply, sessionId, newPoints });
}
