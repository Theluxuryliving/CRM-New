import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axios";
import { useAuth } from "../contexts/AuthContext";

const FollowUps = () => {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchFollowups();
  }, []);

  const fetchFollowups = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/followups");
      setFollowups(res.data || []);
    } catch (err) {
      console.error("Failed to load follow-ups", err);
      setFollowups([]);
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (id, status) => {
    try {
      // backend toggles status via PATCH /followups/:id/status
      await axiosInstance.patch(`/followups/${id}/status`, { status });
      fetchFollowups();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  if (!isAuthenticated) return <div className="p-4">Please log in to view follow-ups.</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Follow-ups</h1>
      {loading ? (
        <div>Loading follow-ups...</div>
      ) : followups.length === 0 ? (
        <div>No follow-ups found.</div>
      ) : (
        <ul className="space-y-3">
          {followups.map((fu) => {
            const latestStatus = (fu.logs && fu.logs[0] && fu.logs[0].status) || "PENDING";
            return (
              <li key={fu.id} className="p-3 border rounded bg-white shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{fu.message}</div>
                    <div className="text-sm text-gray-500">Lead: {fu.lead?.name || "—"}</div>
                    <div className="text-sm text-gray-500">Next: {fu.nextFollowupDate ? new Date(fu.nextFollowupDate).toLocaleString() : "—"}</div>
                    <div className="text-sm text-gray-500">Created by: {fu.createdBy?.name || "—"}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <select
                      className="border px-2 py-1 rounded"
                      value={latestStatus}
                      onChange={(e) => changeStatus(fu.id, e.target.value)}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="DONE">DONE</option>
                      <option value="MISSED">MISSED</option>
                      <option value="RESCHEDULED">RESCHEDULED</option>
                    </select>
                    <button
                      className="text-sm text-blue-600"
                      onClick={() => {
                        // attempt to open logs in a new window or alert (simple)
                        window.alert(JSON.stringify(fu.logs || [], null, 2));
                      }}
                    >
                      View Logs
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FollowUps;
