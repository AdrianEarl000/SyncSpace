import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg)" }}>
      <div className="text-center">
        <p className="font-clash font-bold text-8xl mb-4" style={{ color: "var(--border)", letterSpacing: "-0.04em" }}>404</p>
        <h1 className="font-clash font-bold text-2xl mb-2" style={{ color: "var(--text)" }}>Page not found</h1>
        <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/dashboard" className="btn-primary inline-block px-6 py-3 rounded-xl">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
