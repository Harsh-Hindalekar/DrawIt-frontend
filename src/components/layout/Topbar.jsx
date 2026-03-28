import { useAuthStore } from '../../store/useAuthStore';
import { LogOut, User } from 'lucide-react';

const Topbar = () => {
  const { user, logout } = useAuthStore();

  return (
    <header className="h-16 border-b border-slate-200 bg-darkCard/50 backdrop-blur flex items-center justify-between px-8">
      <div className="flex-1" /> {/* Spacer */}
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
          <User size={16} className="text-primary-light" />
          <span>{user?.username || 'Artist'}</span>
        </div>
        
        <button
          onClick={logout}
          className="p-2 text-slate-500 hover:text-secondary-light transition-colors hover:bg-slate-100 rounded-lg"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
