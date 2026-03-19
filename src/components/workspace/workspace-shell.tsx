"use client";

import { useEffect, useRef } from "react";
import { useSocket } from "@/hooks/use-socket";
import { useWorkspaceStore } from "@/store/workspace-store";
import { Sidebar } from "@/components/sidebar/sidebar";
import { ChatPanel } from "@/components/chat/chat-panel";
import { WhiteboardPanel } from "@/components/whiteboard/whiteboard-panel";
import { ActivityPanel } from "@/components/activity/activity-panel";
import { OnlineUsersList } from "@/components/presence/online-users-list";
import { LiveCursors } from "@/components/presence/live-cursors";
import type { ChatMessage, ActivityItem } from "@/types";

interface WbStroke { id: string; userId: string; data: unknown }
interface Props {
  workspace: {
    id: string; name: string; slug: string; description: string | null;
    icon: string | null; color: string; createdBy: string;
    createdAt: string; updatedAt: string;
    members: Array<{ id: string; role: string; userId: string; user: { id: string; name: string | null; image: string | null; color: string } }>;
  };
  currentUser:      { id: string; name: string | null; image: string | null; email: string | null; color: string };
  initialMessages:  ChatMessage[];
  initialActivities: ActivityItem[];
  wbSession:        { id: string; name: string; strokes: WbStroke[] };
}

export function WorkspaceShell({ workspace, currentUser, initialMessages, initialActivities, wbSession }: Props) {
  const { joinWorkspace, moveCursor, leaveCursor } = useSocket();
  const { activeTab, setMessages, setActivities, reset } = useWorkspaceStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const lastCursorEmit = useRef(0);

  // Bootstrap store with server-fetched data
  useEffect(() => {
    setMessages(initialMessages);
    setActivities(initialActivities);
    return () => { reset(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace.id]);

  // Join socket room
  useEffect(() => {
    const cleanup = joinWorkspace({
      workspaceId: workspace.id,
      user: { id: currentUser.id, name: currentUser.name, image: currentUser.image, color: currentUser.color },
    });
    return cleanup;
  }, [workspace.id, currentUser, joinWorkspace]);

  // Live cursor tracking (throttled to 30 fps)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastCursorEmit.current < 33) return;
      lastCursorEmit.current = now;
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      moveCursor(workspace.id, x, y);
    };

    const onLeave = () => leaveCursor(workspace.id);

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, [workspace.id, moveCursor, leaveCursor]);

  return (
    <div ref={containerRef} className="flex h-screen overflow-hidden relative" style={{ background: "var(--bg)" }}>
      {/* Floating live cursors overlay */}
      <LiveCursors currentUserId={currentUser.id} />

      {/* ── Sidebar ── */}
      <Sidebar workspace={workspace} currentUser={currentUser} />

      {/* ── Main content ── */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === "chat"       && <ChatPanel workspaceId={workspace.id} currentUser={currentUser} />}
          {activeTab === "whiteboard" && <WhiteboardPanel workspaceId={workspace.id} sessionId={wbSession.id} currentUser={currentUser} initialStrokes={wbSession.strokes} />}
          {activeTab === "activity"   && <ActivityPanel />}
        </div>

        {/* ── Right: online users ── */}
        <OnlineUsersList members={workspace.members} />
      </div>
    </div>
  );
}
