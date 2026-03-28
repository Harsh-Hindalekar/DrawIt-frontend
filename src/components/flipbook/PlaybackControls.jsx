import { useFlipbookStore } from '../../store/useFlipbookStore';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useEffect, useRef } from 'react';

const PlaybackControls = () => {
  const { 
    frames, 
    currentFrameIndex, 
    setCurrentFrame, 
    isPlaying, 
    setIsPlaying,
    fps,
    setFps
  } = useFlipbookStore();
  
  const timerRef = useRef(null);

  useEffect(() => {
    if (isPlaying && frames.length > 1) {
      const interval = 1000 / fps;
      timerRef.current = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % frames.length);
      }, interval);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, fps, frames.length, setCurrentFrame]);

  const togglePlayback = () => {
    if (frames.length <= 1) return;
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex flex-col items-center gap-2 px-6 border-r border-slate-200">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setCurrentFrame(0)}
          className="p-1.5 text-slate-500 hover:text-slate-900 transition-colors"
          disabled={isPlaying}
        >
          <SkipBack size={18} />
        </button>
        
        <button 
          onClick={togglePlayback}
          className="p-3 bg-secondary hover:bg-secondary-dark text-white rounded-full transition-colors shadow-lg shadow-secondary/20"
          disabled={frames.length <= 1}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        
        <button 
          onClick={() => setCurrentFrame(frames.length - 1)}
          className="p-1.5 text-slate-500 hover:text-slate-900 transition-colors"
          disabled={isPlaying}
        >
          <SkipForward size={18} />
        </button>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span>FPS: {fps}</span>
        <input 
          type="range" 
          min="1" 
          max="24" 
          value={fps} 
          onChange={(e) => setFps(parseInt(e.target.value))}
          className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
};

export default PlaybackControls;
