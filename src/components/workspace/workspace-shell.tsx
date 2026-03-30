"use client";

import { useEffect } from "react";
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react";
import { useUpdateMyPresence } from "@liveblocks/react";
import { LiveList } from "@liveblocks/client"; // Ensure this is imported!

import { useWorkspaceStore } from "@/store/workspace-store";
import { Sidebar } from "@/components/sidebar/sidebar";
import { ChatPanel } from "@/components/chat/chat-panel";
import { WhiteboardPanel } from "@/components/whiteboard/whiteboard-panel";
import { ActivityPanel } from "@/components/activity/activity-panel";
import { OnlineUsersList } from "@/components/presence/online-users-list";
import { LiveCursors } from "@/components/presence/live-cursors";
import type { ChatMessage, ActivityItem, WhiteboardStrokeData } from "@/types";

// Keep this local type for the raw database incoming data
type WbStroke = { id: string; userId: string; data: any };

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

// ─── THE INNER UI ────────────────────────────────────────────────────────────
function WorkspaceInner({ workspace, currentUser, initialMessages, initialActivities, wbSession }: Props) {
  const { activeTab, setMessages, setActivities, reset } = useWorkspaceStore();
  const updateMyPresence = useUpdateMyPresence();

  useEffect(() => {
    setMessages(initialMessages);
    setActivities(initialActivities);
    return () => { reset(); };
  }, [workspace.id, initialMessages, initialActivities, setMessages, setActivities, reset]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    updateMyPresence({ cursor: { x, y } });
  };

  const handlePointerLeave = () => {
    updateMyPresence({ cursor: null });
  };

  return (
    <div 
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="flex h-screen overflow-hidden relative" 
      style={{ background: "var(--bg)" }}
    >
      <LiveCursors currentUserId={currentUser.id} />
      <Sidebar workspace={workspace} currentUser={currentUser} />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === "chat"       && <ChatPanel workspaceId={workspace.id} currentUser={currentUser} />}
          {activeTab === "whiteboard" && <WhiteboardPanel workspaceId={workspace.id} sessionId={wbSession.id} currentUser={currentUser} initialStrokes={wbSession.strokes} />}
          {activeTab === "activity"   && <ActivityPanel />}
        </div>
        <OnlineUsersList members={workspace.members} />
      </div>
    </div>
  );
}

// ─── THE WRAPPER ─────────────────────────────────────────────────────────────
export function WorkspaceShell(props: Props) {
  const publicApiKey = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY || "";

  // ✅ FIX: Map the raw database strokes to the flat Liveblocks format
  const parsedStrokes: WhiteboardStrokeData[] = props.wbSession.strokes.map(s => {
    const d = s.data || {};
    return {
      id: s.id,
      userId: s.userId,
      pts: d.pts || [],
      color: d.color || "#ffffff",
      width: d.width || 4,
      tool: d.tool || "pen"
    };
  });

  return (
    <LiveblocksProvider publicApiKey={publicApiKey}>
      <RoomProvider 
        id={`workspace-${props.workspace.id}`}
        initialPresence={{ 
          cursor: null, 
          isTyping: false, 
          liveStroke: null,
          info: { 
            name: props.currentUser.name, 
            color: props.currentUser.color, 
            image: props.currentUser.image 
          } 
        }}
        initialStorage={{
          messages: new LiveList(props.initialMessages),
          strokes: new LiveList(parsedStrokes), // 👈 Use the cleanly mapped strokes here!
          activities: new LiveList(props.initialActivities),
        }}
      >
        <ClientSideSuspense fallback={
          <div className="flex h-screen items-center justify-center" style={{ background: "var(--bg)" }}>
             <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }} />
          </div>
        }>
          <WorkspaceInner {...props} />
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}