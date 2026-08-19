// src/pages/ResetPasswordPage.jsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

export default function ResetPasswordPage() {
    const { resettoken } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords don't match.");
            return;
        }

        setSubmitting(true);
        try {
            await api.put(`/auth/resetpassword/${resettoken}`, { password });
            setDone(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err?.response?.data?.error || 'This reset link is invalid or has expired.');
        } finally {
            setSubmitting(false);
        }
    };

    if (done) {
        return (
            <div className="max-w-md mx-auto mt-10 text-center">
                <h2 className="text-2xl font-bold mb-4">Password updated</h2>
                <p className="text-sm text-gray-600">Redirecting you to log in…</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-4">Set a new password</h2>
            {error && <p className="text-red-500 mt-2 mb-2">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">New password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Confirm new password:</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {submitting ? 'Updating…' : 'Update password'}
                </button>
            </form>
            <p className="mt-4 text-center">
                <a href="/login" className="text-indigo-600 hover:underline">Back to login</a>
            </p>
        </div>
    );
}