"use client";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

// 어르신 채팅 에러 바운더리 컴포넌트
export default function ElderChatError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      <span className="text-6xl">😔</span>
      <Alert variant="destructive" className="max-w-sm">
        <AlertDescription className="text-center text-lg">
          오류가 발생했습니다: {error.message}
        </AlertDescription>
      </Alert>
      <Button
        onClick={reset}
        className="h-14 px-8 text-xl bg-orange-500 hover:bg-orange-600 rounded-xl"
      >
        다시 시도
      </Button>
    </div>
  );
}
