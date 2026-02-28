"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ChevronLeft, Send, Home, Sparkles, Check, Mic, MicOff, Radio } from "lucide-react";
import ChatMessage from "@/app/_components/ChatMessage";
import { getElderSession, getElderName } from "@/app/_lib/session";
import { GoogleGenAI, Modality, type LiveServerMessage, type Session } from "@google/genai";

// 화면 단계 타입
type Step = "select" | "analyzing" | "chat" | "saved";

// 대화 메시지 타입
interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
  imageBase64?: string;   // 생성된 이미지 (AI 메시지에만)
  imageMimeType?: string;
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
  const [liveStatus, setLiveStatus] = useState("라이브 연결 안 됨");
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isLiveMicOn, setIsLiveMicOn] = useState(false);
  const liveSessionRef = useRef<Session | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const shouldReconnectRef = useRef(false);
  const micStreamRef = useRef<MediaStream | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const silenceRef = useRef<GainNode | null>(null);
  const playbackCtxRef = useRef<AudioContext | null>(null);
  const playbackTimeRef = useRef(0);
  const liveUserTurnMessageIdRef = useRef<string | null>(null);
  const liveUserTurnDisplayTextRef = useRef("");
  const liveUserTurnRawTextRef = useRef("");
  const liveAiTurnMessageIdRef = useRef<string | null>(null);
  const liveAiTurnDisplayTextRef = useRef("");
  const liveAiTurnRawTextRef = useRef("");

  // 이미지 생성 상태
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedImage, setHasGeneratedImage] = useState(false);

  // 저장 화면용 마지막 이미지
  const [generatedImageBase64, setGeneratedImageBase64] = useState<string | null>(null);
  const [generatedImageMime, setGeneratedImageMime] = useState<string>("image/png");
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

  // 페이지 이동/단계 변경 시 음성 상태 정리
  useEffect(() => {
    if (step !== "chat" && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, [step]);

  useEffect(() => {
    return () => {
      disconnectLive();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchImageAsBase64 = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("사진을 불러오지 못했습니다.");
    const buffer = await res.arrayBuffer();
    const mimeType = res.headers.get("content-type") ?? "image/jpeg";
    return {
      mimeType,
      data: arrayBufferToBase64(buffer),
    };
  };

  const sendInitialPhotoPrompt = async (image: ContextImage) => {
    const session = liveSessionRef.current;
    if (!session) return;

    const { data, mimeType } = await fetchImageAsBase64(image.image_url);
    const initialPrompt = "이 사진을 보고 따뜻하게 설명하고, 기억을 떠올릴 질문 1가지를 해주세요.";

    session.sendClientContent({
      turns: {
        role: "user",
        parts: [
          { inlineData: { mimeType, data } },
          { text: initialPrompt },
        ],
      },
      turnComplete: true,
    });
  };

  const resetLiveTurnState = () => {
    liveUserTurnMessageIdRef.current = null;
    liveUserTurnDisplayTextRef.current = "";
    liveUserTurnRawTextRef.current = "";
    liveAiTurnMessageIdRef.current = null;
    liveAiTurnDisplayTextRef.current = "";
    liveAiTurnRawTextRef.current = "";
  };

  const stopReconnect = () => {
    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    reconnectAttemptsRef.current = 0;
  };

  const scheduleReconnect = () => {
    if (reconnectTimerRef.current || !selectedImage) return;
    const attempt = reconnectAttemptsRef.current + 1;
    reconnectAttemptsRef.current = attempt;
    const delay = Math.min(10_000, 1000 * Math.pow(2, attempt - 1));
    setLiveStatus(`라이브 재연결 중... (${Math.round(delay / 1000)}s)`);
    reconnectTimerRef.current = window.setTimeout(() => {
      reconnectTimerRef.current = null;
      void connectLive(selectedImage);
    }, delay);
  };

  const stopLiveMic = () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.sendRealtimeInput({ audioStreamEnd: true });
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    processorRef.current?.disconnect();
    processorRef.current = null;
    inputSourceRef.current?.disconnect();
    inputSourceRef.current = null;
    silenceRef.current?.disconnect();
    silenceRef.current = null;

    if (inputCtxRef.current) {
      inputCtxRef.current.close();
      inputCtxRef.current = null;
    }
    setIsLiveMicOn(false);
    if (isLiveConnected) {
      setLiveStatus("라이브 연결됨");
    }
  };

  const startLiveMic = async () => {
    if (!liveSessionRef.current) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("이 브라우저는 마이크를 지원하지 않습니다.");
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    micStreamRef.current = stream;

    const AudioCtx =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      toast.error("이 브라우저는 오디오 처리를 지원하지 않습니다.");
      return;
    }

    const inputCtx = new AudioCtx();
    inputCtxRef.current = inputCtx;
    const inputSource = inputCtx.createMediaStreamSource(stream);
    inputSourceRef.current = inputSource;
    const processor = inputCtx.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    const silence = inputCtx.createGain();
    silence.gain.value = 0;
    silenceRef.current = silence;

    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const downsampled = downsampleBuffer(inputData, inputCtx.sampleRate, 16000);
      const int16 = floatTo16BitPCM(downsampled);
      const session = liveSessionRef.current;
      if (session) {
        session.sendRealtimeInput({
          audio: {
            data: arrayBufferToBase64(int16.buffer),
            mimeType: "audio/pcm;rate=16000",
          },
        });
      }
    };

    inputSource.connect(processor);
    processor.connect(silence);
    silence.connect(inputCtx.destination);

    setIsLiveMicOn(true);
    setLiveStatus("라이브 음성 대화 중");
  };

  const playPcmChunk = (base64: string, mimeType: string) => {
    const rate = parseSampleRate(mimeType) || 24000;
    if (!playbackCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      playbackCtxRef.current = new AudioCtx({ sampleRate: rate });
      playbackTimeRef.current = playbackCtxRef.current.currentTime;
    }

    const ctx = playbackCtxRef.current;
    const pcm = base64ToUint8(base64);
    const float32 = pcm16ToFloat32(pcm);
    const buffer = ctx.createBuffer(1, float32.length, rate);
    buffer.getChannelData(0).set(float32);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    playbackTimeRef.current = Math.max(playbackTimeRef.current, ctx.currentTime);
    source.start(playbackTimeRef.current);
    playbackTimeRef.current += buffer.duration;
  };

  const appendLiveMessage = (role: "ai" | "user", rawText: string) => {
    if (!rawText) return;
    const refs =
      role === "ai"
        ? {
            idRef: liveAiTurnMessageIdRef,
            displayRef: liveAiTurnDisplayTextRef,
            rawRef: liveAiTurnRawTextRef,
          }
        : {
            idRef: liveUserTurnMessageIdRef,
            displayRef: liveUserTurnDisplayTextRef,
            rawRef: liveUserTurnRawTextRef,
          };

    if (!refs.idRef.current) {
      const id = `live-${role}-${Date.now()}`;
      refs.idRef.current = id;
      refs.rawRef.current = rawText;
      refs.displayRef.current = rawText;
      setMessages((prev) => [...prev, { id, role, content: rawText }]);
      return;
    }

    const previousRaw = refs.rawRef.current;
    const previousDisplay = refs.displayRef.current;
    let delta = "";

    if (rawText.startsWith(previousRaw)) {
      delta = rawText.slice(previousRaw.length);
    } else if (previousDisplay.endsWith(rawText)) {
      delta = "";
    } else {
      delta = rawText;
    }

    if (!delta) return;
    const nextDisplay = `${previousDisplay}${delta}`;
    refs.rawRef.current = rawText;
    refs.displayRef.current = nextDisplay;
    const id = refs.idRef.current;
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content: nextDisplay } : m)));
  };

  const finalizeLiveTurnToHistory = () => {
    const userText = liveUserTurnDisplayTextRef.current.trim();
    const aiText = liveAiTurnDisplayTextRef.current.trim();
    if (userText || aiText) {
      setChatHistory((prev) => {
        const next = [...prev];
        if (userText) next.push({ role: "user", parts: [{ text: userText }] });
        if (aiText) next.push({ role: "model", parts: [{ text: aiText }] });
        return next;
      });
    }
  };

  const handleLiveServerMessage = (msg: LiveServerMessage) => {
    const serverContent = msg.serverContent;
    if (!serverContent) return;

    const inputText = serverContent.inputTranscription?.text;
    if (inputText) appendLiveMessage("user", inputText);

    const outputText = serverContent.outputTranscription?.text;
    if (outputText) appendLiveMessage("ai", outputText);

    if (serverContent.turnComplete) {
      finalizeLiveTurnToHistory();
      resetLiveTurnState();
    }

    const parts = serverContent.modelTurn?.parts;
    if (!parts) return;
    for (const part of parts) {
      const inline = part.inlineData;
      if (inline?.data) {
        playPcmChunk(inline.data, inline.mimeType || "audio/pcm;rate=24000");
      }
    }
  };

  const connectLive = async (image: ContextImage) => {
    if (!elderId || liveSessionRef.current) return;

    shouldReconnectRef.current = true;
    setLiveStatus("라이브 연결 중...");

    try {
      const tokenRes = await fetch("/api/live/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elderId, elderName }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData?.token || !tokenData?.model) {
        setLiveStatus(`오류: ${tokenData?.error || "토큰 발급 실패"}`);
        throw new Error(tokenData?.error || "토큰 발급 실패");
      }

      const ai = new GoogleGenAI({
        apiKey: tokenData.token,
        httpOptions: { apiVersion: "v1alpha" },
      });

      const session = await ai.live.connect({
        model: tokenData.model,
        config: { responseModalities: [Modality.AUDIO] },
        callbacks: {
          onopen: () => {
            setLiveStatus("라이브 준비 완료");
            setIsLiveConnected(true);
            reconnectAttemptsRef.current = 0;
          },
          onmessage: (msg) => handleLiveServerMessage(msg),
          onerror: () => {
            setLiveStatus("라이브 연결 오류");
          },
          onclose: (event) => {
            finalizeLiveTurnToHistory();
            resetLiveTurnState();
            liveSessionRef.current = null;
            setIsLiveConnected(false);
            setLiveStatus(
              `라이브 연결 끊김 (code ${event.code}${event.reason ? `: ${event.reason}` : ""})`
            );
            stopLiveMic();
            if (shouldReconnectRef.current) {
              scheduleReconnect();
            }
          },
        },
      });

      liveSessionRef.current = session;
      await sendInitialPhotoPrompt(image);
    } catch (err) {
      if (shouldReconnectRef.current) {
        scheduleReconnect();
      }
      throw err;
    }
  };

  const disconnectLive = () => {
    shouldReconnectRef.current = false;
    finalizeLiveTurnToHistory();
    if (liveSessionRef.current) {
      liveSessionRef.current.close();
      liveSessionRef.current = null;
    }
    resetLiveTurnState();
    stopReconnect();
    stopLiveMic();
    setIsLiveConnected(false);
    setLiveStatus("라이브 연결 안 됨");
  };

  const toggleLiveMic = async () => {
    if (!isLiveConnected) return;
    try {
      if (isLiveMicOn) {
        stopLiveMic();
      } else {
        await startLiveMic();
      }
    } catch {
      toast.error("마이크를 시작할 수 없습니다.");
      stopLiveMic();
    }
  };

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

  const buildHistoryWithLiveBuffer = (baseHistory: ChatTurn[]) => {
    const snapshot = [...baseHistory];
    const pendingUserText = liveUserTurnDisplayTextRef.current.trim();
    const pendingAiText = liveAiTurnDisplayTextRef.current.trim();

    if (pendingUserText) {
      snapshot.push({ role: "user", parts: [{ text: pendingUserText }] });
    }
    if (pendingAiText) {
      snapshot.push({ role: "model", parts: [{ text: pendingAiText }] });
    }

    return snapshot;
  };

  // 사진 선택 → 분석 시작
  const handleSelectImage = async (image: ContextImage) => {
    disconnectLive();
    setSelectedImage(image);
    setStep("analyzing");
    setMessages([]);
    setChatHistory([]);
    setHasGeneratedImage(false);
    setGeneratedImageBase64(null);
    setRestorationId(null);

    try {
      await connectLive(image);
      setStep("chat");
    } catch (err) {
      toast.error((err as Error).message || "라이브 연결에 실패했습니다.");
      setStep("select");
    }
  };

  // 일반 대화 전송
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || chatLoading || isGenerating) return;

    if (liveSessionRef.current && isLiveConnected) {
      liveSessionRef.current.sendClientContent({
        turns: {
          role: "user",
          parts: [{ text: trimmed }],
        },
        turnComplete: true,
      });
      setInput("");
      return;
    }

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

  // 이미지 만들기 → 채팅 안에 인라인으로 표시
  const handleGenerateImage = async () => {
    if (isGenerating || chatLoading) return;
    setIsGenerating(true);

    try {
      const historyForImage = buildHistoryWithLiveBuffer(chatHistory);
      const data = await callMemoryChat({
        message: "지금까지 나눈 기억들을 반영한 이미지를 생성해주세요.",
        generateImage: true,
        currentHistory: historyForImage,
      });

      if (!data) return;

      if (!data.imageBase64) {
        toast.error("이미지가 생성되지 않았습니다. 다시 시도해주세요.");
        return;
      }

      const mime = data.imageMimeType ?? "image/png";

      // 이미지를 채팅 말풍선에 추가
      const aiMsgId = `ai-img-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: aiMsgId,
          role: "ai",
          content: data.text,
          imageBase64: data.imageBase64,
          imageMimeType: mime,
        },
      ]);

      // 히스토리 누적
      const newHistory: ChatTurn[] = [
        ...historyForImage,
        { role: "user", parts: [{ text: "이미지를 생성해주세요." }] },
        { role: "model", parts: [{ text: data.text }] },
      ];
      setChatHistory(newHistory);

      // 저장 화면용 마지막 이미지 갱신
      setGeneratedImageBase64(data.imageBase64);
      setGeneratedImageMime(mime);
      if (data.restorationId) setRestorationId(data.restorationId);

      setHasGeneratedImage(true);
    } catch (err) {
      toast.error((err as Error).message || "이미지 생성에 실패했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 기억 확정 → saved 화면
  const handleConfirm = () => {
    disconnectLive();
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

  // 분석 중 로딩
  if (step === "analyzing") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
        <div className="w-16 h-16 border-4 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
        <div className="text-center space-y-1">
          <p className="text-xl font-semibold text-foreground">사진을 살펴보고 있어요</p>
          <p className="text-base text-muted-foreground">잠시만 기다려주세요...</p>
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
            onClick={() => {
              disconnectLive();
              setStep("select");
            }}
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
            <div key={msg.id}>
              <ChatMessage role={msg.role} content={msg.content} />
              {msg.imageBase64 && (
                <div className="flex justify-start px-1 -mt-2 mb-4">
                  <div className="ml-11 rounded-2xl overflow-hidden shadow-md border border-violet-200 max-w-[78%]">
                    <Image
                      src={`data:${msg.imageMimeType};base64,${msg.imageBase64}`}
                      alt="복원된 기억 이미지"
                      width={300}
                      height={300}
                      className="object-cover w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
          {(chatLoading || isGenerating) && (
            <ChatMessage role="ai" content={isGenerating ? "기억을 이미지로 만들고 있어요..." : "..."} />
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 하단 버튼 영역 */}
        <div className="px-0 pb-2 flex flex-col gap-2">
          {hasGeneratedImage && (
            <Button
              onClick={handleConfirm}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-base shadow-md"
            >
              <Check className="size-5 mr-2" />
              기억 확정
            </Button>
          )}
          <Button
            onClick={handleGenerateImage}
            disabled={messages.length < 2 || chatLoading || isGenerating}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white font-semibold text-base shadow-md disabled:opacity-40"
          >
            <Sparkles className="size-5 mr-2" />
            {isGenerating ? "이미지 만드는 중..." : "이미지 만들기"}
          </Button>
        </div>

        {/* 입력 영역 */}
        <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm pt-3 pb-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs text-muted-foreground truncate">{liveStatus}</span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={isLiveConnected ? "default" : "outline"}
                onClick={() => {
                  if (!selectedImage) return;
                  if (isLiveConnected) {
                    disconnectLive();
                    return;
                  }
                  void connectLive(selectedImage).catch(() => {
                    toast.error("라이브 연결에 실패했습니다.");
                  });
                }}
                className="h-9 rounded-xl px-3"
                aria-label={isLiveConnected ? "라이브 종료" : "라이브 연결"}
              >
                <Radio className="size-4 mr-1.5" />
                {isLiveConnected ? "라이브 ON" : "라이브 OFF"}
              </Button>
              <Button
                type="button"
                variant={isLiveMicOn ? "default" : "outline"}
                onClick={() => void toggleLiveMic()}
                disabled={!isLiveConnected}
                className="h-9 rounded-xl px-3"
                aria-label={isLiveMicOn ? "라이브 마이크 중지" : "라이브 마이크 시작"}
              >
                {isLiveMicOn ? <MicOff className="size-4 mr-1.5" /> : <Mic className="size-4 mr-1.5" />}
                {isLiveMicOn ? "라이브 음성 ON" : "라이브 음성 OFF"}
              </Button>
            </div>
          </div>
          <div className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLiveConnected ? "라이브에 보낼 메시지를 입력하세요..." : "기억을 이야기해주세요..."}
              disabled={chatLoading || isGenerating}
              className="flex-1 resize-none text-lg min-h-[52px] max-h-32 rounded-2xl border-border/70 bg-muted/40 focus:bg-white pr-4 pl-4 transition-colors"
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || chatLoading || isGenerating}
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

function downsampleBuffer(buffer: Float32Array, inputRate: number, outputRate: number) {
  if (outputRate === inputRate) return buffer;
  const ratio = inputRate / outputRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLength);
  let offset = 0;

  for (let i = 0; i < newLength; i++) {
    const nextOffset = Math.round((i + 1) * ratio);
    let sum = 0;
    let count = 0;
    for (let j = offset; j < nextOffset && j < buffer.length; j++) {
      sum += buffer[j];
      count++;
    }
    result[i] = count ? sum / count : 0;
    offset = nextOffset;
  }
  return result;
}

function floatTo16BitPCM(float32: Float32Array) {
  const output = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return output;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function pcm16ToFloat32(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer);
  const float32 = new Float32Array(bytes.byteLength / 2);
  for (let i = 0; i < float32.length; i++) {
    const int16 = view.getInt16(i * 2, true);
    float32[i] = int16 / 0x8000;
  }
  return float32;
}

function parseSampleRate(mimeType: string) {
  const match = /rate=(\d+)/.exec(mimeType || "");
  return match ? Number(match[1]) : null;
}
