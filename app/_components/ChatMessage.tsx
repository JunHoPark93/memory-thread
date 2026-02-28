// 채팅 말풍선 컴포넌트 props 타입
interface ChatMessageProps {
  role: "ai" | "user";
  content: string;
}

// 채팅 말풍선 컴포넌트 (어르신 친화적 큰 글씨)
export default function ChatMessage({ role, content }: ChatMessageProps) {
  // AI 메시지: 왼쪽 정렬, 회색 배경
  if (role === "ai") {
    return (
      <div className="flex justify-start mb-4">
        {/* AI 아이콘 */}
        <div className="shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-xl mr-2 mt-1">
          🤖
        </div>
        {/* 말풍선 */}
        <div className="max-w-[75%] bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
          <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </div>
      </div>
    );
  }

  // 사용자 메시지: 오른쪽 정렬, orange 배경
  return (
    <div className="flex justify-end mb-4">
      {/* 말풍선 */}
      <div className="max-w-[75%] bg-orange-500 rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
        <p className="text-lg text-white leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
      </div>
      {/* 사용자 아이콘 */}
      <div className="shrink-0 w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center text-xl ml-2 mt-1">
        👴
      </div>
    </div>
  );
}
