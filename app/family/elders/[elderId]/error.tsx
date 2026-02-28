"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft } from "lucide-react";

// 어르신 상세 페이지 에러 바운더리
export default function ElderDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
      <Alert variant="destructive" className="max-w-sm">
        <AlertDescription>
          오류가 발생했습니다: {error.message}
        </AlertDescription>
      </Alert>
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => router.back()}
          size="sm"
        >
          <ChevronLeft className="size-4" />
          뒤로가기
        </Button>
        <Button onClick={reset} size="sm">
          다시 시도
        </Button>
      </div>
    </div>
  );
}
