import { useFlipbookStore } from '../../store/useFlipbookStore';
import { Layers } from 'lucide-react';

const OnionSkinToggle = () => {
  const { onionSkinEnabled, toggleOnionSkin } = useFlipbookStore();

  return (
    <div className="flex items-center px-4 border-r border-slate-200">
      <button 
        onClick={toggleOnionSkin}
        className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border transition-all ${
          onionSkinEnabled 
            ? 'bg-primary/20 border-primary text-primary-light shadow-[0_0_10px_rgba(168,85,247,0.3)]' 
            : 'bg-darkBg border-slate-200 text-slate-500 hover:border-slate-400'
        }`}
        title="Toggle Onion Skinning"
      >
        <Layers size={20} />
        <span className="text-[10px] uppercase font-bold tracking-wider">Onion Skin</span>
      </button>
    </div>
  );
};

export default OnionSkinToggle;
