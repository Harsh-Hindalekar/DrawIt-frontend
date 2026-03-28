import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-8 bg-darkBg text-center p-4 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-dark/20 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="z-10 flex flex-col items-center gap-6">
        <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-secondary-light tracking-tight">
          DrawIt
        </h1>
        <p className="text-xl md:text-2xl text-slate-500 max-w-2xl">
          The ultimate platform for drawing and creating smooth flipbook animations directly in your browser.
        </p>
        <div className="flex gap-4 mt-8">
          <button className="btn-primary px-8 py-3 text-lg" onClick={() => navigate('/login')}>
            Start Creating
          </button>
          <button className="btn-secondary px-8 py-3 text-lg" onClick={() => navigate('/register')}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
