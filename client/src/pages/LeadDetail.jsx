import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../utils/axios';

const statusOptions = [
  'NEW',
  'CONTACTED',
  'MEETING_SCHEDULED',
  'SITE_VISITED',
  'NEGOTIATION',
  'CLOSED_WON',
  'CLOSED_LOST'
];

const LeadDetail = () => {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newFollowup, setNewFollowup] = useState({ message: '', nextFollowupDate: '' });

  useEffect(() => {
    fetchLead();
  }, [id]);

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
      fetchLead(); // Refresh
    } catch (err) {
      console.error('❌ Failed to add follow-up:', err);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await axiosInstance.put(`/leads/${id}`, { status: newStatus });
      setLead(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error('❌ Failed to update status:', err);
    }
  };

  if (loading) return <p className="p-4">⏳ Loading lead...</p>;
  if (!lead) return <p className="p-4 text-red-500">❌ Lead not found</p>;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">👤 Lead Detail</h2>

      <div className="border p-4 rounded bg-white shadow space-y-2">
        <p><strong>Name:</strong> {lead.name}</p>
        <p><strong>Phone:</strong> {lead.phone}</p>
        <p><strong>Email:</strong> {lead.email}</p>
        <p><strong>Country:</strong> {lead.country}</p>
        <p><strong>City:</strong> {lead.city}</p>
        <p><strong>Area Interested In:</strong> {lead.areaInterestedIn}</p>
        <p><strong>Plan Interested In:</strong> {lead.planInterestedIn}</p>
        <p><strong>Property Type:</strong> {lead.propertyType}</p>
        <p><strong>Project:</strong> {lead.project?.name || 'N/A'}</p>
        <p><strong>Budget:</strong> Rs. {lead.budget?.toLocaleString()}</p>
        <p><strong>Plan to Purchase:</strong> {lead.planToPurchase}</p>
        <p><strong>Lead Source:</strong> {lead.leadSource}</p>
        <p><strong>Agent:</strong> {lead.assignedTo?.name || 'Unassigned'}</p>

        <div className="flex items-center gap-3 mt-4">
          <span className="px-3 py-1 text-sm rounded-full font-semibold bg-blue-100 text-blue-700">
            🎯 Stage: {lead.status}
          </span>

          <select
            value={lead.status}
            onChange={handleStatusChange}
            className="border px-3 py-1 rounded"
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        ➕ Add Follow-up
      </button>

      {/* 📞 Follow-ups */}
      <div className="bg-white border rounded p-4 shadow">
        <h3 className="text-lg font-semibold mb-2">📞 Follow-ups</h3>
        {lead.followups?.length > 0 ? (
          <ul className="space-y-2">
            {lead.followups.map((fup) => (
              <li key={fup.id} className="border p-2 rounded">
                <p className="text-sm text-gray-700">{fup.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Next Follow-up: {new Date(fup.nextFollowupDate).toLocaleDateString()} | Added: {new Date(fup.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No follow-ups yet.</p>
        )}
      </div>

      {/* 📝 Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center">
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
