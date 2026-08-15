// src/pages/bills/BillList.jsx
import { useState, useEffect } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import BillForm from './BillForm';

export default function BillList() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/bills');
        setBills(data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this bill?')) return;
    try {
      await api.delete(`/bills/${id}`);
      setBills(prev => prev.filter(b => b._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (bill) => {
    setEditingId(bill._id);
  };

  const handleSave = async (updatedBill) => {
    try {
      await api.put(`/bills/${editingId}`, updatedBill);
      setEditingId(null);
      const { data } = await api.get('/bills');
      setBills(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancel = () => setEditingId(null);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Bills</h2>
        <button
          onClick={() => navigate('/bills/new')}
          className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
        >
          + New Bill
        </button>
      </div>

      {loading ? (
        <p className="text-center py-8">Loading…</p>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left px-4 py-2 border-b">Name</th>
                <th className="text-left px-4 py-2 border-b">Amount</th>
                <th className="text-left px-4 py-2 border-b">Due Date</th>
                <th className="text-left px-4 py-2 border-b">Status</th>
                <th className="text-left px-4 py-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bills.map(bill => (
                <tr key={bill._id}>
                  <td className="px-4 py-2">{bill.name}</td>
                  <td className="px-4 py-2">{bill.amount}</td>
                  <td className="px-4 py-2">{new Date(bill.dueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{bill.status}</td>
                  <td className="px-4 py-2 flex space-x-2">
                    {editingId === bill._id ? (
                      <BillForm bill={bill}
                        onSave={handleSave}
                        onCancel={handleCancel}
                      />
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(bill)}
                          className="text-indigo-600 hover:underline"
                        >
                          Edit
                        </button>{' '}
                        <button
                          onClick={() => handleDelete(bill._id)}
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