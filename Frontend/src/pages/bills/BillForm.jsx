// src/pages/bills/BillForm.jsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';

export default function BillForm({ bill, onSave, onCancel }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id || !!bill;

  const [form, setForm] = useState({
    name: bill?.name || '',
    amount: bill?.amount || '',
    dueDate: bill?.dueDate ? new Date(bill.dueDate).toISOString().slice(0,10) : '',
    status: bill?.status || 'pending',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        dueDate: new Date(form.dueDate).toISOString(),
      };
      if (isEdit) {
        await api.put(`/bills/${id || bill._id}`, payload);
      } else {
        await api.post('/bills', payload);
      }
      navigate(-1);
    } catch (err) {
      console.error(err);
      setError('Failed to save bill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6 p-4 bg-card rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-text-primary">{isEdit ? 'Edit' : 'New'} Bill</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-text-secondary">Name</label>
          <input name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-surface/50 dark:bg-surface/30 text-text-primary"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">Amount</label>
            <input name="amount"
              value={form.amount}
              onChange={handleChange}
              type="number"
              step="0.01"
              required
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-surface/50 dark:bg-surface/30 text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary">Status</label>
            <select name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-surface/50 dark:bg-surface/30 text-text-primary"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-text-secondary">Due Date</label>
          <input name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            type="date"
            required
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-surface/50 dark:bg-surface/30 text-text-primary"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => (onCancel ? onCancel() : navigate(-1))}
            className="mr-2 bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100"
          >
            Cancel
          </button>
          <button type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 disabled:opacity-50"
          >
            {loading ? 'Saving…' : (isEdit ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </div>
  );
}