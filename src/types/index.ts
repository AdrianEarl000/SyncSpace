import "next-auth";
import type { LiveList } from "@liveblocks/client";

// ─── Extended Session ─────────────────────────────────────────────────────────
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

// ─── Liveblocks Global Registry (NEW) ─────────────────────────────────────────
declare global {
  interface Liveblocks {
    Presence: Presence;
    Storage: Storage;
  }
}

export type Presence = {
  cursor: { x: number; y: number } | null;
  isTyping: boolean;
  liveStroke: WhiteboardStrokeData | null;
  info: {
    name: string | null;
    color: string;
    image: string | null;
  };
};

export type Storage = {
  messages: LiveList<ChatMessage>;          
  strokes: LiveList<WhiteboardStrokeData>;  
  activities: LiveList<ActivityItem>;       
};

// ─── Domain Types (Converted to 'type' for Liveblocks LSON compatibility) ────

export type LiveUser = {
  id: string;
  name: string | null;
  image: string | null;
  color: string;
};

export type ChatMessage = {
  id: string;
  content: string;
  workspaceId: string;
  userId: string;
  createdAt: string;
  editedAt?: string | null;
  user: LiveUser;
};

export type ActivityItem = {
  id: string;
  type: string;
  workspaceId: string;
  createdAt: string;
  metadata?: Record<string, any> | null; 
  user: LiveUser;
};

export type WhiteboardStrokeData = {
  id: string;
  pts: Array<{ x: number; y: number }>; 
  color: string;
  width: number;
  tool: "pen" | "eraser";
  userId: string;
};

// ─── Workspace Meta ───────────────────────────────────────────────────────────
// (This can stay an interface because it is not synced into Liveblocks storage)
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
    user: LiveUser;
  }>;
  _count?: { messages: number; members: number };
}

export type ActiveTab = "chat" | "whiteboard" | "activity";