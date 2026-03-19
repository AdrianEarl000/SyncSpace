"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Plus } from "lucide-react";
import { getWorkspaceEmoji } from "@/lib/utils";

const COLORS   = ["#6366F1","#22C55E","#F59E0B","#EF4444","#3B82F6","#8B5CF6","#EC4899","#14B8A6"];
const EMOJIS   = ["🚀","🎨","⚡","🔥","💎","🌊","🏔️","🎯","🦋","🌿","🔮","✨","🎪","🏛️","🌈"];

export function CreateWorkspaceModal() {
  const router = useRouter();
  const [open, setOpen]               = useState(false);
  const [name, setName]               = useState("");
  const [desc, setDesc]               = useState("");
  const [color, setColor]             = useState(COLORS[0]);
  const [icon, setIcon]               = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const preview = icon || (name ? getWorkspaceEmoji(name) : "🚀");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: desc.trim() || undefined, color, icon: icon || undefined }),
      });
      const data = await res.json();

      if (!res.ok) { setError("Failed to create workspace"); setLoading(false); return; }

      setOpen(false);
      setName(""); setDesc(""); setColor(COLORS[0]); setIcon("");
      router.push(`/workspace/${data.slug}`);
      router.refresh();
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
        style={{ background: "var(--primary)" }}>
        <Plus size={14} /> New workspace
      </button>

      {open && (
        <div className="modal-backdrop animate-fade-in" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className="card rounded-3xl p-7 w-full max-w-md animate-fade-up"
            style={{ background: "var(--sidebar)" }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-clash font-bold text-xl" style={{ color: "var(--text)" }}>New Workspace</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--faint)" }}>A space for your team to collaborate</p>
              </div>
              <button onClick={() => setOpen(false)} className="btn-ghost w-8 h-8 flex items-center justify-center rounded-xl p-0">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-5">
              {error && (
                <div className="px-4 py-3 rounded-xl text-sm"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171" }}>
                  {error}
                </div>
              )}

              {/* Preview */}
              <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: "var(--elevated)" }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ background: `${color}20`, border: `2px solid ${color}40` }}>
                  {preview}
                </div>
                <div>
                  <p className="font-clash font-semibold" style={{ color: "var(--text)" }}>
                    {name || "Workspace name"}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--faint)" }}>
                    {desc || "No description"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                  Name *
                </label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  required maxLength={60} placeholder="Design Team" className="input-base" />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                  Description
                </label>
                <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)}
                  maxLength={300} placeholder="What does your team work on?" className="input-base" />
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setColor(c)}
                      className="w-7 h-7 rounded-full transition-all hover:scale-110 flex items-center justify-center"
                      style={{ background: c, outline: color === c ? "2px solid #fff" : "none", outlineOffset: "2px" }}>
                      {color === c && <span className="text-white text-xs font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emoji picker */}
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                  Icon
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {EMOJIS.map((e) => (
                    <button key={e} type="button" onClick={() => setIcon(icon === e ? "" : e)}
                      className="w-8 h-8 rounded-lg text-lg transition-all hover:scale-110 flex items-center justify-center"
                      style={{ background: icon === e ? "rgba(99,102,241,0.2)" : "var(--elevated)", border: icon === e ? "1px solid var(--primary)" : "1px solid transparent" }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 btn-ghost py-3 rounded-xl"
                  style={{ border: "1px solid var(--border)" }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading || !name.trim()}
                  className="flex-1 btn-primary rounded-xl py-3">
                  {loading ? "Creating…" : "Create workspace"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
