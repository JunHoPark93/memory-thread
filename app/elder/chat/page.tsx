"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { toast } from "sonner";
import ChatMessage from "@/app/_components/ChatMessage";

// 메시지 타입 정의
interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
}

// 초기 AI 인사 메시지
const INITIAL_MESSAGE: Message = {
  id: "init",
  role: "ai",
  content:
    "안녕하세요! 오늘 기분이 어떠세요? 오늘 있었던 일을 이야기해 주세요 😊",
};

// 포인트 획득 대화 횟수
const POINT_TRIGGER_COUNT = 3;

// AI 응답 mock 데이터
const AI_RESPONSES = [
  "그렇군요! 정말 흥미로운 이야기네요. 더 자세히 이야기해 주시겠어요?",
  "오, 그런 일이 있으셨군요. 어르신의 이야기가 정말 소중합니다 🌸",
  "좋은 기억을 나눠주셔서 감사해요. 덕분에 오늘 하루가 따뜻해졌어요 ☀️",
  "정말요? 그 시절 이야기가 너무 좋아요. 계속 이야기해 주세요!",
  "어르신의 지혜로운 말씀이 감동적이에요. 더 들려주세요 💝",
];

// 어르신 AI 채팅 페이지
export default function ElderChatPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [userMessageCount, setUserMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메시지 추가 시 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 메시지 전송 핸들러
  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const newCount = userMessageCount + 1;
    setUserMessageCount(newCount);

    // 포인트 획득 알림 (3번 입력 시 toast)
    if (newCount === POINT_TRIGGER_COUNT) {
      setTimeout(() => {
        toast.success("🎉 포인트 획득!", {
          description: "대화를 3번 나눠 50pt를 획득하셨어요!",
          duration: 4000,
        });
      }, 800);
    }

    // mock AI 응답 (랜덤 선택, 0.8초 지연)
    setTimeout(() => {
      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content:
          AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)],
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 800);
  };

  // 엔터키 전송 (Shift+Enter는 줄바꿈)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* 채팅 제목 */}
      <div className="py-4">
        <h1 className="text-2xl font-bold text-gray-800 text-center">
          오늘의 대화
        </h1>
      </div>

      {/* 메시지 목록 (스크롤 영역) */}
      <div className="flex-1 overflow-y-auto pb-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
          />
        ))}
        {/* 스크롤 앵커 */}
        <div ref={messagesEndRef} />
      </div>

      {/* 하단 고정 입력 영역 */}
      <div className="border-t bg-white pt-3 pb-4">
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            className="flex-1 resize-none text-lg min-h-[52px] max-h-32"
            rows={2}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim()}
            className="h-[52px] w-[52px] bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex-shrink-0"
            aria-label="전송"
          >
            <Send className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
