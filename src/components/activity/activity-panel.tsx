"use client";

import { useStorage } from "@liveblocks/react";
import { formatRelative } from "@/lib/utils";
import { Zap } from "lucide-react";
import type { ActivityItem } from "@/types";

const ICONS: Record<string, string> = {
  USER_JOINED:        "👋",
  USER_LEFT:          "🚪",
  MESSAGE_SENT:       "💬",
  WHITEBOARD_EDITED:  "🎨",
  WHITEBOARD_CLEARED: "🗑️",
  WORKSPACE_CREATED:  "🚀",
  WORKSPACE_UPDATED:  "✏️",
  MEMBER_INVITED:     "📧",
  MEMBER_REMOVED:     "❌",
  TASK_CREATED:       "✅",
  TASK_COMPLETED:     "🏆",
  FILE_UPLOADED:      "📎",
};

const LABELS: Record<string, string> = {
  USER_JOINED:        "joined the workspace",
  USER_LEFT:          "left the workspace",
  MESSAGE_SENT:       "sent a message",
  WHITEBOARD_EDITED:  "drew on the whiteboard",
  WHITEBOARD_CLEARED: "cleared the whiteboard",
  WORKSPACE_CREATED:  "created this workspace",
  WORKSPACE_UPDATED:  "updated workspace settings",
  MEMBER_INVITED:     "invited a member",
  MEMBER_REMOVED:     "removed a member",
  TASK_CREATED:       "created a task",
  TASK_COMPLETED:     "completed a task",
  FILE_UPLOADED:      "uploaded a file",
};

const TYPE_COLORS: Record<string, string> = {
  USER_JOINED:       "#22C55E",
  MESSAGE_SENT:      "#6366F1",
  WHITEBOARD_EDITED: "#F59E0B",
  WORKSPACE_CREATED: "#22C55E",
  MEMBER_INVITED:    "#3B82F6",
  TASK_COMPLETED:    "#22C55E",
};

export function ActivityPanel() {
  const activities = (useStorage((root: any) => root.activities) as ActivityItem[]) || [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-5 py-3.5 flex items-center gap-2.5 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(245,158,11,0.15)" }}
        >
          <Zap size={13} style={{ color: "var(--highlight)" }} />
        </div>
        <h2 className="font-clash font-semibold text-sm" style={{ color: "var(--text)" }}>
          Activity Feed
        </h2>
        <span
          className="badge animate-pulse"
          style={{ background: "rgba(34,197,94,0.12)", color: "var(--accent)" }}
        >
          ● Live
        </span>
        <span className="ml-auto text-xs" style={{ color: "var(--faint)" }}>
          {activities.length} events
        </span>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mb-4"
              style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}
            >
              ⚡
            </div>
            <p className="font-clash font-semibold text-lg mb-1" style={{ color: "var(--text)" }}>
              No activity yet
            </p>
            <p className="text-sm" style={{ color: "var(--faint)" }}>
              Workspace events will appear here in real time
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline spine */}
            <div
              className="absolute left-[18px] top-2 bottom-2 w-px"
              style={{ background: "var(--border)" }}
            />

            <div className="space-y-3 pl-11">
              {activities.map((act, i) => {
                const color = TYPE_COLORS[act.type] ?? "var(--faint)";
                return (
                  <div key={act.id} className="relative animate-fade-in" style={{ animationDelay: `${i * 0.02}s` }}>
                    {/* Timeline node */}
                    <div
                      className="absolute -left-11 w-9 h-9 rounded-xl flex items-center justify-center text-base"
                      style={{
                        background: `${color}14`,
                        border: `1px solid ${color}30`,
                      }}
                    >
                      {ICONS[act.type] ?? "📌"}
                    </div>

                    {/* Card */}
                    <div
                      className="p-3.5 rounded-2xl transition-all hover:scale-[1.01]"
                      style={{ background: "var(--elevated)", border: "1px solid var(--border)" }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className="text-sm font-semibold"
                              style={{ color: "var(--text)" }}
                            >
                              {act.user?.name ?? "Someone"}
                            </span>
                            <span className="text-sm" style={{ color: "var(--muted)" }}>
                              {LABELS[act.type] ?? act.type.replace(/_/g, " ").toLowerCase()}
                            </span>
                          </div>

                          {/* Metadata pills */}
                          {act.metadata && Object.keys(act.metadata).length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {Object.entries(act.metadata).map(([k, v]) => (
                                <span
                                  key={k}
                                  className="text-xs px-2 py-0.5 rounded-lg font-mono"
                                  style={{ background: "var(--border)", color: "var(--muted)" }}
                                >
                                  {k}: {String(v)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <span
                          className="text-xs flex-shrink-0"
                          style={{ color: "var(--faint)" }}
                        >
                          {formatRelative(act.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}