// src/pages/ForgotPasswordPage.jsx
import { useState } from 'react';
import api from '../api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await api.post('/auth/forgotpassword', { email });
            setSent(true);
        } catch (err) {
            setError(err?.response?.data?.error || 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (sent) {
        return (
            <div className="max-w-md mx-auto mt-10 text-center">
                <h2 className="text-2xl font-bold mb-4">Check your email</h2>
                <p className="text-sm text-gray-600">
                    If an account exists for <span className="font-medium">{email}</span>, we've sent a password reset link.
                </p>
                <p className="mt-4 text-center">
                    <a href="/login" className="text-indigo-600 hover:underline">Back to login</a>
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-4">Forgot password</h2>
            {error && <p className="text-red-500 mt-2 mb-2">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {submitting ? 'Sending…' : 'Send reset link'}
                </button>
            </form>
            <p className="mt-4 text-center">
                <a href="/login" className="text-indigo-600 hover:underline">Back to login</a>
            </p>
        </div>
    );
}