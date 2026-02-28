"use client";

import { Button } from "@/components/ui/button";
import { Delete } from "lucide-react";

// PIN 키패드 컴포넌트 props 타입
interface PinKeypadProps {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onComplete: (pin: string) => void;
  currentPin?: string;
}

// 숫자 키패드 레이아웃 정의
const KEYPAD_LAYOUT = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["delete", "0", "confirm"],
];

// PIN 숫자 키패드 컴포넌트 (어르신 친화적 큰 버튼, 모던 스타일)
export default function PinKeypad({
  onDigit,
  onDelete,
  onComplete,
  currentPin = "",
}: PinKeypadProps) {
  return (
    <div className="flex flex-col items-center gap-3" role="group" aria-label="PIN 입력 키패드">
      {KEYPAD_LAYOUT.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-3">
          {row.map((key) => {
            // 지우기 버튼
            if (key === "delete") {
              return (
                <button
                  key={key}
                  onClick={onDelete}
                  className="h-16 w-16 rounded-2xl bg-muted hover:bg-muted/80 active:scale-95 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-150 shadow-sm"
                  aria-label="지우기"
                >
                  <Delete className="size-5" />
                </button>
              );
            }

            // 확인 버튼
            if (key === "confirm") {
              return (
                <button
                  key={key}
                  onClick={() => onComplete(currentPin)}
                  className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 flex items-center justify-center text-white text-sm font-bold transition-all duration-150 shadow-md hover:shadow-lg"
                  aria-label="확인"
                >
                  확인
                </button>
              );
            }

            // 숫자 버튼 (0~9)
            return (
              <button
                key={key}
                onClick={() => onDigit(key)}
                className="h-16 w-16 rounded-2xl bg-white hover:bg-orange-50 active:scale-95 border border-border hover:border-orange-200 flex items-center justify-center text-2xl font-semibold text-foreground transition-all duration-150 shadow-sm hover:shadow-md"
                aria-label={`숫자 ${key}`}
              >
                {key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
