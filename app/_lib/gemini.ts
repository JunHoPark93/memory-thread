import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini AI 클라이언트 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const textModel = process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash";

// 텍스트/일반 채팅 모델
export const geminiModel = genAI.getGenerativeModel({
  model: textModel,
});

// 나노바나나2: 멀티턴 대화 기반 이미지 생성 (Gemini 3.1 Flash Image)
export const nanoBanana2Model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-image-preview",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generationConfig: { responseModalities: ["TEXT", "IMAGE"] } as any,
});
