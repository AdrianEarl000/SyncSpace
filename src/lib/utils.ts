import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Deterministic color from userId
const USER_COLORS = [
  "#6366F1", "#22C55E", "#F59E0B", "#EF4444",
  "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6",
  "#F97316", "#06B6D4",
];

export function getUserColor(userId: string, fallback?: string): string {
  if (fallback && fallback !== "#6366F1") return fallback;
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}

// Generate slug from name
export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    Math.random().toString(36).slice(2, 7)
  );
}

// Format relative time
export function formatRelative(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const secs = Math.floor(diff / 1000);
  const mins = Math.floor(secs / 60);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (secs < 60) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

// Format chat timestamp
export function formatChatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Generate emoji workspace icon from name
export function getWorkspaceEmoji(name: string): string {
  const emojis = ["🚀","🎨","⚡","🔥","💎","🌊","🏔️","🎯","🦋","🌿","🔮","✨"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return emojis[Math.abs(hash) % emojis.length];
}
