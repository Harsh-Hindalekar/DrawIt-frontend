import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/layout/PageTransition';
import { useProjectsStore } from '../store/useProjectsStore';
import { useAuthStore } from '../store/useAuthStore';
import { Plus, Edit3, Film, Sparkles } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const projects = useProjectsStore(s => s.projects);
  const user = useAuthStore(s => s.user);

  return (
    <PageTransition>
      <div className="p-8 max-w-7xl mx-auto space-y-12">
        
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.username}!</h1>
            <p className="text-slate-500">Ready to create your next masterpiece?</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => navigate('/draw')}
            className="glass-panel p-8 flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-darkCard transition-all group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Edit3 size={32} className="text-primary-light" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-800">New Drawing</h3>
              <p className="text-slate-500 text-sm mt-1">Start with a blank canvas</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/flipbook')}
            className="glass-panel p-8 flex flex-col items-center justify-center gap-4 hover:border-secondary/50 hover:bg-darkCard transition-all group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Film size={32} className="text-secondary-light" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-800">New Flipbook</h3>
              <p className="text-slate-500 text-sm mt-1">Create frame-by-frame animation</p>
            </div>
          </button>

          <button 
            onClick={() => navigate('/ai-drawing')}
            className="glass-panel p-8 flex flex-col items-center justify-center gap-4 hover:border-purple-500/50 hover:bg-darkCard transition-all group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles size={32} className="text-purple-600" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-800">AI Drawing</h3>
              <p className="text-slate-500 text-sm mt-1">Draw with auto-shapes & AI</p>
            </div>
          </button>
        </div>

        {/* Recent Projects */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Film className="text-primary-light" /> Recent Projects
            </h2>
            <button className="text-sm text-slate-500 hover:text-slate-900" onClick={() => navigate('/gallery')}>View All</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map(project => (
              <div key={project.id} className="glass-panel overflow-hidden group hover:border-slate-300 transition-colors cursor-pointer">
                <div className="aspect-video bg-slate-100 flex items-center justify-center relative">
                  {project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-600">No thumbnail</span>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button className="btn-primary rounded-full px-6">Open</button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg">{project.title}</h3>
                  <div className="flex justify-between mt-2 text-sm text-slate-500">
                    <span>{project.frames} frames</span>
                    <span>{project.date}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Create New Card */}
            <div onClick={() => navigate('/flipbook')} className="glass-panel flex flex-col items-center justify-center aspect-video sm:aspect-auto border-dashed border-2 border-slate-200 hover:border-primary/50 hover:bg-darkCard/50 cursor-pointer transition-all">
              <Plus size={32} className="text-slate-500 mb-2" />
              <span className="font-medium text-slate-500">Create Project</span>
            </div>
          </div>
        </div>

      </div>
    </PageTransition>
  );
};

export default Dashboard;
