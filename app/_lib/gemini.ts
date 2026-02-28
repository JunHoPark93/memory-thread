import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini AI 클라이언트 초기화
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

// gemini-2.0-flash 모델 사용
export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});
