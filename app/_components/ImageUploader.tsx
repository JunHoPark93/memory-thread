"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";

// 이미지 항목 타입
interface ImageItem {
  id: string;
  src: string;
  caption: string;
}

// mock 이미지 데이터 (초기값)
const MOCK_IMAGES: ImageItem[] = [
  {
    id: "1",
    src: "https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=200&h=200&fit=crop",
    caption: "가족 여행 사진",
  },
  {
    id: "2",
    src: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=200&h=200&fit=crop",
    caption: "젊을 때 사진",
  },
];

// 이미지 업로드 컴포넌트 (드래그앤드롭 + 미리보기)
export default function ImageUploader() {
  const [images, setImages] = useState<ImageItem[]>(MOCK_IMAGES);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 드래그 이벤트 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // 파일 드롭 핸들러 (mock)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    toast.info("이미지 업로드 기능은 준비 중입니다.");
  };

  // 파일 선택 핸들러 (mock)
  const handleFileSelect = () => {
    toast.info("이미지 업로드 기능은 준비 중입니다.");
  };

  // 이미지 삭제 핸들러
  const handleDelete = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    toast.success("이미지가 삭제되었습니다.");
  };

  // 캡션 변경 핸들러
  const handleCaptionChange = (id: string, caption: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, caption } : img))
    );
  };

  return (
    <div className="space-y-4">
      {/* 드래그앤드롭 업로드 영역 */}
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
          onChange={handleFileSelect}
          multiple
        />
      </div>

      {/* 업로드된 이미지 목록 */}
      {images.length > 0 && (
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
                src={image.src}
                alt={image.caption}
                className="w-20 h-20 object-cover rounded-lg shrink-0"
              />

              {/* 캡션 입력 + 삭제 버튼 */}
              <div className="flex-1 space-y-2">
                <Input
                  value={image.caption}
                  onChange={(e) =>
                    handleCaptionChange(image.id, e.target.value)
                  }
                  placeholder="사진 설명을 입력하세요"
                  className="text-sm"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(image.id)}
                  className="w-full"
                >
                  <Trash2 className="size-3" />
                  삭제
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
