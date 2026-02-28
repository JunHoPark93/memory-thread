import Link from "next/link";
import { Button } from "@/components/ui/button";

// 404 커스텀 페이지
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
      <div className="text-8xl">🧵</div>
      <h1 className="text-3xl font-bold text-center">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="text-muted-foreground text-center text-lg">
        요청하신 페이지가 존재하지 않습니다.
      </p>
      <Button asChild size="lg">
        <Link href="/">홈으로 돌아가기</Link>
      </Button>
    </div>
  );
}
