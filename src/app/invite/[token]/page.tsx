import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

interface Props { params: { token: string } }

export default async function InvitePage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=/invite/${params.token}`);
  }

  // Accept invite via API
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://sync-space-topaz.vercel.app/";
  const res  = await fetch(`${baseUrl}/api/invites?token=${params.token}`, {
    headers: { Cookie: "" }, // server-side fetch; auth handled via session
    cache: "no-store",
  });
  const data = await res.json();

  if (!res.ok) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg)" }}>
        <div className="card rounded-3xl p-8 max-w-md w-full text-center" style={{ background: "var(--sidebar)" }}>
          <p className="text-5xl mb-4">⚠️</p>
          <h1 className="font-clash font-bold text-xl mb-2" style={{ color: "var(--text)" }}>Invite Invalid</h1>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>{data.error}</p>
          <Link href="/dashboard" className="btn-primary inline-block px-6 py-2.5 rounded-xl text-sm">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  redirect(`/workspace/${data.workspace.slug}`);
}
