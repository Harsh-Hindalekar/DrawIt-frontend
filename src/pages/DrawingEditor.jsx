import { useNavigate } from 'react-router-dom';
import { useCanvasStore } from '../store/useCanvasStore';
import Toolbar from '../components/canvas/Toolbar';
import ColorPicker from '../components/canvas/ColorPicker';
import LayerManager from '../components/canvas/LayerManager';
import CanvasBoard from '../components/canvas/CanvasBoard';
import AirDraw from '../components/canvas/AirDraw';
import { ArrowLeft, Save, Download } from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';

const DrawingEditor = () => {
  const navigate = useNavigate();
  const { isAirDrawEnabled, toggleAirDraw } = useCanvasStore();

  return (
    <PageTransition>
      <div className="h-screen w-screen bg-slate-50 relative overflow-hidden">
        {/* Full Screen Canvas Area */}
        <div className="absolute inset-0 z-0">
          <CanvasBoard />
        </div>

        {/* Floating Topbar Items */}
        <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-4 pointer-events-auto">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-3 bg-white hover:bg-slate-100 shadow-lg border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-slate-200">
              <h1 className="text-sm font-bold text-slate-700">Untitled Drawing</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4 pointer-events-auto">
            <ColorPicker />
            <div className="w-px h-8 bg-slate-300 mx-1" />
            <button className="btn-secondary py-2 px-4 shadow-lg text-sm">
              <Save size={16} /> Save
            </button>
            <button className="btn-primary py-2 px-4 shadow-lg text-sm bg-primary hover:bg-primary-dark text-white">
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        {/* Left Sidebar - Toolbar */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 z-40">
          <Toolbar />
        </div>

        {/* Right Sidebar - Layers */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-40 max-h-[80vh]">
          <LayerManager />
        </div>

        {/* Air Draw Component */}
        {isAirDrawEnabled && <AirDraw onClose={toggleAirDraw} />}
      </div>
    </PageTransition>
  );
};

export default DrawingEditor;
