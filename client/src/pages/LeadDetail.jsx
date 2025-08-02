import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axiosInstance from "../utils/axios";

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [lead, setLead] = useState(null);
  const [followups, setFollowups] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newFollowup, setNewFollowup] = useState({ message: "", nextFollowupDate: "" });

  useEffect(() => {
    const fetchLeadAndFollowups = async () => {
      try {
        const leadRes = await axiosInstance.get(`/leads/${id}`);
        setLead(leadRes.data);
      } catch (err) {
        console.error("❌ Failed to fetch lead:", err);
        navigate("/leads");
      }

      try {
        const followupRes = await axiosInstance.get(`/followups/lead/${id}`);
        setFollowups(Array.isArray(followupRes.data) ? followupRes.data : []);
      } catch (err) {
        console.error("❌ Failed to fetch followups:", err);
        setFollowups([]);
      }
    };

    fetchLeadAndFollowups();
  }, [id]);

  const handleFollowupSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/followups", { leadId: id, ...newFollowup });
      setNewFollowup({ message: "", nextFollowupDate: "" });
      setShowModal(false);

      const res = await axiosInstance.get(`/followups/lead/${id}`);
      setFollowups(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Failed to submit follow-up:", err);
    }
  };

  const toggleStatus = async (fid, current) => {
    try {
      const res = await axiosInstance.patch(`/followups/${fid}/status`, { status: !current });
      setFollowups((prev) =>
        prev.map((f) =>
          f.id === fid ? { ...f, status: res.data.status } : f
        )
      );
    } catch (err) {
      console.error("❌ Failed to toggle status:", err);
    }
  };

  if (!lead) return <div className="p-6">Loading Lead...</div>;

  return (
    <div className="relative min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-4">👤 Lead Detail</h2>

      <div className="bg-white shadow rounded p-4 mb-6">
        <p><strong>Name:</strong> {lead.name}</p>
        <p><strong>Phone:</strong> {lead.phone}</p>
        <p><strong>Email:</strong> {lead.email || "N/A"}</p>
        <p><strong>Country:</strong> {lead.country}</p>
        <p><strong>City:</strong> {lead.city}</p>
        <p><strong>Interested Area:</strong> {lead.areaInterestedIn}</p>
        <p><strong>Plan:</strong> {lead.planInterestedIn}</p>
        <p><strong>Property Type:</strong> {lead.propertyType}</p>
        <p><strong>Budget:</strong> {lead.budget?.toLocaleString()} PKR</p>
        <p><strong>Status:</strong> {lead.status}</p>
        <p><strong>Assigned Agent:</strong> {lead.agentName || "Unassigned"}</p>
        <button
          onClick={() => setShowModal(true)}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ➕ Add Follow-up
        </button>
      </div>

      <h3 className="text-xl font-semibold mb-2">📌 Follow-ups</h3>
      {followups.length === 0 ? (
        <p>No follow-ups yet.</p>
      ) : (
        <ul className="space-y-2">
          {followups.map((f) => (
            <li
              key={f.id}
              className="border p-3 rounded shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{f.message}</p>
                <p className="text-sm text-gray-500">
                  Next: {new Date(f.nextFollowupDate).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => toggleStatus(f.id, f.status)}
                className={`text-white px-3 py-1 rounded ${
                  f.status ? "bg-green-600 hover:bg-green-700" : "bg-gray-500 hover:bg-gray-600"
                }`}
              >
                {f.status ? "✅ Done" : "❌ Pending"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* ✅ Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
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
