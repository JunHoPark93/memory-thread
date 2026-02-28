import { Skeleton } from "@/components/ui/skeleton";

// 어르신 로그인 페이지 로딩 스켈레톤
export default function ElderLoginLoading() {
  return (
    <div className="pt-8 pb-12 flex flex-col items-center gap-8">
      {/* 제목 스켈레톤 */}
      <Skeleton className="h-10 w-64 rounded-xl" />

      {/* PIN 표시 스켈레톤 */}
      <div className="flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="w-14 h-14 rounded-full" />
        ))}
      </div>

      {/* 키패드 스켈레톤 */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, row) => (
          <div key={row} className="flex gap-3">
            {Array.from({ length: 3 }).map((_, col) => (
              <Skeleton key={col} className="w-16 h-16 rounded-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
