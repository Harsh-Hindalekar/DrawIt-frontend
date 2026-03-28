import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlipbookStore } from '../store/useFlipbookStore';
import { useCanvasStore } from '../store/useCanvasStore';
import Toolbar from '../components/canvas/Toolbar';
import ColorPicker from '../components/canvas/ColorPicker';
import LayerManager from '../components/canvas/LayerManager';
import CanvasBoard from '../components/canvas/CanvasBoard';
import FrameStrip from '../components/flipbook/FrameStrip';
import PlaybackControls from '../components/flipbook/PlaybackControls';
import OnionSkinToggle from '../components/flipbook/OnionSkinToggle';
import AirDraw from '../components/canvas/AirDraw';
import { ArrowLeft, Save, Download } from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';
import GIF from 'gif.js';

const FlipbookEditor = () => {
  const navigate = useNavigate();
  const { frames, currentFrameIndex, setFrameData, onionSkinEnabled } = useFlipbookStore();
  const { layers, isAirDrawEnabled, toggleAirDraw } = useCanvasStore(); 
  
  const saveFrameState = () => {
    console.log("Saving frame state...");
  };

  const handleExportGif = () => {
    alert("GIF Export Feature requires gif.worker.js attached. Code is prepared for it.");
  };

  return (
    <PageTransition>
      <div className="h-screen w-screen bg-slate-50 relative overflow-hidden flex flex-col">
        {/* Full Screen Canvas Area - Underneath everything */}
        <div className="absolute inset-0 z-0">
           <CanvasBoard />
        </div>

        {/* Floating Topbar */}
        <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-4 pointer-events-auto">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-3 bg-white hover:bg-slate-100 shadow-lg border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-slate-200">
              <h1 className="text-sm font-bold text-slate-700">Animation Project</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4 pointer-events-auto">
            <span className="text-xs font-bold text-slate-500 bg-white shadow-sm border border-slate-200 px-3 py-2 rounded-lg">
              Frame {currentFrameIndex + 1} / {frames.length}
            </span>
            <ColorPicker />
            <div className="w-px h-8 bg-slate-300 mx-1" />
            <button className="btn-secondary py-2 px-3 shadow-lg text-sm" onClick={saveFrameState}>
              <Save size={16} /> Save
            </button>
            <button className="btn-primary py-2 px-3 shadow-lg text-sm" onClick={handleExportGif}>
              <Download size={16} /> Export GIF
            </button>
          </div>
        </div>

        {/* Workspace Elements */}
        <div className="flex-1 relative pointer-events-none">
          {/* Onion Skin Background Render */}
          {onionSkinEnabled && currentFrameIndex > 0 && frames[currentFrameIndex - 1].dataUrl && (
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none z-10">
               <img src={frames[currentFrameIndex - 1].dataUrl} className="max-h-full max-w-full" alt="Onion Skin" />
            </div>
          )}

          {/* Left Sidebar - Toolbar */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2 z-40 pointer-events-auto">
            <Toolbar />
          </div>

          {/* Right Sidebar - Layers */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 z-40 pointer-events-auto max-w-[300px]">
            <LayerManager />
          </div>

          {/* Air Draw Component */}
          {isAirDrawEnabled && <AirDraw onClose={toggleAirDraw} />}
        </div>

        {/* Timeline Bottom Bar */}
        <div className="h-28 border-t border-slate-200 bg-white/90 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 flex items-center relative pointer-events-auto">
          <PlaybackControls />
          <OnionSkinToggle />
          <FrameStrip />
        </div>
      </div>
    </PageTransition>
  );
};

export default FlipbookEditor;
