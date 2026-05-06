"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import { Send, MessageCircle, Phone, Globe, ExternalLink, CheckCheck, Loader2 } from "lucide-react";
import Image from "next/image";
import { getInitials } from "@/lib/utils";

interface Message {
  id: string;
  sender: "visitor" | "professional";
  content: string;
  created_at: string;
  read: boolean;
}

interface ChatClientProps {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  avatarUrl: string | null;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
}

export function ChatClient({
  tenantId,
  tenantName,
  avatarUrl,
  phone,
  whatsapp,
  website,
}: ChatClientProps) {
  const t = useTranslations("contact");
  const supabase = createClient();
  const storageKey = `conv_${tenantId}`;

  const [step, setStep] = useState<"form" | "chat">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load existing conversation from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setConversationId(saved);
      setStep("chat");
    }
  }, [storageKey]);

  // Load messages when conversationId is set
  const loadMessages = useCallback(async (convId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("id, sender, content, created_at, read")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as Message[]);
  }, [supabase]);

  useEffect(() => {
    if (!conversationId) return;
    loadMessages(conversationId);
  }, [conversationId, loadMessages]);

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, supabase]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !firstMessage.trim()) return;
    setStarting(true);
    setError("");

    const { data: conv, error: convErr } = await supabase
      .from("conversations")
      .insert({
        tenant_id: tenantId,
        visitor_name: name.trim(),
        visitor_email: email.trim(),
        visitor_phone: phoneInput.trim() || null,
        status: "open",
        last_message_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (convErr || !conv) {
      setError("Erro ao iniciar conversa. Tente novamente.");
      setStarting(false);
      return;
    }

    await supabase.from("messages").insert({
      conversation_id: conv.id,
      tenant_id: tenantId,
      sender: "visitor",
      content: firstMessage.trim(),
      read: false,
    });

    // Notification
    await supabase.from("notifications").insert({
      tenant_id: tenantId,
      type: "message",
      title: `Nova mensagem de ${name.trim()}`,
      body: firstMessage.slice(0, 120),
      href: "/dashboard/mensagens",
      read: false,
    });

    localStorage.setItem(storageKey, conv.id);
    setConversationId(conv.id);
    setStep("chat");
    setStarting(false);
  }

  async function handleSend() {
    if (!input.trim() || !conversationId || sending) return;
    setSending(true);
    const content = input.trim();
    setInput("");

    await supabase.from("messages").insert({
      conversation_id: conversationId,
      tenant_id: tenantId,
      sender: "visitor",
      content,
      read: false,
    });

    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId);

    setSending(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const initials = getInitials(tenantName);
  const whatsappLink = whatsapp
    ? `https://wa.me/55${whatsapp.replace(/\D/g, "")}`
    : null;

  // ── STEP: FORM ──
  if (step === "form") {
    return (
      <div className="space-y-6">
        {/* Direct contact options */}
        {(whatsapp || phone || website) && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("direct_contact")}</h3>
            <div className="space-y-2">
              {whatsappLink && (
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 transition-colors hover:bg-green-100 dark:border-green-800/40 dark:bg-green-900/10 dark:text-green-400">
                  <MessageCircle size={18} />
                  <div>
                    <p className="text-sm font-medium">{t("whatsapp")}</p>
                    <p className="text-xs opacity-80">{whatsapp}</p>
                  </div>
                </a>
              )}
              {phone && (
                <a href={`tel:${phone}`}
                  className="flex items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">
                  <Phone size={18} />
                  <div>
                    <p className="text-sm font-medium">{t("phone")}</p>
                    <p className="text-xs opacity-80">{phone}</p>
                  </div>
                </a>
              )}
              {website && (
                <a href={website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">
                  <Globe size={18} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t("website")}</p>
                    <p className="text-xs opacity-80 truncate">{website}</p>
                  </div>
                  <ExternalLink size={13} className="shrink-0 opacity-50" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Start conversation form */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-100">{t("title")}</h3>
          <p className="mb-5 text-sm text-zinc-500 dark:text-zinc-400">{t("subtitle")}</p>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleStart} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">{t("name")} *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required placeholder={t("name")}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">{t("email")} *</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder="seu@email.com"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">{t("phone")}</label>
              <input value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} type="tel" placeholder="(11) 99999-9999"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">{t("message")} *</label>
              <textarea value={firstMessage} onChange={(e) => setFirstMessage(e.target.value)} required rows={4}
                placeholder={`Olá ${tenantName.split(" ")[0]}, gostaria de...`}
                className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
            </div>
            <button type="submit" disabled={starting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-600 disabled:opacity-60">
              {starting ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
              {starting ? t("sending") : t("send")}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── STEP: CHAT ──
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 flex flex-col" style={{ height: "calc(100vh - 240px)", minHeight: "480px" }}>
      {/* Chat header */}
      <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-500 to-gray-700 text-sm font-bold text-white overflow-hidden">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={tenantName} fill className="object-cover" />
          ) : (
            initials
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{tenantName}</p>
          <p className="flex items-center gap-1 text-xs text-green-500">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
            {t("responds_soon")}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-zinc-400">{t("sending")}...</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "visitor" ? "justify-end" : "justify-start"}`}>
            {msg.sender === "professional" && (
              <div className="relative mr-2 flex h-7 w-7 shrink-0 items-center justify-center self-end rounded-full bg-gradient-to-br from-gray-500 to-gray-700 text-xs font-bold text-white overflow-hidden">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={tenantName} fill className="object-cover" />
                ) : (
                  initials
                )}
              </div>
            )}
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
              msg.sender === "visitor"
                ? "rounded-br-sm bg-gray-700 text-white"
                : "rounded-bl-sm bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
            }`}>
              <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <p className={`mt-1 text-[10px] ${msg.sender === "visitor" ? "text-gray-300" : "text-zinc-400"}`}>
                {new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                {msg.sender === "visitor" && (
                  <CheckCheck size={11} className="inline ml-1 opacity-70" />
                )}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-100 p-3 dark:border-zinc-800">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={t("message") + "... (Enter)"}
            className="flex-1 resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            style={{ maxHeight: "120px" }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 120) + "px";
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-700 text-white transition-colors hover:bg-gray-600 disabled:opacity-40"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-zinc-400">{t("enter_hint")}</p>
      </div>
    </div>
  );
}
