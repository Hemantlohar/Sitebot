"use client";

import { SendHorizontal, Bot, MessageCircle } from "lucide-react";

interface WidgetPreviewProps {
  botName: string;
  welcomeMessage: string;
  logoUrl?: string;
  theme?: string;
  primaryColor?: string;
  headerColor?: string;
  widgetWidth?: number;
  borderRadius?: number;

  // NEW: actual suggested questions from Bot Settings
  suggestedQuestions?: string[];
}

export default function WidgetPreview({
  botName,
  welcomeMessage,
  logoUrl,
  theme = "light",
  primaryColor = "#2563eb",
  headerColor = "#2563eb",
  widgetWidth = 350,
  borderRadius = 12,
  suggestedQuestions = [],
}: WidgetPreviewProps) {
  const isDark = theme === "dark";

  // Use real questions if available.
  // Otherwise show sample preview questions.
  const previewQuestions =
    suggestedQuestions.length > 0
      ? suggestedQuestions.slice(0, 4)
      : [
          "Tell me about your products",
          "How can you help me?",
          "What are your features?",
        ];

  return (
    <div className="w-full">
      {/* Preview Stage */}

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 p-6 md:p-8">
        {/* Browser-style background decoration */}

        <div className="absolute left-6 top-5 flex gap-2 opacity-50">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
        </div>

        <div className="flex min-h-[650px] flex-col items-center justify-center pt-8">
          {/* Chat Widget */}

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
            {/* Header */}

            <div
              className="flex items-center gap-3 px-4 py-4 text-white transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${headerColor}, ${primaryColor})`,
              }}
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
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
                  {botName || "AI Assistant"}
                </p>

                <div className="mt-1 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-400" />

                  <span className="text-xs opacity-90">
                    Online
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-xl transition hover:bg-white/10"
              >
                ×
              </button>
            </div>

            {/* Chat Area */}

            <div
              className="h-[360px] overflow-y-auto p-4 transition-all duration-300"
              style={{
                backgroundColor: isDark ? "#09090b" : "#ffffff",
              }}
            >
              {/* Welcome Message */}

              <div className="flex justify-start">
                <div
                  className="max-w-[85%] px-4 py-3 text-sm leading-relaxed shadow-sm transition-all duration-300"
                  style={{
                    backgroundColor: isDark ? "#27272a" : "#f1f5f9",
                    color: isDark ? "#ffffff" : "#111827",
                    borderRadius: `${Math.min(borderRadius, 18)}px`,
                  }}
                >
                  {welcomeMessage || "Hi! How can I help you today?"}
                </div>
              </div>

              {/* Fake User Message */}

              <div className="mt-5 flex justify-end">
                <div
                  className="max-w-[78%] px-4 py-3 text-sm leading-relaxed text-white shadow-sm transition-all duration-300"
                  style={{
                    backgroundColor: primaryColor,
                    borderRadius: `${Math.min(borderRadius, 18)}px`,
                  }}
                >
{previewQuestions[0] || "Tell me about your products."}                </div>
              </div>

              {/* Fake AI Response */}

              <div className="mt-5 flex justify-start">
                <div
                  className="max-w-[85%] px-4 py-3 text-sm leading-relaxed shadow-sm transition-all duration-300"
                  style={{
                    backgroundColor: isDark ? "#27272a" : "#f1f5f9",
                    color: isDark ? "#ffffff" : "#111827",
                    borderRadius: `${Math.min(borderRadius, 18)}px`,
                  }}
                >
                  I can help you explore products, features, pricing, and
                  information available in the website knowledge base.
                </div>
              </div>

              {/* Suggested Questions */}

              <div className="mt-5 flex flex-wrap gap-2">
                {previewQuestions.map((question, index) => (
                  <button
                    key={`${question}-${index}`}
                    type="button"
                    className="rounded-full border px-3 py-2 text-left text-xs transition-all duration-300 hover:opacity-75"
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
            </div>

            {/* Input Area */}

            <div
              className="flex gap-2 border-t p-3 transition-all duration-300"
              style={{
                backgroundColor: isDark ? "#18181b" : "#ffffff",
                borderColor: isDark ? "#3f3f46" : "#e5e7eb",
              }}
            >
              <input
                disabled
                placeholder="Message AI Assistant..."
                className="min-w-0 flex-1 rounded-xl border px-4 py-3 text-sm outline-none"
                style={{
                  backgroundColor: isDark ? "#27272a" : "#f8fafc",
                  color: isDark ? "#ffffff" : "#111827",
                  borderColor: isDark ? "#3f3f46" : "#e5e7eb",
                }}
              />

              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: primaryColor,
                }}
              >
                <SendHorizontal size={18} />
              </button>
            </div>
          </div>

          {/* Floating Launcher Preview */}

<div
  className="
    mt-6
    flex
    h-16
    w-16
    shrink-0
    items-center
    justify-center
    overflow-hidden
    rounded-full
    text-white
    shadow-xl
    transition-all
    duration-300
    hover:scale-105
  "
  style={{
    backgroundColor: primaryColor,
    padding: 0,
    boxSizing: "border-box",
  }}
>
  {logoUrl ? (
    <img
      src={logoUrl}
      alt="Bot launcher"
      className="
        block
        h-full
        w-full
        rounded-full
        object-cover
        object-center
      "
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
        </div>
      </div>
    </div>
  );
}