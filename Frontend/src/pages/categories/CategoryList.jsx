// src/pages/categories/CategoryList.jsx
import { useState, useEffect } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import CategoryForm from './CategoryForm';

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null); // id of category being edited
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: responseData } = await api.get('/categories');
        setCategories(responseData.data);
      } catch (e) {
        console.error(e);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories(prev => prev.filter(c => c._id !== id));
    } catch (e) {
      console.error(e);
      setError('Failed to delete category');
    }
  };

  const handleEdit = (category) => {
    setEditingId(category._id);
  };

  const handleSave = async (updatedCategory) => {
    try {
      await api.put(`/categories/${editingId}`, updatedCategory);
      setEditingId(null);
      const { data } = await api.get('/categories');
      setCategories(data.data);
    } catch (e) {
      console.error(e);
      setError('Failed to save category');
    }
  };

  const handleCancel = () => setEditingId(null);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Categories</h2>
        <button
          onClick={() => navigate('/categories/new')}
          className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
        >
          + Add New Category
        </button>
      </div>

      {loading ? (
        <p className="text-center py-8">Loading…</p>
      ) : error ? (
        <p className="text-center text-red-500 py-8">{error}</p>
      ) : categories.length === 0 ? (
        <p className="text-center text-text-muted py-8">
          No categories yet. Click “+ Add New Category” to get started.
        </p>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left px-4 py-2 border-b">Name</th>
                <th className="text-left px-4 py-2 border-b">Type</th>
                <th className="text-left px-4 py-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map(cat => (
                <tr key={cat._id}>
                  <td className="px-4 py-2">{cat.name}</td>
                  <td className="px-4 py-2">{cat.type}</td>
                  <td className="px-4 py-2 flex space-x-2">
                    {editingId === cat._id ? (
                      <CategoryForm category={cat}
                        onSave={handleSave}
                        onCancel={handleCancel}
                      />
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(cat)}
                          className="text-indigo-600 hover:underline"
                        >
                          Edit
                        </button>{' '}
                        <button
                          onClick={() => handleDelete(cat._id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}