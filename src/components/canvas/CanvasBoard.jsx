import { useRef, useEffect, useState, useCallback } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';

const CanvasBoard = () => {
  const { tool, color, brushSize, layers, activeLayerId, clearTrigger, airDrawEvent } = useCanvasStore();
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [airCursor, setAirCursor] = useState(null);
  
  // We need multiple canvas refs, one for each layer
  const containerRef = useRef(null);
  const layerRefs = useRef({}); // { layerId: HTMLCanvasElement }
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState(null);
  
  // Create a scratch canvas for previewing shapes before committing
  const scratchCanvasRef = useRef(null);

  // Helper to get active canvas
  const getActiveContext = useCallback(() => {
    if (!activeLayerId) return null;
    const canvas = layerRefs.current[activeLayerId];
    if (!canvas) return null;
    return canvas.getContext('2d');
  }, [activeLayerId]);

  const getScratchContext = useCallback(() => {
    if (!scratchCanvasRef.current) return null;
    return scratchCanvasRef.current.getContext('2d');
  }, []);

  const clearScratchCanvas = useCallback(() => {
    const ctx = getScratchContext();
    if (ctx) ctx.clearRect(0, 0, size.width, size.height);
  }, [size, getScratchContext]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle clear canvas action
  useEffect(() => {
    if (clearTrigger) {
      Object.keys(layerRefs.current).forEach(key => {
        const canvas = layerRefs.current[key];
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, size.width, size.height);
        }
      });
      clearScratchCanvas();
    }
  }, [clearTrigger, size, clearScratchCanvas]);

  // Handle air drawing events
  useEffect(() => {
    if (!airDrawEvent) {
      setAirCursor(null);
      return;
    }
    
    const { x, y, type } = airDrawEvent;
    // Map normalized camera coords to window coords
    const clientX = x * window.innerWidth;
    const clientY = y * window.innerHeight;
    
    setAirCursor({ x: clientX, y: clientY, isPinching: type === 'down' || type === 'move' });

    const mockEvent = {
      preventDefault: () => {},
      clientX,
      clientY
    };

    if (type === 'down') {
      startDrawing(mockEvent);
    } else if (type === 'move') {
      draw(mockEvent);
    } else if (type === 'up') {
      stopDrawing();
    }
  }, [airDrawEvent]);

  const getCoordinates = (e) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    
    // Check if it's a touch event
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    if (tool === 'select') return;
    const pos = getCoordinates(e.nativeEvent || e);
    setIsDrawing(true);
    setLastPos(pos);
    setStartPos(pos); // Record start position for shapes

    // Initialize context state
    const ctx = getActiveContext();
    if (ctx && (tool === 'brush' || tool === 'eraser')) {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const pos = getCoordinates(e.nativeEvent || e);
    const ctx = getActiveContext();
    const sCtx = getScratchContext();
    
    if (!ctx || !sCtx) return;

    // For continuous drawing (brush/eraser)
    if (tool === 'brush' || tool === 'eraser') {
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color; // Assuming white bg, but really it should use composite operation
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }
      
      ctx.stroke();
      setLastPos(pos);
    } 
    // For shapes, draw to scratch canvas to show preview
    else if (startPos && (tool === 'rectangle' || tool === 'circle' || tool === 'line')) {
      clearScratchCanvas();
      
      sCtx.strokeStyle = color;
      sCtx.lineWidth = brushSize;
      sCtx.lineCap = 'round';
      sCtx.beginPath();
      
      if (tool === 'rectangle') {
        sCtx.rect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2));
        sCtx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      } else if (tool === 'line') {
        sCtx.moveTo(startPos.x, startPos.y);
        sCtx.lineTo(pos.x, pos.y);
      }
      sCtx.stroke();
    }
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    const ctx = getActiveContext();
    
    if (tool === 'brush' || tool === 'eraser') {
      if (ctx) ctx.closePath();
    } else if (startPos && (tool === 'rectangle' || tool === 'circle' || tool === 'line')) {
      // Commit shape from scratch to active canvas
      const sCanvas = scratchCanvasRef.current;
      if (ctx && sCanvas) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(sCanvas, 0, 0);
        clearScratchCanvas();
      }
    }
    
    setIsDrawing(false);
    setStartPos(null);
  };

  return (
    <div 
      className="relative flex items-center justify-center w-full h-full bg-slate-100"
      style={{ cursor: tool === 'select' ? 'default' : 'crosshair' }}
    >
      <div 
        ref={containerRef}
        className="relative bg-white shadow-sm overflow-hidden w-full h-full cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      >
        {/* Render each layer as a separate absolute canvas */}
        {layers.map((layer, index) => (
          <canvas
            key={layer.id}
            ref={el => layerRefs.current[layer.id] = el}
            width={size.width}
            height={size.height}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: index,
              opacity: layer.visible ? layer.opacity : 0,
              pointerEvents: 'none'
            }}
          />
        ))}
        
        {/* Scratch Canvas for tool previews */}
        <canvas
          ref={scratchCanvasRef}
          width={size.width}
          height={size.height}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: layers.length,
            pointerEvents: 'none',
            opacity: 1
          }}
        />
        {/* Air Draw Cursor Overlay */}
        {airCursor && (
          <div 
            className="absolute rounded-full pointer-events-none z-50 transition-transform duration-75"
            style={{
              left: airCursor.x,
              top: airCursor.y,
              width: airCursor.isPinching ? brushSize : 12,
              height: airCursor.isPinching ? brushSize : 12,
              backgroundColor: airCursor.isPinching ? color : 'transparent',
              border: `2px solid ${airCursor.isPinching ? 'white' : color}`,
              transform: 'translate(-50%, -50%)',
              boxShadow: airCursor.isPinching ? '0 0 10px rgba(0,0,0,0.2)' : 'none'
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CanvasBoard;
