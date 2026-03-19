"use client";

import { useWorkspaceStore } from "@/store/workspace-store";

export function LiveCursors({ currentUserId }: { currentUserId: string }) {
  const { remoteCursors } = useWorkspaceStore();

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {remoteCursors
        .filter((c) => c.userId !== currentUserId)
        .map((cursor) => (
          <div
            key={cursor.userId}
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
                fill={cursor.color}
                stroke="rgba(0,0,0,0.4)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>

            {/* Name label */}
            <div
              className="absolute top-5 left-3 px-2 py-0.5 rounded-lg text-xs font-semibold text-white whitespace-nowrap shadow-lg"
              style={{
                background: cursor.color,
                fontSize: "11px",
                boxShadow: `0 2px 8px ${cursor.color}60`,
              }}
            >
              {cursor.name ?? "Anonymous"}
            </div>
          </div>
        ))}
    </div>
  );
}
