// src/pages/goals/GoalList.jsx
import { useState, useEffect } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import GoalForm from './GoalForm';

export default function GoalList() {
  const [goals, setGoals] = useState([]);
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
        const { data: goalData } = await api.get('/goals');
        setGoals(goalData.data);
        const { data: catData } = await api.get('/categories');
        setCategories(catData.data);
      } catch (e) {
        console.error(e);
        setError('Failed to load goals');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await api.delete(`/goals/${id}`);
      setGoals(prev => prev.filter(g => g._id !== id));
    } catch (e) {
      console.error(e);
      setError('Failed to delete goal');
    }
  };

  const handleEdit = (goal) => {
    setEditingId(goal._id);
  };

  const handleSave = async (updatedGoal) => {
    try {
      await api.put(`/goals/${editingId}`, updatedGoal);
      setEditingId(null);
      const { data } = await api.get('/goals');
      setGoals(data.data);
    } catch (e) {
      console.error(e);
      setError('Failed to save goal');
    }
  };

  const handleCancel = () => setEditingId(null);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Goals</h2>
        <button
          onClick={() => navigate('/goals/new')}
          className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
        >
          + Add New Goal
        </button>
      </div>

      {loading ? (
        <p className="text-center py-8">Loading…</p>
      ) : error ? (
        <p className="text-center text-red-500 py-8">{error}</p>
      ) : goals.length === 0 ? (
        <p className="text-center text-muted py-8">
          No goals yet. Click "+ Add New Goal" to get started.
        </p>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left px-4 py-2 border-b">Name</th>
                <th className="text-left px-4 py-2 border-b">Target</th>
                <th className="text-left px-4 py-2 border-b">Current</th>
                <th className="text-left px-4 py-2 border-b">Deadline</th>
                <th className="text-left px-4 py-2 border-b">Category</th>
                <th className="text-left px-4 py-2 border-b">Progress</th>
                <th className="text-left px-4 py-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {goals.map(g => {
                const catName = categories.find(c => c._id === (g.categoryId?._id || g.categoryId))?.name ?? '-';
                const progress = g.targetAmount ? ((g.currentAmount / g.targetAmount) * 100).toFixed(0) : 0;
                return (
                  <tr key={g._id}>
                    <td className="px-4 py-2">{g.name}</td>
                    <td className="px-4 py-2 font-numeric">₹{g.targetAmount}</td>
                    <td className="px-4 py-2 font-numeric">₹{g.currentAmount}</td>
                    <td className="px-4 py-2">{g.deadline ? new Date(g.deadline).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-2">{catName}</td>
                    <td className="px-4 py-2">{progress}%</td>
                    <td className="px-4 py-2 flex space-x-2">
                      {editingId === g._id ? (
                        <GoalForm
                          goal={g}
                          categories={categories}
                          onSave={handleSave}
                          onCancel={handleCancel}
                        />
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(g)}
                            className="text-indigo-600 hover:underline"
                          >
                            Edit
                          </button>{' '}
                          <button
                            onClick={() => handleDelete(g._id)}
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