// src/features/webcam-drawing/GestureCanvas.jsx
import { useRef, useEffect, useMemo, useState } from "react";
import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Camera } from "@mediapipe/camera_utils";
import "./GestureCanvas.css";

function Icon({ children }) {
  return <span className="gc-icon">{children}</span>;
}

const Icons = {
  brush: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 20c4 0 6-2 6-6 0-1 0-2 1-3l8-8 3 3-8 8c-1 1-2 1-3 1-4 0-6 2-6 6Z" />
      <path d="M14 6l4 4" />
    </svg>
  ),
  eraser: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 20H8l-4-4 10-10 8 8-6 6Z" />
      <path d="M6 16l4 4" />
    </svg>
  ),
  save: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2Z" />
      <path d="M7 21v-8h10v8" />
      <path d="M7 3v5h8" />
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M6 6l1 16h10l1-16" />
    </svg>
  ),
  mirror: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 4v16" />
      <path d="M7 8l-3 4 3 4" />
      <path d="M17 8l3 4-3 4" />
    </svg>
  ),
};

export default function GestureCanvas() {
  const videoRef = useRef(null);
  const drawCanvasRef = useRef(null);     // permanent drawing
  const overlayCanvasRef = useRef(null);  // landmarks overlay
  const cameraRef = useRef(null);
  const handsRef = useRef(null);

  // ---- UI state (only updated when needed) ----
  const [statusText, setStatusText] = useState("Waiting for hand...");
  const [tool, setTool] = useState("brush"); // brush | eraser
  const [mirrorView, setMirrorView] = useState(true);

  const [colorUI, setColorUI] = useState("#111111");
  const [brushUI, setBrushUI] = useState(6);
  const [cameraOn, setCameraOn] = useState(true);

  // ---- live refs (NO re-render spam) ----
  const toolRef = useRef("brush");
  const colorRef = useRef("#111111");
  const brushRef = useRef(6);
  const mirrorRef = useRef(true);

  useEffect(() => { toolRef.current = tool; }, [tool]);
  useEffect(() => { colorRef.current = colorUI; }, [colorUI]);
  useEffect(() => { brushRef.current = brushUI; }, [brushUI]);
  useEffect(() => { mirrorRef.current = mirrorView; }, [mirrorView]);

  // drawing refs
  const prevPosRef = useRef(null);
  const smoothPosRef = useRef(null); // Added for exponential smoothing
  const fistStartRef = useRef(null);
  const lastSaveRef = useRef(0);
  const drawingPointerRef = useRef(false);

  // throttle status updates
  const lastStatusRef = useRef({ text: "", t: 0 });
  const setStatusSafe = (text, minGapMs = 180) => {
    const now = Date.now();
    const last = lastStatusRef.current;
    if (text !== last.text && now - last.t > minGapMs) {
      lastStatusRef.current = { text, t: now };
      setStatusText(text);
    }
  };

  const getCtx = (ref) => ref.current?.getContext("2d");

  // Clear full backing store (resets transforms to ensure full clear)
  function clearCanvasFull(ctx, canvas) {
    try {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } finally {
      ctx.restore();
    }
  }

  // Resize canvas for DPR and keep drawing coordinates in CSS pixels
  function resizeForDPR(canvas, cssWidth, cssHeight) {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function saveDrawing() {
    const c = drawCanvasRef.current;
    if (!c) return;
    const link = document.createElement("a");
    link.download = `gesture_drawing_${Date.now()}.png`;
    link.href = c.toDataURL("image/png");
    link.click();
  }

  function exportDrawing() {
    // alias for now — future: export SVG/transparent PNG
    saveDrawing();
  }

  function clearDrawing() {
    const c = drawCanvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (ctx) clearCanvasFull(ctx, c);
    prevPosRef.current = null;
  }

  // Pointer (mouse/touch) drawing handlers so pointer input still works
  function getPointerPos(evt, canvas) {
    const rect = canvas.getBoundingClientRect();
    const x = (evt.clientX - rect.left);
    const y = (evt.clientY - rect.top);
    return { x, y };
  }

  function pointerStart(e) {
    const c = drawCanvasRef.current;
    if (!c) return;
    drawingPointerRef.current = true;
    c.setPointerCapture?.(e.pointerId);
    const pos = getPointerPos(e, c);
    prevPosRef.current = pos;
    // draw a dot immediately
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = brushRef.current;
      if (toolRef.current === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
        ctx.fillStyle = ctx.strokeStyle;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = colorRef.current;
        ctx.fillStyle = ctx.strokeStyle;
      }
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushRef.current / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function pointerMove(e) {
    if (!drawingPointerRef.current) return;
    const c = drawCanvasRef.current;
    if (!c) return;
    const pos = getPointerPos(e, c);
    const prev = prevPosRef.current;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = brushRef.current;
    if (toolRef.current === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.fillStyle = ctx.strokeStyle;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = colorRef.current;
      ctx.fillStyle = ctx.strokeStyle;
    }
    if (prev) {
      const dx = pos.x - prev.x;
      const dy = pos.y - prev.y;
      const dist = Math.hypot(dx, dy);
      const maxStep = Math.max(2, brushRef.current * 1.2);
      const steps = Math.min(16, Math.ceil(dist / maxStep));
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      for (let i = 1; i <= steps; i++) {
        const tseg = i / steps;
        ctx.lineTo(prev.x + dx * tseg, prev.y + dy * tseg);
      }
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushRef.current / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    prevPosRef.current = pos;
  }

  function pointerEnd(e) {
    const c = drawCanvasRef.current;
    if (c) c.releasePointerCapture?.(e.pointerId);
    drawingPointerRef.current = false;
    prevPosRef.current = null;
  }

  function isFingerExtended(landmarks, tipIdx, pipIdx) {
    try { return landmarks[tipIdx].y < landmarks[pipIdx].y; }
    catch { return false; }
  }

  // ---- main gesture handler (NO React state spam) ----
  function handleLandmarks(landmarks) {
    const drawC = drawCanvasRef.current;
    const overlayC = overlayCanvasRef.current;
    if (!drawC || !overlayC) return;

    const drawCtx = getCtx(drawCanvasRef);
    const overlayCtx = getCtx(overlayCanvasRef);
    if (!drawCtx || !overlayCtx) return;

    // clear overlay (backing-store aware)
    clearCanvasFull(overlayCtx, overlayC);

    // draw skeleton
    drawConnectors(overlayCtx, landmarks, HAND_CONNECTIONS, { color: "#22c55e", lineWidth: 2 });
    drawLandmarks(overlayCtx, landmarks, { color: "#ef4444", lineWidth: 1 });

    const tip = { index: 8, middle: 12, ring: 16, pinky: 20, thumb: 4 };
    const pip = { index: 6, middle: 10, ring: 14, pinky: 18 };

    const indexExtended = isFingerExtended(landmarks, tip.index, pip.index);
    const middleExtended = isFingerExtended(landmarks, tip.middle, pip.middle);
    const ringExtended = isFingerExtended(landmarks, tip.ring, pip.ring);
    const pinkyExtended = isFingerExtended(landmarks, tip.pinky, pip.pinky);

    const isOpenPalm = indexExtended && middleExtended && ringExtended && pinkyExtended;
    const isFist = !indexExtended && !middleExtended && !ringExtended && !pinkyExtended;
    const isPeace = indexExtended && middleExtended && !ringExtended && !pinkyExtended;
    const isPointing = indexExtended && !middleExtended;

    // coords (normalized -> CSS pixels)
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = drawC.clientWidth || Math.round(drawC.width / dpr);
    const h = drawC.clientHeight || Math.round(drawC.height / dpr);

    const index = landmarks[tip.index];
    const thumb = landmarks[tip.thumb];

    // Smoothing logic (Exponential Smoothing)
    // tuned for responsiveness while reducing jitter
    const smoothing = 0.22; // lower = smoother but more lag
    const lastPos = smoothPosRef.current || { x: index.x, y: index.y };
    const sx = lastPos.x + (index.x - lastPos.x) * smoothing;
    const sy = lastPos.y + (index.y - lastPos.y) * smoothing;
    smoothPosRef.current = { x: sx, y: sy };

    // mirror view: if UI mirrored, invert x so drawing matches what user sees
    const mx = mirrorRef.current ? (1 - sx) : sx;
    const tx = mirrorRef.current ? (1 - thumb.x) : thumb.x;

    const ix = mx * w;
    const iy = sy * h;

    // fist hold -> clear
    if (isFist) {
      if (!fistStartRef.current) fistStartRef.current = Date.now();
      const held = Date.now() - fistStartRef.current;

      overlayCtx.save();
      overlayCtx.font = "14px system-ui";
      overlayCtx.fillStyle = "#ef4444";
      overlayCtx.fillText(`Fist hold: ${(held / 1000).toFixed(1)}s`, 10, 20);
      overlayCtx.restore();

      if (held > 1800) {
        clearDrawing();
        setStatusSafe("Cleared (fist hold)");
        fistStartRef.current = null;
        smoothPosRef.current = null;
        return;
      }
    } else {
      fistStartRef.current = null;
    }

    // peace -> save (cooldown)
    if (isPeace) {
      const now = Date.now();
      if (now - lastSaveRef.current > 2000) {
        saveDrawing();
        lastSaveRef.current = now;
        setStatusSafe("Saved (peace sign)");
      }
      prevPosRef.current = null;
      smoothPosRef.current = null;
      return;
    }

    // open palm -> pause
    if (isOpenPalm) {
      prevPosRef.current = null;
      smoothPosRef.current = null;
      setStatusSafe("Paused (open palm)");
      return;
    }

    // pinch -> adjust brush size (but don't spam state)
    const pinchDist = Math.hypot((mx - tx) * w, (index.y - thumb.y) * h);
    const newBrush = Math.max(2, Math.min(30, Math.round(pinchDist / 10)));
    if (Math.abs(brushRef.current - newBrush) >= 1) {
      brushRef.current = newBrush;
      // update UI occasionally (not every frame)
      setBrushUI((prev) => (Math.abs(prev - newBrush) >= 2 ? newBrush : prev));
    }

    // draw when pointing
    if (isPointing) {
      const t = toolRef.current;
      const c = colorRef.current;
      const b = brushRef.current;

      drawCtx.lineCap = "round";
      drawCtx.lineJoin = "round";
      drawCtx.lineWidth = b;

      if (t === "eraser") {
        drawCtx.globalCompositeOperation = "destination-out";
        drawCtx.strokeStyle = "rgba(0,0,0,1)";
      } else {
        drawCtx.globalCompositeOperation = "source-over";
        drawCtx.strokeStyle = c;
      }
      // ensure fill uses same style (for dots)
      drawCtx.fillStyle = drawCtx.strokeStyle;

      const prev = prevPosRef.current;
      // interpolate if movement is large to avoid visible jumps
      if (prev) {
        const dx = ix - prev.x;
        const dy = iy - prev.y;
        const dist = Math.hypot(dx, dy);
        const maxStep = Math.max(2, b * 1.2);
        const steps = Math.min(16, Math.ceil(dist / maxStep));
        drawCtx.beginPath();
        drawCtx.moveTo(prev.x, prev.y);
        for (let i = 1; i <= steps; i++) {
          const tseg = i / steps;
          drawCtx.lineTo(prev.x + dx * tseg, prev.y + dy * tseg);
        }
        drawCtx.stroke();
      } else {
        // Dot if just starting
        drawCtx.beginPath();
        drawCtx.arc(ix, iy, b / 2, 0, Math.PI * 2);
        drawCtx.fill();
      }

      prevPosRef.current = { x: ix, y: iy };
      setStatusSafe(`Drawing — ${t === "eraser" ? "Eraser" : "Brush"} • ${b}px`);
    } else {
      prevPosRef.current = null;
      smoothPosRef.current = null;
      setStatusSafe("Hand detected — not drawing");
    }
  }

  // Setup MediaPipe hands + camera
  useEffect(() => {
    const video = videoRef.current;
    const drawC = drawCanvasRef.current;
    const overlayC = overlayCanvasRef.current;
    if (!video || !drawC || !overlayC) return;

    // responsive: fit container width, keep 4:3 and support high-DPI
    const baseW = 960;
    const baseH = 720;

    // Size video and canvases in CSS pixels then set backing store to DPR
    video.width = baseW;
    video.height = baseH;
    video.style.width = `${baseW}px`;
    video.style.height = `${baseH}px`;

    resizeForDPR(drawC, baseW, baseH);
    resizeForDPR(overlayC, baseW, baseH);

    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    hands.onResults((results) => {
      const overlayCtx = getCtx(overlayCanvasRef);
      if (!overlayCtx || !overlayC) return;

      // clear full backing store to avoid ghosting across DPR
      clearCanvasFull(overlayCtx, overlayC);

      const lm = results.multiHandLandmarks?.[0];
      if (lm) {
        try {
          handleLandmarks(lm);
        } catch (err) {
          console.error("handleLandmarks error:", err);
          setStatusSafe("Gesture error (check console)");
        }
      } else {
        prevPosRef.current = null;
        setStatusSafe("No hand detected", 250);
      }
    });

    const camera = new Camera(video, {
      onFrame: async () => {
        await hands.send({ image: video });
      },
      width: baseW,
      height: baseH,
    });

    cameraRef.current = camera;
    handsRef.current = hands;

    // start camera only if enabled
    if (cameraOn) {
      camera.start().catch((err) => {
        console.error("Camera start failed:", err);
        setStatusSafe("Camera start failed");
      });
    }

    return () => {
      try { camera.stop(); } catch { }
      try { hands.close(); } catch { }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraOn]);

  // Attach pointer listeners to draw canvas so mouse/touch drawing works
  useEffect(() => {
    const c = drawCanvasRef.current;
    if (!c) return;
    c.style.touchAction = "none";
    c.addEventListener("pointerdown", pointerStart);
    window.addEventListener("pointermove", pointerMove);
    window.addEventListener("pointerup", pointerEnd);
    return () => {
      c.removeEventListener("pointerdown", pointerStart);
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerup", pointerEnd);
    };
  }, []);

  const currentColor = useMemo(() => colorUI, [colorUI]);

  return (
    <div className="gc-wrap">
      {/* TOP TOOLBAR (Paint-like) */}
      <div className="gc-topbar">
        <div className="gc-brand">SmartCanvas</div>

        <button className={`gc-btn ${tool === "brush" ? "isActive" : ""}`} onClick={() => setTool("brush")}>
          <Icon>{Icons.brush}</Icon> Brush
        </button>

        <button className={`gc-btn ${tool === "eraser" ? "isActive" : ""}`} onClick={() => setTool("eraser")}>
          <Icon>{Icons.eraser}</Icon> Eraser
        </button>

        <div className="gc-sep" />

        <label className="gc-color">
          <span className="gc-label">Color</span>
          <input
            type="color"
            value={currentColor}
            onChange={(e) => setColorUI(e.target.value)}
            aria-label="Color picker"
          />
        </label>

        <label className="gc-size">
          <span className="gc-label">Size</span>
          <input
            type="range"
            min="2"
            max="30"
            value={brushUI}
            onChange={(e) => setBrushUI(+e.target.value)}
            aria-label="Brush size"
          />
          <span className="gc-sizeval">{brushUI}px</span>
        </label>

        <div className="gc-sep" />

        <button className="gc-btn" onClick={() => setMirrorView((v) => !v)}>
          <Icon>{Icons.mirror}</Icon> {mirrorView ? "Mirror On" : "Mirror Off"}
        </button>

        <div className="gc-spacer" />

        <button className="gc-btn" onClick={saveDrawing}>
          <Icon>{Icons.save}</Icon> Save
        </button>
        <button className="gc-btn" onClick={exportDrawing} style={{background:'linear-gradient(180deg,#8b5cf6,#d946ef)',color:'#fff'}}>
          Export
        </button>
        <button className="gc-btn danger" onClick={clearDrawing}>
          <Icon>{Icons.trash}</Icon> Clear
        </button>
      </div>

      {/* Top-right floating controls */}
      <div className="gc-topRight">
        <button className="gc-swatch" title="Current color" onClick={() => {/* future: open palette */}} style={{background: colorUI, boxShadow:'0 6px 20px rgba(139,92,246,0.12)'}} />
        <div className="gc-topActions">
          <button className="gc-small gc-shadow" onClick={saveDrawing}>Save</button>
          <button className="gc-small gc-primary" onClick={exportDrawing}>Export</button>
        </div>
      </div>

      {/* LEFT TOOL RAIL */}
      <div className="gc-left">
        <div>
          <button className={`gc-rail-btn ${tool === "brush" ? "active" : ""}`} onClick={() => setTool("brush")}>
            <Icon>{Icons.brush}</Icon>
          </button>
          <button className={`gc-rail-btn ${tool === "eraser" ? "active" : ""}`} onClick={() => setTool("eraser")}>
            <Icon>{Icons.eraser}</Icon>
          </button>
          <button className={`gc-rail-btn ${cameraOn ? "active" : ""}`} onClick={() => {
            setCameraOn((v) => !v);
            const cam = cameraRef.current;
            if (cam) {
              if (!cameraOn) cam.start().catch(() => setStatusSafe("Camera start failed"));
              else cam.stop();
            }
          }} title="Toggle Camera (gestures)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 7l-6 0-2-3-2 3-6 0a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2z" />
            </svg>
          </button>
          <button className="gc-rail-btn" onClick={() => clearDrawing()} title="Clear">
            <Icon>{Icons.trash}</Icon>
          </button>
        </div>
        <div style={{marginTop:12}}>
          <div className="gc-rail-size">{brushUI}px</div>
        </div>
      </div>

      {/* CANVAS AREA */}
      <div className="gc-stage">
        {/* hidden video for MediaPipe */}
        <video ref={videoRef} className="gc-video" autoPlay playsInline muted />

        <div className={`gc-canvasBox ${mirrorView ? "mirrored" : ""}`}>
          <canvas ref={drawCanvasRef} className="gc-canvas draw" />
          <canvas ref={overlayCanvasRef} className="gc-canvas overlay" />
        </div>

        {/* STATUS + HELP */}
        <div className="gc-status">
          <div className="gc-pill">
            <b>Status:</b> {statusText}
          </div>

          <div className="gc-help">
            <b>Gestures:</b> Point = draw • Open palm = pause • Peace = save • Fist hold (1.8s) = clear
          </div>
        </div>
      </div>

      {/* Right floating Layers panel */}
      <div className="gc-layers">
        <div className="gl-header">
          <strong>Layers</strong>
          <button className="gl-add">+</button>
        </div>
        <div className="gl-body">
          <div className="gl-item gl-active">
            <div className="gl-item-title">Layer 1</div>
            <input type="range" min="0" max="100" defaultValue="100" />
          </div>
          <div className="gl-item">
            <div className="gl-item-title">Background</div>
            <input type="range" min="0" max="100" defaultValue="100" />
          </div>
        </div>
      </div>
    </div>
  );
}
