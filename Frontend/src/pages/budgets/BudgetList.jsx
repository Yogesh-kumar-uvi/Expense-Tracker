// src/pages/budgets/BudgetList.jsx
import { useState, useEffect } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import BudgetForm from './BudgetForm';

export default function BudgetList() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: budData } = await api.get('/budgets');
        setBudgets(budData.data);
        const { data: catData } = await api.get('/categories');
        setCategories(catData.data);
      } catch (e) {
        console.error(e);
        setError('Failed to load budgets');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await api.delete(`/budgets/${id}`);
      setBudgets(prev => prev.filter(b => b._id !== id));
    } catch (e) {
      console.error(e);
      setError('Failed to delete budget');
    }
  };

  const handleEdit = (budget) => {
    setEditingId(budget._id);
  };

  const handleSave = async (updatedBudget) => {
    try {
      await api.put(`/budgets/${editingId}`, updatedBudget);
      setEditingId(null);
      const { data } = await api.get('/budgets');
      setBudgets(data.data);
    } catch (e) {
      console.error(e);
      setError('Failed to save budget');
    }
  };

  const handleCancel = () => setEditingId(null);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Budgets</h2>
        <button
          onClick={() => navigate('/budgets/new')}
          className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
        >
          + Add New Budget
        </button>
      </div>

      {loading ? (
        <p className="text-center py-8">Loading…</p>
      ) : error ? (
        <p className="text-center text-red-500 py-8">{error}</p>
      ) : budgets.length === 0 ? (
        <p className="text-center text-text-muted py-8">
          No budgets yet. Click "+ Add New Budget" to get started.
        </p>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left px-4 py-2 border-b">Name</th>
                <th className="text-left px-4 py-2 border-b">Amount</th>
                <th className="text-left px-4 py-2 border-b">Currency</th>
                <th className="text-left px-4 py-2 border-b">Period</th>
                <th className="text-left px-4 py-2 border-b">Start Date</th>
                <th className="text-left px-4 py-2 border-b">End Date</th>
                <th className="text-left px-4 py-2 border-b">Category</th>
                <th className="text-left px-4 py-2 border-b">Spent</th>
                <th className="text-left px-4 py-2 border-b">Remaining</th>
                <th className="text-left px-4 py-2 border-b">%</th>
                <th className="text-left px-4 py-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {budgets.map(b => {
                const catName = categories.find(c => c._id === b.categoryId)?.name ?? '-';
                const spent = b.spent ?? 0;
                const remaining = b.remaining ?? 0;
                const percent = b.percentSpent ?? 0;
                const amountStr = b.amount !== null && b.amount !== undefined ? `$${b.amount}` : '$0';
                const spentStr = spent !== null && spent !== undefined ? `$${spent}` : '$0';
                const remainingStr = remaining !== null && remaining !== undefined ? `$${remaining}` : '$0';
                return (
                  <tr key={b._id}>
                    <td className="px-4 py-2">{b.name}</td>
                    <td className="px-4 py-2 font-numeric">{amountStr}</td>
                    <td className="px-4 py-2">{b.currency}</td>
                    <td className="px-4 py-2">{b.period}</td>
                    <td className="px-4 py-2">{new Date(b.startDate).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{new Date(b.endDate).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{catName}</td>
                    <td className="px-4 py-2 font-numeric">{spentStr}</td>
                    <td className="px-4 py-2 font-numeric">{remainingStr}</td>
                    <td className="px-4 py-2">{percent}%</td>
                    <td className="px-4 py-2 flex space-x-2">
                      {editingId === b._id ? (
                        <BudgetForm
                          budget={b}
                          categories={categories}
                          onSave={handleSave}
                          onCancel={handleCancel}
                        />
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(b)}
                            className="text-indigo-600 hover:underline"
                          >
                            Edit
                          </button>{' '}
                          <button
                            onClick={() => handleDelete(b._id)}
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
    </div>
  );
}