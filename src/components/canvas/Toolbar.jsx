import { useCanvasStore } from '../../store/useCanvasStore';
import { Pen, Eraser, Square, Circle, Minus, MousePointer2, Trash2, Camera } from 'lucide-react';

const Toolbar = () => {
  const { tool, setTool, brushSize, setBrushSize, isAirDrawEnabled, toggleAirDraw } = useCanvasStore();

  const tools = [
    { id: 'select', icon: <MousePointer2 size={20} />, label: 'Select/Move' },
    { id: 'brush', icon: <Pen size={20} />, label: 'Brush (B)' },
    { id: 'eraser', icon: <Eraser size={20} />, label: 'Eraser (E)' },
    { id: 'rectangle', icon: <Square size={20} />, label: 'Rectangle (R)' },
    { id: 'circle', icon: <Circle size={20} />, label: 'Circle (C)' },
    { id: 'line', icon: <Minus size={20} />, label: 'Line (L)' },
  ];

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the entire canvas?')) {
      useCanvasStore.getState().clearCanvas();
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-darkCard/80 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-xl w-16 items-center">
      {tools.map((t) => (
        <button
          key={t.id}
          onClick={() => setTool(t.id)}
          className={`p-3 rounded-xl transition-all ${
            tool === t.id
              ? 'bg-primary text-white shadow-lg shadow-primary/25'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title={t.label}
        >
          {t.icon}
        </button>
      ))}

      <div className="w-full flex justify-center py-2 border-t border-slate-200 mt-2">
        <div className="relative h-32 flex flex-col items-center justify-between w-full">
          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-32 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer transform -rotate-90 top-1/2 -mt-1 absolute outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
          />
        </div>
      </div>
      <div className="text-xs text-slate-500 font-medium">{brushSize}px</div>
      
      <div className="w-full flex justify-center py-2 border-t border-slate-200 mt-2 gap-2 flex-col items-center">
        <button
          onClick={toggleAirDraw}
          className={`p-3 rounded-xl transition-all ${
            isAirDrawEnabled
              ? 'bg-primary text-white shadow-md'
              : 'text-slate-500 hover:text-primary hover:bg-slate-100'
          }`}
          title="Air Draw (Webcam)"
        >
          <Camera size={20} />
        </button>
        <button
          onClick={handleClear}
          className="p-3 rounded-xl text-slate-400 hover:text-red-500 hover:bg-slate-100 transition-colors"
          title="Clear Canvas"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
