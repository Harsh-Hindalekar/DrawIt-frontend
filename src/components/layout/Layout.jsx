import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { AnimatePresence } from 'framer-motion';

const Layout = () => {
  return (
    <div className="flex h-screen w-screen bg-darkBg text-slate-800 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 relative overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto w-full relative">
          <AnimatePresence mode="wait">
            <Outlet />
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Layout;
