// src/pages/transactions/TransactionForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Paperclip, Loader2 } from 'lucide-react';
import api from '../../api';

export default function TransactionForm({ transaction, categories: categoriesProp, onSave, onCancel }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!(transaction || id);

  const [categories, setCategories] = useState(categoriesProp || []);
  const [ready, setReady] = useState(!!transaction || !id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [attachments, setAttachments] = useState(transaction?.attachments || []);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  const [type, setType] = useState(transaction?.type ?? 'expense');
  const [amount, setAmount] = useState(transaction?.amount ?? '');
  const [currency, setCurrency] = useState(transaction?.currency ?? 'INR');
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? '');
  const [date, setDate] = useState(
    transaction?.date ? new Date(transaction.date).toISOString().slice(0, 16) : ''
  );
  const [notes, setNotes] = useState(transaction?.notes ?? '');
  const [recordId, setRecordId] = useState(transaction?._id);

  // Sync from the parent's categories whenever they change (an initial empty
  // array is still "truthy", so this can't just check `if (categoriesProp)`
  // once — it needs to re-sync every time the parent's data actually arrives).
  // Only fall back to fetching ourselves when no prop was passed at all.
  useEffect(() => {
    if (categoriesProp !== undefined) {
      setCategories(categoriesProp);
      return;
    }
    api.get('/categories')
      .then(({ data }) => setCategories(data.data))
      .catch((err) => {
        setError(
          `Failed to load categories: ${err?.response?.status ?? ''} ${err?.response?.data?.error || err.message}`
        );
      });
  }, [categoriesProp]);

  // Standalone edit route (no `transaction` prop) — fetch the record first
  useEffect(() => {
    if (transaction || !id) return;
    api.get(`/transactions/${id}`).then(({ data }) => {
      const t = data.data;
      setType(t.type);
      setAmount(t.amount);
      setCurrency(t.currency);
      setCategoryId(t.categoryId?._id || t.categoryId || '');
      setDate(new Date(t.date).toISOString().slice(0, 16));
      setNotes(t.notes || '');
      setRecordId(t._id);
      setAttachments(t.attachments || []);
      setReady(true);
    }).catch(() => setError('Failed to load transaction'));
  }, [id, transaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      type,
      amount: parseFloat(amount),
      currency,
      categoryId: categoryId || undefined,
      date: new Date(date).toISOString(),
      notes,
    };

    if (onSave) {
      onSave(payload);
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (isEdit) {
        await api.put(`/transactions/${recordId || id}`, payload);
        navigate('/transactions');
      } else {
        const { data } = await api.post('/transactions', payload);
        // Go straight to the edit page for the new transaction so a receipt
        // can be attached immediately (attachments need an existing record id).
        navigate(`/transactions/${data.data._id}/edit`);
      }
    } catch (err) {
      setError('Failed to save transaction');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => (onCancel ? onCancel() : navigate('/transactions'));

  const handleReceiptSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !recordId) return;

    setUploadingReceipt(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('receipt', file);
      const { data } = await api.post(`/transactions/${recordId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAttachments(data.data.attachments || []);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to upload receipt');
    } finally {
      setUploadingReceipt(false);
      e.target.value = '';
    }
  };

  if (!ready) {
    return <p className="p-4 text-sm text-muted">Loading…</p>;
  }

  const fieldClass =
    'w-full rounded-control border border-border bg-card px-3 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30';
  const labelClass = 'mb-1 block text-xs font-medium text-text-secondary';

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-control border border-border bg-surface p-4">
      {error && <p className="text-sm text-danger-600">{error}</p>}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className={fieldClass}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
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
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Currency</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={fieldClass}>
            {['INR', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
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
      </div>

      <div>
        <label className={labelClass}>Date &amp; time</label>
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={fieldClass} />
      </div>

      <div>
        <label className={labelClass}>Receipt / screenshot</label>
        {recordId ? (
          <>
            <label className="flex w-fit cursor-pointer items-center gap-2 rounded-control border border-border bg-card px-3 py-2 text-sm text-text-secondary hover:bg-surface">
              {uploadingReceipt ? <Loader2 size={15} className="animate-spin" /> : <Paperclip size={15} />}
              {uploadingReceipt ? 'Uploading…' : 'Attach image'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleReceiptSelect}
                className="hidden"
              />
            </label>
            {attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {attachments.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer">
                    <img src={url} alt="Receipt" className="h-16 w-16 rounded-control border border-border object-cover" />
                  </a>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-xs text-muted">Save the transaction first, then you can attach a receipt.</p>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="rounded-control bg-primary-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save'}
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