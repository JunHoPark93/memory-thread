"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Trash2, X } from "lucide-react";
import { toast } from "sonner";

// 이미지 항목 타입
interface ImageItem {
  id: string;
  image_url: string;
  title: string;
  caption: string;
}

// 선택된 파일 미리보기 상태
interface PendingImage {
  file: File;
  preview: string;
  title: string;
  caption: string;
}

interface ImageUploaderProps {
  elderId: string;
}

// 이미지 업로드 컴포넌트 (실제 API 연동)
export default function ImageUploader({ elderId }: ImageUploaderProps) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pending, setPending] = useState<PendingImage | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingImages, setLoadingImages] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 기존 이미지 목록 로드
  useEffect(() => {
    const loadImages = async () => {
      setLoadingImages(true);
      try {
        const res = await fetch(`/api/elders/${elderId}/images`);
        if (!res.ok) throw new Error("이미지 로드 실패");
        const data = await res.json();
        setImages(data.images ?? []);
      } catch {
        toast.error("이미지 목록을 불러오지 못했습니다.");
      } finally {
        setLoadingImages(false);
      }
    };
    loadImages();
  }, [elderId]);

  // 파일 선택 처리 (미리보기 + 메타데이터 입력 단계로)
  const handleFileChosen = (file: File) => {
    const preview = URL.createObjectURL(file);
    setPending({ file, preview, title: "", caption: "" });
  };

  // 드래그 이벤트 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFileChosen(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileChosen(file);
    // input 초기화 (같은 파일 재선택 가능)
    e.target.value = "";
  };

  // 대기 중인 이미지 업로드 취소
  const handleCancelPending = () => {
    if (pending) URL.revokeObjectURL(pending.preview);
    setPending(null);
  };

  // 실제 업로드 실행
  const handleUpload = async () => {
    if (!pending) return;
    if (!pending.title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", pending.file);
      formData.append("title", pending.title);
      formData.append("caption", pending.caption);

      const res = await fetch(`/api/elders/${elderId}/images`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "업로드에 실패했습니다.");
        return;
      }

      const newImage = await res.json();
      setImages((prev) => [newImage, ...prev]);
      URL.revokeObjectURL(pending.preview);
      setPending(null);
      toast.success("사진이 등록되었습니다.");
    } catch {
      toast.error("서버 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  // 이미지 삭제
  const handleDelete = async (imageId: string) => {
    try {
      const res = await fetch(`/api/elders/${elderId}/images/${imageId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("삭제에 실패했습니다.");
        return;
      }
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success("사진이 삭제되었습니다.");
    } catch {
      toast.error("서버 오류가 발생했습니다.");
    }
  };

  return (
    <div className="space-y-4">
      {/* 파일 선택 대기 중 UI */}
      {pending ? (
        <div className="border rounded-xl p-4 space-y-3 bg-white shadow-sm">
          <div className="flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pending.preview}
              alt="미리보기"
              className="w-24 h-24 object-cover rounded-lg shrink-0"
            />
            <div className="flex-1 space-y-2">
              <Input
                value={pending.title}
                onChange={(e) =>
                  setPending((p) => p && { ...p, title: e.target.value })
                }
                placeholder="제목 (필수)"
                className="text-sm"
              />
              <Textarea
                value={pending.caption}
                onChange={(e) =>
                  setPending((p) => p && { ...p, caption: e.target.value })
                }
                placeholder="설명 (선택)"
                className="text-sm resize-none"
                rows={2}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
            >
              {uploading ? "업로드 중..." : "업로드"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancelPending}
              disabled={uploading}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        /* 드래그앤드롭 업로드 영역 */
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-orange-400 bg-orange-50"
              : "border-gray-300 hover:border-orange-300 hover:bg-orange-50/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="size-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">
            사진을 드래그하거나 클릭하여 업로드
          </p>
          <p className="text-sm text-gray-400 mt-1">
            JPG, PNG, HEIC 파일 지원
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInputChange}
          />
        </div>
      )}

      {/* 등록된 이미지 목록 */}
      {loadingImages ? (
        <p className="text-sm text-gray-400 text-center py-4">불러오는 중...</p>
      ) : images.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">
            등록된 사진 ({images.length}장)
          </p>
          {images.map((image) => (
            <div
              key={image.id}
              className="flex items-start gap-3 p-3 bg-white border rounded-lg shadow-sm"
            >
              {/* 썸네일 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.image_url}
                alt={image.title}
                className="w-20 h-20 object-cover rounded-lg shrink-0"
              />

              {/* 제목 + 설명 + 삭제 */}
              <div className="flex-1 space-y-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {image.title}
                </p>
                {image.caption && (
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {image.caption}
                  </p>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(image.id)}
                  className="w-full mt-1"
                >
                  <Trash2 className="size-3" />
                  삭제
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !pending && (
          <p className="text-sm text-gray-400 text-center py-2">
            등록된 사진이 없습니다.
          </p>
        )
      )}
    </div>
  );
}
