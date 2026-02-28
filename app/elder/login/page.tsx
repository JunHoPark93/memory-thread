"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import PinKeypad from "@/app/_components/PinKeypad";

// PIN 최대 자리수
const PIN_MAX_LENGTH = 4;

// 어르신 PIN 로그인 페이지 (큰 글씨, warm 톤)
export default function ElderLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  // 숫자 입력 핸들러
  const handleDigit = (digit: string) => {
    setError("");
    if (pin.length < PIN_MAX_LENGTH) {
      const newPin = pin + digit;
      setPin(newPin);
      // 4자리 자동 완성 시 처리
      if (newPin.length === PIN_MAX_LENGTH) {
        handleComplete(newPin);
      }
    }
  };

  // 지우기 핸들러
  const handleDelete = () => {
    setError("");
    setPin((prev) => prev.slice(0, -1));
  };

  // PIN 완성 핸들러 (4자리 입력 완료)
  const handleComplete = (completedPin: string) => {
    if (completedPin.length < PIN_MAX_LENGTH) {
      setError("PIN 번호 4자리를 모두 입력해주세요.");
      return;
    }
    // mock: 어떤 PIN이든 로그인 성공으로 처리
    router.push("/elder/chat");
  };

  return (
    <div className="pt-8 pb-12">
      {/* 뒤로가기 링크 */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-base font-medium mb-8 transition-colors"
      >
        <ChevronLeft className="size-5" />
        뒤로가기
      </Link>

      {/* 글래스모피즘 카드 */}
      <div className="glass rounded-3xl p-8 shadow-xl border border-white/40 space-y-8">
        {/* 안내 텍스트 */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-foreground">
            PIN 번호 입력
          </h1>
          <p className="text-base text-muted-foreground">4자리 숫자를 눌러주세요</p>
        </div>

        {/* PIN 표시 영역 - 세련된 원형 인디케이터 */}
        <div className="flex justify-center gap-5" role="status" aria-label={`PIN ${pin.length}자리 입력됨`}>
          {Array.from({ length: PIN_MAX_LENGTH }).map((_, index) => (
            <div
              key={index}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ${
                index < pin.length
                  ? "bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg glow-amber scale-110"
                  : "bg-white border-2 border-border"
              }`}
              aria-hidden="true"
            >
              {index < pin.length && (
                <div className="w-3.5 h-3.5 rounded-full bg-white" />
              )}
            </div>
          ))}
        </div>

        {/* 에러 메시지 영역 */}
        {error && (
          <p className="text-destructive text-center text-base font-medium" role="alert">
            {error}
          </p>
        )}

        {/* PIN 키패드 */}
        <div className="flex justify-center">
          <PinKeypad
            onDigit={handleDigit}
            onDelete={handleDelete}
            onComplete={handleComplete}
            currentPin={pin}
          />
        </div>
      </div>
    </div>
  );
}
