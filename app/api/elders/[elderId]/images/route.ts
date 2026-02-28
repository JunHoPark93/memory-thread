import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/_lib/supabase";

// 어르신 등록 사진 목록 조회
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ elderId: string }> }
) {
  const { elderId } = await params;

  const { data, error } = await supabase
    .from("context_images")
    .select("id, image_url, title, caption, created_at")
    .eq("elder_id", elderId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ images: data });
}

// 어르신 사진 업로드 (Supabase Storage 연동)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ elderId: string }> }
) {
  const { elderId } = await params;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const title = (formData.get("title") as string) ?? "";
  const caption = (formData.get("caption") as string) ?? "";

  if (!file) {
    return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  }
  if (!title.trim()) {
    return NextResponse.json({ error: "제목을 입력해주세요." }, { status: 400 });
  }

  // 파일명 중복 방지: {elderId}/{timestamp}-{originalName}
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${elderId}/${timestamp}-${safeName}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from("elder-images")
    .upload(storagePath, arrayBuffer, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // public URL 획득
  const { data: urlData } = supabase.storage
    .from("elder-images")
    .getPublicUrl(storagePath);
  const imageUrl = urlData.publicUrl;

  // DB에 저장
  const { data, error: dbError } = await supabase
    .from("context_images")
    .insert({ elder_id: elderId, image_url: imageUrl, title, caption })
    .select("id, image_url, title, caption")
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
