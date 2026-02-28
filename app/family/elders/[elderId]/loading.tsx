import { Skeleton } from "@/components/ui/skeleton";

// 어르신 상세 페이지 로딩 스켈레톤
export default function ElderDetailLoading() {
  return (
    <div className="pt-6 pb-12 space-y-6">
      {/* 헤더 스켈레톤 */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded" />
        <Skeleton className="h-8 w-32" />
      </div>

      {/* 탭 스켈레톤 */}
      <Skeleton className="h-10 w-full rounded-lg" />

      {/* 콘텐츠 스켈레톤 */}
      <div className="space-y-5 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        ))}
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}
