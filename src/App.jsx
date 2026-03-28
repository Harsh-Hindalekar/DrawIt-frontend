import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';

// Mock Pages (will be implemented next)
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DrawingEditor from './pages/DrawingEditor';
import FlipbookEditor from './pages/FlipbookEditor';
import { Gallery, Community, Settings } from './pages/OtherPages';
import Layout from './components/layout/Layout';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes using Layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="community" element={<Community />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Editor Routes (Full screen, no standard layout) */}
        <Route path="/draw" element={
          <ProtectedRoute>
            <DrawingEditor />
          </ProtectedRoute>
        } />
        <Route path="/flipbook" element={
          <ProtectedRoute>
            <FlipbookEditor />
          </ProtectedRoute>
        } />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;