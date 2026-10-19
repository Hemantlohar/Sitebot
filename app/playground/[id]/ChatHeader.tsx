"use client";

import { Bot, Sparkles, RotateCcw, X } from "lucide-react";

interface ChatHeaderProps {
  botName: string;
  logoUrl?: string | null;
  primaryColor: string;
  headerColor: string;
  onReset: () => void;
}

export default function ChatHeader({
  botName,
  logoUrl,
  primaryColor,
  headerColor,
  onReset,
}: ChatHeaderProps) {
  return (
    <div
      className="relative overflow-hidden border-b"
      style={{
        background: `linear-gradient(135deg, ${headerColor}, ${primaryColor})`,
      }}
    >
      {/* Background Glow */}
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-3xl" />

      <div className="relative flex items-center gap-4 px-6 py-5">

        {/* Avatar */}

        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Bot"
            className="h-14 w-14 rounded-2xl object-cover ring-2 ring-white/30"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">

            <Bot size={28} className="text-white" />

          </div>
        )}

        {/* Title */}

        <div className="flex-1">

          <div className="flex items-center gap-2">

            <h2 className="text-lg font-semibold text-white">

              {botName || "AI Assistant"}

            </h2>

            <Sparkles
              size={16}
              className="text-yellow-300"
            />

          </div>

          <div className="mt-1 flex items-center gap-2">

            <span className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse" />

            <span className="text-sm text-white/90">

              Online • Ready to help

            </span>

          </div>

        </div>

        {/* Buttons */}

        <button
          onClick={onReset}
          className="rounded-xl bg-white/10 p-2 text-white transition hover:bg-white/20"
          title="Clear conversation"
        >
          <RotateCcw size={18} />
        </button>

        <button
          className="rounded-xl bg-white/10 p-2 text-white transition hover:bg-white/20"
          title="Close"
        >
          <X size={18} />
        </button>

      </div>
    </div>
  );
}