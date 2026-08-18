// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // While the token is still being verified against the server (happens on
  // every full page refresh), don't redirect yet — that was causing every
  // refresh to bounce straight to /login even with a perfectly valid token.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <p className="text-sm text-muted">Loading…</p>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};