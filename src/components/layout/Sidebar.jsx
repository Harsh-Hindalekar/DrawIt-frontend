import { Link, useLocation } from 'react-router-dom';
import { Home, Image as ImageIcon, Users, Settings, Sparkles } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Gallery', path: '/gallery', icon: <ImageIcon size={20} /> },
    { name: 'Community', path: '/community', icon: <Users size={20} /> },
  ];

  return (
    <aside className="w-64 bg-darkCard border-r border-slate-200 h-full flex flex-col justify-between">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-secondary-light flex items-center gap-2 mb-8">
          <span className="text-3xl tracking-tighter">✒️</span>
          DrawIt
        </h1>

        <nav className="space-y-4">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentPath === link.path
                  ? 'bg-primary/20 text-primary-light border border-primary/30'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {link.icon}
              <span className="font-medium">{link.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-6">
        <Link
          to="/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            currentPath === '/settings'
              ? 'bg-primary/20 text-primary-light border border-primary/30'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
