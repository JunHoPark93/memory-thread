"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

// 어르신 카드 컴포넌트 props 타입
interface ElderCardProps {
  id: string;
  name: string;
  lastChat: string;
}

// 어르신 목록 카드 컴포넌트 (클릭 시 상세 페이지로 이동, hover 마이크로 인터랙션)
export default function ElderCard({ id, name, lastChat }: ElderCardProps) {
  const router = useRouter();

  return (
    <Card
      className="cursor-pointer group hover:-translate-y-1 hover:shadow-lg border-border/60 rounded-2xl transition-all duration-200 active:scale-[0.99]"
      onClick={() => router.push(`/family/elders/${id}`)}
      role="button"
      tabIndex={0}
      aria-label={`${name} 상세 페이지로 이동`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          router.push(`/family/elders/${id}`);
        }
      }}
    >
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3.5">
          {/* 어르신 아바타 - 그라디언트 배경 */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 border border-orange-200/60 flex items-center justify-center text-2xl shrink-0 shadow-sm">
            👴
          </div>
          {/* 어르신 정보 */}
          <div>
            <p className="font-semibold text-foreground text-base">{name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              마지막 대화: {lastChat}
            </p>
          </div>
        </div>

        {/* 오른쪽 화살표 - hover 시 이동 */}
        <ChevronRight className="size-4 text-muted-foreground/50 shrink-0 group-hover:translate-x-0.5 group-hover:text-orange-400 transition-all duration-200" />
      </CardContent>
    </Card>
  );
}
