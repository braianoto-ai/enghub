"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Loader2, ChevronDown, ChevronUp, X } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  tenantId: string;
  area?: string;
}

export function AiQuoteAssistant({ tenantId, area }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: "Olá! Posso ajudar você a descrever seu projeto para que o profissional entenda exatamente o que você precisa. Me conta: o que você quer fazer?",
      }]);
    }
  }, [open, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/quote-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, tenantId, area }),
      });

      if (!res.ok || !res.body) throw new Error();

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      const assistantMsg: Message = { role: "assistant", content: "" };
      setMessages((prev) => [...prev, assistantMsg]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: text };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Ocorreu um erro. Tente novamente." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-purple-200 dark:border-purple-800">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-purple-500" />
          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
            Assistente IA — não sabe o que escrever?
          </span>
        </div>
        {open ? <ChevronUp size={14} className="text-purple-400" /> : <ChevronDown size={14} className="text-purple-400" />}
      </button>

      {open && (
        <div className="border-t border-purple-100 dark:border-purple-800">
          <div className="flex h-56 flex-col gap-2 overflow-y-auto px-4 py-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gray-700 text-white"
                    : "bg-purple-50 text-purple-900 dark:bg-purple-900/30 dark:text-purple-100"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-xl bg-purple-50 px-3 py-2 dark:bg-purple-900/30">
                  <Loader2 size={13} className="animate-spin text-purple-400" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="flex items-center gap-2 border-t border-purple-100 px-3 py-2 dark:border-purple-800">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
              placeholder="Descreva o que você precisa..."
              className="flex-1 rounded-lg border border-purple-200 bg-transparent px-3 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-purple-400 focus:outline-none dark:border-purple-700 dark:text-zinc-100"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-40"
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
