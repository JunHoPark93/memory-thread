"use client";

import { useState, useEffect } from "react";
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
import { getFamilySession } from "@/app/_lib/session";

// 어르신 타입
interface Elder {
  id: string;
  name: string;
  created_at: string;
}

// 가족 대시보드 - 어르신 목록 관리 페이지
export default function FamilyDashboardPage() {
  const [elders, setElders] = useState<Elder[]>([]);
  const [familyUserId, setFamilyUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPin, setNewPin] = useState("");
  const [nameError, setNameError] = useState("");
  const [pinError, setPinError] = useState("");
  const [saving, setSaving] = useState(false);

  // 어르신 목록 로드
  const loadElders = async (fid: string) => {
    try {
      const res = await fetch(`/api/elders?familyUserId=${fid}`);
      const data = await res.json();
      if (data.elders) setElders(data.elders);
    } catch {
      toast.error("어르신 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fid = getFamilySession();
    if (fid) {
      setFamilyUserId(fid);
      loadElders(fid);
    } else {
      setLoading(false);
    }
  }, []);

  // 입력값 초기화
  const resetForm = () => {
    setNewName("");
    setNewPin("");
    setNameError("");
    setPinError("");
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  // 어르신 추가 저장 핸들러
  const handleSave = async () => {
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
    if (!familyUserId) return;

    setSaving(true);
    try {
      const res = await fetch("/api/elders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familyUserId, name: newName.trim(), pinCode: newPin }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "등록에 실패했습니다.");
        return;
      }

      toast.success(`${newName}님이 추가되었습니다.`);
      handleClose();
      loadElders(familyUserId);
    } catch {
      toast.error("서버 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  // 마지막 대화 날짜 포맷
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  };

  return (
    <div className="pt-6 pb-12 space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">관리 대상 어르신</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? "불러오는 중..." : `${elders.length}명 등록됨`}
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          size="sm"
          aria-label="새 어르신 추가"
        >
          <Plus className="size-4" />
          추가
        </Button>
      </div>

      {/* 어르신 카드 목록 */}
      <div className="space-y-3">
        {elders.map((elder) => (
          <ElderCard
            key={elder.id}
            id={elder.id}
            name={elder.name}
            lastChat={formatDate(elder.created_at)}
          />
        ))}
        {!loading && elders.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm">
            등록된 어르신이 없습니다.
          </p>
        )}
      </div>

      {/* 어르신 추가 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm mx-4 rounded-3xl border-border/60 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">새 어르신 추가</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label htmlFor="elder-name" className="text-sm font-medium text-foreground">
                어르신 이름
              </label>
              <Input
                id="elder-name"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setNameError(""); }}
                placeholder="예: 김복순"
                className="h-10 rounded-xl border-border/70 bg-muted/30 focus:bg-white transition-colors"
              />
              {nameError && <p className="text-destructive text-xs" role="alert">{nameError}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="elder-pin" className="text-sm font-medium text-foreground">
                PIN 번호 (4자리 숫자)
              </label>
              <Input
                id="elder-pin"
                type="password"
                value={newPin}
                onChange={(e) => {
                  const numOnly = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setNewPin(numOnly);
                  setPinError("");
                }}
                placeholder="4자리 숫자"
                maxLength={4}
                inputMode="numeric"
                className="h-10 rounded-xl border-border/70 bg-muted/30 focus:bg-white transition-colors"
              />
              {pinError && <p className="text-destructive text-xs" role="alert">{pinError}</p>}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClose} className="rounded-xl">취소</Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl shadow-sm disabled:opacity-60"
            >
              {saving ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
