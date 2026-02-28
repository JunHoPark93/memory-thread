import { NextRequest, NextResponse } from "next/server";

// 어르신 컨텍스트 정보 API (고향/가족/직업/취미/추억/건강)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ elderId: string }> }
) {
  // TODO: 어르신의 6카테고리 텍스트 정보 조회
  const { elderId } = await params;
  void elderId;
  return NextResponse.json({ message: "TODO" });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ elderId: string }> }
) {
  // TODO: 어르신의 6카테고리 텍스트 정보 저장/수정
  const { elderId } = await params;
  void elderId;
  void request;
  return NextResponse.json({ message: "TODO" });
}
