import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Modality } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { supabase as publicSupabase } from "@/app/_lib/supabase";

const liveModel =
  process.env.GEMINI_LIVE_MODEL || "gemini-2.5-flash-native-audio-preview-12-2025";
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

function getSupabaseForServer() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && serviceKey) {
    return createClient(url, serviceKey);
  }
  return publicSupabase;
}

export async function POST(request: NextRequest) {
  if (!geminiApiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY가 필요합니다." }, { status: 500 });
  }

  const { elderId, elderName } = (await request.json()) as {
    elderId?: string;
    elderName?: string;
  };

  if (!elderId) {
    return NextResponse.json({ error: "elderId가 필요합니다." }, { status: 400 });
  }

  const supabase = getSupabaseForServer();
  const { data, error } = await supabase
    .from("context_texts")
    .select("category, content")
    .eq("elder_id", elderId)
    .order("category", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "컨텍스트 조회 실패" }, { status: 500 });
  }

  const contextText = (data ?? [])
    .filter((row) => row.content && String(row.content).trim())
    .map((row) => `- ${row.category}: ${String(row.content).trim()}`)
    .join("\n");

  const safeName = elderName?.trim() || "어르신";
  const systemInstruction = [
    "유저는 한국어로만 말합니다. 모든 응답을 한국어로 해주세요.",
    "친절하고 짧은 문장으로, 공감하며 대답하세요.",
    contextText
      ? `다음은 ${safeName}님의 개인 컨텍스트입니다.\n${contextText}`
      : `${safeName}님의 개인 컨텍스트가 아직 등록되지 않았습니다.`,
    "컨텍스트를 참고해 어르신의 기억을 자연스럽게 이끌어 주세요."
  ].join("\n\n");

  const ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: { apiVersion: "v1alpha" }
  });

  try {
    const token = await ai.authTokens.create({
      config: {
        uses: 3,
        newSessionExpireTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        expireTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        liveConnectConstraints: {
          model: liveModel,
          config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } }
            },
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            }
          }
        }
      }
    });

    if (!token.name) {
      return NextResponse.json({ error: "토큰 발급 실패" }, { status: 500 });
    }

    return NextResponse.json({
      token: token.name,
      model: liveModel
    });
  } catch {
    return NextResponse.json({ error: "토큰 발급 실패" }, { status: 500 });
  }
}
