"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// 6개 카테고리 정의
const CATEGORIES = [
  { key: "hometown", label: "고향", placeholder: "고향에 대해 이야기해 주세요..." },
  { key: "family", label: "가족", placeholder: "가족에 대해 이야기해 주세요..." },
  { key: "job", label: "직업", placeholder: "어떤 일을 하셨나요?" },
  { key: "hobby", label: "취미", placeholder: "좋아하시는 것들을 알려주세요..." },
  { key: "memory", label: "추억", placeholder: "소중한 추억들을 남겨주세요..." },
  { key: "health", label: "건강", placeholder: "건강 상태나 주의사항을 입력하세요..." },
] as const;

// 카테고리 키 타입
type CategoryKey = (typeof CATEGORIES)[number]["key"];

// 폼 데이터 타입
type FormData = Record<CategoryKey, string>;

// 어르신 개인 정보 6카테고리 텍스트 폼
export default function ContextTextForm() {
  const [formData, setFormData] = useState<FormData>({
    hometown: "",
    family: "",
    job: "",
    hobby: "",
    memory: "",
    health: "",
  });

  // 각 텍스트영역 변경 핸들러
  const handleChange = (key: CategoryKey, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // mock 저장 핸들러
  const handleSave = () => {
    toast.success("정보가 저장되었습니다.", {
      description: "어르신의 소중한 정보가 안전하게 저장되었습니다.",
    });
  };

  return (
    <div className="space-y-5">
      {CATEGORIES.map(({ key, label, placeholder }) => (
        <div key={key} className="space-y-2">
          {/* 카테고리 레이블 */}
          <label
            htmlFor={`context-${key}`}
            className="block text-sm font-semibold text-gray-700"
          >
            {label}
          </label>
          {/* 텍스트 입력 영역 */}
          <Textarea
            id={`context-${key}`}
            value={formData[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={placeholder}
            className="resize-none min-h-[80px]"
            rows={3}
          />
        </div>
      ))}

      {/* 저장 버튼 */}
      <Button
        onClick={handleSave}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        size="lg"
      >
        저장하기
      </Button>
    </div>
  );
}
