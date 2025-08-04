
// 📁 File: src/pages/LeadDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../utils/axios';

const LeadDetail = () => {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newFollowup, setNewFollowup] = useState({ message: '', nextFollowupDate: '' });

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const res = await axiosInstance.get(`/leads/${id}`);
        setLead(res.data);
      } catch (err) {
        console.error('❌ Error fetching lead:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [id]);

  const handleFollowupSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(`/followups`, {
        leadId: id,
        message: newFollowup.message,
        nextFollowupDate: newFollowup.nextFollowupDate
      });
      alert('✅ Follow-up added!');
      setShowModal(false);
      setNewFollowup({ message: '', nextFollowupDate: '' });
    } catch (err) {
      console.error('❌ Failed to add follow-up:', err);
    }
  };

  if (loading) return <p className="p-4">⏳ Loading lead...</p>;
  if (!lead) return <p className="p-4 text-red-500">❌ Lead not found</p>;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">👤 Lead Detail</h2>
      <div className="border p-4 rounded bg-white shadow">
        <p><strong>Name:</strong> {lead.name}</p>
        <p><strong>Phone:</strong> {lead.phone}</p>
        <p><strong>Email:</strong> {lead.email}</p>
        <p><strong>Budget:</strong> {lead.budget?.toLocaleString()}</p>
      </div>

      <button
        onClick={() => {
          console.log('Button clicked');
          alert('Add Follow-up clicked');
          setShowModal(true);
        }}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        ➕ Add Follow-up
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-red-100 bg-opacity-90 z-[100] flex items-center justify-center border-4 border-red-600">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-2xl z-[101]">
            <h2 className="text-xl font-bold mb-4">➕ New Follow-up</h2>
            <form onSubmit={handleFollowupSubmit} className="space-y-4">
              <textarea
                value={newFollowup.message}
                onChange={(e) =>
                  setNewFollowup({ ...newFollowup, message: e.target.value })
                }
                placeholder="Follow-up message"
                className="w-full p-2 border rounded"
                rows={3}
                required
              />
              <input
                type="date"
                value={newFollowup.nextFollowupDate}
                onChange={(e) =>
                  setNewFollowup({
                    ...newFollowup,
                    nextFollowupDate: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
                required
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDetail;
