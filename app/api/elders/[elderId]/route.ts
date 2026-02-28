import { NextRequest, NextResponse } from "next/server";

// 특정 어르신 정보 API
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ elderId: string }> }
) {
  // TODO: 특정 어르신 정보 조회
  const { elderId } = await params;
  void elderId;
  return NextResponse.json({ message: "TODO" });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ elderId: string }> }
) {
  // TODO: 어르신 정보 수정 (이름, PIN 등)
  const { elderId } = await params;
  void elderId;
  void request;
  return NextResponse.json({ message: "TODO" });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ elderId: string }> }
) {
  // TODO: 어르신 삭제
  const { elderId } = await params;
  void elderId;
  return NextResponse.json({ message: "TODO" });
}
