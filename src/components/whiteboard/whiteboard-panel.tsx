"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useStorage, useMutation, useOthers, useUpdateMyPresence } from "@liveblocks/react";
import { Trash2, Pencil, Eraser, Minus, Plus, Undo2, Download } from "lucide-react";
import type { WhiteboardStrokeData } from "@/types";

interface Pt { x: number; y: number }

const PEN_COLORS = ["#F8FAFC","#6366F1","#22C55E","#F59E0B","#EF4444","#3B82F6","#EC4899","#F97316"];

interface Props {
  workspaceId:    string;
  sessionId:      string;
  currentUser:    { id: string; name: string | null; color: string };
  initialStrokes: Array<{ id: string; userId: string; data: unknown }>;
}

export function WhiteboardPanel({ workspaceId, currentUser, initialStrokes }: Props) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  
  const [liveStroke,   setLiveStroke]   = useState<WhiteboardStrokeData | null>(null);
  const [color,  setColor]  = useState(currentUser.color || PEN_COLORS[0]);
  const [width,  setWidth]  = useState(4);
  const [tool,   setTool]   = useState<"pen"|"eraser">("pen");
  const drawing  = useRef(false);

  const strokes = useStorage((root) => root.strokes) || [];
  const updateMyPresence = useUpdateMyPresence();
  const others = useOthers();
  
  const remoteActiveStrokes = others
    .map((other) => other.presence.liveStroke)
    .filter((s): s is WhiteboardStrokeData => s !== null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const renderStroke = (stroke: WhiteboardStrokeData) => {
      if (!stroke || !stroke.pts || stroke.pts.length < 2) return;
      ctx.beginPath();
      ctx.globalCompositeOperation = stroke.tool === "eraser" ? "destination-out" : "source-over";
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth   = stroke.width;
      ctx.lineCap     = "round";
      ctx.lineJoin    = "round";
      ctx.moveTo(stroke.pts[0].x, stroke.pts[0].y);
      for (let i = 1; i < stroke.pts.length; i++) {
        const prev = stroke.pts[i - 1], curr = stroke.pts[i];
        ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + curr.x) / 2, (prev.y + curr.y) / 2);
      }
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
    };

    [...strokes, ...(liveStroke ? [liveStroke] : []), ...remoteActiveStrokes].forEach(renderStroke);
  }, [strokes, liveStroke, remoteActiveStrokes]);

  const getPos = (e: React.MouseEvent): Pt => {
    const r = canvasRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (canvasRef.current!.width  / r.width),
      y: (e.clientY - r.top)  * (canvasRef.current!.height / r.height),
    };
  };

  const onDown = useCallback((e: React.MouseEvent) => {
    drawing.current = true;
    const pt  = getPos(e);
    const strokeColor = tool === "eraser" ? "#0A0F1A" : color;
    const strokeWidth = tool === "eraser" ? Math.max(width * 5, 20) : width;
    const id  = `${currentUser.id}-${Date.now()}`;
    const s: WhiteboardStrokeData = { id, pts: [pt], color: strokeColor, width: strokeWidth, tool, userId: currentUser.id };
    
    setLiveStroke(s);
    updateMyPresence({ liveStroke: s });
  }, [color, width, tool, currentUser.id, updateMyPresence]);

  const onMove = useCallback((e: React.MouseEvent) => {
    if (!drawing.current || !liveStroke) return;
    const pt = getPos(e);
    
    setLiveStroke((prev) => {
        if (!prev) return prev;
        const next = { ...prev, pts: [...prev.pts, pt] };
        updateMyPresence({ liveStroke: next });
        return next;
    });
  }, [liveStroke, updateMyPresence]);

  const onUp = useMutation(({ storage }) => {
    if (!liveStroke) return;
    drawing.current = false;
    
    storage.get("strokes").push(liveStroke);
    
    setLiveStroke(null);
    updateMyPresence({ liveStroke: null });
  }, [liveStroke, updateMyPresence]);

  const handleUndo = useMutation(({ storage }) => {
    const strokesList = storage.get("strokes");
    const lastIndex = strokesList.toArray().map((s) => s.userId).lastIndexOf(currentUser.id);
    
    if (lastIndex !== -1) {
      strokesList.delete(lastIndex);
    }
  }, [currentUser.id]);

  const handleClear = useMutation(({ storage }) => {
    storage.get("strokes").clear();
    setLiveStroke(null);
    updateMyPresence({ liveStroke: null });
  }, [updateMyPresence]);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.download = "syncspace-whiteboard.png";
    a.href = canvasRef.current?.toDataURL("image/png") ?? "";
    a.click();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-5 py-3 flex items-center gap-3 flex-wrap flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-1.5 p-1 rounded-xl" style={{ background: "var(--elevated)" }}>
          {(["pen","eraser"] as const).map((t) => (
            <button key={t} onClick={() => setTool(t)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: tool === t ? "var(--primary)" : "transparent", color: tool === t ? "#fff" : "var(--muted)" }}>
              {t === "pen" ? <Pencil size={12} /> : <Eraser size={12} />}
              {t === "pen" ? "Pen" : "Erase"}
            </button>
          ))}
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1.5">
          {PEN_COLORS.map((c) => (
            <button key={c} onClick={() => { setColor(c); setTool("pen"); }}
              className="rounded-full transition-all hover:scale-110"
              style={{ width: "20px", height: "20px", background: c, flexShrink: 0,
                outline: color === c && tool === "pen" ? "2.5px solid var(--primary)" : "none",
                outlineOffset: "2px",
                border: c === "#F8FAFC" ? "1px solid var(--border)" : "none" }} />
          ))}
        </div>

        {/* Size */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl" style={{ background: "var(--elevated)" }}>
          <button onClick={() => setWidth((w) => Math.max(1, w - 1))} className="btn-ghost w-6 h-6 p-0 flex items-center justify-center rounded-lg">
            <Minus size={11} />
          </button>
          <span className="text-xs font-mono w-4 text-center" style={{ color: "var(--muted)" }}>{width}</span>
          <button onClick={() => setWidth((w) => Math.min(30, w + 1))} className="btn-ghost w-6 h-6 p-0 flex items-center justify-center rounded-lg">
            <Plus size={11} />
          </button>
        </div>

        {/* Preview dot */}
        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
          <div className="rounded-full" style={{ width: `${Math.min(width * 2, 24)}px`, height: `${Math.min(width * 2, 24)}px`, background: tool === "eraser" ? "var(--border)" : color }} />
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => handleUndo()} data-tooltip="Undo (your strokes)"
            className="btn-ghost w-8 h-8 p-0 flex items-center justify-center rounded-xl"
            style={{ border: "1px solid var(--border)" }}>
            <Undo2 size={13} />
          </button>
          <button onClick={handleDownload} data-tooltip="Download PNG"
            className="btn-ghost w-8 h-8 p-0 flex items-center justify-center rounded-xl"
            style={{ border: "1px solid var(--border)" }}>
            <Download size={13} />
          </button>
          <button onClick={() => handleClear()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-105"
            style={{ background: "rgba(239,68,68,0.08)", color: "#F87171", border: "1px solid rgba(239,68,68,0.2)" }}>
            <Trash2 size={12} /> Clear all
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden" style={{ background: "#080E1A" }}>
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #1E293B 1px, transparent 1px)", backgroundSize: "28px 28px", opacity: 0.6 }} />
        <canvas
          ref={canvasRef}
          width={2560} height={1440}
          className={`absolute inset-0 w-full h-full ${tool === "eraser" ? "wb-eraser" : "wb-cursor"}`}
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
          onMouseLeave={onUp}
        />
        {/* Stroke count */}
        <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-lg text-xs pointer-events-none"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", color: "var(--faint)" }}>
          {strokes.length} stroke{strokes.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}