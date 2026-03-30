"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useWorkspaceStore } from "@/store/workspace-store";
// 1. Add Liveblocks imports
import { useOthers, useStorage } from "@liveblocks/react";
import { MessageSquare, PenLine, Activity, LogOut, LayoutDashboard, Users } from "lucide-react";
import { getWorkspaceEmoji } from "@/lib/utils";
import type { ActiveTab } from "@/types";

interface Props {
  workspace: {
    id: string; name: string; color: string; icon: string | null;
    members: Array<{ userId: string }>;
  };
  currentUser: { id: string; name: string | null; image: string | null; color: string };
}

const NAV: Array<{ id: ActiveTab; label: string; icon: typeof MessageSquare }> = [
  { id: "chat",       label: "Chat",       icon: MessageSquare },
  { id: "whiteboard", label: "Whiteboard", icon: PenLine       },
  { id: "activity",   label: "Activity",   icon: Activity      },
];

export function Sidebar({ workspace, currentUser }: Props) {
  // 2. Only grab the UI state from Zustand now
  const { activeTab, setActiveTab } = useWorkspaceStore();
  
  // 3. Grab real-time data directly from Liveblocks
  const others = useOthers();
  const messages = useStorage((root: any) => root.messages) || [];

  const unreadCount = 0; // implement with per-user read tracking if needed
  
  // Calculate total online (Others + Current User)
  const totalOnline = others.length + 1;

  return (
    <aside className="w-60 flex flex-col flex-shrink-0 h-full"
      style={{ background: "var(--sidebar)", borderRight: "1px solid var(--border)" }}>

      {/* Workspace header */}
      <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: `${workspace.color}20`, border: `1px solid ${workspace.color}40` }}>
            {workspace.icon ?? getWorkspaceEmoji(workspace.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-clash font-semibold text-sm truncate" style={{ color: "var(--text)" }}>
              {workspace.name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full presence-dot" style={{ background: "var(--accent)" }} />
              <p className="text-xs" style={{ color: "var(--faint)" }}>
                {totalOnline} online · {workspace.members.length} total
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <p className="text-xs font-semibold uppercase tracking-widest px-3 py-2" style={{ color: "var(--faint)" }}>
          Channels
        </p>
        <div className="space-y-0.5">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background:  active ? "rgba(99,102,241,0.12)" : "transparent",
                  color:       active ? "var(--primary)" : "var(--muted)",
                  borderLeft:  active ? "2px solid var(--primary)" : "2px solid transparent",
                }}>
                <Icon size={15} />
                <span>{label}</span>
                {id === "chat" && messages.length > 0 && (
                  <span className="ml-auto badge text-white" style={{ background: "var(--primary)" }}>
                    {messages.length > 99 ? "99+" : messages.length}
                  </span>
                )}
                {id === "chat" && others.length > 0 && messages.length === 0 && (
                  <span className="ml-auto w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t space-y-0.5" style={{ borderColor: "var(--border)" }}>
        <Link href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/5"
          style={{ color: "var(--muted)" }}>
          <LayoutDashboard size={15} /> Dashboard
        </Link>
        <button onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/5"
          style={{ color: "var(--faint)" }}>
          <LogOut size={15} /> Sign out
        </button>

        {/* Current user badge */}
        <div className="flex items-center gap-2.5 px-3 py-2 mt-1 rounded-xl"
          style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="relative flex-shrink-0">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: currentUser.color }}>
              {currentUser.name?.[0] ?? "?"}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
              style={{ background: "var(--accent)", borderColor: "var(--sidebar)" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: "var(--text)" }}>
              {currentUser.name ?? "You"}
            </p>
            <p className="text-xs" style={{ color: "var(--faint)" }}>Active</p>
          </div>
        </div>
      </div>
    </aside>
  );
}