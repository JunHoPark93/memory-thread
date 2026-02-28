import { NextRequest, NextResponse } from "next/server";

// AI 채팅 API - Gemini 연동 (어르신 대화)
export async function POST(request: NextRequest) {
  // TODO: Gemini AI와 채팅 기능 구현
  // - 어르신 컨텍스트 정보 주입
  // - 대화 히스토리 관리
  // - 포인트 적립 로직
  void request;
  return NextResponse.json({ message: "TODO" });
}

export async function GET() {
  return NextResponse.json({ message: "TODO" });
}
