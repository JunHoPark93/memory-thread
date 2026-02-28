"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import ElderCard from "@/app/_components/ElderCard";

// mock 어르신 데이터
const MOCK_ELDERS = [
  { id: "elder-1", name: "김할아버지", lastChat: "2024년 1월 15일" },
  { id: "elder-2", name: "이할머니", lastChat: "2024년 1월 14일" },
  { id: "elder-3", name: "박할아버지", lastChat: "2024년 1월 10일" },
];

// 가족 대시보드 - 어르신 목록 관리 페이지
export default function FamilyDashboardPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPin, setNewPin] = useState("");
  const [nameError, setNameError] = useState("");
  const [pinError, setPinError] = useState("");

  // 입력값 초기화
  const resetForm = () => {
    setNewName("");
    setNewPin("");
    setNameError("");
    setPinError("");
  };

  // 다이얼로그 닫기
  const handleClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  // 어르신 추가 저장 핸들러 (mock)
  const handleSave = () => {
    let hasError = false;

    if (!newName.trim()) {
      setNameError("이름을 입력해주세요.");
      hasError = true;
    }

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinError("PIN은 4자리 숫자여야 합니다.");
      hasError = true;
    }

    if (hasError) return;

    toast.success(`${newName}님이 추가되었습니다.`, {
      description: "어르신 정보가 성공적으로 등록되었습니다.",
    });
    handleClose();
  };

  return (
    <div className="pt-6 pb-12 space-y-6">
      {/* 헤더 영역 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          관리 대상 어르신
        </h1>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-gray-800 hover:bg-gray-900 text-white"
          size="sm"
        >
          <Plus className="size-4" />
          어르신 추가
        </Button>
      </div>

      {/* 어르신 카드 목록 */}
      <div className="space-y-3">
        {MOCK_ELDERS.map((elder) => (
          <ElderCard
            key={elder.id}
            id={elder.id}
            name={elder.name}
            lastChat={elder.lastChat}
          />
        ))}
      </div>

      {/* 어르신 추가 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>새 어르신 추가</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* 이름 입력 */}
            <div className="space-y-1.5">
              <label
                htmlFor="elder-name"
                className="text-sm font-medium text-gray-700"
              >
                어르신 이름
              </label>
              <Input
                id="elder-name"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setNameError("");
                }}
                placeholder="예: 김할아버지"
              />
              {nameError && (
                <p className="text-red-500 text-xs">{nameError}</p>
              )}
            </div>

            {/* PIN 입력 */}
            <div className="space-y-1.5">
              <label
                htmlFor="elder-pin"
                className="text-sm font-medium text-gray-700"
              >
                PIN 번호 (4자리 숫자)
              </label>
              <Input
                id="elder-pin"
                type="password"
                value={newPin}
                onChange={(e) => {
                  // 숫자만 입력 허용, 최대 4자리
                  const numOnly = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setNewPin(numOnly);
                  setPinError("");
                }}
                placeholder="4자리 숫자"
                maxLength={4}
                inputMode="numeric"
              />
              {pinError && (
                <p className="text-red-500 text-xs">{pinError}</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClose}>
              취소
            </Button>
            <Button onClick={handleSave} className="bg-gray-800 hover:bg-gray-900">
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
