"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send, Inbox, Circle, CheckCheck, Loader2, Search, FileDown, ChevronDown } from "lucide-react";

type ConversationStatus = "pending" | "accepted" | "in_progress" | "completed" | "closed";

const STATUS_CONFIG: Record<ConversationStatus, { label: string; color: string; dot: string }> = {
  pending:     { label: "Em análise",    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", dot: "bg-yellow-400" },
  accepted:    { label: "Aceito",        color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",         dot: "bg-blue-400" },
  in_progress: { label: "Em andamento",  color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", dot: "bg-purple-400" },
  completed:   { label: "Concluído",     color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",     dot: "bg-green-400" },
  closed:      { label: "Recusado",      color: "bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400",            dot: "bg-gray-400" },
};

interface Conversation {
  id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string | null;
  status: ConversationStatus;
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
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
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

    // Notifica o visitante por email (fire and forget)
    fetch("/api/notify/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: selected.id, replyContent: content }),
    }).catch(() => {});

    setSending(false);
    inputRef.current?.focus();
  }

  async function handleDownloadPdf(convId: string) {
    setDownloadingPdf(true);
    try {
      const res = await fetch(`/api/pdf/quote/${convId}`);
      if (!res.ok) throw new Error("Erro ao gerar PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orcamento-${convId.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingPdf(false);
    }
  }

  async function handleStatusChange(newStatus: ConversationStatus) {
    if (!selected) return;
    setStatusOpen(false);
    await supabase
      .from("conversations")
      .update({ status: newStatus })
      .eq("id", selected.id);
    setSelected({ ...selected, status: newStatus });
    setConversations((prev) =>
      prev.map((c) => c.id === selected.id ? { ...c, status: newStatus } : c)
    );
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Mensagens</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Conversas em tempo real com visitantes</p>
        </div>
        {totalUnread > 0 && (
          <span className="rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-800/30 dark:text-gray-400">
            {totalUnread} não {totalUnread === 1 ? "lida" : "lidas"}
          </span>
        )}
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-20 text-center dark:border-zinc-700">
          <Inbox size={36} className="mb-3 text-gray-300 dark:text-zinc-600" />
          <p className="font-medium text-gray-500 dark:text-zinc-400">Nenhuma conversa ainda</p>
          <p className="mt-1 text-sm text-gray-400 dark:text-zinc-500">Quando alguém enviar uma mensagem pelo seu perfil, aparecerá aqui.</p>
        </div>
      ) : (
        <div className="flex h-[calc(100vh-220px)] min-h-[500px] overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">

          {/* Sidebar: conversation list */}
          <div className="flex w-80 shrink-0 flex-col border-r border-gray-100 dark:border-zinc-800">
            <div className="border-b border-gray-100 p-3 dark:border-zinc-800">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -tranzinc-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar conversa..."
                  className="w-full rounded-lg border border-gray-200 py-2 pl-8 pr-3 text-sm focus:border-gray-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filtered.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelected(conv)}
                  className={`w-full border-b px-4 py-3.5 text-left transition-colors last:border-b-0 dark:border-zinc-800 ${
                    selected?.id === conv.id
                      ? "bg-gray-100 dark:bg-gray-800/20"
                      : "hover:bg-gray-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      {(conv.unread_count ?? 0) > 0 && (
                        <Circle size={8} className="shrink-0 fill-gray-500 text-gray-500" />
                      )}
                      <p className={`truncate text-sm ${conv.unread_count ? "font-semibold text-gray-900 dark:text-zinc-100" : "font-medium text-gray-700 dark:text-zinc-300"}`}>
                        {conv.visitor_name}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-gray-400 dark:text-zinc-500">
                      {timeAgo(conv.last_message_at)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-gray-400 dark:text-zinc-500">{conv.visitor_email}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_CONFIG[conv.status]?.color ?? STATUS_CONFIG.pending.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_CONFIG[conv.status]?.dot ?? ""}`} />
                      {STATUS_CONFIG[conv.status]?.label ?? "Em análise"}
                    </span>
                  </div>
                  {conv.last_preview && (
                    <p className="mt-1 truncate text-xs text-gray-500 dark:text-zinc-400">{conv.last_preview}</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main: chat thread */}
          {!selected ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <Inbox size={32} className="mb-3 text-gray-300 dark:text-zinc-600" />
              <p className="text-sm text-gray-400 dark:text-zinc-500">Selecione uma conversa</p>
            </div>
          ) : (
            <div className="flex flex-1 flex-col min-w-0">
              {/* Chat header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 dark:border-zinc-800">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-zinc-100">{selected.visitor_name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <a href={`mailto:${selected.visitor_email}`} className="text-xs text-gray-700 hover:underline dark:text-gray-400">{selected.visitor_email}</a>
                    {selected.visitor_phone && (
                      <a href={`tel:${selected.visitor_phone}`} className="text-xs text-gray-400 hover:text-gray-600 dark:text-zinc-500">
                        {selected.visitor_phone}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadPdf(selected.id)}
                    disabled={downloadingPdf}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    title="Baixar PDF desta conversa"
                  >
                    {downloadingPdf ? <Loader2 size={12} className="animate-spin" /> : <FileDown size={12} />}
                    PDF
                  </button>

                  {/* Status dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setStatusOpen((o) => !o)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${STATUS_CONFIG[selected.status]?.color ?? STATUS_CONFIG.pending.color}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_CONFIG[selected.status]?.dot ?? ""}`} />
                      {STATUS_CONFIG[selected.status]?.label ?? "Em análise"}
                      <ChevronDown size={11} />
                    </button>
                    {statusOpen && (
                      <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                        {(Object.entries(STATUS_CONFIG) as [ConversationStatus, typeof STATUS_CONFIG[ConversationStatus]][]).map(([key, cfg]) => (
                          <button
                            key={key}
                            onClick={() => handleStatusChange(key)}
                            className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-medium transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800 ${selected.status === key ? "opacity-50 cursor-default" : ""}`}
                          >
                            <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 px-5 py-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "professional" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.sender === "professional"
                        ? "rounded-br-sm bg-gray-700 text-white"
                        : "rounded-bl-sm bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-zinc-100"
                    }`}>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <p className={`mt-1 text-[10px] ${msg.sender === "professional" ? "text-gray-300" : "text-gray-400 dark:text-zinc-500"}`}>
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
              <div className="border-t border-gray-100 p-3 dark:border-zinc-800">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder="Responder... (Enter para enviar)"
                    className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
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
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-700 text-white transition-colors hover:bg-gray-600 disabled:opacity-40"
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
