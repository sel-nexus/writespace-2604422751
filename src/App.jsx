import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import { getSession } from './utils/storage';
import { homeForRole } from './utils/auth';

/** Route the public, authenticated, and administrator WriteSpace surfaces. */
export default function App() {
  const session = getSession();
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={session ? <Navigate to={homeForRole(session.role)} replace /> : <Login />} />
          <Route path="/register" element={session ? <Navigate to={homeForRole(session.role)} replace /> : <Register />} />
          <Route path="/blogs" element={<ProtectedRoute><p className="mx-auto max-w-6xl px-6 py-16">Blog workspace is being prepared.</p></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><p className="mx-auto max-w-6xl px-6 py-16">Admin workspace is being prepared.</p></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
