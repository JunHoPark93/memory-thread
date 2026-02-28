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
        className="inline-flex items-center gap-1 text-orange-600 text-lg mb-8"
      >
        <ChevronLeft className="size-5" />
        뒤로가기
      </Link>

      {/* 안내 텍스트 */}
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-10">
        PIN 번호를 입력하세요
      </h1>

      {/* PIN 표시 영역 (●로 표시) */}
      <div className="flex justify-center gap-4 mb-10">
        {Array.from({ length: PIN_MAX_LENGTH }).map((_, index) => (
          <div
            key={index}
            className={`w-14 h-14 rounded-full border-3 flex items-center justify-center text-3xl transition-all ${
              index < pin.length
                ? "bg-orange-500 border-orange-500 text-white"
                : "bg-white border-orange-300 text-transparent"
            }`}
          >
            {index < pin.length ? "●" : "○"}
          </div>
        ))}
      </div>

      {/* 에러 메시지 영역 */}
      {error && (
        <p className="text-red-500 text-center text-lg mb-6 font-medium">
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
  );
}
