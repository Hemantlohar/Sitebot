"use client";

import { KeyboardEvent } from "react";
import { ArrowUp, Loader2 } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  sendMessage: () => void;
  loading: boolean;
  primaryColor: string;
  placeholder?: string;
}

export default function ChatInput({
  input,
  setInput,
  sendMessage,
  loading,
  primaryColor,
  placeholder = "Ask me anything...",
}: ChatInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (!loading && input.trim()) {
        sendMessage();
      }
    }
  };

  return (
    <div className="border-t bg-white p-4">
      <div className="rounded-3xl border border-slate-200 bg-white shadow-lg transition-all focus-within:border-slate-300 focus-within:shadow-xl">

        <textarea
          rows={1}
          value={input}
          placeholder={placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="max-h-40 min-h-[56px] w-full resize-none rounded-t-3xl bg-transparent px-5 py-4 text-[15px] outline-none"
        />

        <div className="flex items-center justify-between border-t border-slate-100 px-3 py-3">

          <span className="text-xs text-slate-400">
            Press <b>Enter</b> to send • <b>Shift + Enter</b> for new line
          </span>

          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: primaryColor,
            }}
          >
            {loading ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <ArrowUp size={18} />
            )}
          </button>

        </div>
      </div>
    </div>
  );
}