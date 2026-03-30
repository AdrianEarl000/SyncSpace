"use client";

// 1. Swap the store for Liveblocks
import { useOthers } from "@liveblocks/react";

export function LiveCursors({ currentUserId }: { currentUserId: string }) {
  // 2. Get everyone else's real-time presence (automatically excludes currentUserId!)
  const others = useOthers();

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {others.map((other) => {
        const { cursor, info } = other.presence;

        // If they are in the room but haven't moved their mouse yet, don't draw it
        if (!cursor) return null;

        return (
          <div
            key={other.connectionId} // Liveblocks provides a unique connection ID
            className="absolute"
            style={{
              left: `${cursor.x}%`,
              top: `${cursor.y}%`,
              transform: "translate(-2px, -2px)",
              transition: "left 0.06s linear, top 0.06s linear",
              willChange: "left, top",
            }}
          >
            {/* Cursor SVG */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path
                d="M4 2L18 10.5L11 12.5L8.5 19L4 2Z"
                fill={info?.color || "var(--primary)"}
                stroke="rgba(0,0,0,0.4)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>

            {/* Name label */}
            <div
              className="absolute top-5 left-3 px-2 py-0.5 rounded-lg text-xs font-semibold text-white whitespace-nowrap shadow-lg"
              style={{
                background: info?.color || "var(--primary)",
                fontSize: "11px",
                boxShadow: `0 2px 8px ${info?.color || "var(--primary)"}60`,
              }}
            >
              {info?.name ?? "Anonymous"}
            </div>
          </div>
        );
      })}
    </div>
  );
}