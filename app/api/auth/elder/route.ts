import { NextRequest, NextResponse } from "next/server";

// 어르신 인증 API - PIN 로그인
export async function POST(request: NextRequest) {
  // TODO: PIN 번호로 어르신 인증 구현
  void request;
  return NextResponse.json({ message: "TODO" });
}

export async function GET() {
  return NextResponse.json({ message: "TODO" });
}
