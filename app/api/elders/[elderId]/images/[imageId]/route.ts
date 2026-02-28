import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/_lib/supabase";

// 어르신 사진 개별 삭제
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ elderId: string; imageId: string }> }
) {
  const { elderId, imageId } = await params;

  // DB에서 image_url 조회
  const { data: image, error: fetchError } = await supabase
    .from("context_images")
    .select("image_url")
    .eq("id", imageId)
    .eq("elder_id", elderId)
    .single();

  if (fetchError || !image) {
    return NextResponse.json({ error: "이미지를 찾을 수 없습니다." }, { status: 404 });
  }

  // Supabase Storage 경로 추출 (public URL → storage path)
  // URL 형태: https://.../storage/v1/object/public/elder-images/{elderId}/{filename}
  const url = new URL(image.image_url);
  const pathParts = url.pathname.split("/object/public/elder-images/");
  const storagePath = pathParts[1];

  if (storagePath) {
    const { error: storageError } = await supabase.storage
      .from("elder-images")
      .remove([storagePath]);

    if (storageError) {
      console.error("Storage 삭제 오류:", storageError.message);
      // Storage 삭제 실패해도 DB는 삭제 진행
    }
  }

  // DB에서 삭제
  const { error: dbError } = await supabase
    .from("context_images")
    .delete()
    .eq("id", imageId)
    .eq("elder_id", elderId);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
