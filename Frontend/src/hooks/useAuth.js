// src/hooks/useAuth.js
// Re-exported from context so every existing `import { useAuth } from '../hooks/useAuth'`
// keeps working, but now shares ONE auth state across the whole app instead of
// each component holding its own disconnected copy.
export { useAuth } from '../context/AuthContext';
