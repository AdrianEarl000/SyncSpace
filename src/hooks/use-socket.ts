"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import { useWorkspaceStore } from "@/store/workspace-store";
import type { ChatMessage, ActivityItem } from "@/types";

// Singleton socket
let _socket: Socket | null = null;

function getSocket(): Socket {
  if (!_socket || _socket.disconnected) {
    _socket = io(process.env.NEXT_PUBLIC_APP_URL || "", {
      path: "/api/socketio",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
  }
  return _socket;
}

interface JoinPayload {
  workspaceId: string;
  user: { id: string; name: string | null; image: string | null; color: string };
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const {
    setOnlineUsers, setTyping, upsertCursor, removeCursor,
    addMessage, prependActivity,
  } = useWorkspaceStore();

  // Connect and register listeners for a workspace
  const joinWorkspace = useCallback(({ workspaceId, user }: JoinPayload) => {
    const s = getSocket();
    socketRef.current = s;

    s.emit("workspace:join", { workspaceId, user });

    // ── Presence ────────────────────────────────────────────────
    const onPresenceSync  = (users: Parameters<typeof setOnlineUsers>[0]) => setOnlineUsers(users);
    const onPresenceJoin  = ({ user }: { user: { id: string; name: string; color: string } }) => {
      prependActivity({
        id: `join-${Date.now()}`,
        type: "USER_JOINED",
        workspaceId,
        createdAt: new Date().toISOString(),
        user: { id: user.id, name: user.name, image: null, color: user.color },
        metadata: null,
      });
    };

    // ── Chat ────────────────────────────────────────────────────
    const onChatMsg  = (msg: ChatMessage) => addMessage(msg);
    const onChatType = ({ userId, name, isTyping }: { userId: string; name: string; isTyping: boolean }) =>
      setTyping({ userId, name }, isTyping);

    // ── Cursors ─────────────────────────────────────────────────
    const onCursorUpdate = (c: Parameters<typeof upsertCursor>[0]) => upsertCursor(c);
    const onCursorRemove = ({ userId }: { userId: string })         => removeCursor(userId);

    // ── Activity ────────────────────────────────────────────────
    const onActivityNew = (act: ActivityItem) => prependActivity(act);

    s.on("presence:sync",   onPresenceSync);
    s.on("presence:joined", onPresenceJoin);
    s.on("chat:message",    onChatMsg);
    s.on("chat:typing",     onChatType);
    s.on("cursor:update",   onCursorUpdate);
    s.on("cursor:remove",   onCursorRemove);
    s.on("activity:new",    onActivityNew);

    return () => {
      s.emit("workspace:leave", { workspaceId });
      s.off("presence:sync",   onPresenceSync);
      s.off("presence:joined", onPresenceJoin);
      s.off("chat:message",    onChatMsg);
      s.off("chat:typing",     onChatType);
      s.off("cursor:update",   onCursorUpdate);
      s.off("cursor:remove",   onCursorRemove);
      s.off("activity:new",    onActivityNew);
    };
  }, [setOnlineUsers, setTyping, upsertCursor, removeCursor, addMessage, prependActivity]);

  // ── Emitters ──────────────────────────────────────────────────

  const sendMessage = useCallback((workspaceId: string, msg: ChatMessage) => {
    getSocket().emit("chat:message", { ...msg, workspaceId });
  }, []);

  const startTyping = useCallback((workspaceId: string, user: { id: string; name: string | null }) => {
    getSocket().emit("chat:typing:start", { workspaceId, user });
  }, []);

  const stopTyping = useCallback((workspaceId: string, user: { id: string; name: string | null }) => {
    getSocket().emit("chat:typing:stop", { workspaceId, user });
  }, []);

  const moveCursor = useCallback((workspaceId: string, x: number, y: number) => {
    getSocket().emit("cursor:move", { workspaceId, x, y });
  }, []);

  const leaveCursor = useCallback((workspaceId: string) => {
    getSocket().emit("cursor:leave", { workspaceId });
  }, []);

  const wbStrokeBegin = useCallback((workspaceId: string, stroke: object) => {
    getSocket().emit("wb:stroke:begin", { workspaceId, stroke });
  }, []);

  const wbStrokePoint = useCallback((workspaceId: string, strokeId: string, point: object) => {
    getSocket().emit("wb:stroke:point", { workspaceId, strokeId, point });
  }, []);

  const wbStrokeEnd = useCallback((workspaceId: string, strokeId: string) => {
    getSocket().emit("wb:stroke:end", { workspaceId, strokeId });
  }, []);

  const wbClear = useCallback((workspaceId: string) => {
    getSocket().emit("wb:clear", { workspaceId });
  }, []);

  const wbUndo = useCallback((workspaceId: string, strokeId: string) => {
    getSocket().emit("wb:stroke:undo", { workspaceId, strokeId });
  }, []);

  const pushActivity = useCallback((workspaceId: string, activity: ActivityItem) => {
    getSocket().emit("activity:push", { workspaceId, activity });
  }, []);

  const getSocketInstance = useCallback(() => getSocket(), []);

  return {
    socketRef,
    joinWorkspace,
    sendMessage,
    startTyping,
    stopTyping,
    moveCursor,
    leaveCursor,
    wbStrokeBegin,
    wbStrokePoint,
    wbStrokeEnd,
    wbClear,
    wbUndo,
    pushActivity,
    getSocketInstance,
  };
}
