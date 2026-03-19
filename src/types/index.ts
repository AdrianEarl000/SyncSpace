// ─── Extended Session ─────────────────────────────────────────────────────────
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      color: string;
    };
  }
  interface User {
    color?: string;
  }
}

// ─── Domain Types ─────────────────────────────────────────────────────────────

export interface WorkspaceUser {
  socketId: string;
  userId: string;
  name: string | null;
  image: string | null;
  color: string;
  joinedAt: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  workspaceId: string;
  userId: string;
  createdAt: string;
  editedAt?: string | null;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    color: string;
  };
}

export interface ActivityItem {
  id: string;
  type: string;
  workspaceId: string;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    color: string;
  };
}

export interface TypingUser {
  userId: string;
  name: string | null;
}

export interface RemoteCursor {
  userId: string;
  name: string | null;
  color: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

export interface WhiteboardStrokeData {
  id: string;
  points: Array<{ x: number; y: number }>;
  color: string;
  width: number;
  tool: "pen" | "eraser";
  userId: string;
}

export interface WorkspaceWithMeta {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string;
  createdBy: string;
  createdAt: Date | string;
  members: Array<{
    id: string;
    role: string;
    userId: string;
    user: { id: string; name: string | null; image: string | null; color: string };
  }>;
  _count?: { messages: number; members: number };
}

export type ActiveTab = "chat" | "whiteboard" | "activity";
