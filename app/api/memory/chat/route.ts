import { NextRequest, NextResponse } from "next/server";
import { geminiModel, nanoBanana2Model } from "@/app/_lib/gemini";
import { supabase } from "@/app/_lib/supabase";

// 대화 턴 타입
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

// 이미지 URL을 base64 인라인 데이터로 변환
async function fetchImageAsBase64(
  url: string,
  signal: AbortSignal
): Promise<{ data: string; mimeType: string }> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("이미지를 불러올 수 없습니다.");
  const buffer = await res.arrayBuffer();
  const mimeType = res.headers.get("content-type") ?? "image/jpeg";
  const data = Buffer.from(buffer).toString("base64");
  return { data, mimeType };
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

// 나노바나나2 멀티턴 채팅 기반 이미지 분석 + 생성 API
export async function POST(request: NextRequest) {
  // 60초 타임아웃
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const body = await request.json();
    const {
      elderId,
      imageUrl,
      history = [],
      message,
      generateImage = false,
      restorationId,
    }: {
      elderId: string;
      imageUrl: string;
      history: ChatTurn[];
      message: string;
      generateImage: boolean;
      restorationId?: string;
    } = body;

    if (!elderId || !imageUrl || !message) {
      return NextResponse.json({ error: "필수 파라미터가 누락되었습니다." }, { status: 400 });
    }

    // 어르신 context_texts (고향/가족/직업 등) 조회 → 프롬프트 개인화
    const { data: contextTexts } = await supabase
      .from("context_texts")
      .select("category, content")
      .eq("elder_id", elderId);

    const contextSummary = contextTexts?.length
      ? contextTexts
          .map((c: { category: string; content: string }) => `[${c.category}] ${c.content}`)
          .join("\n")
      : "";

    // history 검증: 첫 번째 content는 반드시 'user' role이어야 함
    const validatedHistory = history.length > 0 && history[0].role !== "user"
      ? history.slice(1) // model로 시작하면 첫 요소 제거
      : history;

    // 멀티턴 채팅 세션 시작
    const chat = nanoBanana2Model.startChat({ history: validatedHistory });

    let userParts: Array<
      | { text: string }
      | { inlineData: { mimeType: string; data: string } }
    >;

    if (history.length === 0) {
      // 첫 번째 요청: 사진 인라인 데이터 포함
      const { data: imgData, mimeType: imgMime } = await fetchImageAsBase64(
        imageUrl,
        controller.signal
      );

      const systemContext = contextSummary
        ? `\n\n어르신에 대한 배경 정보:\n${contextSummary}`
        : "";

      userParts = [
        { inlineData: { mimeType: imgMime, data: imgData } },
        {
          text: `당신은 따뜻하고 친절한 AI 친구입니다. 어르신과 함께 사진 속 기억을 되살려드립니다.${systemContext}

이 사진을 보고 한국어로 다음을 해주세요:
1. 사진에 대한 따뜻한 설명 (2~3문장)
2. 어르신의 기억을 자연스럽게 이끌어내는 질문 1가지

말투는 친근하고 따뜻하게, 어르신이 편하게 대화할 수 있도록 해주세요.`,
        },
      ];
    } else if (generateImage) {
      // 이미지 생성 요청
      const imageGenerationPrompt = `지금까지 나눈 기억과 이야기들을 모두 담아서, 따뜻하고 아름다운 이미지를 생성해주세요.
원본 사진의 분위기를 살리되, 어르신이 말씀하신 기억들(계절, 날씨, 함께한 사람들 등)이 반영된 새로운 이미지로 만들어주세요.
이미지와 함께 짧은 설명도 한국어로 작성해주세요.`;

      userParts = [
        {
          text: imageGenerationPrompt,
        },
      ];
    } else {
      // 일반 대화: 어르신 기억 추가
      userParts = [{ text: message }];
    }

    let response: Awaited<ReturnType<typeof chat.sendMessage>>["response"];
    try {
      const result = await chat.sendMessage(userParts as Parameters<typeof chat.sendMessage>[0]);
      response = result.response;
    } catch (err) {
      const apiErr = err as GeminiApiError;
      const canFallbackToText = apiErr?.status === 429 && !generateImage;
      if (!canFallbackToText) throw err;

      // 이미지 모델 쿼터 초과 시 텍스트/비전 가능한 기본 모델로 폴백
      const fallbackChat = geminiModel.startChat({ history });
      const fallbackResult = await fallbackChat.sendMessage(
        userParts as Parameters<typeof fallbackChat.sendMessage>[0]
      );
      response = fallbackResult.response;
    }

    // 텍스트 + 이미지 파트 분리
    let textResponse = "";
    let imageBase64: string | undefined;
    let imageMimeType: string | undefined;

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if ("text" in part && part.text) {
        textResponse += part.text;
      } else if ("inlineData" in part && part.inlineData) {
        imageBase64 = part.inlineData.data;
        imageMimeType = part.inlineData.mimeType;
      }
    }

    // 이미지 생성 요청이고 이미지가 반환된 경우 → Storage 저장
    let restoredImageUrl: string | undefined;
    let finalRestorationId = restorationId;

    if (generateImage && imageBase64) {
      const timestamp = Date.now();
      const storagePath = `${elderId}/restored-${timestamp}.png`;
      const imageBuffer = Buffer.from(imageBase64, "base64");

      const { error: uploadError } = await supabase.storage
        .from("elder-images")
        .upload(storagePath, imageBuffer, {
          contentType: imageMimeType ?? "image/png",
        });

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("elder-images")
          .getPublicUrl(storagePath);
        restoredImageUrl = urlData.publicUrl;
      }
    }

    // memory_restorations DB 저장/업데이트
    const updatedHistory: ChatTurn[] = [
      ...history,
      { role: "user", parts: [{ text: message }] },
      { role: "model", parts: [{ text: textResponse }] },
    ];

    if (finalRestorationId) {
      // 기존 레코드 업데이트
      const updateData: Record<string, unknown> = { conversation: updatedHistory };
      if (restoredImageUrl) updateData.restored_image_url = restoredImageUrl;

      await supabase
        .from("memory_restorations")
        .update(updateData)
        .eq("id", finalRestorationId);
    } else {
      // 신규 레코드 생성
      const { data: newRecord } = await supabase
        .from("memory_restorations")
        .insert({
          elder_id: elderId,
          original_image_url: imageUrl,
          conversation: updatedHistory,
          restored_image_url: restoredImageUrl ?? null,
        })
        .select("id")
        .single();

      finalRestorationId = newRecord?.id;
    }

    return NextResponse.json({
      text: textResponse,
      imageBase64: generateImage ? imageBase64 : undefined,
      imageMimeType: generateImage ? imageMimeType : undefined,
      restoredImageUrl,
      restorationId: finalRestorationId,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      return NextResponse.json({ error: "요청 시간이 초과되었습니다. 다시 시도해주세요." }, { status: 408 });
    }

    const apiErr = err as GeminiApiError;
    if (apiErr?.status === 429) {
      const retrySeconds = parseRetrySeconds(apiErr);
      const retryHint = retrySeconds
        ? `약 ${retrySeconds}초 뒤 다시 시도해주세요.`
        : "잠시 후 다시 시도해주세요.";

      const quotaMessage = `현재 Gemini 이미지 모델 사용량 한도에 도달했습니다. ${retryHint} 문제가 계속되면 API 요금제/결제 상태를 확인해주세요.`;
      console.warn("[memory/chat] quota exceeded:", apiErr.message);
      return NextResponse.json({ error: quotaMessage }, { status: 429 });
    }

    console.error("[memory/chat]", err);
    return NextResponse.json({ error: "AI 처리 중 오류가 발생했습니다." }, { status: 500 });
  } finally {
    clearTimeout(timeout);
  }
}
