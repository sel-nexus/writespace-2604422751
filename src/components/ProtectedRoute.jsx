import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { getSession } from '../utils/storage';

/** Enforce browser-local authentication and optional administrator access. */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const session = getSession();
  const location = useLocation();
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (adminOnly && session.role !== 'admin') return <Navigate to="/blogs" replace />;
  return children;
}

ProtectedRoute.propTypes = { children: PropTypes.node.isRequired, adminOnly: PropTypes.bool };
