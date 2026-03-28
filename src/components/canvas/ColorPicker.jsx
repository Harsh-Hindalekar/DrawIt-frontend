import { useState } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { Palette } from 'lucide-react';

const ColorPicker = () => {
  const { color, setColor } = useCanvasStore();
  const [isOpen, setIsOpen] = useState(false);

  const predefinedColors = [
    '#ffffff', '#000000', '#ef4444', '#f97316', '#f59e0b',
    '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1',
    '#a855f7', '#ec4899', '#f43f5e', '#71717a'
  ];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-3 rounded-xl bg-darkCard/80 border border-slate-200 hover:bg-slate-100 transition-colors shadow-lg"
        title="Color Picker"
      >
        <div 
          className="w-6 h-6 rounded-full border-2 border-white/20" 
          style={{ backgroundColor: color }}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-16 bg-darkCard border border-slate-200 p-4 rounded-xl shadow-2xl w-64 z-50">
          <div className="flex items-center gap-2 mb-4 text-slate-800 font-medium">
            <Palette size={18} className="text-primary-light" /> Colors
          </div>
          
          <input 
            type="color" 
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-10 bg-transparent rounded cursor-pointer mb-4"
          />
          
          <div className="grid grid-cols-7 gap-2">
            {predefinedColors.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${c === color ? 'border-white scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
