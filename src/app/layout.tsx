import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/ui/providers";

// Clash Display — bold geometric display typeface
const clashDisplay = localFont({
  src: [
    { path: "../../public/fonts/ClashDisplay-Regular.woff2", weight: "400" },
    { path: "../../public/fonts/ClashDisplay-Medium.woff2",  weight: "500" },
    { path: "../../public/fonts/ClashDisplay-Semibold.woff2",weight: "600" },
    { path: "../../public/fonts/ClashDisplay-Bold.woff2",    weight: "700" },
  ],
  variable: "--font-clash",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

// Satoshi — clean, modern body font
const satoshi = localFont({
  src: [
    { path: "../../public/fonts/Satoshi-Regular.woff2",  weight: "400" },
    { path: "../../public/fonts/Satoshi-Medium.woff2",   weight: "500" },
    { path: "../../public/fonts/Satoshi-Bold.woff2",     weight: "700" },
  ],
  variable: "--font-satoshi",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: { default: "SyncSpace", template: "%s — SyncSpace" },
  description: "Real-time collaborative workspaces for modern teams. Chat, draw, and create together.",
  keywords: ["collaboration", "real-time", "whiteboard", "chat", "workspace", "team"],
  authors: [{ name: "SyncSpace" }],
  openGraph: {
    title: "SyncSpace",
    description: "Real-time collaborative workspaces for modern teams.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F172A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${clashDisplay.variable} ${satoshi.variable} font-satoshi antialiased`}
        style={{ background: "var(--bg)", color: "var(--text)" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
