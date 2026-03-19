"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm]     = useState({ name: "", email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res  = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) { setError(data.error || "Registration failed"); setLoading(false); return; }

      const signInRes = await signIn("credentials", {
        email: form.email, password: form.password, redirect: false,
      });

      if (signInRes?.ok) router.push("/dashboard");
      else { setError("Account created — please sign in."); setLoading(false); }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 noise relative" style={{ background: "var(--bg)" }}>
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-clash font-bold text-white text-lg"
            style={{ background: "linear-gradient(135deg, #6366F1, #22C55E)" }}>S</div>
          <span className="font-clash font-semibold text-xl" style={{ color: "var(--text)" }}>SyncSpace</span>
        </div>

        <div className="card rounded-3xl p-8" style={{ background: "var(--sidebar)" }}>
          <h1 className="font-clash font-bold text-2xl mb-1" style={{ color: "var(--text)" }}>Create account</h1>
          <p className="text-sm mb-7" style={{ color: "var(--muted)" }}>Start collaborating for free</p>

          <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-sm font-medium transition-all hover:scale-[1.01] mb-5"
            style={{ background: "var(--elevated)", border: "1px solid var(--border)", color: "var(--text)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 divider" />
            <span className="text-xs" style={{ color: "var(--faint)" }}>or</span>
            <div className="flex-1 divider" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-xl text-sm"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171" }}>
                {error}
              </div>
            )}
            {(["name","email","password"] as const).map((field) => (
              <div key={field}>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                  {field === "name" ? "Full name" : field}
                </label>
                <input
                  type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                  value={form[field]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  required
                  placeholder={field === "name" ? "Alex Johnson" : field === "email" ? "you@company.com" : "Min. 8 characters"}
                  className="input-base"
                />
              </div>
            ))}
            <button type="submit" disabled={loading || !form.name || !form.email || !form.password}
              className="btn-primary w-full mt-2">
              {loading ? "Creating account…" : "Create free account"}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "var(--faint)" }}>
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold" style={{ color: "var(--primary)" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
