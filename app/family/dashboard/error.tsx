"use client";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

// 가족 대시보드 에러 바운더리
export default function FamilyDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Alert variant="destructive" className="max-w-sm">
        <AlertDescription>
          오류가 발생했습니다: {error.message}
        </AlertDescription>
      </Alert>
      <Button onClick={reset} variant="outline">
        다시 시도
      </Button>
    </div>
  );
}
