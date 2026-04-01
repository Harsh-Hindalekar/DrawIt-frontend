import React, { useRef } from "react";
import { addCircle, addLine, addRect, addBitmapFromDataURL, redoFrame, undoFrame } from "../utils/thumbs";

export default function Toolbar(props) {
  const {
    playing, toolMode, setToolMode,
    brushTool, setBrushTool,
    color, setColor,
    size, setSize,
    onionSkin, setOnionSkin,
    onionOpacity, setOnionOpacity,
    fps, setFps, setPlaying,
    frames, activeIndex, setFrames, setSelectedId
  , vertical = false
  } = props;

  const fileInputRef = useRef(null);

  const pickImage = () => fileInputRef.current?.click();

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataURL = reader.result;
      setToolMode("select");
      const id = addBitmapFromDataURL(setFrames, activeIndex, dataURL);
      setSelectedId(id);
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fc-rail">
      <div className="fc-rail-group">
        <button className={`fc-rail-btn ${toolMode === 'select' ? 'active' : ''}`} onClick={() => setToolMode('select')} title="Select">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l18 18" stroke="none"/></svg>
        </button>

        <button className={`fc-rail-btn ${toolMode === 'draw' ? 'active' : ''}`} onClick={() => setToolMode('draw')} title="Draw">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20c4 0 6-2 6-6 0-1 0-2 1-3l8-8 3 3-8 8c-1 1-2 1-3 1-4 0-6 2-6 6Z"/></svg>
        </button>

        <button className={`fc-rail-btn ${toolMode === 'cut' ? 'active' : ''}`} onClick={() => setToolMode('cut')} title="Cut & Move">
          ✂
        </button>

        <button className="fc-rail-btn" onClick={() => { setToolMode('select'); setSelectedId(addRect(setFrames, activeIndex)); }} title="Add Rect">▭</button>
        <button className="fc-rail-btn" onClick={() => { setToolMode('select'); setSelectedId(addCircle(setFrames, activeIndex)); }} title="Add Circle">◯</button>
        <button className="fc-rail-btn" onClick={() => { setToolMode('select'); setSelectedId(addLine(setFrames, activeIndex)); }} title="Add Line">／</button>

        <button className="fc-rail-btn" onClick={pickImage} title="Add Image">🖼️</button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={onPickImage} style={{ display: "none" }} />
      </div>

      <div className="fc-rail-group">
        <button className="fc-rail-btn" onClick={() => undoFrame(setFrames, activeIndex)} title="Undo">↺</button>
        <button className="fc-rail-btn" onClick={() => redoFrame(setFrames, activeIndex)} title="Redo">↻</button>
      </div>

      <div className="fc-rail-bottom">
        <div className={`fc-onion ${onionSkin ? 'enabled' : ''}`} onClick={() => setOnionSkin(s => !s)} title="Onion Skin">
          <div className="fc-onion-label">Onion</div>
        </div>
        <div className="fc-size-display">{size}px</div>
      </div>
    </div>
  );
}
