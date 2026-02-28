"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ChevronLeft, Send, RefreshCw, Save, Home, Sparkles } from "lucide-react";
import ChatMessage from "@/app/_components/ChatMessage";
import { getElderSession, getElderName } from "@/app/_lib/session";

// 화면 단계 타입
type Step = "select" | "analyzing" | "chat" | "generating" | "preview" | "saved";

// 대화 메시지 타입
interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
}

// 대화 히스토리 턴 (API 전송용)
interface ChatTurn {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

// 사진 타입
interface ContextImage {
  id: string;
  image_url: string;
  title: string;
  caption: string;
}

// 기억복원 Wizard 페이지
export default function ElderMemoryPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("select");
  const [elderId, setElderId] = useState<string | null>(null);
  const [elderName, setElderName] = useState("어르신");

  // 사진 목록
  const [images, setImages] = useState<ContextImage[]>([]);
  const [imagesLoading, setImagesLoading] = useState(true);

  // 선택한 사진
  const [selectedImage, setSelectedImage] = useState<ContextImage | null>(null);

  // 채팅
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 생성된 이미지
  const [generatedImageBase64, setGeneratedImageBase64] = useState<string | null>(null);
  const [generatedImageMime, setGeneratedImageMime] = useState<string>("image/png");
  const [restoredImageUrl, setRestoredImageUrl] = useState<string | null>(null);
  const [restorationId, setRestorationId] = useState<string | null>(null);

  // 세션 초기화 + 사진 목록 로드
  useEffect(() => {
    const id = getElderSession();
    const name = getElderName();
    if (!id) {
      router.push("/elder/login?next=memory");
      return;
    }
    setElderId(id);
    if (name) setElderName(name);

    // 사진 목록 조회
    fetch(`/api/elders/${id}/images`)
      .then((r) => r.json())
      .then((data) => setImages(data.images ?? []))
      .catch(() => toast.error("사진 목록을 불러오지 못했습니다."))
      .finally(() => setImagesLoading(false));
  }, [router]);

  // 메시지 추가 시 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // API 호출 공통 함수
  const callMemoryChat = async (options: {
    message: string;
    generateImage?: boolean;
    currentHistory?: ChatTurn[];
    imageOverride?: ContextImage; // 첫 선택 시 state 반영 전 직접 전달
  }) => {
    const targetImage = options.imageOverride ?? selectedImage;
    if (!elderId || !targetImage) return null;

    const res = await fetch("/api/memory/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        elderId,
        imageUrl: targetImage.image_url,
        history: options.currentHistory ?? chatHistory,
        message: options.message,
        generateImage: options.generateImage ?? false,
        restorationId,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "오류가 발생했습니다.");
    }

    return res.json();
  };

  // 사진 선택 → 분석 시작
  const handleSelectImage = async (image: ContextImage) => {
    setSelectedImage(image);
    setStep("analyzing");
    setMessages([]);
    setChatHistory([]);

    try {
      const data = await callMemoryChat({
        message: "사진을 분석하고 기억을 이끌어내는 질문을 해주세요.",
        currentHistory: [],
        imageOverride: image, // state 반영 전이므로 지역 변수 직접 전달
      });

      if (!data) return;

      // 첫 AI 응답 표시
      setMessages([{ id: "ai-init", role: "ai", content: data.text }]);

      // 히스토리 업데이트
      setChatHistory([
        { role: "user", parts: [{ text: "사진을 분석하고 기억을 이끌어내는 질문을 해주세요." }] },
        { role: "model", parts: [{ text: data.text }] },
      ]);

      if (data.restorationId) setRestorationId(data.restorationId);
      setStep("chat");
    } catch (err) {
      toast.error((err as Error).message || "사진 분석에 실패했습니다.");
      setStep("select");
    }
  };

  // 일반 대화 전송
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || chatLoading) return;

    const userMsg: Message = { id: `user-${Date.now()}`, role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setChatLoading(true);

    try {
      const data = await callMemoryChat({ message: trimmed });
      if (!data) return;

      setMessages((prev) => [
        ...prev,
        { id: `ai-${Date.now()}`, role: "ai", content: data.text },
      ]);

      // 히스토리 누적
      const newHistory: ChatTurn[] = [
        ...chatHistory,
        { role: "user", parts: [{ text: trimmed }] },
        { role: "model", parts: [{ text: data.text }] },
      ];
      setChatHistory(newHistory);

      if (data.restorationId) setRestorationId(data.restorationId);
    } catch (err) {
      toast.error((err as Error).message || "메시지 전송에 실패했습니다.");
    } finally {
      setChatLoading(false);
    }
  };

  // 이미지 만들기
  const handleGenerateImage = async () => {
    setStep("generating");

    try {
      const data = await callMemoryChat({
        message: "지금까지 나눈 기억들을 반영한 이미지를 생성해주세요.",
        generateImage: true,
      });

      if (!data) return;

      if (!data.imageBase64) {
        toast.error("이미지가 생성되지 않았습니다. 다시 시도해주세요.");
        setStep("chat");
        return;
      }

      setGeneratedImageBase64(data.imageBase64);
      setGeneratedImageMime(data.imageMimeType ?? "image/png");
      if (data.restoredImageUrl) setRestoredImageUrl(data.restoredImageUrl);
      if (data.restorationId) setRestorationId(data.restorationId);

      // 히스토리에 이미지 생성 대화도 추가
      const newHistory: ChatTurn[] = [
        ...chatHistory,
        { role: "user", parts: [{ text: "이미지를 생성해주세요." }] },
        { role: "model", parts: [{ text: data.text }] },
      ];
      setChatHistory(newHistory);

      setStep("preview");
    } catch (err) {
      toast.error((err as Error).message || "이미지 생성에 실패했습니다.");
      setStep("chat");
    }
  };

  // 재생성 (chat 단계로 돌아가기)
  const handleRegenerate = () => {
    setGeneratedImageBase64(null);
    setStep("chat");
  };

  // 저장 (이미 API에서 저장됨, UI 완료 처리)
  const handleSave = () => {
    setStep("saved");
    toast.success("기억이 소중히 저장되었습니다!");
  };

  // 엔터키 전송
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ────────────────────────────────────────────────
  // 렌더링
  // ────────────────────────────────────────────────

  // 사진 선택 단계
  if (step === "select") {
    return (
      <div className="pb-12">
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-base font-medium mb-6 transition-colors"
        >
          <ChevronLeft className="size-5" />
          홈으로
        </button>

        <div className="space-y-2 mb-6">
          <h1 className="text-3xl font-bold text-foreground">{elderName}님, 안녕하세요!</h1>
          <p className="text-base text-muted-foreground">기억을 되살릴 사진을 골라보세요</p>
        </div>

        {imagesLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
          </div>
        ) : images.length === 0 ? (
          <div className="glass rounded-3xl p-10 text-center space-y-3">
            <span className="text-5xl">📷</span>
            <p className="text-xl font-semibold text-foreground">아직 등록된 사진이 없어요</p>
            <p className="text-base text-muted-foreground">가족에게 사진 등록을 부탁해주세요</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {images.map((img) => (
              <button
                key={img.id}
                onClick={() => handleSelectImage(img)}
                className="group relative rounded-2xl overflow-hidden aspect-square shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                <Image
                  src={img.image_url}
                  alt={img.title || "사진"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {img.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <p className="text-white text-sm font-medium truncate">{img.title}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 분석 중 / 이미지 생성 중 로딩
  if (step === "analyzing" || step === "generating") {
    const isGenerating = step === "generating";
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
        <div className="w-16 h-16 border-4 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
        <div className="text-center space-y-1">
          <p className="text-xl font-semibold text-foreground">
            {isGenerating ? "기억을 이미지로 만들고 있어요" : "사진을 살펴보고 있어요"}
          </p>
          <p className="text-base text-muted-foreground">
            {isGenerating ? "잠시만 기다려주세요 (최대 60초)" : "잠시만 기다려주세요..."}
          </p>
        </div>
        {selectedImage && (
          <div className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-lg opacity-60">
            <Image src={selectedImage.image_url} alt="선택한 사진" fill className="object-cover" />
          </div>
        )}
      </div>
    );
  }

  // 대화 단계
  if (step === "chat") {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* 헤더 */}
        <div className="py-3 border-b border-border/50 flex items-center gap-3">
          <button
            onClick={() => setStep("select")}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="사진 선택으로 돌아가기"
          >
            <ChevronLeft className="size-5" />
          </button>
          {selectedImage && (
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0">
              <Image src={selectedImage.image_url} alt="선택한 사진" fill className="object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-foreground truncate">
              {selectedImage?.title || "기억복원 대화"}
            </p>
            <p className="text-xs text-muted-foreground">기억을 이야기해주세요</p>
          </div>
        </div>

        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto py-4 space-y-1" role="log">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
          ))}
          {chatLoading && <ChatMessage role="ai" content="..." />}
          <div ref={messagesEndRef} />
        </div>

        {/* 이미지 만들기 버튼 */}
        <div className="px-0 pb-2">
          <Button
            onClick={handleGenerateImage}
            disabled={messages.length < 2 || chatLoading}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white font-semibold text-base shadow-md disabled:opacity-40"
          >
            <Sparkles className="size-5 mr-2" />
            이미지 만들기
          </Button>
        </div>

        {/* 입력 영역 */}
        <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm pt-3 pb-4">
          <div className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="기억을 이야기해주세요..."
              disabled={chatLoading}
              className="flex-1 resize-none text-lg min-h-[52px] max-h-32 rounded-2xl border-border/70 bg-muted/40 focus:bg-white pr-4 pl-4 transition-colors"
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || chatLoading}
              className="h-[52px] w-[52px] rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white flex-shrink-0 shadow-md disabled:opacity-40 transition-all"
              aria-label="메시지 전송"
            >
              <Send className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 미리보기 단계
  if (step === "preview") {
    return (
      <div className="pb-12 space-y-6">
        <div className="text-center space-y-1 pt-4">
          <h2 className="text-2xl font-bold text-foreground">기억이 이미지로 태어났어요!</h2>
          <p className="text-sm text-muted-foreground">저장하거나 다시 만들어보세요</p>
        </div>

        {/* 원본 vs 생성 이미지 비교 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground text-center">원본 사진</p>
            {selectedImage && (
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-md">
                <Image src={selectedImage.image_url} alt="원본 사진" fill className="object-cover" />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-violet-600 text-center font-semibold">복원된 기억</p>
            {generatedImageBase64 ? (
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-violet-300">
                <Image
                  src={`data:${generatedImageMime};base64,${generatedImageBase64}`}
                  alt="복원된 기억 이미지"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square rounded-2xl bg-muted flex items-center justify-center">
                <p className="text-sm text-muted-foreground">이미지 없음</p>
              </div>
            )}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleSave}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white font-bold text-lg shadow-lg"
          >
            <Save className="size-5 mr-2" />
            소중히 저장하기
          </Button>
          <Button
            onClick={handleRegenerate}
            variant="outline"
            className="w-full h-12 rounded-2xl border-violet-200 text-violet-600 hover:bg-violet-50 font-semibold"
          >
            <RefreshCw className="size-4 mr-2" />
            다시 만들기
          </Button>
        </div>
      </div>
    );
  }

  // 저장 완료
  if (step === "saved") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 text-center px-4">
        <div className="space-y-3">
          <div className="text-6xl">✨</div>
          <h2 className="text-3xl font-bold text-foreground">기억이 저장되었어요!</h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            소중한 기억을 아름다운 이미지로<br />간직하게 되었어요
          </p>
        </div>

        {/* 저장된 이미지 미리보기 */}
        {generatedImageBase64 && (
          <div className="relative w-48 h-48 rounded-3xl overflow-hidden shadow-xl border-2 border-violet-200">
            <Image
              src={`data:${generatedImageMime};base64,${generatedImageBase64}`}
              alt="저장된 기억 이미지"
              fill
              className="object-cover"
            />
          </div>
        )}

        <Button
          onClick={() => router.push("/")}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white font-bold text-lg shadow-lg"
        >
          <Home className="size-5 mr-2" />
          홈으로 돌아가기
        </Button>
      </div>
    );
  }

  return null;
}
