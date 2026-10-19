"use client";

import ReactMarkdown from "react-markdown";
import { Bot, User } from "lucide-react";
import { RefObject } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface MessageListProps {
  messages: ChatMessage[];
  typing: boolean;
  primaryColor: string;
  isDark: boolean;
  bottomRef: RefObject<HTMLDivElement | null>;
}

export default function MessageList({
  messages,
  typing,
  primaryColor,
  isDark,
  bottomRef,
}: MessageListProps) {
  return (
    <div
      className="h-[520px] overflow-y-auto px-5 py-6"
      style={{
        background: isDark ? "#09090b" : "#fafafa",
      }}
    >
      {messages.map((message, index) => {
        const isUser = message.role === "user";

        return (
          <div
            key={index}
            className={`mb-6 flex items-start gap-3 ${
              isUser ? "justify-end" : "justify-start"
            }`}
          >
            {!isUser && (
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow"
                style={{
                  background: primaryColor,
                }}
              >
                <Bot size={18} />
              </div>
            )}

            <div
              className={`max-w-[78%] rounded-2xl px-5 py-4 shadow-sm ${
                isUser
                  ? "text-white"
                  : isDark
                  ? "bg-zinc-800 text-white"
                  : "bg-white text-slate-800"
              }`}
              style={
                isUser
                  ? {
                      background: primaryColor,
                    }
                  : {}
              }
            >
              <div className="prose prose-sm max-w-none prose-p:my-2 prose-pre:rounded-xl prose-pre:bg-slate-900 prose-code:text-blue-500">
                <ReactMarkdown>
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>

            {isUser && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-200">
                <User size={18} />
              </div>
            )}
          </div>
        );
      })}

      {typing && (
        <div className="mb-6 flex items-start gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
            style={{
              background: primaryColor,
            }}
          >
            <Bot size={18} />
          </div>

          <div
            className={`rounded-2xl px-5 py-4 ${
              isDark ? "bg-zinc-800" : "bg-white"
            }`}
          >
            <div className="flex gap-2">
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-400" />
              <span
                className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-400"
                style={{
                  animationDelay: "0.2s",
                }}
              />
              <span
                className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-400"
                style={{
                  animationDelay: "0.4s",
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}