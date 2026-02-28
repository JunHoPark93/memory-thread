"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// 6개 카테고리 정의 (DB 카테고리명과 일치)
const CATEGORIES = [
  { key: "고향", label: "고향", placeholder: "고향에 대해 이야기해 주세요..." },
  { key: "가족", label: "가족", placeholder: "가족에 대해 이야기해 주세요..." },
  { key: "직업", label: "직업", placeholder: "어떤 일을 하셨나요?" },
  { key: "취미", label: "취미", placeholder: "좋아하시는 것들을 알려주세요..." },
  { key: "추억", label: "추억", placeholder: "소중한 추억들을 남겨주세요..." },
  { key: "건강", label: "건강", placeholder: "건강 상태나 주의사항을 입력하세요..." },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]["key"];
type FormData = Record<CategoryKey, string>;

const EMPTY_FORM: FormData = {
  고향: "", 가족: "", 직업: "", 취미: "", 추억: "", 건강: "",
};

interface ContextTextFormProps {
  elderId?: string;
}

// 어르신 개인 정보 6카테고리 텍스트 폼
export default function ContextTextForm({ elderId }: ContextTextFormProps) {
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // elderId가 있으면 DB에서 데이터 로드
  useEffect(() => {
    if (!elderId) return;
    setLoading(true);

    fetch(`/api/elders/${elderId}/context`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.texts)) {
          const loaded: FormData = { ...EMPTY_FORM };
          for (const { category, content } of data.texts) {
            if (category in loaded) {
              loaded[category as CategoryKey] = content;
            }
          }
          setFormData(loaded);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [elderId]);

  const handleChange = (key: CategoryKey, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // 저장 핸들러
  const handleSave = async () => {
    if (!elderId) {
      toast.error("어르신 정보가 없습니다.");
      return;
    }

    setSaving(true);
    try {
      const texts = CATEGORIES.map(({ key }) => ({
        category: key,
        content: formData[key],
      }));

      const res = await fetch(`/api/elders/${elderId}/context`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts }),
      });

      if (!res.ok) {
        toast.error("저장에 실패했습니다.");
        return;
      }

      toast.success("정보가 저장되었습니다.", {
        description: "어르신의 소중한 정보가 안전하게 저장되었습니다.",
      });
    } catch {
      toast.error("서버 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-muted-foreground text-sm">
        불러오는 중...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {CATEGORIES.map(({ key, label, placeholder }) => (
        <div key={key} className="space-y-2">
          <label htmlFor={`context-${key}`} className="block text-sm font-semibold text-gray-700">
            {label}
          </label>
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

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-60"
        size="lg"
      >
        {saving ? "저장 중..." : "저장하기"}
      </Button>
    </div>
  );
}
