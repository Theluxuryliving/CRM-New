// 📁 File: src/pages/LeadDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../utils/axios';

const STAGES = ['NEW', 'CONTACTED', 'FOLLOWED_UP', 'MEETING_DONE', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];

const LeadDetail = () => {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newFollowup, setNewFollowup] = useState({ message: '', nextFollowupDate: '' });
  const [updatingStatus, setUpdatingStatus] = useState(false);

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
        nextFollowupDate: newFollowup.nextFollowupDate,
      });
      alert('✅ Follow-up added!');
      setShowModal(false);
      setNewFollowup({ message: '', nextFollowupDate: '' });
      fetchLead();
    } catch (err) {
      console.error('❌ Failed to add follow-up:', err);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setUpdatingStatus(true);
    try {
      await axiosInstance.put(`/leads/${id}`, { status: newStatus });
      await fetchLead();
    } catch (err) {
      console.error('❌ Failed to update status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) return <p className="p-4">⏳ Loading lead...</p>;
  if (!lead) return <p className="p-4 text-red-500">❌ Lead not found</p>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">👤 Lead Detail</h2>

      <div className="border p-4 rounded bg-white shadow grid grid-cols-1 md:grid-cols-2 gap-4">
        <p><strong>Name:</strong> {lead.name}</p>
        <p><strong>Phone:</strong> {lead.phone}</p>
        <p><strong>Email:</strong> {lead.email}</p>
        <p><strong>Country:</strong> {lead.country}</p>
        <p><strong>City:</strong> {lead.city}</p>
        <p><strong>Area Interested In:</strong> {lead.areaInterestedIn}</p>
        <p><strong>Plan Interested In:</strong> {lead.planInterestedIn}</p>
        <p><strong>Property Type:</strong> {lead.propertyType}</p>
        <p><strong>Project:</strong> {lead.project?.name || 'N/A'}</p>
        <p><strong>Budget:</strong> {lead.budget?.toLocaleString()} PKR</p>
        <p><strong>Purchase Timeline:</strong> {lead.planToPurchase}</p>
        <p><strong>Lead Source:</strong> {lead.leadSource}</p>
        <div className="flex items-center gap-3">
          <strong>Status:</strong>
          <span className="px-2 py-1 rounded text-white text-sm bg-green-600">{lead.status}</span>
          <select
            value={lead.status}
            onChange={handleStatusChange}
            disabled={updatingStatus}
            className="ml-2 border p-1 rounded"
          >
            {STAGES.map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
        </div>
        <p><strong>Assigned Agent:</strong> {lead.assignedTo?.name || 'N/A'}</p>
        <p><strong>Created:</strong> {new Date(lead.createdAt).toLocaleString()}</p>
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        ➕ Add Follow-up
      </button>

      <div className="mt-6">
        <h3 className="text-xl font-bold mb-2">📌 Follow-ups</h3>
        {lead.followups?.length > 0 ? (
          <ul className="space-y-3">
            {lead.followups.map((f, i) => (
              <li key={i} className="border rounded p-3 bg-gray-50">
                <p className="text-sm text-gray-700 mb-1"><strong>Next:</strong> {f.nextFollowupDate}</p>
                <p>{f.message}</p>
                <p className="text-xs text-gray-500 mt-1">🕓 {new Date(f.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No follow-ups yet.</p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-2xl z-[60]">
            <h2 className="text-xl font-bold mb-4">➕ New Follow-up</h2>
            <form onSubmit={handleFollowupSubmit} className="space-y-4">
              <textarea
                value={newFollowup.message}
                onChange={(e) => setNewFollowup({ ...newFollowup, message: e.target.value })}
                placeholder="Follow-up message"
                className="w-full p-2 border rounded"
                rows={3}
                required
              />
              <input
                type="date"
                value={newFollowup.nextFollowupDate}
                onChange={(e) => setNewFollowup({ ...newFollowup, nextFollowupDate: e.target.value })}
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
