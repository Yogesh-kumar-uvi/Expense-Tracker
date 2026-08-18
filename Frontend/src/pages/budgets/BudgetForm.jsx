// src/pages/budgets/BudgetForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';

export default function BudgetForm({ budget, categories: categoriesProp, onSave, onCancel }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!(budget || id);

  const [categories, setCategories] = useState(categoriesProp || []);
  const [ready, setReady] = useState(!!budget || !id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState(budget?.name ?? '');
  const [amount, setAmount] = useState(budget?.amount ?? '');
  const [currency, setCurrency] = useState(budget?.currency ?? 'INR');
  const [period, setPeriod] = useState(budget?.period ?? 'monthly');
  const [startDate, setStartDate] = useState(
    budget?.startDate ? new Date(budget.startDate).toISOString().slice(0, 10) : ''
  );
  const [endDate, setEndDate] = useState(
    budget?.endDate ? new Date(budget.endDate).toISOString().slice(0, 10) : ''
  );
  const [categoryId, setCategoryId] = useState(budget?.categoryId ?? '');
  const [recordId, setRecordId] = useState(budget?._id);

  // Sync from the parent's categories whenever they change (an initial empty
  // array is still "truthy", so this can't just check `if (categoriesProp)`
  // once — it needs to re-sync every time the parent's data actually arrives).
  // Only fall back to fetching ourselves when no prop was passed at all.
  useEffect(() => {
    if (categoriesProp !== undefined) {
      setCategories(categoriesProp);
      return;
    }
    api.get('/categories').then(({ data }) => setCategories(data.data)).catch(() => {});
  }, [categoriesProp]);

  useEffect(() => {
    if (budget || !id) return;
    api.get(`/budgets/${id}`).then(({ data }) => {
      const b = data.data;
      setName(b.name);
      setAmount(b.amount);
      setCurrency(b.currency);
      setPeriod(b.period);
      setStartDate(new Date(b.startDate).toISOString().slice(0, 10));
      setEndDate(new Date(b.endDate).toISOString().slice(0, 10));
      setCategoryId(b.categoryId?._id || b.categoryId || '');
      setRecordId(b._id);
      setReady(true);
    }).catch(() => setError('Failed to load budget'));
  }, [id, budget]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      amount: parseFloat(amount),
      currency,
      period,
      startDate,
      endDate,
      categoryId: categoryId || undefined,
    };

    if (onSave) {
      onSave(payload);
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await api.put(`/budgets/${recordId || id}`, payload);
      } else {
        await api.post('/budgets', payload);
      }
      navigate('/budgets');
    } catch (err) {
      setError('Failed to save budget');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => (onCancel ? onCancel() : navigate('/budgets'));

  if (!ready) {
    return <p className="p-4 text-sm text-muted">Loading…</p>;
  }

  const fieldClass =
    'w-full rounded-control border border-border bg-card/80 dark:bg-card/60 px-3 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30';
  const labelClass = 'mb-1 block text-xs font-medium text-text-secondary';

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-control border border-border bg-surface/80 dark:bg-surface/60 p-4">
      {error && <p className="text-sm text-danger-600">{error}</p>}

      <div>
        <label className={labelClass}>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required className={fieldClass} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
            required
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Currency</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={fieldClass}>
            {['INR', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Period</label>
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className={fieldClass}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Start date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>End date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Category</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={fieldClass}>
          <option value="">-- Select category --</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="rounded-control bg-primary-600 text-white px-3.5 py-1.5 text-sm font-semibold hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-control border border-border px-3.5 py-1.5 text-sm font-medium text-text-secondary hover:bg-card/80 dark:hover:bg-card/60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}