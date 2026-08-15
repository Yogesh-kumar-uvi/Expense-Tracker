// src/pages/profile/ProfilePage.jsx
import { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api';

const initials = (user) =>
    `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() || 'U';

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError('');
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            await api.put('/auth/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            await refreshUser();
        } catch (err) {
            setError(err?.response?.data?.error || 'Failed to upload photo. Please try again.');
        } finally {
            setUploading(false);
            e.target.value = ''; // allow re-selecting the same file
        }
    };

    return (
        <div className="mx-auto max-w-lg">
            <div className="rounded-card border border-border bg-card p-6 shadow-subtle">
                <h2 className="mb-6 text-sm font-semibold text-text-primary">Profile photo</h2>

                {error && (
                    <p className="mb-4 text-sm text-danger-600 dark:text-danger-400">{error}</p>
                )}

                <div className="flex items-center gap-5">
                    <div className="relative">
                        {user?.avatarUrl ? (
                            <img
                                src={user.avatarUrl}
                                alt="Profile"
                                className="h-20 w-20 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-xl font-semibold text-primary-700 dark:bg-primary-900 dark:text-primary-200">
                                {initials(user)}
                            </div>
                        )}
                        {uploading && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                                <Loader2 size={20} className="animate-spin text-white" />
                            </div>
                        )}
                    </div>

                    <div>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="flex items-center gap-2 rounded-control border border-border bg-surface px-3.5 py-2 text-sm font-medium text-text-primary hover:bg-card disabled:opacity-60"
                        >
                            <Camera size={15} />
                            {user?.avatarUrl ? 'Change photo' : 'Upload photo'}
                        </button>
                        <p className="mt-2 text-xs text-text-muted">JPEG, PNG, WEBP, or GIF. Max 5MB.</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>
                </div>

                <div className="mt-6 border-t border-border pt-6">
                    <p className="text-sm text-text-primary">
                        {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-text-muted">{user?.email}</p>
                </div>
            </div>
        </div>
    );
}