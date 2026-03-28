import React, { useRef, useState, useEffect } from "react";
import { detectIntent } from "./intentAI";
import { makeShape } from "./shapeFactory";
import AirDraw from "../../components/canvas/AirDraw";
import { useCanvasStore } from "../../store/useCanvasStore";

export default function AiDrawing() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [elements, setElements] = useState([]);
  const elementsRef = useRef([]);
  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  const [tool, setTool] = useState("pencil"); 
  const [aiMode, setAiMode] = useState(true);
  const [color, setColor] = useState("#000");
  const [size, setSize] = useState(2);

  const [drawing, setDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const actionRef = useRef(null);
  const [textEditor, setTextEditor] = useState(null);

  // Air Draw integration
  const { airDrawEvent, isAirDrawEnabled, toggleAirDraw } = useCanvasStore();

  const [canvasSize, setCanvasSize] = useState({ 
    w: window.innerWidth - 400, 
    h: window.innerHeight - 250 
  });

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({ 
        w: window.innerWidth - 400, 
        h: window.innerHeight - 250 
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const CANVAS_W = Math.max(800, canvasSize.w);
  const CANVAS_H = Math.max(500, canvasSize.h);

  /* ---------------- SETUP ---------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;
    redraw(elementsRef.current);
  }, [CANVAS_W, CANVAS_H]);

  /* ---------------- UTIL ---------------- */
  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const getBounds = (pts) => {
    if (!pts || pts.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0, w: 0, h: 0 };
    let minX = pts[0].x, maxX = pts[0].x, minY = pts[0].y, maxY = pts[0].y;
    pts.forEach((p) => {
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
    });
    return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
  };

  const hitTest = (x, y) => {
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      if (el.type === "image") {
        const dx = x - el.cx; const dy = y - el.cy;
        if (Math.abs(dx) < el.w / 2 && Math.abs(dy) < el.h / 2) return el;
      } else if (el.type === "text") {
        const b = el.bounds;
        if (x >= b.minX && x <= b.maxX && y >= b.minY && y <= b.maxY) return el;
      } else {
        const b = el.bounds;
        const padding = 10;
        if (x >= b.minX - padding && x <= b.maxX + padding && y >= b.minY - padding && y <= b.maxY + padding) return el;
      }
    }
    return null;
  };

  const isInResizeHandle = (x, y, b) => {
    const handleSize = 10;
    return x >= b.maxX - handleSize && x <= b.maxX + handleSize && y >= b.maxY - handleSize && y <= b.maxY + handleSize;
  };

  const isInRotateHandle = (x, y, b) => {
    const handleSize = 10;
    const rx = b.cx; const ry = b.minY - 25;
    return x >= rx - handleSize && x <= rx + handleSize && y >= ry - handleSize && y <= ry + handleSize;
  };

  const rotatePoint = (px, py, cx, cy, angle) => {
    const s = Math.sin(angle); const c = Math.cos(angle);
    px -= cx; py -= cy;
    const nx = px * c - py * s; const ny = px * s + py * c;
    return { x: nx + cx, y: ny + cy };
  };

  const applyPen = (ctx, t, s) => {
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    if (t === "marker") { ctx.lineWidth = s * 2; ctx.globalAlpha = 0.8; }
    else if (t === "highlighter") { ctx.lineWidth = s * 4; ctx.globalAlpha = 0.4; }
    else if (t === "brush") { ctx.lineWidth = s * 3; ctx.globalAlpha = 0.9; }
    else { ctx.lineWidth = s; ctx.globalAlpha = 1.0; }
  };

  const redraw = (els) => {
    const ctx = ctxRef.current; if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    els.forEach((el) => {
      ctx.save();
      if (el.type === "image") {
        ctx.translate(el.cx, el.cy); ctx.rotate(el.angle || 0);
        ctx.drawImage(el.img, -el.w / 2, -el.h / 2, el.w, el.h);
      } else if (el.type === "text") {
        ctx.font = `${el.fontSize || 28}px ${el.fontFamily || "Arial"}`;
        ctx.fillStyle = el.color || "#000"; ctx.textBaseline = "top";
        ctx.fillText(el.text, el.x, el.y);
      } else {
        ctx.strokeStyle = el.color || "#000"; applyPen(ctx, el.tool, el.size);
        ctx.beginPath();
        el.points.forEach((p, idx) => { if (idx === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
        ctx.stroke();
      }
      if (el.id === selectedId) {
        const b = el.bounds || (el.type === "image" ? { minX: el.cx - el.w/2, minY: el.cy - el.h/2, maxX: el.cx + el.w/2, maxY: el.cy + el.h/2, cx: el.cx, cy: el.cy } : null);
        if (b) {
          ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 1; ctx.setLineDash([5, 5]);
          ctx.strokeRect(b.minX - 5, b.minY - 5, (b.maxX - b.minX) + 10, (b.maxY - b.minY) + 10);
          ctx.setLineDash([]); ctx.fillStyle = "#3b82f6";
          ctx.fillRect(b.maxX - 2, b.maxY - 2, 10, 10);
          ctx.beginPath(); ctx.arc(b.cx, b.minY - 25, 6, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.restore();
    });
  };

  /* ---------------- HISTORY ---------------- */
  const [history, setHistory] = useState([[]]);
  const [step, setStep] = useState(0);

  const commit = (newEls) => {
    const next = history.slice(0, step + 1);
    setHistory([...next, newEls]);
    setStep(next.length);
    setElements(newEls);
    redraw(newEls);
  };

  const undo = () => { if (step > 0) { const s = step - 1; setStep(s); setElements(history[s]); redraw(history[s]); } };
  const redo = () => { if (step < history.length - 1) { const s = step + 1; setStep(s); setElements(history[s]); redraw(history[s]); } };

  /* ---------------- EVENTS ---------------- */
  const onDown = (e) => {
    const p = getPos(e);
    const hit = hitTest(p.x, p.y);

    if (hit) {
      setSelectedId(hit.id);
      const b = hit.bounds || (hit.type === "image" ? { minX: hit.cx - hit.w/2, minY: hit.cy - hit.h/2, maxX: hit.cx + hit.w/2, maxY: hit.cy + hit.h/2, cx: hit.cx, cy: hit.cy } : null);
      if (b && isInRotateHandle(p.x, p.y, b)) {
        actionRef.current = { id: hit.id, kind: "rotate", cx: b.cx, cy: b.cy, startAngle: Math.atan2(p.y - b.cy, p.x - b.cx), originalPoints: hit.type === "stroke" ? [...hit.points] : null, originalImage: hit.type === "image" ? { ...hit } : null };
        return;
      }
      if (b && isInResizeHandle(p.x, p.y, b)) {
        actionRef.current = { id: hit.id, kind: "resize", baseBounds: { ...b }, originalPoints: hit.type === "stroke" ? [...hit.points] : null, originalImage: hit.type === "image" ? { ...hit } : null };
        return;
      }
      actionRef.current = { id: hit.id, kind: "move", lastPointer: p };
      return;
    }

    setSelectedId(null); setDrawing(true); setPoints([p]);
    const ctx = ctxRef.current; ctx.beginPath(); ctx.moveTo(p.x, p.y);
    if (tool === "eraser") { ctx.globalCompositeOperation = "destination-out"; ctx.lineWidth = size * 2; }
    else { ctx.globalCompositeOperation = "source-over"; ctx.strokeStyle = color; applyPen(ctx, tool, size); }
  };

  const onMove = (e) => {
    const p = getPos(e);
    if (actionRef.current) {
      const act = actionRef.current;
      setElements((prev) => {
        const next = prev.map((el) => {
          if (el.id !== act.id) return el;
          if (act.kind === "move") {
            const dx = p.x - act.lastPointer.x; const dy = p.y - act.lastPointer.y;
            act.lastPointer = p;
            if (el.type === "image") return { ...el, cx: el.cx + dx, cy: el.cy + dy };
            const moved = el.points.map((pt) => ({ x: pt.x + dx, y: pt.y + dy }));
            return { ...el, points: moved, bounds: getBounds(moved) };
          }
          if (act.kind === "resize") {
            const bb = act.baseBounds;
            const sx = Math.max(0.1, (p.x - bb.minX) / bb.w); const sy = Math.max(0.1, (p.y - bb.minY) / bb.h);
            if (el.type === "image") return { ...el, w: act.originalImage.w * sx, h: act.originalImage.h * sy };
            const scaled = act.originalPoints.map((pt) => ({ x: bb.minX + (pt.x - bb.minX) * sx, y: bb.minY + (pt.y - bb.minY) * sy }));
            return { ...el, points: scaled, bounds: getBounds(scaled) };
          }
          if (act.kind === "rotate") {
            const now = Math.atan2(p.y - act.cy, p.x - act.cx);
            const delta = now - act.startAngle;
            if (el.type === "image") return { ...el, angle: (act.originalImage.angle || 0) + delta };
            const rotated = act.originalPoints.map((pt) => rotatePoint(pt.x, pt.y, act.cx, act.cy, delta));
            return { ...el, points: rotated, bounds: getBounds(rotated) };
          }
          return el;
        });
        redraw(next); return next;
      });
      return;
    }
    if (!drawing) return;
    const ctx = ctxRef.current;
    if (tool === "eraser") { ctx.globalCompositeOperation = "destination-out"; ctx.lineWidth = size * 2; }
    else { ctx.globalCompositeOperation = "source-over"; ctx.strokeStyle = color; applyPen(ctx, tool, size); }
    ctx.lineTo(p.x, p.y); ctx.stroke();
    setPoints((prev) => [...prev, p]);
  };

  const onUp = () => {
    if (actionRef.current) { actionRef.current = null; commit(elementsRef.current); return; }
    if (!drawing) return;
    setDrawing(false);
    let finalPts = points;
    if (aiMode && tool !== "eraser") { finalPts = makeShape(detectIntent(points), points); }
    const newEl = { id: Date.now(), type: "stroke", points: finalPts, bounds: getBounds(finalPts), color, tool, size };
    commit([...elementsRef.current, newEl]);
    setPoints([]);
  };

  /* ---------------- FEATURE FUNCTIONS ---------------- */
  const onImportImage = (file) => {
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const w = Math.min(500, img.width); const h = (img.height / img.width) * w;
      const newEl = { id: Date.now(), type: "image", img, cx: CANVAS_W / 2, cy: CANVAS_H / 2, w, h, angle: 0 };
      commit([...elementsRef.current, newEl]);
    };
    img.src = URL.createObjectURL(file);
  };

  const bringFront = () => {
    if (!selectedId) return;
    const arr = [...elementsRef.current]; const idx = arr.findIndex((e) => e.id === selectedId);
    if (idx < 0) return; const [it] = arr.splice(idx, 1); arr.push(it); commit(arr);
  };

  const sendBack = () => {
    if (!selectedId) return;
    const arr = [...elementsRef.current]; const idx = arr.findIndex((e) => e.id === selectedId);
    if (idx < 0) return; const [it] = arr.splice(idx, 1); arr.unshift(it); commit(arr);
  };

  const deleteSelected = () => { if (!selectedId) return; commit(elementsRef.current.filter((e) => e.id !== selectedId)); setSelectedId(null); };
  const savePNG = () => { const a = document.createElement("a"); a.href = canvasRef.current.toDataURL("image/png"); a.download = "canvas.png"; a.click(); };

  /* ---------------- HOOKS ---------------- */
  useEffect(() => {
    const onKeyDown = (e) => {
      const ctrl = e.metaKey || e.ctrlKey;
      if (ctrl && e.key === "z") { e.preventDefault(); undo(); }
      else if ((ctrl && e.key === "y") || (ctrl && e.shiftKey && e.key === "z")) { e.preventDefault(); redo(); }
      else if (e.key === "Delete" || e.key === "Backspace") { if (selectedId) { e.preventDefault(); deleteSelected(); } }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId]);

  useEffect(() => {
    if (!airDrawEvent || !isAirDrawEnabled) return;
    const { x, y, type } = airDrawEvent; const px = x * CANVAS_W; const py = y * CANVAS_H; const p = { x: px, y: py };
    if (type === "down") {
      setSelectedId(null); setDrawing(true); setPoints([p]);
      const ctx = ctxRef.current; ctx.beginPath(); ctx.moveTo(p.x, p.y);
      if (tool === "eraser") { ctx.globalCompositeOperation = "destination-out"; ctx.lineWidth = size * 2; }
      else { ctx.globalCompositeOperation = "source-over"; ctx.strokeStyle = color; applyPen(ctx, tool, size); }
    } else if (type === "move" && drawing) {
      const ctx = ctxRef.current; ctx.lineTo(p.x, p.y); ctx.stroke();
      setPoints((prev) => [...prev, p]);
    } else if (type === "up" && drawing) { onUp(); }
  }, [airDrawEvent, isAirDrawEnabled]);

  const cursor = actionRef.current ? "grabbing" : drawing ? (tool === "eraser" ? "cell" : "crosshair") : selectedId ? "move" : "default";

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-slate-50 text-slate-800 p-4">
      <div className="w-full max-w-[1800px] flex flex-col items-center">
        <div className="glass-panel w-full flex flex-wrap items-center gap-3 p-3 mb-6 sticky top-4 z-50">
          <b className="mr-4 text-primary-dark font-bold text-lg flex items-center gap-2">✨ SmartCanvas AI</b>
          <button className="btn-secondary text-xs px-3" onClick={undo}>Undo</button>
          <button className="btn-secondary text-xs px-3" onClick={redo}>Redo</button>
          <div className="w-px h-6 bg-slate-200 mx-1" />
          <button className={`text-xs py-1.5 px-4 rounded-full font-bold ${aiMode ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`} onClick={() => setAiMode(!aiMode)}>AI {aiMode ? "ON" : "OFF"}</button>
          <button className={`text-xs py-1.5 px-4 rounded-full font-bold flex items-center gap-2 ${isAirDrawEnabled ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-500'}`} onClick={toggleAirDraw}>🖐️ AIR DRAW {isAirDrawEnabled ? "ON" : "OFF"}</button>
          <div className="w-px h-6 bg-slate-200 mx-1" />
          <button className="btn-secondary text-[10px] px-3 disabled:opacity-30" onClick={bringFront} disabled={!selectedId}>Front</button>
          <button className="btn-secondary text-[10px] px-3 disabled:opacity-30" onClick={sendBack} disabled={!selectedId}>Back</button>
          <button className="btn-secondary text-[10px] px-3 text-red-500 border-red-100 disabled:opacity-30" onClick={deleteSelected} disabled={!selectedId}>Delete</button>
          <div className="flex-1" />
          <label className="btn-secondary text-xs px-4 cursor-pointer">🖼️ Import Image <input type="file" accept="image/*" className="hidden" onChange={(e) => onImportImage(e.target.files?.[0])} /></label>
          <button className="btn-primary text-xs px-5 shadow-lg shadow-primary/20" onClick={savePNG}>Save Canvas</button>
          <button className="text-xs p-1.5 bg-red-50 text-red-600 rounded-lg" onClick={() => { if (window.confirm("Clear everything?")) commit([]); }}>🗑️</button>
        </div>

        <div className="flex gap-6 items-start justify-center w-full">
          <div className="flex flex-col gap-4 glass-panel p-4 sticky top-24">
            {["pencil", "marker", "highlighter", "brush", "eraser"].map((t) => (
              <button key={t} className={`text-sm py-2 px-4 rounded-xl font-semibold capitalize ${tool === t ? 'bg-primary text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`} onClick={() => { setTool(t); setSelectedId(null); }}>{t}</button>
            ))}
            <div className="w-full h-px bg-slate-100" />
            <div className="grid grid-cols-2 gap-2">
              {["#000000", "#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7"].map((c) => (
                <div key={c} className={`w-7 h-7 rounded-full cursor-pointer border-2 ${color === c ? 'border-primary scale-110' : 'border-white'}`} style={{ background: c }} onClick={() => setColor(c)} />
              ))}
            </div>
            <div className="w-full h-px bg-slate-100" />
            <input type="range" min="1" max="30" value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full h-1 accent-primary" />
          </div>

          <div className="flex-shrink-0 relative shadow-2xl border-8 border-white rounded-2xl overflow-hidden bg-white" style={{ width: CANVAS_W, height: CANVAS_H }}>
            <canvas ref={canvasRef} style={{ cursor, background: "#fff" }} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} />
            {elements.length === 0 && !drawing && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-20 transition-opacity">
                <p className="text-xl font-bold text-slate-400">Start your masterpiece...</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {isAirDrawEnabled && <AirDraw onClose={toggleAirDraw} />}
    </div>
  );
}
