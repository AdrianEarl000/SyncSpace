"use client";

import { useWorkspaceStore } from "@/store/workspace-store";

interface Member {
  id: string; role: string; userId: string;
  user: { id: string; name: string | null; image: string | null; color: string };
}

export function OnlineUsersList({ members }: { members: Member[] }) {
  const { onlineUsers, typingUsers } = useWorkspaceStore();
  const onlineIds = new Set(onlineUsers.map((u) => u.userId));
  const typingIds = new Set(typingUsers.map((u) => u.userId));

  const online  = members.filter((m) => onlineIds.has(m.userId));
  const offline = members.filter((m) => !onlineIds.has(m.userId));

  return (
    <aside className="w-52 flex-shrink-0 flex flex-col"
      style={{ background: "var(--sidebar)", borderLeft: "1px solid var(--border)" }}>
      <div className="px-4 py-3.5 border-b" style={{ borderColor: "var(--border)" }}>
        <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--faint)" }}>
          Members
        </h3>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
          <span className="text-xs" style={{ color: "var(--accent)" }}>{online.length} online</span>
          <span className="text-xs" style={{ color: "var(--faint)" }}>· {offline.length} offline</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {/* Online */}
        {online.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2 px-2"
              style={{ color: "var(--accent)", fontSize: "10px" }}>
              Online — {online.length}
            </p>
            <div className="space-y-0.5">
              {online.map((m) => (
                <div key={m.id} className="flex items-center gap-2.5 px-2 py-2 rounded-xl transition-all hover:bg-white/5">
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: m.user.color }}>
                      {m.user.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 presence-dot"
                      style={{ background: "var(--accent)", borderColor: "var(--sidebar)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: "var(--text)" }}>
                      {m.user.name ?? "User"}
                    </p>
                    <p className="text-xs" style={{ color: typingIds.has(m.userId) ? "var(--highlight)" : "var(--faint)", fontSize: "10px" }}>
                      {typingIds.has(m.userId) ? "✏️ typing…" : m.role.toLowerCase()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Offline */}
        {offline.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2 px-2"
              style={{ color: "var(--faint)", fontSize: "10px" }}>
              Offline — {offline.length}
            </p>
            <div className="space-y-0.5">
              {offline.map((m) => (
                <div key={m.id} className="flex items-center gap-2.5 px-2 py-2 rounded-xl opacity-40">
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: "#334155" }}>
                      {m.user.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                      style={{ background: "#475569", borderColor: "var(--sidebar)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: "var(--muted)" }}>
                      {m.user.name ?? "User"}
                    </p>
                    <p className="text-xs" style={{ color: "var(--faint)", fontSize: "10px" }}>
                      {m.role.toLowerCase()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
