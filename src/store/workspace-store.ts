import { create } from "zustand";
import type { ActiveTab } from "@/types";

interface WorkspaceStore {
  // ─── UI State ─────────────────────────────────────────────────────────────
  // These are the only things we still need local state for!
  activeTab: ActiveTab;
  sidebarOpen: boolean;

  // Actions — UI
  setActiveTab: (tab: ActiveTab) => void;
  setSidebarOpen: (open: boolean) => void;
  reset: () => void;

  // ─── Legacy Stubs ─────────────────────────────────────────────────────────
  // We keep these as empty functions so your WorkspaceShell doesn't crash 
  // when it tries to pass the initial server data on page load.
  setMessages: (msgs: any) => void;
  setActivities: (acts: any) => void;
}

const initial = {
  activeTab: "chat" as ActiveTab,
  sidebarOpen: true,
};

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  ...initial,

  // UI Actions
  setActiveTab: (activeTab) => set({ activeTab }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  reset: () => set(initial),

  // Safe empty stubs (Liveblocks handles this data now)
  setMessages: () => {},
  setActivities: () => {},
}));