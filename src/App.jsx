import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import BlogList from './pages/BlogList';
import BlogDetail from './pages/BlogDetail';
import PostEditor from './pages/PostEditor';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
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
          <Route path="/blogs" element={<ProtectedRoute><BlogList /></ProtectedRoute>} />
          <Route path="/blog/:id" element={<ProtectedRoute><BlogDetail /></ProtectedRoute>} />
          <Route path="/write" element={<ProtectedRoute><PostEditor /></ProtectedRoute>} />
          <Route path="/edit/:id" element={<ProtectedRoute><PostEditor editMode /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute adminOnly><UserManagement /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
