"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSocket } from "@/hooks/use-socket";
import { Trash2, Pencil, Eraser, Minus, Plus, Undo2, Download } from "lucide-react";

interface Pt { x: number; y: number }
interface Stroke { id: string; pts: Pt[]; color: string; width: number; tool: "pen"|"eraser"; userId: string }

const PEN_COLORS = ["#F8FAFC","#6366F1","#22C55E","#F59E0B","#EF4444","#3B82F6","#EC4899","#F97316"];

interface Props {
  workspaceId:    string;
  sessionId:      string;
  currentUser:    { id: string; name: string | null; color: string };
  initialStrokes: Array<{ id: string; userId: string; data: unknown }>;
}

export function WhiteboardPanel({ workspaceId, currentUser, initialStrokes }: Props) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const [strokes,      setStrokes]      = useState<Stroke[]>([]);
  const [liveStroke,   setLiveStroke]   = useState<Stroke | null>(null);
  const [remoteActive, setRemoteActive] = useState<Map<string, Stroke>>(new Map());
  const [color,  setColor]  = useState(currentUser.color || PEN_COLORS[0]);
  const [width,  setWidth]  = useState(4);
  const [tool,   setTool]   = useState<"pen"|"eraser">("pen");
  const drawing  = useRef(false);

  const { getSocketInstance, wbStrokeBegin, wbStrokePoint, wbStrokeEnd, wbClear, wbUndo } = useSocket();

  // Parse initial strokes from DB
  useEffect(() => {
    const parsed = initialStrokes.map((s) => {
      try {
        const d = s.data as { pts?: Pt[]; color?: string; width?: number; tool?: "pen"|"eraser" };
        return { id: s.id, userId: s.userId, pts: d.pts ?? [], color: d.color ?? "#fff", width: d.width ?? 3, tool: d.tool ?? "pen" } as Stroke;
      } catch { return null; }
    }).filter(Boolean) as Stroke[];
    setStrokes(parsed);
  }, [initialStrokes]);

  // Socket listeners for remote drawing
  useEffect(() => {
    const s = getSocketInstance();

    const onBegin = (stroke: Stroke) => {
      setRemoteActive((m) => new Map(m).set(stroke.id, { ...stroke, pts: stroke.pts ?? [] }));
    };
    const onPoint = ({ strokeId, point }: { strokeId: string; point: Pt }) => {
      setRemoteActive((m) => {
        const map   = new Map(m);
        const exist = map.get(strokeId);
        if (exist) map.set(strokeId, { ...exist, pts: [...exist.pts, point] });
        return map;
      });
    };
    const onEnd = ({ strokeId }: { strokeId: string }) => {
      setRemoteActive((m) => {
        const map    = new Map(m);
        const stroke = map.get(strokeId);
        if (stroke) { setStrokes((ss) => [...ss, stroke]); map.delete(strokeId); }
        return map;
      });
    };
    const onUndo = ({ strokeId }: { strokeId: string }) => {
      setStrokes((ss) => ss.filter((s) => s.id !== strokeId));
    };
    const onClear = () => { setStrokes([]); setRemoteActive(new Map()); };

    s.on("wb:stroke:begin", onBegin);
    s.on("wb:stroke:point", onPoint);
    s.on("wb:stroke:end",   onEnd);
    s.on("wb:stroke:undo",  onUndo);
    s.on("wb:clear",        onClear);

    return () => {
      s.off("wb:stroke:begin", onBegin);
      s.off("wb:stroke:point", onPoint);
      s.off("wb:stroke:end",   onEnd);
      s.off("wb:stroke:undo",  onUndo);
      s.off("wb:clear",        onClear);
    };
  }, [getSocketInstance]);

  // Render all strokes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const renderStroke = (stroke: Stroke) => {
      if (stroke.pts.length < 2) return;
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

    [...strokes, ...(liveStroke ? [liveStroke] : []), ...Array.from(remoteActive.values())].forEach(renderStroke);
  }, [strokes, liveStroke, remoteActive]);

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
    const s: Stroke = { id, pts: [pt], color: strokeColor, width: strokeWidth, tool, userId: currentUser.id };
    setLiveStroke(s);
    wbStrokeBegin(workspaceId, s);
  }, [color, width, tool, workspaceId, currentUser.id, wbStrokeBegin]);

  const onMove = useCallback((e: React.MouseEvent) => {
    if (!drawing.current || !liveStroke) return;
    const pt = getPos(e);
    setLiveStroke((s) => s ? { ...s, pts: [...s.pts, pt] } : s);
    wbStrokePoint(workspaceId, liveStroke.id, pt);
  }, [liveStroke, workspaceId, wbStrokePoint]);

  const onUp = useCallback(() => {
    if (!liveStroke) return;
    drawing.current = false;
    setStrokes((ss) => [...ss, liveStroke]);
    wbStrokeEnd(workspaceId, liveStroke.id);
    setLiveStroke(null);
  }, [liveStroke, workspaceId, wbStrokeEnd]);

  const handleUndo = () => {
    const myStrokes = strokes.filter((s) => s.userId === currentUser.id);
    if (!myStrokes.length) return;
    const last = myStrokes[myStrokes.length - 1];
    setStrokes((ss) => ss.filter((s) => s.id !== last.id));
    wbUndo(workspaceId, last.id);
  };

  const handleClear = () => {
    setStrokes([]); setRemoteActive(new Map()); setLiveStroke(null);
    wbClear(workspaceId);
  };

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
          <button onClick={handleUndo} data-tooltip="Undo (your strokes)"
            className="btn-ghost w-8 h-8 p-0 flex items-center justify-center rounded-xl"
            style={{ border: "1px solid var(--border)" }}>
            <Undo2 size={13} />
          </button>
          <button onClick={handleDownload} data-tooltip="Download PNG"
            className="btn-ghost w-8 h-8 p-0 flex items-center justify-center rounded-xl"
            style={{ border: "1px solid var(--border)" }}>
            <Download size={13} />
          </button>
          <button onClick={handleClear}
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
