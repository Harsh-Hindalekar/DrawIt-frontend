import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-darkBg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-secondary-dark/10 to-transparent pointer-events-none" />
      
      <form className="glass-panel p-10 w-full max-w-md space-y-8 relative z-10" onSubmit={(e) => { e.preventDefault(); navigate('/login'); }}>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary-light to-primary-light">
            Create Account
          </h2>
          <p className="text-slate-500 text-sm">Join the animation community</p>
        </div>
        
        <div className="space-y-4">
          <input type="text" placeholder="Username" className="input-field" required />
          <input type="email" placeholder="Email Address" className="input-field" required />
          <input type="password" placeholder="Password" className="input-field" required />
        </div>
        
        <button type="submit" className="btn-primary w-full py-3 text-lg bg-secondary hover:bg-secondary-dark">
          Sign Up
        </button>
        
        <p className="text-center text-sm text-slate-500">
          Already have an account? <button type="button" onClick={() => navigate('/login')} className="text-secondary-light hover:underline">Login</button>
        </p>
      </form>
    </div>
  );
};

export default Register;
