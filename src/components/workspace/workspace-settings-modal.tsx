"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, X, Trash2, UserPlus, Copy, Check } from "lucide-react";

const COLORS = ["#6366F1","#22C55E","#F59E0B","#EF4444","#3B82F6","#8B5CF6","#EC4899","#14B8A6"];

interface Props {
  workspace: {
    id: string; name: string; description: string | null;
    color: string; icon: string | null; slug: string;
  };
  isOwner: boolean;
}

export function WorkspaceSettingsModal({ workspace, isOwner }: Props) {
  const router = useRouter();
  const [open,    setOpen]    = useState(false);
  const [tab,     setTab]     = useState<"general"|"invite"|"danger">("general");
  const [name,    setName]    = useState(workspace.name);
  const [desc,    setDesc]    = useState(workspace.description ?? "");
  const [color,   setColor]   = useState(workspace.color);
  const [loading, setLoading] = useState(false);
  const [saved,   setSaved]   = useState(false);

  // Invite
  const [inviteEmail, setInviteEmail]   = useState("");
  const [inviteLink,  setInviteLink]    = useState("");
  const [copied,      setCopied]        = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError,   setInviteError]   = useState("");

  const handleSave = async () => {
    setLoading(true);
    try {
      await fetch(`/api/workspaces/${workspace.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: desc, color }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviteLoading(true);
    setInviteError("");
    try {
      const res  = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, workspaceId: workspace.id }),
      });
      const data = await res.json();
      if (!res.ok) { setInviteError(data.error); return; }
      setInviteLink(`${window.location.origin}/invite/${data.token}`);
      setInviteEmail("");
    } catch { setInviteError("Failed to send invite"); }
    finally   { setInviteLoading(false); }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${workspace.name}"? This cannot be undone.`)) return;
    await fetch(`/api/workspaces/${workspace.id}`, { method: "DELETE" });
    router.push("/dashboard");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        data-tooltip="Workspace settings"
        className="btn-ghost w-8 h-8 flex items-center justify-center rounded-xl p-0"
      >
        <Settings size={14} />
      </button>

      {open && (
        <div className="modal-backdrop animate-fade-in" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div
            className="card rounded-3xl w-full max-w-lg animate-fade-up overflow-hidden"
            style={{ background: "var(--sidebar)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <h2 className="font-clash font-bold text-lg" style={{ color: "var(--text)" }}>
                Workspace Settings
              </h2>
              <button onClick={() => setOpen(false)} className="btn-ghost w-8 h-8 flex items-center justify-center rounded-xl p-0">
                <X size={15} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
              {(["general","invite","danger"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className="flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-all"
                  style={{
                    color: tab === t ? "var(--primary)" : "var(--faint)",
                    borderBottom: tab === t ? "2px solid var(--primary)" : "2px solid transparent",
                  }}>
                  {t === "general" ? "⚙️ General" : t === "invite" ? "👥 Invite" : "⚠️ Danger"}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* General tab */}
              {tab === "general" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--muted)" }}>Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="input-base" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--muted)" }}>Description</label>
                    <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What does your team work on?" className="input-base" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--muted)" }}>Color</label>
                    <div className="flex gap-2">
                      {COLORS.map((c) => (
                        <button key={c} onClick={() => setColor(c)}
                          className="w-7 h-7 rounded-full transition-all hover:scale-110"
                          style={{ background: c, outline: color === c ? "2px solid white" : "none", outlineOffset: "2px" }} />
                      ))}
                    </div>
                  </div>
                  {isOwner && (
                    <button onClick={handleSave} disabled={loading || !name.trim()}
                      className="btn-primary w-full rounded-xl py-2.5 flex items-center justify-center gap-2">
                      {saved ? <><Check size={14} /> Saved!</> : loading ? "Saving…" : "Save changes"}
                    </button>
                  )}
                </div>
              )}

              {/* Invite tab */}
              {tab === "invite" && (
                <div className="space-y-4">
                  <p className="text-sm" style={{ color: "var(--muted)" }}>
                    Invite team members by email. They&apos;ll receive a link to join this workspace.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="email" value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@company.com"
                      className="input-base flex-1"
                      onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                    />
                    <button onClick={handleInvite} disabled={inviteLoading || !inviteEmail}
                      className="btn-primary px-4 rounded-xl flex items-center gap-1.5 flex-shrink-0">
                      <UserPlus size={13} />
                      {inviteLoading ? "…" : "Invite"}
                    </button>
                  </div>

                  {inviteError && (
                    <p className="text-sm" style={{ color: "#F87171" }}>{inviteError}</p>
                  )}

                  {inviteLink && (
                    <div className="p-3 rounded-xl" style={{ background: "var(--elevated)", border: "1px solid var(--border)" }}>
                      <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>Share this invite link:</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs truncate font-mono" style={{ color: "var(--accent)" }}>
                          {inviteLink}
                        </code>
                        <button onClick={handleCopyLink}
                          className="btn-ghost w-7 h-7 flex items-center justify-center rounded-lg p-0 flex-shrink-0">
                          {copied ? <Check size={12} style={{ color: "var(--accent)" }} /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Danger tab */}
              {tab === "danger" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <h3 className="font-semibold text-sm mb-1" style={{ color: "#F87171" }}>Delete Workspace</h3>
                    <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
                      Permanently delete this workspace and all its data including messages, whiteboard, and activities. This action cannot be undone.
                    </p>
                    {isOwner ? (
                      <button onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                        style={{ background: "rgba(239,68,68,0.12)", color: "#F87171", border: "1px solid rgba(239,68,68,0.25)" }}>
                        <Trash2 size={13} /> Delete &quot;{workspace.name}&quot;
                      </button>
                    ) : (
                      <p className="text-xs" style={{ color: "var(--faint)" }}>Only the workspace owner can delete it.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
