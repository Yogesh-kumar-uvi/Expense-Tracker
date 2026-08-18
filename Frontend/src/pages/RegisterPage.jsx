// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4 text-primary">Register</h2>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-secondary">First Name:</label>
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-border rounded-md bg-card/80 dark:bg-card/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-secondary">Last Name:</label>
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-border rounded-md bg-card/80 dark:bg-card/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-secondary">Email:</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            required
            className="w-full px-3 py-2 border border-border rounded-md bg-card/80 dark:bg-card/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-secondary">Password:</label>
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            minLength="6"
            required
            className="w-full px-3 py-2 border border-border rounded-md bg-card/80 dark:bg-card/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-primary"
          />
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          Create account
        </button>
      </form>
      <p className="mt-4 text-center">
        Already have an account?{' '}
        <a href="/login" className="text-indigo-500 hover:text-indigo-300 dark:text-indigo-300">Log in</a>
      </p>
    </div>
  );
}