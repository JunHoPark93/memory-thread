const http = require("http");
const next = require("next");
const { WebSocketServer } = require("ws");
const { GoogleGenAI, Modality } = require("@google/genai");
require("dotenv").config();

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT || 3000);
const hostname = process.env.HOSTNAME || "0.0.0.0";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const liveModel =
  process.env.GEMINI_LIVE_MODEL || "gemini-2.5-flash-native-audio-preview-12-2025";

if (!apiKey) {
  console.error("Missing GEMINI_API_KEY in environment.");
}

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

app
  .prepare()
  .then(() => {
    const server = http.createServer((req, res) => handle(req, res));
    const wss = new WebSocketServer({ server, path: "/live" });

    wss.on("connection", (ws) => {
      if (!ai) {
        ws.close(1011, "Missing API key");
        return;
      }

      let session = null;
      let closed = false;
      let heartbeat = null;

      console.log("[live] ws connected");
      ws.isAlive = true;
      ws.on("pong", () => {
        ws.isAlive = true;
      });

      heartbeat = setInterval(() => {
        if (ws.readyState !== ws.OPEN) return;
        if (!ws.isAlive) {
          ws.terminate();
          return;
        }
        ws.isAlive = false;
        ws.ping();
      }, 20000);

      ai.live
        .connect({
          model: liveModel,
          systemInstruction: {
            parts: [{ text: "모든 응답을 한국어로 해주세요." }]
          },
          config: {
            responseModalities: [Modality.AUDIO],
            outputAudioTranscription: {},
            inputAudioTranscription: {},
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } }
            }
          },
          callbacks: {
            onopen: () => {
              if (closed) return;
              safeWsSend(ws, { type: "ready" });
              console.log("[live] session open");
            },
            onmessage: (message) => {
              if (closed) return;
              handleLiveMessage(ws, message);
            },
            onerror: (err) => {
              if (closed) return;
              safeWsSend(ws, { type: "error", error: String(err?.message || err) });
              console.error("[live] session error", err);
            },
            onclose: () => {
              if (closed) return;
              safeWsSend(ws, { type: "closed" });
              ws.close();
              console.log("[live] session closed");
            }
          }
        })
        .then((liveSession) => {
          session = liveSession;
        })
        .catch((err) => {
          safeWsSend(ws, { type: "error", error: String(err?.message || err) });
          ws.close();
        });

      ws.on("message", async (raw) => {
        if (!session) return;
        let msg;
        try {
          msg = JSON.parse(raw.toString());
        } catch {
          return;
        }

        if (msg.type === "ping") {
          safeWsSend(ws, { type: "pong" });
          return;
        }

        if (msg.type === "audio" && msg.data) {
          try {
            await session.sendRealtimeInput({
              audio: { data: msg.data, mimeType: msg.mimeType || "audio/pcm;rate=16000" }
            });
          } catch {}
          return;
        }

        if (msg.type === "text" && msg.text) {
          try {
            await session.sendClientContent({
              turns: [{ role: "user", parts: [{ text: String(msg.text) }] }],
              turnComplete: true
            });
          } catch {}
        }

        if (msg.type === "end_turn") {
          try {
            await session.sendClientContent({ turnComplete: true });
          } catch {}
        }
      });

      ws.on("close", (code, reason) => {
        closed = true;
        if (heartbeat) {
          clearInterval(heartbeat);
          heartbeat = null;
        }
        if (session) {
          try {
            session.close();
          } catch {}
        }
        console.log("[live] ws closed", code, reason?.toString() || "");
      });

      ws.on("error", (err) => {
        console.error("[live] ws error", err);
      });
    });

    server.listen(port, hostname, () => {
      console.log(`Server running on http://${hostname}:${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

function handleLiveMessage(ws, message) {
  const serverContent = message?.serverContent;
  if (!serverContent) return;

  if (serverContent.interrupted) {
    safeWsSend(ws, { type: "interrupted" });
  }

  const inputText = serverContent.inputTranscription?.text;
  if (inputText) {
    safeWsSend(ws, { type: "input_transcript", text: inputText });
  }

  const outputText = serverContent.outputTranscription?.text;
  if (outputText) {
    safeWsSend(ws, { type: "output_transcript", text: outputText });
  }

  const parts = serverContent.modelTurn?.parts;
  if (Array.isArray(parts)) {
    for (const part of parts) {
      const inline = part?.inlineData;
      if (inline?.data) {
        safeWsSend(ws, {
          type: "audio",
          data: inline.data,
          mimeType: inline.mimeType || "audio/pcm;rate=24000"
        });
      }
    }
  }
}

function safeWsSend(ws, obj) {
  try {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(obj));
    }
  } catch {}
}
