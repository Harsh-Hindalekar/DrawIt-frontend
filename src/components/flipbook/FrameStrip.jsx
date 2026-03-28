import { useFlipbookStore } from '../../store/useFlipbookStore';
import { Plus, Copy, Trash2 } from 'lucide-react';

const FrameStrip = () => {
  const { 
    frames, 
    currentFrameIndex, 
    setCurrentFrame, 
    addFrame, 
    duplicateFrame, 
    deleteFrame 
  } = useFlipbookStore();

  return (
    <div className="flex-1 overflow-x-auto flex items-center gap-2 px-4 custom-scrollbar h-full">
      {frames.map((frame, index) => (
        <div 
          key={frame.id}
          className={`relative group shrink-0 h-16 w-24 rounded-lg border-2 cursor-pointer overflow-hidden transition-all ${
            currentFrameIndex === index 
              ? 'border-secondary shadow-[0_0_10px_rgba(236,72,153,0.5)] bg-slate-100' 
              : 'border-slate-200 bg-darkBg hover:border-slate-400'
          }`}
          onClick={() => setCurrentFrame(index)}
        >
          {/* Frame Preview Image if exists */}
          {frame.dataUrl ? (
            <img src={frame.dataUrl} alt={`Frame ${index + 1}`} className="w-full h-full object-contain bg-white" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 bg-white/5">
              {index + 1}
            </div>
          )}
          
          {/* Frame Number Badge */}
          <div className="absolute top-1 left-1 bg-black/60 text-[10px] px-1.5 rounded text-white backdrop-blur-sm">
            {index + 1}
          </div>

          {/* Hover Actions */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity backdrop-blur-[1px]">
            <button 
              className="p-1 text-slate-800 hover:text-primary-light" 
              onClick={(e) => { e.stopPropagation(); duplicateFrame(index); }}
              title="Duplicate Frame"
            >
              <Copy size={14} />
            </button>
            <button 
              className="p-1 text-slate-800 hover:text-red-400" 
              onClick={(e) => { e.stopPropagation(); deleteFrame(index); }}
              disabled={frames.length <= 1}
              title="Delete Frame"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
      
      {/* Add New Frame Button */}
      <button 
        onClick={addFrame}
        className="shrink-0 h-16 w-16 rounded-lg border-2 border-dashed border-slate-200 hover:border-primary-light hover:bg-primary/10 flex items-center justify-center text-slate-500 hover:text-primary-light transition-colors"
        title="Add Frame"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default FrameStrip;
