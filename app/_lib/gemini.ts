import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini AI 클라이언트 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// gemini-2.0-flash 모델 사용
export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

// 나노바나나2: 멀티턴 대화 기반 이미지 생성 (Gemini 3.1 Flash Image)
export const nanoBanana2Model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-image-preview",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generationConfig: { responseModalities: ["TEXT", "IMAGE"] } as any,
});
