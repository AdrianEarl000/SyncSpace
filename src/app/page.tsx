import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SyncSpaceLogo } from "@/components/ui/syncspace-logo";
import { ParticlesBackground } from "@/components/ui/particles-background";
import { PageReveal } from "@/components/ui/page-reveal";
import { BackgroundEffects } from "@/components/ui/background-effects";

const FEATURES = [
  { icon: "💬", title: "Real-time Chat",  desc: "Instant messages with typing indicators and avatars", color: "#6366F1" },
  { icon: "🎨", title: "Live Whiteboard", desc: "Draw together on a shared canvas with live cursors",  color: "#22C55E" },
  { icon: "👥", title: "User Presence",   desc: "See who's online with animated presence indicators",  color: "#F59E0B" },
  { icon: "🖱️", title: "Live Cursors",    desc: "Watch teammates' cursors move in real time",          color: "#EF4444" },
  { icon: "⚡", title: "Activity Feed",   desc: "Track every action across your workspace",            color: "#8B5CF6" },
  { icon: "🔐", title: "Secure Auth",     desc: "Google OAuth and email/password with NextAuth",       color: "#14B8A6" },
] as const;

const TECH_TAGS = [
  "Next.js 14", "TypeScript", "Supabase", "Prisma",
  "Liveblocks", "NextAuth v5", "Tailwind CSS", "Zustand",
] as const;

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--bg)]">
      
      {/* ══ BACKGROUND LAYERS ══ */}
      <BackgroundEffects />
      <ParticlesBackground />

      {/* ══ PAGE CONTENT ══ */}
      <div className="relative z-10">
        <PageReveal>
          
          {/* ── Navbar ── */}
          <nav className="anim-nav flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
            <SyncSpaceLogo size={38} showWordmark />
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="btn-ghost text-sm px-4 py-2 rounded-xl">
                Sign in
              </Link>
              <Link href="/auth/register" className="btn-primary text-sm px-5 py-2.5 rounded-xl inline-block">
                Get started free →
              </Link>
            </div>
          </nav>

          {/* ── Hero ── */}
          <section className="flex flex-col items-center text-center px-6 pt-24 pb-16 max-w-5xl mx-auto">
            <div className="anim-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-8 text-xs font-semibold tracking-wide bg-green-500/10 border border-green-500/25 text-[var(--accent)]">
              <span className="w-1.5 h-1.5 rounded-full presence-dot bg-[var(--accent)]" />
              Real-time collaboration — live now
            </div>

            <h1 className="anim-h1 font-clash font-bold leading-[0.95] mb-6 text-[var(--text)] tracking-[-0.03em] text-[clamp(3.5rem,9vw,8rem)]">
              Where teams
              <br />
              <span className="text-gradient">think together</span>
            </h1>

            <p className="anim-sub text-lg max-w-2xl leading-relaxed mb-10 text-[var(--muted)]">
              SyncSpace is a real-time collaborative workspace — live chat, shared
              whiteboards, presence awareness, and activity tracking. Built for teams
              that move fast.
            </p>

            <div className="anim-cta flex flex-wrap items-center justify-center gap-4">
              <Link href="/auth/register" className="btn-primary px-8 py-3.5 rounded-2xl text-base inline-block shadow-[0_0_28px_rgba(99,102,241,0.38)]">
                Start collaborating free
              </Link>
              <Link href="/auth/login" className="px-8 py-3.5 rounded-2xl text-base font-medium transition-colors inline-block border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--border)]">
                Sign in
              </Link>
            </div>
          </section>

          {/* ── Feature Grid ── */}
          <section className="max-w-6xl mx-auto px-6 pb-24">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {FEATURES.map((f) => (
                <div key={f.title} className="anim-card feature-card card p-5 rounded-2xl cursor-default">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4"
                    style={{
                      background: `${f.color}18`,
                      border: `1px solid ${f.color}30`,
                    }}
                  >
                    {f.icon}
                  </div>
                  <h3 className="font-clash font-semibold text-base mb-1.5 text-[var(--text)]">
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--faint)]">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Tech Strip ── */}
          <div className="anim-strip border-t border-[var(--border)]">
            <div className="max-w-6xl mx-auto px-6 py-8 flex flex-wrap items-center justify-center gap-8">
              {TECH_TAGS.map((t) => (
                <span key={t} className="text-xs font-semibold tracking-widest uppercase text-[var(--faint)]">
                  {t}
                </span>
              ))}
            </div>
          </div>

        </PageReveal>
      </div>
    </main>
  );
}