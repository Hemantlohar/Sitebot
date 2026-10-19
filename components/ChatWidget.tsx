"use client";
import ReactMarkdown from "react-markdown";
import {
  useState,
  useEffect,
  useRef,
} from "react";

interface ChatWidgetProps {
  botName: string;
  messages: {
    sender: string;
    text: string;
  }[];
  onSendMessage: (message: string) => void;
}

export default function ChatWidget({
  botName,
  messages,
  onSendMessage,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [input, setInput] = useState("");

  const messagesEndRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  function handleSend() {
    if (!input.trim()) return;

    onSendMessage(input);
    setInput("");
  }

  if (!isOpen) {
    return (
      <button
  onClick={() => setIsOpen(true)}
  className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white w-16 h-16 rounded-full shadow-2xl text-2xl transition hover:scale-110"
>
  💬
</button>
    );
  }

  return (
<div className="fixed bottom-5 right-5 w-[370px] max-w-[95vw] h-[600px] max-h-[85vh] bg-zinc-900 text-white border border-zinc-700 rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300">
      {/* Header */}
<div className="bg-zinc-900 px-5 py-4 flex justify-between items-center border-b border-zinc-700">       
<span className="font-bold text-lg">          💬 {botName}
        </span>

        <button
          onClick={() => setIsOpen(false)}
          className="text-zinc-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-zinc-950">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-3 flex ${
              msg.sender === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div

  className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-6 shadow ${                
    msg.sender === "user"
  ? "bg-blue-600 text-white rounded-br-md"
  : "bg-zinc-800 text-zinc-100 rounded-bl-md"
              }`}
            >
  <ReactMarkdown>
  {msg.text}
</ReactMarkdown>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-700 p-3 flex gap-2 bg-zinc-900">
        <input
          type="text"
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          placeholder="Ask anything..."
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
        />

        <button
          onClick={handleSend}
className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl text-white font-medium transition"        >
          Send
        </button>
      </div>
    </div>
  );
}