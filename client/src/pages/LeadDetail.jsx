import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [lead, setLead] = useState(null);
  const [followups, setFollowups] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newFollowup, setNewFollowup] = useState({ message: "", nextFollowupDate: "" });

  const headers = {
    Authorization: `Bearer ${localStorage.getItem("token") || token}`,
  };

  useEffect(() => {
    axios.get(`/api/leads/${id}`, { headers })
      .then((res) => setLead(res.data))
      .catch((err) => {
        console.error("❌ Failed to fetch lead:", err);
        navigate("/leads");
      });

    axios.get(`/api/followups/lead/${id}`, { headers })
      .then((res) => {
        if (Array.isArray(res.data)) setFollowups(res.data);
        else setFollowups([]);
      })
      .catch((err) => console.error("❌ Failed to fetch followups:", err));
  }, [id]);

  const handleFollowupSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "/api/followups",
        { leadId: id, ...newFollowup },
        { headers }
      );
      setNewFollowup({ message: "", nextFollowupDate: "" });
      setShowModal(false);

      const res = await axios.get(`/api/followups/lead/${id}`, { headers });
      if (Array.isArray(res.data)) setFollowups(res.data);
      else setFollowups([]);
    } catch (err) {
      console.error("❌ Failed to submit follow-up:", err);
    }
  };

  const toggleStatus = async (fid, current) => {
    try {
      const res = await axios.patch(
        `/api/followups/${fid}/status`,
        { status: !current },
        { headers }
      );
      setFollowups((prev) =>
        prev.map((f) =>
          f.id === fid ? { ...f, status: res.data.status } : f
        )
      );
    } catch (err) {
      console.error("❌ Failed to toggle status:", err);
    }
  };

  if (!lead) return <div>Loading Lead...</div>;

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
          onClick={() => {
            console.log("✅ Add Follow-up button clicked");
            setShowModal(true);
          }}
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
                  f.status
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-500 hover:bg-gray-600"
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
