"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send, Inbox, Circle, CheckCheck, Loader2, Search } from "lucide-react";

interface Conversation {
  id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string | null;
  status: string;
  last_message_at: string;
  unread_count?: number;
  last_preview?: string;
}

interface Message {
  id: string;
  sender: "visitor" | "professional";
  content: string;
  created_at: string;
  read: boolean;
}

interface MensagensClientProps {
  tenantId: string;
}

export function MensagensClient({ tenantId }: MensagensClientProps) {
  const supabase = createClient();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load conversations
  const loadConversations = useCallback(async () => {
    const { data } = await supabase
      .from("conversations")
      .select("id, visitor_name, visitor_email, visitor_phone, status, last_message_at")
      .eq("tenant_id", tenantId)
      .order("last_message_at", { ascending: false });

    if (!data) return;

    // Get unread counts + last preview
    const enriched = await Promise.all(
      data.map(async (conv) => {
        const { data: msgs } = await supabase
          .from("messages")
          .select("content, read, sender")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1);

        const last = msgs?.[0];
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .eq("sender", "visitor")
          .eq("read", false);

        return {
          ...conv,
          unread_count: count ?? 0,
          last_preview: last?.content ?? "",
        };
      })
    );

    setConversations(enriched);
  }, [supabase, tenantId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Realtime: new conversations
  useEffect(() => {
    const channel = supabase
      .channel(`conversations:${tenantId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "conversations",
        filter: `tenant_id=eq.${tenantId}`,
      }, () => { loadConversations(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [tenantId, supabase, loadConversations]);

  // Load messages for selected conversation
  const loadMessages = useCallback(async (convId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("id, sender, content, created_at, read")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as Message[]);

    // Mark visitor messages as read
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("conversation_id", convId)
      .eq("sender", "visitor")
      .eq("read", false);

    // Reload conversations to update unread count
    loadConversations();
  }, [supabase, loadConversations]);

  useEffect(() => {
    if (!selected) return;
    loadMessages(selected.id);
  }, [selected, loadMessages]);

  // Realtime: messages in selected conversation
  useEffect(() => {
    if (!selected) return;

    const channel = supabase
      .channel(`msgs:${selected.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${selected.id}`,
      }, async (payload) => {
        const newMsg = payload.new as Message;
        setMessages((prev) => {
          if (prev.find((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        // Mark as read if from visitor
        if (newMsg.sender === "visitor") {
          await supabase
            .from("messages")
            .update({ read: true })
            .eq("id", newMsg.id);
          loadConversations();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selected, supabase, loadConversations]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || !selected || sending) return;
    setSending(true);
    const content = input.trim();
    setInput("");

    await supabase.from("messages").insert({
      conversation_id: selected.id,
      tenant_id: tenantId,
      sender: "professional",
      content,
      read: false,
    });

    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", selected.id);

    setSending(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `${mins}min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  }

  const filtered = conversations.filter((c) =>
    c.visitor_name.toLowerCase().includes(search.toLowerCase()) ||
    c.visitor_email.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count ?? 0), 0);

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Mensagens</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Conversas em tempo real com visitantes</p>
        </div>
        {totalUnread > 0 && (
          <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
            {totalUnread} não {totalUnread === 1 ? "lida" : "lidas"}
          </span>
        )}
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-20 text-center dark:border-slate-700">
          <Inbox size={36} className="mb-3 text-gray-300 dark:text-slate-600" />
          <p className="font-medium text-gray-500 dark:text-slate-400">Nenhuma conversa ainda</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-slate-500">Quando alguém enviar uma mensagem pelo seu perfil, aparecerá aqui.</p>
        </div>
      ) : (
        <div className="flex h-[calc(100vh-220px)] min-h-[500px] overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900">

          {/* Sidebar: conversation list */}
          <div className="flex w-80 shrink-0 flex-col border-r border-gray-100 dark:border-slate-800">
            <div className="border-b border-gray-100 p-3 dark:border-slate-800">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar conversa..."
                  className="w-full rounded-lg border border-gray-200 py-2 pl-8 pr-3 text-sm focus:border-violet-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filtered.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelected(conv)}
                  className={`w-full border-b px-4 py-3.5 text-left transition-colors last:border-b-0 dark:border-slate-800 ${
                    selected?.id === conv.id
                      ? "bg-violet-50 dark:bg-violet-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      {(conv.unread_count ?? 0) > 0 && (
                        <Circle size={8} className="shrink-0 fill-violet-500 text-violet-500" />
                      )}
                      <p className={`truncate text-sm ${conv.unread_count ? "font-semibold text-gray-900 dark:text-slate-100" : "font-medium text-gray-700 dark:text-slate-300"}`}>
                        {conv.visitor_name}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-gray-400 dark:text-slate-500">
                      {timeAgo(conv.last_message_at)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-gray-400 dark:text-slate-500">{conv.visitor_email}</p>
                  {conv.last_preview && (
                    <p className="mt-1 truncate text-xs text-gray-500 dark:text-slate-400">{conv.last_preview}</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main: chat thread */}
          {!selected ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <Inbox size={32} className="mb-3 text-gray-300 dark:text-slate-600" />
              <p className="text-sm text-gray-400 dark:text-slate-500">Selecione uma conversa</p>
            </div>
          ) : (
            <div className="flex flex-1 flex-col min-w-0">
              {/* Chat header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 dark:border-slate-800">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-slate-100">{selected.visitor_name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <a href={`mailto:${selected.visitor_email}`} className="text-xs text-violet-600 hover:underline dark:text-violet-400">{selected.visitor_email}</a>
                    {selected.visitor_phone && (
                      <a href={`tel:${selected.visitor_phone}`} className="text-xs text-gray-400 hover:text-gray-600 dark:text-slate-500">
                        {selected.visitor_phone}
                      </a>
                    )}
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  selected.status === "open"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400"
                }`}>
                  {selected.status === "open" ? "Aberta" : "Fechada"}
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 px-5 py-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "professional" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.sender === "professional"
                        ? "rounded-br-sm bg-violet-600 text-white"
                        : "rounded-bl-sm bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-100"
                    }`}>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <p className={`mt-1 text-[10px] ${msg.sender === "professional" ? "text-violet-200" : "text-gray-400 dark:text-slate-500"}`}>
                        {new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        {msg.sender === "professional" && (
                          <CheckCheck size={11} className="inline ml-1 opacity-70" />
                        )}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-100 p-3 dark:border-slate-800">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder="Responder... (Enter para enviar)"
                    className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
                    style={{ maxHeight: "100px" }}
                    onInput={(e) => {
                      const t = e.currentTarget;
                      t.style.height = "auto";
                      t.style.height = Math.min(t.scrollHeight, 100) + "px";
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || sending}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white transition-colors hover:bg-violet-500 disabled:opacity-40"
                  >
                    {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
