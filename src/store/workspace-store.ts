import { create } from "zustand";
import type {
  ChatMessage, ActivityItem, TypingUser,
  RemoteCursor, WorkspaceUser, ActiveTab,
} from "@/types";

interface WorkspaceStore {
  // Presence
  onlineUsers:    WorkspaceUser[];
  typingUsers:    TypingUser[];
  remoteCursors:  RemoteCursor[];

  // Content
  messages:       ChatMessage[];
  activities:     ActivityItem[];

  // UI
  activeTab:      ActiveTab;
  sidebarOpen:    boolean;

  // Actions — presence
  setOnlineUsers:   (users: WorkspaceUser[]) => void;
  addOnlineUser:    (user: WorkspaceUser) => void;
  removeOnlineUser: (userId: string) => void;
  setTyping:        (user: TypingUser, isTyping: boolean) => void;
  upsertCursor:     (cursor: RemoteCursor) => void;
  removeCursor:     (userId: string) => void;

  // Actions — content
  setMessages:    (msgs: ChatMessage[]) => void;
  addMessage:     (msg: ChatMessage) => void;
  setActivities:  (acts: ActivityItem[]) => void;
  prependActivity:(act: ActivityItem) => void;

  // Actions — UI
  setActiveTab:   (tab: ActiveTab) => void;
  setSidebarOpen: (open: boolean) => void;
  reset:          () => void;
}

const initial = {
  onlineUsers:   [],
  typingUsers:   [],
  remoteCursors: [],
  messages:      [],
  activities:    [],
  activeTab:     "chat" as ActiveTab,
  sidebarOpen:   true,
};

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  ...initial,

  setOnlineUsers:   (users) => set({ onlineUsers: users }),
  addOnlineUser:    (user)  => set((s) => ({
    onlineUsers: s.onlineUsers.find((u) => u.userId === user.userId)
      ? s.onlineUsers
      : [...s.onlineUsers, user],
  })),
  removeOnlineUser: (userId) => set((s) => ({
    onlineUsers: s.onlineUsers.filter((u) => u.userId !== userId),
  })),

  setTyping: (user, isTyping) => set((s) => ({
    typingUsers: isTyping
      ? s.typingUsers.find((u) => u.userId === user.userId)
        ? s.typingUsers
        : [...s.typingUsers, user]
      : s.typingUsers.filter((u) => u.userId !== user.userId),
  })),

  upsertCursor: (cursor) => set((s) => ({
    remoteCursors: [
      ...s.remoteCursors.filter((c) => c.userId !== cursor.userId),
      cursor,
    ],
  })),
  removeCursor: (userId) => set((s) => ({
    remoteCursors: s.remoteCursors.filter((c) => c.userId !== userId),
  })),

  setMessages:     (messages)  => set({ messages }),
  addMessage:      (msg)       => set((s) => ({ messages: [...s.messages, msg] })),
  setActivities:   (activities) => set({ activities }),
  prependActivity: (act)        => set((s) => ({
    activities: [act, ...s.activities].slice(0, 100),
  })),

  setActiveTab:   (activeTab)   => set({ activeTab }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  reset:          ()            => set(initial),
}));
