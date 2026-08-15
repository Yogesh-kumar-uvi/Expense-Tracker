// src/pages/goals/GoalForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';

export default function GoalForm({ goal, categories: categoriesProp, onSave, onCancel }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id || !!goal;
  const [categories, setCategories] = useState(categoriesProp || []);
  const [ready, setReady] = useState(!!goal || !id);
  const [recordId, setRecordId] = useState(goal?._id);

  useEffect(() => {
    if (categoriesProp !== undefined) {
      setCategories(categoriesProp);
      return;
    }
    api.get('/categories').then(({ data }) => setCategories(data.data)).catch(() => {});
  }, [categoriesProp]);

  useEffect(() => {
    if (goal || !id) return;
    api.get(`/goals/${id}`).then(({ data }) => {
      const g = data.data;
      setForm({
        name: g.name ?? '',
        targetAmount: g.targetAmount ?? '',
        currentAmount: g.currentAmount ?? '',
        deadline: g.deadline ? new Date(g.deadline).toISOString().slice(0, 10) : '',
        categoryId: g.categoryId?._id || g.categoryId || '',
      });
      setRecordId(g._id);
      setReady(true);
    }).catch(() => setError('Failed to load goal'));
  }, [id, goal]);

  const [form, setForm] = useState({
    name: goal?.name ?? '',
    targetAmount: goal?.targetAmount ?? '',
    currentAmount: goal?.currentAmount ?? '',
    deadline: goal?.deadline ? new Date(goal.deadline).toISOString().slice(0, 10) : '',
    categoryId: goal?.categoryId ?? '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      targetAmount: parseFloat(form.targetAmount),
      currentAmount: form.currentAmount === '' ? 0 : parseFloat(form.currentAmount),
      deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
      categoryId: form.categoryId || undefined,
    };

    if (onSave) {
      onSave(payload);
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await api.put(`/goals/${recordId || id}`, payload);
      } else {
        await api.post('/goals', payload);
      }
      navigate('/goals');
    } catch (err) {
      setError('Failed to save goal');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => (onCancel ? onCancel() : navigate('/goals'));

  if (!ready) {
    return <p className="p-4 text-sm text-text-muted">Loading…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-control border border-border bg-surface p-4">
      {error && <p className="text-sm text-danger-600">{error}</p>}
      <div>
        <label className="mb-1 block text-xs font-medium text-text-secondary">Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full rounded-control border border-border bg-card px-3 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">Target amount</label>
          <input
            name="targetAmount"
            type="number"
            step="0.01"
            min="0"
            value={form.targetAmount}
            onChange={handleChange}
            required
            className="w-full rounded-control border border-border bg-card px-3 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">Current amount</label>
          <input
            name="currentAmount"
            type="number"
            step="0.01"
            min="0"
            value={form.currentAmount}
            onChange={handleChange}
            className="w-full rounded-control border border-border bg-card px-3 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-text-secondary">Deadline</label>
        <input
          name="deadline"
          type="date"
          value={form.deadline}
          onChange={handleChange}
          className="w-full rounded-control border border-border bg-card px-3 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />
      </div>
      {categories.length > 0 && (
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">Category</label>
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            className="w-full rounded-control border border-border bg-card px-3 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          >
            <option value="">-- None --</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-control bg-primary-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {loading ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-control border border-border px-3.5 py-1.5 text-sm font-medium text-text-secondary hover:bg-card"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}