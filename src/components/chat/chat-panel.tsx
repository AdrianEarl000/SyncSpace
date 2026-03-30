"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useStorage, useOthers, useUpdateMyPresence } from "@liveblocks/react";
import { Send, Hash } from "lucide-react";
import { formatChatTime } from "@/lib/utils";
import type { ChatMessage } from "@/types";

interface Props {
  workspaceId: string;
  currentUser: { id: string; name: string | null; image: string | null; color: string };
}

function groupMessages(msgs: readonly ChatMessage[]) {
  if (!msgs) return [];
  const groups: Array<{ user: ChatMessage["user"]; items: ChatMessage[]; firstAt: string }> = [];
  for (const msg of msgs) {
    const last = groups[groups.length - 1];
    const close =
      last &&
      last.user.id === msg.user.id &&
      new Date(msg.createdAt).getTime() - new Date(last.firstAt).getTime() < 5 * 60_000;
    if (close) { last.items.push(msg); }
    else { groups.push({ user: msg.user, items: [msg], firstAt: msg.createdAt }); }
  }
  return groups;
}

export function ChatPanel({ workspaceId, currentUser }: Props) {
  const [input, setInput]         = useState("");
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const inputRef                  = useRef<HTMLTextAreaElement>(null);

  const messages = useStorage((root) => root.messages) || [];
  
  const updateMyPresence = useUpdateMyPresence();
  
  const otherTypers = useOthers((others) => 
    others.filter((other) => other.presence.isTyping)
  );

  const groups = groupMessages(messages);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, otherTypers.length]);

  const handleSend = useMutation(({ storage }) => {
    const content = input.trim();
    if (!content) return;

    const msg: ChatMessage = {
      id:        `msg-${Date.now()}-${Math.random()}`,
      content,
      workspaceId,
      userId:      currentUser.id,
      createdAt:   new Date().toISOString(),
      editedAt:    null,
      user:        currentUser,
    };

    storage.get("messages").push(msg);

    setInput("");
    updateMyPresence({ isTyping: false });

    fetch("/api/messages", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ content, workspaceId }),
    }).catch(console.error);
  }, [input, workspaceId, currentUser, updateMyPresence]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    if (e.target.value.trim().length > 0) {
        updateMyPresence({ isTyping: true });
    } else {
        updateMyPresence({ isTyping: false });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-3.5 flex items-center gap-2.5 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(99,102,241,0.15)" }}>
          <Hash size={13} style={{ color: "var(--primary)" }} />
        </div>
        <h2 className="font-clash font-semibold text-sm" style={{ color: "var(--text)" }}>general</h2>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: "rgba(34,197,94,0.1)", color: "var(--accent)" }}>
          {messages.length} messages
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {groups.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mb-4"
              style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>💬</div>
            <p className="font-clash font-semibold text-lg mb-1" style={{ color: "var(--text)" }}>Start the conversation</p>
            <p className="text-sm" style={{ color: "var(--faint)" }}>Be the first to say something!</p>
          </div>
        )}

        {groups.map((group) => (
          <div key={group.firstAt} className="flex gap-3 msg-enter">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 mt-0.5"
              style={{ background: group.user.color ?? "var(--primary)" }}>
              {group.user.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                  {group.user.name ?? "Anonymous"}
                </span>
                <span className="text-xs" style={{ color: "var(--faint)" }}>
                  {formatChatTime(group.firstAt)}
                </span>
                {group.user.id === currentUser.id && (
                  <span className="badge" style={{ background: "rgba(99,102,241,0.15)", color: "var(--primary)" }}>you</span>
                )}
              </div>
              <div className="space-y-1">
                {group.items.map((msg) => (
                  <p key={msg.id} className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                    {msg.content}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}

       {/* Typing indicator */}
        {otherTypers.length > 0 && (
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="flex -space-x-2">
              {otherTypers.slice(0, 3).map((u) => (
                <div key={u.connectionId} className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white border-2"
                  style={{ 
                    /* ✅ Add "as string" casts to satisfy React's strict CSS types */
                    background: (u.info?.color as string) || "var(--primary)", 
                    borderColor: "var(--bg)" 
                  }}>
                  {(u.info?.name as string)?.[0] ?? "?"}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl"
              style={{ background: "var(--elevated)", border: "1px solid var(--border)" }}>
              <span className="w-1.5 h-1.5 rounded-full typing-dot" style={{ background: "var(--muted)" }} />
              <span className="w-1.5 h-1.5 rounded-full typing-dot" style={{ background: "var(--muted)" }} />
              <span className="w-1.5 h-1.5 rounded-full typing-dot" style={{ background: "var(--muted)" }} />
              <span className="text-xs ml-1" style={{ color: "var(--faint)" }}>
                {otherTypers.map((u) => (u.info?.name as string) ?? "Someone").join(", ")} {otherTypers.length === 1 ? "is" : "are"} typing
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 flex-shrink-0">
        <div className="flex items-end gap-2 px-4 py-3 rounded-2xl"
          style={{ background: "var(--elevated)", border: "1px solid var(--border)" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Message # general…"
            rows={1}
            className="flex-1 bg-transparent text-sm outline-none resize-none leading-relaxed"
            style={{ color: "var(--text)", maxHeight: "120px" }}
          />
          <button onClick={() => handleSend()} disabled={!input.trim()}
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 disabled:opacity-40 disabled:scale-100"
            style={{ background: input.trim() ? "var(--primary)" : "var(--border)" }}>
            <Send size={13} color="white" />
          </button>
        </div>
        <p className="text-xs mt-1.5 px-1" style={{ color: "var(--faint)" }}>
          <kbd className="px-1 py-0.5 rounded text-xs font-mono" style={{ background: "var(--elevated)", border: "1px solid var(--border)" }}>Enter</kbd> to send &nbsp;
          <kbd className="px-1 py-0.5 rounded text-xs font-mono" style={{ background: "var(--elevated)", border: "1px solid var(--border)" }}>Shift+Enter</kbd> for newline
        </p>
      </div>
    </div>
  );
}