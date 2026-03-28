import { useCanvasStore } from '../../store/useCanvasStore';
import { Layers, Plus, Trash2, Eye, EyeOff } from 'lucide-react';

const LayerManager = () => {
  const { 
    layers, 
    activeLayerId, 
    addLayer, 
    removeLayer, 
    setActiveLayer, 
    toggleLayerVisibility, 
    setLayerOpacity 
  } = useCanvasStore();

  return (
    <div className="w-64 bg-darkCard/80 backdrop-blur-md border border-slate-200 rounded-2xl flex flex-col overflow-hidden max-h-[80vh] shadow-2xl">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-darkCard sticky top-0 z-10">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <Layers size={18} className="text-secondary-light" /> 
          Layers
        </div>
        <button 
          onClick={addLayer}
          className="p-1.5 bg-slate-100 hover:bg-secondary/20 text-slate-600 hover:text-secondary-light rounded-md transition-colors"
          title="Add New Layer"
        >
          <Plus size={16} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {/* Render layers in reverse order so top layer is logically at the top */}
        {[...layers].reverse().map(layer => (
          <div 
            key={layer.id}
            className={`p-3 rounded-xl border transition-all ${
              activeLayerId === layer.id 
                ? 'border-secondary/50 bg-secondary/10' 
                : 'border-transparent hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div 
                className="flex items-center gap-2 cursor-pointer flex-1"
                onClick={() => setActiveLayer(layer.id)}
              >
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
                  className="text-slate-500 hover:text-slate-900"
                >
                  {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <span className={`text-sm font-medium ${activeLayerId === layer.id ? 'text-slate-800' : 'text-slate-500'}`}>
                  {layer.name}
                </span>
              </div>
              
              <button 
                onClick={() => removeLayer(layer.id)}
                className="text-slate-500 hover:text-red-400 p-1"
                disabled={layers.length <= 1}
              >
                <Trash2 size={14} />
              </button>
            </div>
            
            <input 
              type="range" 
              min="0" max="1" step="0.05"
              value={layer.opacity}
              onChange={(e) => setLayerOpacity(layer.id, parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              title="Opacity"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayerManager;
