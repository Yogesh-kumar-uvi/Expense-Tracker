// src/pages/notifications/NotificationPage.jsx
import { useState, useEffect } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import api from '../../api';

const TYPE_COLORS = {
  info: 'bg-info-50 text-info-600 dark:bg-info-500/10 dark:text-info-500',
  success: 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500',
  warning: 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-500',
  error: 'bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:text-danger-500',
};

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get('/notifications');
      setNotifications(data.data);
    } catch (e) {
      console.error(e);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}`, { isRead: true });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-card border border-border bg-card shadow-subtle">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-text-primary">Notifications</h2>
        </div>

        {loading ? (
          <p className="p-8 text-center text-sm text-muted">Loading…</p>
        ) : error ? (
          <p className="p-8 text-center text-sm text-danger-600">{error}</p>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <Bell size={22} className="text-muted" />
            <p className="text-sm text-muted">You're all caught up — no notifications.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {notifications.map((n) => (
              <li
                key={n._id}
                className={`flex items-start gap-3 px-5 py-4 ${!n.isRead ? 'bg-primary-50/40 dark:bg-primary-500/5' : ''}`}
              >
                <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${TYPE_COLORS[n.type] || TYPE_COLORS.info}`}>
                  <Bell size={13} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary">{n.title}</p>
                  <p className="mt-0.5 text-sm text-text-secondary">{n.message}</p>
                  <p className="mt-1 text-xs text-muted">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkRead(n._id)}
                      aria-label="Mark as read"
                      title="Mark as read"
                      className="rounded-control p-1.5 text-muted hover:bg-surface hover:text-success-600"
                    >
                      <Check size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n._id)}
                    aria-label="Delete notification"
                    title="Delete"
                    className="rounded-control p-1.5 text-muted hover:bg-surface hover:text-danger-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}