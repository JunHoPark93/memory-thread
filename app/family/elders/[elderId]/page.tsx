"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import ContextTextForm from "@/app/_components/ContextTextForm";
import ImageUploader from "@/app/_components/ImageUploader";
import PinKeypad from "@/app/_components/PinKeypad";

// mock 어르신 이름 데이터
const MOCK_ELDER_NAMES: Record<string, string> = {
  "elder-1": "김할아버지",
  "elder-2": "이할머니",
  "elder-3": "박할아버지",
};

// 어르신 상세 관리 페이지 (텍스트 정보 / 사진 관리 / PIN 설정)
export default function ElderDetailPage({
  params,
}: {
  params: Promise<{ elderId: string }>;
}) {
  const router = useRouter();
  const { elderId } = use(params);
  const elderName = MOCK_ELDER_NAMES[elderId] ?? "어르신";

  // PIN 설정 탭 상태
  const [newPin, setNewPin] = useState("");

  // PIN 숫자 입력
  const handlePinDigit = (digit: string) => {
    if (newPin.length < 4) {
      setNewPin((prev) => prev + digit);
    }
  };

  // PIN 지우기
  const handlePinDelete = () => {
    setNewPin((prev) => prev.slice(0, -1));
  };

  // PIN 저장 핸들러 (mock)
  const handlePinSave = (pin: string) => {
    if (pin.length < 4) {
      toast.error("PIN 4자리를 모두 입력해주세요.");
      return;
    }
    toast.success("PIN이 저장되었습니다.", {
      description: `${elderName}의 PIN이 변경되었습니다.`,
    });
    setNewPin("");
  };

  return (
    <div className="pt-6 pb-12 space-y-6">
      {/* 상단 헤더 - 어르신 이름 + 뒤로가기 */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 px-2"
          aria-label="뒤로가기"
        >
          <ChevronLeft className="size-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">{elderName}</h1>
      </div>

      {/* 3탭 구성 */}
      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="text" className="text-xs sm:text-sm">
            텍스트 정보
          </TabsTrigger>
          <TabsTrigger value="photo" className="text-xs sm:text-sm">
            사진 관리
          </TabsTrigger>
          <TabsTrigger value="pin" className="text-xs sm:text-sm">
            PIN 설정
          </TabsTrigger>
        </TabsList>

        {/* 탭1: 텍스트 정보 (ContextTextForm) */}
        <TabsContent value="text" className="mt-6">
          <ContextTextForm />
        </TabsContent>

        {/* 탭2: 사진 관리 (ImageUploader) */}
        <TabsContent value="photo" className="mt-6">
          <ImageUploader />
        </TabsContent>

        {/* 탭3: PIN 설정 */}
        <TabsContent value="pin" className="mt-6">
          <div className="flex flex-col items-center gap-6">
            <h2 className="text-xl font-semibold text-gray-700">
              새 PIN 번호 설정
            </h2>

            {/* 새 PIN 표시 */}
            <div className="flex gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl transition-all ${
                    i < newPin.length
                      ? "bg-gray-800 border-gray-800 text-white"
                      : "bg-white border-gray-300"
                  }`}
                >
                  {i < newPin.length ? "●" : "○"}
                </div>
              ))}
            </div>

            {/* PIN 키패드 */}
            <PinKeypad
              onDigit={handlePinDigit}
              onDelete={handlePinDelete}
              onComplete={handlePinSave}
              currentPin={newPin}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
