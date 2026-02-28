import { NextRequest, NextResponse } from "next/server";

// 가족 인증 API - ID/PW 로그인
export async function POST(request: NextRequest) {
  // TODO: ID/비밀번호로 가족 인증 구현
  void request;
  return NextResponse.json({ message: "TODO" });
}

export async function GET() {
  return NextResponse.json({ message: "TODO" });
}
