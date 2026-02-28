"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { toast } from "sonner";
import ChatMessage from "@/app/_components/ChatMessage";
import { getElderSession, getElderName } from "@/app/_lib/session";

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
  content: "안녕하세요! 오늘 기분이 어떠세요? 오늘 있었던 일을 이야기해 주세요 😊",
};

// 어르신 AI 채팅 페이지
export default function ElderChatPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [elderId, setElderId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [elderName, setElderName] = useState<string>("어르신");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 세션 초기화
  useEffect(() => {
    const id = getElderSession();
    const name = getElderName();
    if (id) setElderId(id);
    if (name) setElderName(name);
  }, []);

  // 메시지 추가 시 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 메시지 전송 핸들러
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading || !elderId) return;

    // 사용자 메시지 즉시 표시
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elderId, sessionId, content: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("메시지 전송에 실패했습니다.");
        return;
      }

      // 세션 ID 저장 (최초 응답 시)
      if (!sessionId && data.sessionId) {
        setSessionId(data.sessionId);
      }

      // AI 응답 표시
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: "ai",
        content: data.reply,
      };
      setMessages((prev) => [...prev, aiMessage]);

      // 포인트 획득 알림
      if (data.newPoints !== null && data.newPoints !== undefined) {
        toast.success("🎉 포인트 획득!", {
          description: `대화를 나눠 50pt를 획득하셨어요! (총 ${data.newPoints}pt)`,
          duration: 4000,
        });
      }
    } catch {
      toast.error("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 엔터키 전송 (Shift+Enter는 줄바꿈)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* 채팅 헤더 */}
      <div className="py-4 text-center border-b border-border/50">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
          <h1 className="text-xl font-bold text-foreground">
            {elderName}님의 오늘의 대화
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">AI 친구와 이야기해요</p>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1" role="log" aria-label="채팅 메시지">
        {messages.map((message) => (
          <ChatMessage key={message.id} role={message.role} content={message.content} />
        ))}
        {/* AI 응답 대기 중 표시 */}
        {loading && (
          <ChatMessage role="ai" content="..." />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 하단 입력 영역 */}
      <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm pt-3 pb-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={elderId ? "메시지를 입력하세요..." : "로그인이 필요합니다."}
              disabled={!elderId || loading}
              className="flex-1 resize-none text-lg min-h-[52px] max-h-32 rounded-2xl border-border/70 bg-muted/40 focus:bg-white pr-4 pl-4 transition-colors"
              rows={1}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading || !elderId}
            className="h-[52px] w-[52px] rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white flex-shrink-0 shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="메시지 전송"
          >
            <Send className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
