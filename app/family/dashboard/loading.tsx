import { Skeleton } from "@/components/ui/skeleton";

// 가족 대시보드 로딩 스켈레톤
export default function FamilyDashboardLoading() {
  return (
    <div className="pt-6 pb-12 space-y-6">
      {/* 헤더 스켈레톤 */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* 어르신 카드 스켈레톤 */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-4 bg-white border rounded-lg"
          >
            <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="w-5 h-5" />
          </div>
        ))}
      </div>
    </div>
  );
}
