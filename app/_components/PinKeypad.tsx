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

// PIN 숫자 키패드 컴포넌트 (어르신 친화적 큰 버튼)
export default function PinKeypad({
  onDigit,
  onDelete,
  onComplete,
  currentPin = "",
}: PinKeypadProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {KEYPAD_LAYOUT.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-3">
          {row.map((key) => {
            // 지우기 버튼
            if (key === "delete") {
              return (
                <button
                  key={key}
                  onClick={onDelete}
                  className="h-16 w-16 rounded-full bg-gray-200 hover:bg-gray-300 active:bg-gray-400 flex items-center justify-center text-gray-700 font-medium transition-colors"
                  aria-label="지우기"
                >
                  <Delete className="size-6" />
                </button>
              );
            }

            // 확인 버튼
            if (key === "confirm") {
              return (
                <button
                  key={key}
                  onClick={() => onComplete(currentPin)}
                  className="h-16 w-16 rounded-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 flex items-center justify-center text-white text-sm font-bold transition-colors"
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
                className="h-16 w-16 rounded-full bg-white hover:bg-orange-50 active:bg-orange-100 border-2 border-orange-200 flex items-center justify-center text-2xl font-bold text-gray-800 transition-colors shadow-sm"
                aria-label={key}
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
