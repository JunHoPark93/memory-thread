// 채팅 말풍선 컴포넌트 props 타입
interface ChatMessageProps {
  role: "ai" | "user";
  content: string;
}

// 채팅 말풍선 컴포넌트 (어르신 친화적 큰 글씨, 모던 스타일)
export default function ChatMessage({ role, content }: ChatMessageProps) {
  // AI 메시지: 왼쪽 정렬, 흰색/연회색 배경
  if (role === "ai") {
    return (
      <div className="flex justify-start mb-4 px-1" role="listitem">
        {/* AI 아바타 - 그라디언트 원형 */}
        <div
          className="shrink-0 w-9 h-9 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 border border-orange-200 flex items-center justify-center text-lg mr-2.5 mt-1 shadow-sm"
          aria-hidden="true"
        >
          🤖
        </div>
        {/* 말풍선 - 흰색 카드 스타일 */}
        <div className="max-w-[78%] bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-border/60">
          <p className="text-lg text-foreground leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </div>
      </div>
    );
  }

  // 사용자 메시지: 오른쪽 정렬, 그라디언트 배경
  return (
    <div className="flex justify-end mb-4 px-1" role="listitem">
      {/* 말풍선 - 그라디언트 */}
      <div className="max-w-[78%] bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl rounded-tr-md px-4 py-3 shadow-md">
        <p className="text-lg text-white leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
      </div>
      {/* 사용자 아바타 */}
      <div
        className="shrink-0 w-9 h-9 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center text-lg ml-2.5 mt-1 shadow-sm"
        aria-hidden="true"
      >
        👴
      </div>
    </div>
  );
}
