// Quick placeholders
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import PageTransition from '../components/layout/PageTransition';

export const Landing = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="text-5xl font-bold text-primary">DrawIt</h1>
      <p className="text-xl text-slate-500">The premier animation tool on the web.</p>
      <div className="flex gap-4">
        <button className="btn-primary" onClick={() => navigate('/login')}>Login</button>
        <button className="btn-secondary" onClick={() => navigate('/register')}>Register</button>
      </div>
    </div>
  );
};

export const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);
  
  const handleLogin = (e) => {
    e.preventDefault();
    login({ id: '1', username: 'Artist' });
    navigate('/dashboard');
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleLogin} className="glass-panel p-8 w-96 space-y-6">
        <h2 className="text-2xl font-bold">Welcome Back</h2>
        <input type="email" placeholder="Email" className="input-field" required />
        <input type="password" placeholder="Password" className="input-field" required />
        <button type="submit" className="btn-primary w-full">Login</button>
      </form>
    </div>
  );
};

export const Register = () => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="glass-panel p-8 w-96 space-y-6">
        <h2 className="text-2xl font-bold">Create Account</h2>
        <button className="btn-secondary w-full" onClick={() => navigate('/login')}>Back to Login</button>
      </div>
    </div>
  );
};

export const Dashboard = () => (
  <PageTransition>
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-slate-500">Recent projects goes here.</p>
    </div>
  </PageTransition>
);

export const DrawingEditor = () => (
  <div className="h-screen w-screen bg-slate-50 flex items-center justify-center">
    Drawing Editor Workspace
  </div>
);

export const FlipbookEditor = () => (
  <div className="h-screen w-screen bg-slate-50 flex items-center justify-center">
    Flipbook Workspace
  </div>
);

export const Gallery = () => (
  <PageTransition>
    <div className="p-8"><h1 className="text-3xl">Gallery</h1></div>
  </PageTransition>
);

export const Community = () => (
  <PageTransition>
    <div className="p-8"><h1 className="text-3xl">Community</h1></div>
  </PageTransition>
);

export const Settings = () => (
  <PageTransition>
    <div className="p-8"><h1 className="text-3xl">Settings</h1></div>
  </PageTransition>
);
