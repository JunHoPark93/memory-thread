import { NextRequest, NextResponse } from "next/server";

// 어르신 목록 API
export async function GET() {
  // TODO: 가족 계정에 연결된 어르신 목록 조회
  return NextResponse.json({ message: "TODO" });
}

export async function POST(request: NextRequest) {
  // TODO: 새 어르신 등록 (이름 + PIN)
  void request;
  return NextResponse.json({ message: "TODO" });
}
