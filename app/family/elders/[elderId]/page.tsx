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
    <div className="pt-6 pb-12 space-y-5">
      {/* 상단 헤더 - 어르신 이름 + 뒤로가기 */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted px-2"
          aria-label="뒤로가기"
        >
          <ChevronLeft className="size-5" />
        </Button>
        <div className="flex items-center gap-2.5">
          {/* 어르신 아바타 */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 border border-orange-200/60 flex items-center justify-center text-lg shadow-sm">
            👴
          </div>
          <h1 className="text-xl font-bold text-foreground">{elderName}</h1>
        </div>
      </div>

      {/* 3탭 구성 - 세련된 탭 UI */}
      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid grid-cols-3 w-full rounded-2xl bg-muted/60 p-1 h-auto">
          <TabsTrigger
            value="text"
            className="text-xs sm:text-sm rounded-xl py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-orange-600 data-[state=active]:font-semibold transition-all"
          >
            텍스트 정보
          </TabsTrigger>
          <TabsTrigger
            value="photo"
            className="text-xs sm:text-sm rounded-xl py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-orange-600 data-[state=active]:font-semibold transition-all"
          >
            사진 관리
          </TabsTrigger>
          <TabsTrigger
            value="pin"
            className="text-xs sm:text-sm rounded-xl py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-orange-600 data-[state=active]:font-semibold transition-all"
          >
            PIN 설정
          </TabsTrigger>
        </TabsList>

        {/* 탭1: 텍스트 정보 (ContextTextForm) */}
        <TabsContent value="text" className="mt-5">
          <ContextTextForm />
        </TabsContent>

        {/* 탭2: 사진 관리 (ImageUploader) */}
        <TabsContent value="photo" className="mt-5">
          <ImageUploader />
        </TabsContent>

        {/* 탭3: PIN 설정 */}
        <TabsContent value="pin" className="mt-5">
          <div className="glass rounded-3xl p-7 shadow-lg border border-white/40">
            <div className="flex flex-col items-center gap-6">
              <div className="text-center space-y-1">
                <h2 className="text-lg font-semibold text-foreground">
                  새 PIN 번호 설정
                </h2>
                <p className="text-sm text-muted-foreground">4자리 숫자를 입력하세요</p>
              </div>

              {/* 새 PIN 표시 - 세련된 원형 인디케이터 */}
              <div className="flex gap-4" role="status" aria-label={`PIN ${newPin.length}자리 입력됨`}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                      i < newPin.length
                        ? "bg-gradient-to-br from-orange-500 to-amber-500 shadow-md glow-amber scale-110"
                        : "bg-white border-2 border-border"
                    }`}
                    aria-hidden="true"
                  >
                    {i < newPin.length && (
                      <div className="w-3 h-3 rounded-full bg-white" />
                    )}
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
