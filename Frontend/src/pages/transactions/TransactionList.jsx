// src/pages/transactions/TransactionList.jsx
import { useState, useEffect } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import TransactionForm from './TransactionForm';

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: transData } = await api.get('/transactions', { params: { page, limit: 50 } });
        setTransactions(transData.data);
        setPages(transData.pages || 1);
        const { data: catData } = await api.get('/categories');
        setCategories(catData.data);
      } catch (e) {
        console.error(e);
        setError('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions(prev => prev.filter(t => t._id !== id));
    } catch (e) {
      console.error(e);
      setError('Failed to delete transaction');
    }
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction._id);
  };

  const handleSave = async (updatedTransaction) => {
    try {
      await api.put(`/transactions/${editingId}`, updatedTransaction);
      setEditingId(null);
      const { data } = await api.get('/transactions', { params: { page, limit: 50 } });
      setTransactions(data.data);
      setPages(data.pages || 1);
    } catch (e) {
      console.error(e);
      setError('Failed to save transaction');
    }
  };

  const handleCancel = () => setEditingId(null);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Transactions</h2>
        <button
          onClick={() => navigate('/transactions/new')}
          className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
        >
          + Add New Transaction
        </button>
      </div>

      {loading ? (
        <p className="text-center py-8">Loading…</p>
      ) : error ? (
        <p className="text-center text-red-500 py-8">{error}</p>
      ) : transactions.length === 0 ? (
        <p className="text-center text-text-muted py-8">
          No transactions yet. Click "+ Add New Transaction" to get started.
        </p>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left px-4 py-2 border-b">Date</th>
                <th className="text-left px-4 py-2 border-b">Type</th>
                <th className="text-left px-4 py-2 border-b">Amount</th>
                <th className="text-left px-4 py-2 border-b">Category</th>
                <th className="text-left px-4 py-2 border-b">Notes</th>
                <th className="text-left px-4 py-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map(t => {
                const catName = categories.find(c => c._id === t.categoryId)?.name ?? '-';
                const dateStr = new Date(t.date).toLocaleDateString();
                const amountStr = t.amount !== null && t.amount !== undefined ? `$${t.amount}` : '$0';
                return (
                  <tr key={t._id}>
                    <td className="px-4 py-2">{dateStr}</td>
                    <td className="px-4 py-2">{t.type}</td>
                    <td className="px-4 py-2 font-numeric">{amountStr}</td>
                    <td className="px-4 py-2">{catName}</td>
                    <td className="px-4 py-2">{t.notes ?? ''}</td>
                    <td className="px-4 py-2 flex space-x-2">
                      {editingId === t._id ? (
                        <TransactionForm
                          transaction={t}
                          categories={categories}
                          onSave={handleSave}
                          onCancel={handleCancel}
                        />
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(t)}
                            className="text-indigo-600 hover:underline"
                          >
                            Edit
                          </button>{' '}
                          <button
                            onClick={() => handleDelete(t._id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page <= 1}
            className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Prev
          </button>
          <span className="text-sm text-text-muted">Page {page} of {pages}</span>
          <button
            onClick={() => setPage(p => Math.min(p + 1, pages))}
            disabled={page >= pages}
            className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}