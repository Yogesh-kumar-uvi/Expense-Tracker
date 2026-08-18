// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4 text-primary">Login</h2>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-secondary">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-border rounded-md bg-card/80 dark:bg-card/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-secondary">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-border rounded-md bg-card/80 dark:bg-card/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-primary"
          />
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          Log in
        </button>
      </form>
      <p className="mt-4 text-center">
        Don't have an account?{' '}
        <a href="/register" className="text-indigo-500 hover:text-indigo-300 dark:text-indigo-300">Register here</a>
      </p>
    </div>
  );
}