import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="relative min-h-screen overflow-hidden noise" style={{ background: "var(--bg)" }}>

      {/* ── Ambient glow blobs ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-15%] left-[10%] w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)", filter: "blur(40px)" }} />
      </div>

      {/* ── Grid background ── */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
        style={{ backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative z-10">
        {/* ── Nav ── */}
        <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-clash font-bold text-base"
              style={{ background: "linear-gradient(135deg, #6366F1 0%, #22C55E 100%)" }}>
              S
            </div>
            <span className="font-clash font-semibold text-lg tracking-tight" style={{ color: "var(--text)" }}>
              SyncSpace
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login"
              className="btn-ghost text-sm px-4 py-2 rounded-xl">
              Sign in
            </Link>
            <Link href="/auth/register"
              className="btn-primary text-sm px-5 py-2.5 rounded-xl inline-block">
              Get started free →
            </Link>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="flex flex-col items-center text-center px-6 pt-24 pb-16 max-w-5xl mx-auto">

          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-8 text-xs font-semibold tracking-wide"
            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "var(--accent)" }}>
            <span className="w-1.5 h-1.5 rounded-full presence-dot" style={{ background: "var(--accent)" }} />
            Real-time collaboration — live now
          </div>

          <h1 className="font-clash font-bold leading-[0.95] mb-6"
            style={{ fontSize: "clamp(3.5rem, 9vw, 8rem)", color: "var(--text)", letterSpacing: "-0.03em" }}>
            Where teams
            <br />
            <span className="text-gradient">think together</span>
          </h1>

          <p className="text-lg max-w-2xl leading-relaxed mb-10"
            style={{ color: "var(--muted)" }}>
            SyncSpace is a real-time collaborative workspace — live chat, shared whiteboards,
            presence awareness, and activity tracking. Built for teams that move fast.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/auth/register"
              className="btn-primary px-8 py-3.5 rounded-2xl text-base inline-block"
              style={{ boxShadow: "0 0 40px rgba(99,102,241,0.4)" }}>
              Start collaborating free
            </Link>
            <Link href="/auth/login"
              className="px-8 py-3.5 rounded-2xl text-base font-medium transition-all hover:bg-white/5 inline-block"
              style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>
              Sign in
            </Link>
          </div>
        </section>

        {/* ── Feature grid ── */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: "💬", title: "Real-time Chat",    desc: "Instant messages with typing indicators and avatars", color: "#6366F1" },
              { icon: "🎨", title: "Live Whiteboard",   desc: "Draw together on a shared canvas with live cursors",  color: "#22C55E" },
              { icon: "👥", title: "User Presence",     desc: "See who's online with animated presence indicators",   color: "#F59E0B" },
              { icon: "🖱️", title: "Live Cursors",      desc: "Watch teammates' cursors move in real time",           color: "#EF4444" },
              { icon: "⚡", title: "Activity Feed",     desc: "Track every action across your workspace",             color: "#8B5CF6" },
              { icon: "🔐", title: "Secure Auth",       desc: "Google OAuth and email/password with NextAuth",        color: "#14B8A6" },
            ].map((f, i) => (
              <div key={f.title}
                className="card p-5 rounded-2xl group hover:scale-[1.02] transition-all duration-200 cursor-default"
                style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4"
                  style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}>
                  {f.icon}
                </div>
                <h3 className="font-clash font-semibold text-base mb-1.5" style={{ color: "var(--text)" }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--faint)" }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tech stack strip ── */}
        <div className="border-t" style={{ borderColor: "var(--border)" }}>
          <div className="max-w-6xl mx-auto px-6 py-8 flex flex-wrap items-center justify-center gap-8">
            {["Next.js 14","TypeScript","Supabase","Prisma","Socket.IO","NextAuth v5","Tailwind CSS","Zustand"].map((t) => (
              <span key={t} className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: "var(--faint)" }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
