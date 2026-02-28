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

// 어르신 목록 카드 컴포넌트 (클릭 시 상세 페이지로 이동)
export default function ElderCard({ id, name, lastChat }: ElderCardProps) {
  const router = useRouter();

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow active:bg-gray-50"
      onClick={() => router.push(`/family/elders/${id}`)}
    >
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {/* 어르신 아바타 */}
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl shrink-0">
            👴
          </div>
          {/* 어르신 정보 */}
          <div>
            <p className="font-semibold text-gray-900 text-base">{name}</p>
            <p className="text-sm text-muted-foreground">
              마지막 대화: {lastChat}
            </p>
          </div>
        </div>

        {/* 오른쪽 화살표 아이콘 */}
        <ChevronRight className="size-5 text-gray-400 shrink-0" />
      </CardContent>
    </Card>
  );
}
