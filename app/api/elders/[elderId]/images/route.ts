import { NextRequest, NextResponse } from "next/server";

// 어르신 사진 API
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ elderId: string }> }
) {
  // TODO: 어르신 등록 사진 목록 조회
  const { elderId } = await params;
  void elderId;
  return NextResponse.json({ message: "TODO" });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ elderId: string }> }
) {
  // TODO: 어르신 사진 업로드 (Supabase Storage 연동)
  const { elderId } = await params;
  void elderId;
  void request;
  return NextResponse.json({ message: "TODO" });
}
