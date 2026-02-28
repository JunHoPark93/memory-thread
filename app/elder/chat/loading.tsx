import { Skeleton } from "@/components/ui/skeleton";

// 어르신 채팅 페이지 로딩 스켈레톤
export default function ElderChatLoading() {
  return (
    <div className="flex flex-col gap-4 pt-6 pb-4">
      {/* 제목 스켈레톤 */}
      <Skeleton className="h-8 w-40 rounded-lg mx-auto mb-4" />

      {/* AI 메시지 스켈레톤 */}
      <div className="flex items-start gap-2">
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
        <Skeleton className="h-20 w-64 rounded-2xl" />
      </div>

      {/* 사용자 메시지 스켈레톤 */}
      <div className="flex items-start gap-2 justify-end">
        <Skeleton className="h-16 w-48 rounded-2xl" />
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
      </div>

      {/* AI 메시지 스켈레톤 */}
      <div className="flex items-start gap-2">
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
        <Skeleton className="h-16 w-56 rounded-2xl" />
      </div>

      {/* 입력 영역 스켈레톤 */}
      <div className="mt-auto flex gap-2 items-end border-t pt-3">
        <Skeleton className="flex-1 h-14 rounded-lg" />
        <Skeleton className="w-14 h-14 rounded-xl" />
      </div>
    </div>
  );
}
