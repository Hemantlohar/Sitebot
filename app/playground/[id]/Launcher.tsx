"use client";

import { Bot, MessageCircle, X } from "lucide-react";

interface LauncherProps {
  open: boolean;
  toggle: () => void;
  primaryColor: string;
  unreadCount?: number;
}

export default function Launcher({
  open,
  toggle,
  primaryColor,
  unreadCount = 0,
}: LauncherProps) {
  return (
    <button
      onClick={toggle}
      className="group relative flex h-16 w-16 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
      style={{
        background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
      }}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-full opacity-30 blur-xl transition-all duration-300 group-hover:opacity-60"
        style={{
          background: primaryColor,
        }}
      />

      {/* Icon */}
      <div className="relative z-10 transition-transform duration-300 group-hover:rotate-6">
        {open ? (
          <X size={26} />
        ) : (
          <MessageCircle size={26} />
        )}
      </div>

      {/* Online Dot */}
      {!open && (
        <span className="absolute bottom-2 right-2 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
      )}

      {/* Unread Badge */}
      {!open && unreadCount > 0 && (
        <div className="absolute -right-1 -top-1 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white shadow-lg">
          {unreadCount > 99 ? "99+" : unreadCount}
        </div>
      )}

      {/* Tooltip */}
      {!open && (
        <div className="pointer-events-none absolute right-20 whitespace-nowrap rounded-xl bg-slate-900 px-3 py-2 text-sm text-white opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100">
          Chat with AI
        </div>
      )}
    </button>
  );
}