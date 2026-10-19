"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  SendHorizontal,
  MessageCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import Link from "next/link";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface BotConfig {
  id: string;
  bot_name: string;
  welcome_message: string;
  suggested_questions: string[];
  theme: string;
  primary_color: string;
  header_color: string;
  logo_url: string | null;
  widget_width?: number;
  border_radius?: number;
}

export default function PlaygroundPage() {
  const { id } = useParams();

  const [config, setConfig] = useState<BotConfig | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const visitorId = useRef(crypto.randomUUID());
  const conversationId = useRef(crypto.randomUUID());

  useEffect(() => {
    async function loadBot() {
      const res = await fetch(`/api/widget/${id}`);
      const data = await res.json();

      if (!data.success) return;

      setConfig(data.config);

      setMessages([
        {
          role: "assistant",
          content: data.config.welcome_message,
        },
      ]);
    }

    loadBot();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, typing]);

  async function sendMessage(question: string) {
    if (!question.trim() || loading || !config) return;

    const userMessage = {
      role: "user" as const,
      content: question,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setTyping(true);

    const history = [...messages, userMessage];

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        websiteId: id,
        visitorId: visitorId.current,
        conversationId: conversationId.current,
        question,
        history,
      }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    const replyChunks: string[] = [];

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "",
      },
    ]);

    while (true) {
      const { done, value } = await reader!.read();

      if (done) break;

      replyChunks.push(decoder.decode(value));
      const currentFullText = replyChunks.join("");

      setMessages((prev) => {
        const updated = [...prev];

        updated[updated.length - 1] = {
          role: "assistant",
          content: currentFullText,
        };

        return updated;
      });
    }

    setTyping(false);
    setLoading(false);
  }

  function clearChat() {
    conversationId.current = crypto.randomUUID();

    setMessages([
      {
        role: "assistant",
        content: config?.welcome_message || "",
      },
    ]);
  }

  const isDark = config?.theme === "dark";
  const primaryColor = config?.primary_color || "#2563eb";
  const headerColor = config?.header_color || "#2563eb";
  const widgetWidth = config?.widget_width || 350;
  const borderRadius = config?.border_radius || 12;
  const bubbleRadius = Math.min(borderRadius, 18);
  const hasUserMessages = messages.some((message) => message.role === "user");
  const suggestedQuestions = (config?.suggested_questions || []).slice(0, 4);

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="flex items-center justify-between border-b bg-white px-4 py-2.5">
        <Link
          href={`/dashboard/${id}`}
          className="flex items-center gap-1.5 text-sm text-zinc-600 transition hover:text-zinc-900"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <button
          type="button"
          onClick={clearChat}
          disabled={!config}
          className="flex items-center gap-1.5 text-sm text-zinc-600 transition hover:text-zinc-900 disabled:opacity-50"
        >
          <Trash2 size={14} />
          Clear chat
        </button>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 p-6 md:p-8">
        <div className="absolute left-6 top-5 flex gap-2 opacity-50">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
        </div>

        <div className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center pt-8">
          {!config ? (
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          ) : (
            <>
              <div
                className="transition-all duration-300"
                style={{
                  width: `${Math.min(widgetWidth, 420)}px`,
                  maxWidth: "100%",
                  borderRadius: `${borderRadius}px`,
                  backgroundColor: isDark ? "#18181b" : "#ffffff",
                  color: isDark ? "#ffffff" : "#111827",
                  overflow: "hidden",
                  boxShadow: "0 25px 60px rgba(0,0,0,0.22)",
                }}
              >
                <div
                  className="flex items-center gap-3 px-4 py-4 text-white transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${headerColor}, ${primaryColor})`,
                  }}
                >
                  {config.logo_url ? (
                    <img
                      src={config.logo_url}
                      alt="Bot logo"
                      className="h-11 w-11 rounded-full bg-white object-cover ring-2 ring-white/30"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
                      <Bot size={22} />
                    </div>
                  )}

                  <div>
                    <p className="text-[15px] font-semibold">
                      {config.bot_name || "AI Assistant"}
                    </p>

                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-green-400" />
                      <span className="text-xs opacity-90">Online</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={clearChat}
                    className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-xl transition hover:bg-white/10"
                    aria-label="Clear chat"
                  >
                    ×
                  </button>
                </div>

                <div
                  className="h-[360px] overflow-y-auto p-4 transition-all duration-300"
                  style={{
                    backgroundColor: isDark ? "#09090b" : "#ffffff",
                  }}
                >
                  {messages.map((message, index) => {
                    const isLast = index === messages.length - 1;
                    const isEmptyAssistant =
                      message.role === "assistant" && !message.content.trim();
                    const showTypingBubble =
                      isLast && isEmptyAssistant && typing;

                    if (isEmptyAssistant && !showTypingBubble) {
                      return null;
                    }

                    return (
                      <div
                        key={`${message.role}-${index}`}
                        className={`flex ${
                          index > 0 ? "mt-5" : ""
                        } ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`px-4 py-3 text-sm leading-relaxed shadow-sm transition-all duration-300 ${
                            message.role === "user"
                              ? "max-w-[78%] text-white"
                              : "max-w-[85%]"
                          }`}
                          style={{
                            backgroundColor:
                              message.role === "user"
                                ? primaryColor
                                : isDark
                                  ? "#27272a"
                                  : "#f1f5f9",
                            color:
                              message.role === "user"
                                ? "#ffffff"
                                : isDark
                                  ? "#ffffff"
                                  : "#111827",
                            borderRadius: `${bubbleRadius}px`,
                          }}
                        >
                          {showTypingBubble ? (
                            <div className="flex gap-1.5">
                              <span
                                className="h-2 w-2 rounded-full animate-bounce"
                                style={{
                                  backgroundColor: isDark
                                    ? "#a1a1aa"
                                    : "#94a3b8",
                                }}
                              />
                              <span
                                className="h-2 w-2 rounded-full animate-bounce"
                                style={{
                                  backgroundColor: isDark
                                    ? "#a1a1aa"
                                    : "#94a3b8",
                                  animationDelay: "0.2s",
                                }}
                              />
                              <span
                                className="h-2 w-2 rounded-full animate-bounce"
                                style={{
                                  backgroundColor: isDark
                                    ? "#a1a1aa"
                                    : "#94a3b8",
                                  animationDelay: "0.4s",
                                }}
                              />
                            </div>
                          ) : (
                            <span className="whitespace-pre-wrap">
                              {message.content}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {!hasUserMessages && suggestedQuestions.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {suggestedQuestions.map((question, index) => (
                        <button
                          key={`${question}-${index}`}
                          type="button"
                          onClick={() => sendMessage(question)}
                          disabled={loading}
                          className="rounded-full border px-3 py-2 text-left text-xs transition-all duration-300 hover:opacity-75 disabled:opacity-50"
                          style={{
                            borderColor: primaryColor,
                            color: primaryColor,
                            backgroundColor: isDark
                              ? "rgba(255,255,255,0.04)"
                              : "#ffffff",
                          }}
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  )}

                  <div ref={bottomRef} />
                </div>

                <div
                  className="flex gap-2 border-t p-3 transition-all duration-300"
                  style={{
                    backgroundColor: isDark ? "#18181b" : "#ffffff",
                    borderColor: isDark ? "#3f3f46" : "#e5e7eb",
                  }}
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        sendMessage(input);
                      }
                    }}
                    disabled={loading}
                    placeholder={`Message ${config.bot_name || "AI Assistant"}...`}
                    className="min-w-0 flex-1 rounded-xl border px-4 py-3 text-sm outline-none disabled:opacity-60"
                    style={{
                      backgroundColor: isDark ? "#27272a" : "#f8fafc",
                      color: isDark ? "#ffffff" : "#111827",
                      borderColor: isDark ? "#3f3f46" : "#e5e7eb",
                    }}
                  />

                  <button
                    type="button"
                    disabled={loading || !input.trim()}
                    onClick={() => sendMessage(input)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:opacity-60"
                    style={{
                      backgroundColor: primaryColor,
                    }}
                  >
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <SendHorizontal size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div
                className="mt-6 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full text-white shadow-xl transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: primaryColor,
                  padding: 0,
                  boxSizing: "border-box",
                }}
              >
                {config.logo_url ? (
                  <img
                    src={config.logo_url}
                    alt="Bot launcher"
                    className="block h-full w-full rounded-full object-cover object-center"
                    style={{
                      margin: 0,
                      padding: 0,
                    }}
                  />
                ) : (
                  <MessageCircle size={27} />
                )}
              </div>

              <p className="mt-3 text-xs text-zinc-500">
                Widget launcher preview
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
