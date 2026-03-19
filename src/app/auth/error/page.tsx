"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const ERRORS: Record<string, string> = {
  Configuration:  "Server configuration error. Please contact support.",
  AccessDenied:   "Access denied. You may not have permission to sign in.",
  Verification:   "The verification token has expired or is invalid.",
  OAuthSignin:    "Error starting OAuth sign-in. Please try again.",
  OAuthCallback:  "Error completing OAuth sign-in. Please try again.",
  OAuthCreateAccount: "Could not create OAuth account. Email may already be in use.",
  Default:        "An unexpected authentication error occurred.",
};

export default function AuthErrorPage() {
  const params = useSearchParams();
  const code   = params.get("error") ?? "Default";
  const message = ERRORS[code] ?? ERRORS.Default;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg)" }}>
      <div className="card rounded-3xl p-8 max-w-md w-full text-center" style={{ background: "var(--sidebar)" }}>
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="font-clash font-bold text-xl mb-2" style={{ color: "var(--text)" }}>Authentication Error</h1>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>{message}</p>
        <Link href="/auth/login" className="btn-primary inline-block px-6 py-2.5 rounded-xl text-sm">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
