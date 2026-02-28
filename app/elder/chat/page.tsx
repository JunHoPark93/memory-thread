"use client";

import { useState, useRef, useEffect, type MutableRefObject } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { toast } from "sonner";
import ChatMessage from "@/app/_components/ChatMessage";
import { getElderSession, getElderName } from "@/app/_lib/session";
import { GoogleGenAI, Modality, type LiveServerMessage, type Session } from "@google/genai";

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
  const [liveStatus, setLiveStatus] = useState("라이브 연결 안 됨");
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [elderId, setElderId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [elderName, setElderName] = useState<string>("어르신");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const liveSessionRef = useRef<Session | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const shouldReconnectRef = useRef(false);
  const wantMicRef = useRef(false);
  const micStreamRef = useRef<MediaStream | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const silenceRef = useRef<GainNode | null>(null);
  const playbackCtxRef = useRef<AudioContext | null>(null);
  const playbackTimeRef = useRef(0);
  const liveUserIdRef = useRef<string | null>(null);
  const liveAiIdRef = useRef<string | null>(null);

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

  useEffect(() => {
    return () => {
      disconnectLive();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const connectLive = async () => {
    if (!elderId) {
      toast.error("라이브 연결 전에 로그인 상태를 확인해 주세요.");
      return;
    }
    if (liveSessionRef.current) return;
    shouldReconnectRef.current = true;
    setLiveStatus("라이브 연결 중...");

    try {
      const tokenRes = await fetch("/api/live/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elderId, elderName })
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData?.token || !tokenData?.model) {
        setLiveStatus(`오류: ${tokenData?.error || "토큰 발급 실패"}`);
        return;
      }

      const ai = new GoogleGenAI({
        apiKey: tokenData.token,
        httpOptions: { apiVersion: "v1alpha" }
      });

      const session = await ai.live.connect({
        model: tokenData.model,
        config: {
          responseModalities: [Modality.AUDIO]
        },
        callbacks: {
          onopen: () => {
            setLiveStatus("라이브 준비 완료");
            setIsLiveConnected(true);
            reconnectAttemptsRef.current = 0;
            if (wantMicRef.current && !isMicOn) {
              startMic();
            }
          },
          onmessage: (msg) => {
            handleLiveServerMessage(msg);
          },
          onerror: () => {
            setLiveStatus("라이브 연결 오류");
          },
          onclose: (event) => {
            liveSessionRef.current = null;
            setIsLiveConnected(false);
            setIsMicOn(false);
            setLiveStatus(
              `라이브 연결 끊김 (code ${event.code}${event.reason ? `: ${event.reason}` : ""})`
            );
            stopMic();
            if (shouldReconnectRef.current) {
              scheduleReconnect();
            }
          }
        }
      });

      liveSessionRef.current = session;
    } catch {
      setLiveStatus("라이브 연결 실패");
      if (shouldReconnectRef.current) {
        scheduleReconnect();
      }
    }
  };

  const disconnectLive = () => {
    shouldReconnectRef.current = false;
    if (liveSessionRef.current) {
      liveSessionRef.current.close();
      liveSessionRef.current = null;
    }
    liveUserIdRef.current = null;
    liveAiIdRef.current = null;
    stopReconnect();
    stopMic();
    setIsLiveConnected(false);
    setLiveStatus("라이브 연결 안 됨");
  };

  const startMic = async () => {
    if (!liveSessionRef.current) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setLiveStatus("이 브라우저는 마이크를 지원하지 않습니다");
      return;
    }
    wantMicRef.current = true;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    micStreamRef.current = stream;
    const AudioCtx =
      window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      setLiveStatus("이 브라우저는 오디오 처리를 지원하지 않습니다");
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
            mimeType: "audio/pcm;rate=16000"
          }
        });
      }
    };

    inputSource.connect(processor);
    processor.connect(silence);
    silence.connect(inputCtx.destination);

    setIsMicOn(true);
    setLiveStatus("마이크 스트리밍 중");
  };

  const stopMic = () => {
    wantMicRef.current = false;
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

    setIsMicOn(false);
    if (isLiveConnected) {
      setLiveStatus("라이브 연결됨");
    }
  };

  const scheduleReconnect = () => {
    if (reconnectTimerRef.current) return;
    const attempt = reconnectAttemptsRef.current + 1;
    reconnectAttemptsRef.current = attempt;
    const delay = Math.min(10000, 1000 * Math.pow(2, attempt - 1));
    setLiveStatus(`라이브 재연결 중... (${Math.round(delay / 1000)}s)`);
    reconnectTimerRef.current = window.setTimeout(() => {
      reconnectTimerRef.current = null;
      connectLive();
    }, delay);
  };

  const stopReconnect = () => {
    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    reconnectAttemptsRef.current = 0;
  };

  const handleLiveServerMessage = (msg: LiveServerMessage) => {
    const serverContent = msg.serverContent;
    if (!serverContent) return;

    if (serverContent.interrupted) {
      resetPlayback();
    }

    const inputText = serverContent.inputTranscription?.text;
    if (inputText) {
      upsertLiveMessage("user", inputText, liveUserIdRef);
    }

    const outputText = serverContent.outputTranscription?.text;
    if (outputText) {
      upsertLiveMessage("ai", outputText, liveAiIdRef);
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

  const upsertLiveMessage = (
    role: "ai" | "user",
    text: string,
    idRef: MutableRefObject<string | null>
  ) => {
    if (!text) return;
    if (!idRef.current) {
      const id = `live-${role}-${Date.now()}`;
      idRef.current = id;
      setMessages((prev) => [...prev, { id, role, content: text }]);
      return;
    }
    const id = idRef.current;
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, content: text } : m))
    );
  };

  const playPcmChunk = (base64: string, mimeType: string) => {
    const rate = parseSampleRate(mimeType) || 24000;
    if (!playbackCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
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

  const resetPlayback = () => {
    if (!playbackCtxRef.current) return;
    playbackTimeRef.current = playbackCtxRef.current.currentTime;
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
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Button
            type="button"
            onClick={isLiveConnected ? disconnectLive : connectLive}
            className="rounded-full"
          >
            {isLiveConnected ? "라이브 종료" : "라이브 연결"}
          </Button>
          <Button
            type="button"
            onClick={isMicOn ? stopMic : startMic}
            disabled={!isLiveConnected}
            className="rounded-full"
          >
            {isMicOn ? "마이크 중지" : "마이크 시작"}
          </Button>
          <span className="text-xs text-muted-foreground">{liveStatus}</span>
        </div>
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
