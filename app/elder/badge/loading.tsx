import { Skeleton } from "@/components/ui/skeleton";

// 어르신 뱃지 페이지 로딩 스켈레톤
export default function ElderBadgeLoading() {
  return (
    <div className="pt-6 pb-12 space-y-8">
      {/* 포인트 스켈레톤 */}
      <div className="bg-white rounded-2xl p-6 text-center space-y-3">
        <Skeleton className="h-5 w-32 mx-auto" />
        <Skeleton className="h-16 w-40 mx-auto" />
      </div>

      {/* 진행도 스켈레톤 */}
      <div className="bg-white rounded-2xl p-6 space-y-3">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-full rounded-full" />
      </div>

      {/* 뱃지 그리드 스켈레톤 */}
      <div className="bg-white rounded-2xl p-6">
        <Skeleton className="h-6 w-28 mb-4" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>

      {/* 버튼 스켈레톤 */}
      <Skeleton className="h-16 w-full rounded-2xl" />
    </div>
  );
}
