import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED = ["/dashboard", "/workspace"];

// Routes that redirect to dashboard if already logged in
const AUTH_ROUTES = ["/auth/login", "/auth/register"];

export default auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn   = !!(req as { auth: { user?: unknown } | null }).auth?.user;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p));

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|fonts|public).*)"],
};
