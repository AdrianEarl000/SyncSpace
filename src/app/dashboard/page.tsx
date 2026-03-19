import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatRelative, getWorkspaceEmoji } from "@/lib/utils";
import { CreateWorkspaceModal } from "@/components/dashboard/create-workspace-modal";
import { signOut } from "@/lib/auth";
import { LogOut, Plus, MessageSquare, Users, Zap } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const [workspaces, recentMessages] = await Promise.all([
    prisma.workspace.findMany({
      where:   { members: { some: { userId: session.user.id } } },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, image: true, color: true } } },
          orderBy: { joinedAt: "asc" },
        },
        _count: { select: { messages: true, members: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.message.findMany({
      where: {
        workspace: { members: { some: { userId: session.user.id } } },
        deleted: false,
      },
      include: {
        user:      { select: { name: true, color: true } },
        workspace: { select: { name: true, slug: true, color: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const totalMembers  = new Set(workspaces.flatMap((w) => w.members.map((m) => m.userId))).size;
  const totalMessages = workspaces.reduce((n, w) => n + w._count.messages, 0);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-20 px-6 py-4 flex items-center justify-between"
        style={{ background: "rgba(15,23,42,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-clash font-bold text-white text-sm"
            style={{ background: "linear-gradient(135deg, #6366F1, #22C55E)" }}>S</div>
          <span className="font-clash font-semibold" style={{ color: "var(--text)" }}>SyncSpace</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: "var(--elevated)", border: "1px solid var(--border)" }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: session.user.color || "var(--primary)" }}>
              {session.user.name?.[0] ?? session.user.email?.[0] ?? "U"}
            </div>
            <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>
              {session.user.name ?? session.user.email}
            </span>
          </div>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/auth/login" }); }}>
            <button type="submit" data-tooltip="Sign out"
              className="btn-ghost w-9 h-9 flex items-center justify-center rounded-xl p-0">
              <LogOut size={15} />
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* ── Welcome ── */}
        <div className="mb-10">
          <h1 className="font-clash font-bold text-4xl mb-1" style={{ color: "var(--text)", letterSpacing: "-0.02em" }}>
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}{session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""} 👋
          </h1>
          <p style={{ color: "var(--muted)" }}>Here&apos;s what&apos;s happening across your workspaces.</p>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "Workspaces", value: workspaces.length, icon: <Zap size={16} />, color: "var(--primary)" },
            { label: "Team members", value: totalMembers,    icon: <Users size={16} />, color: "var(--accent)" },
            { label: "Total messages", value: totalMessages, icon: <MessageSquare size={16} />, color: "var(--highlight)" },
          ].map((s) => (
            <div key={s.label} className="card rounded-2xl p-5"
              style={{ background: "var(--sidebar)" }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${s.color}18`, color: s.color }}>{s.icon}</div>
                <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--faint)" }}>{s.label}</span>
              </div>
              <p className="font-clash font-bold text-3xl" style={{ color: "var(--text)", letterSpacing: "-0.02em" }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-6">

          {/* ── Workspaces list ── */}
          <div className="col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-clash font-semibold text-lg" style={{ color: "var(--text)" }}>Workspaces</h2>
              <CreateWorkspaceModal />
            </div>

            {workspaces.length === 0 ? (
              <div className="card rounded-2xl p-10 text-center"
                style={{ background: "var(--sidebar)", border: "1px dashed var(--border)" }}>
                <p className="text-5xl mb-4">🚀</p>
                <p className="font-clash font-semibold text-lg mb-2" style={{ color: "var(--text)" }}>No workspaces yet</p>
                <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>Create your first workspace to start collaborating</p>
                <CreateWorkspaceModal />
              </div>
            ) : (
              <div className="space-y-3">
                {workspaces.map((ws) => (
                  <Link key={ws.id} href={`/workspace/${ws.slug}`}
                    className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:scale-[1.01] group"
                    style={{ background: "var(--sidebar)", border: "1px solid var(--border)" }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: `${ws.color}20`, border: `1px solid ${ws.color}30` }}>
                      {ws.icon ?? getWorkspaceEmoji(ws.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-clash font-semibold truncate" style={{ color: "var(--text)" }}>{ws.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--faint)" }}>
                        {ws._count.members} members · {ws._count.messages} messages
                      </p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex -space-x-2">
                        {ws.members.slice(0, 4).map((m) => (
                          <div key={m.id} className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white"
                            style={{ borderColor: "var(--sidebar)", background: m.user.color ?? "var(--primary)" }}>
                            {m.user.name?.[0] ?? "?"}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs font-medium" style={{ color: "var(--primary)" }}>Open →</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* ── Recent messages ── */}
          <div className="col-span-2">
            <h2 className="font-clash font-semibold text-lg mb-4" style={{ color: "var(--text)" }}>Recent Messages</h2>
            <div className="card rounded-2xl overflow-hidden" style={{ background: "var(--sidebar)" }}>
              {recentMessages.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-3xl mb-2">💬</p>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>No messages yet</p>
                </div>
              ) : (
                recentMessages.map((msg, i) => (
                  <Link key={msg.id} href={`/workspace/${msg.workspace.slug}`}
                    className="flex items-start gap-3 p-3.5 transition-colors hover:bg-white/5"
                    style={{ borderBottom: i < recentMessages.length - 1 ? "1px solid var(--border-faint)" : "none" }}>
                    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mt-0.5"
                      style={{ background: msg.user.color ?? "var(--primary)" }}>
                      {msg.user.name?.[0] ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-semibold" style={{ color: "var(--text)" }}>{msg.user.name}</span>
                        <span className="text-xs" style={{ color: "var(--faint)" }}>in</span>
                        <span className="text-xs font-medium" style={{ color: msg.workspace.color }}>{msg.workspace.name}</span>
                      </div>
                      <p className="text-xs truncate" style={{ color: "var(--muted)" }}>{msg.content}</p>
                    </div>
                    <span className="text-xs flex-shrink-0" style={{ color: "var(--faint)" }}>
                      {formatRelative(msg.createdAt)}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
