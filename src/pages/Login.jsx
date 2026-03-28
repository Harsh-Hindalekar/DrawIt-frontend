import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);
  
  const handleLogin = (e) => {
    e.preventDefault();
    login({ id: '1', username: 'Artist', email: 'artist@example.com' });
    navigate('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-darkBg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/10 to-transparent pointer-events-none" />
      
      <form onSubmit={handleLogin} className="glass-panel p-10 w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-secondary-light">
            Welcome Back
          </h2>
          <p className="text-slate-500 text-sm">Sign in to continue animating</p>
        </div>
        
        <div className="space-y-4">
          <input type="email" placeholder="Email Address" className="input-field" required defaultValue="test@example.com" />
          <input type="password" placeholder="Password" className="input-field" required defaultValue="password" />
        </div>
        
        <button type="submit" className="btn-primary w-full py-3 text-lg">
          Login
        </button>
        
        <p className="text-center text-sm text-slate-500">
          Don't have an account? <button type="button" onClick={() => navigate('/register')} className="text-primary-light hover:underline">Register</button>
        </p>
      </form>
    </div>
  );
};

export default Login;
