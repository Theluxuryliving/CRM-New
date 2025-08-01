// 📁 File: src/pages/Followups.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Followups = () => {
  const { role } = useAuth();
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState({});
  const [filters, setFilters] = useState({ status: '', from: '', to: '', agentId: '' });

  useEffect(() => {
    const fetchFollowups = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/followups', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          params: filters
        });
        setFollowups(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch followups:', err);
        setFollowups([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowups();
  }, [filters]);

  const toggleStatus = async (id, newStatus) => {
    try {
      const res = await axios.patch(`/api/followups/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setFollowups(f => f.map(fu => fu.id === id ? res.data : fu));
    } catch (err) {
      console.error('❌ Status update failed:', err);
    }
  };

  const fetchLogs = async (followupId) => {
    if (logs[followupId]) {
      setLogs(prev => ({ ...prev, [followupId]: null }));
      return;
    }
    try {
      const res = await axios.get(`/api/followups/${followupId}/logs`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setLogs(prev => ({ ...prev, [followupId]: res.data }));
    } catch (err) {
      console.error('❌ Failed to fetch logs:', err);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">📆 Follow-ups</h2>

      <div className="flex flex-wrap gap-4">
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="border p-2 rounded">
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="DONE">Done</option>
          <option value="SKIPPED">Skipped</option>
        </select>
        <input type="date" onChange={e => setFilters(f => ({ ...f, from: e.target.value }))} className="border p-2 rounded" />
        <input type="date" onChange={e => setFilters(f => ({ ...f, to: e.target.value }))} className="border p-2 rounded" />
        {['MANAGER', 'SR_MANAGER', 'DIRECTOR', 'CCO', 'ADMIN'].includes(role) && (
          <input placeholder="Agent ID" type="text" value={filters.agentId} onChange={e => setFilters(f => ({ ...f, agentId: e.target.value }))} className="border p-2 rounded" />
        )}
      </div>

      {loading ? (
        <p className="text-blue-600">Loading...</p>
      ) : followups.length === 0 ? (
        <p className="text-gray-500">🚫 No follow-ups found.</p>
      ) : (
        <div className="space-y-4">
          {followups.map(fu => {
            const overdue = new Date(fu.nextFollowupDate) < new Date();
            const upcoming = new Date(fu.nextFollowupDate) >= new Date();
            return (
              <div key={fu.id} className="p-4 border rounded bg-white shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">🔁 {fu.lead?.name || 'Lead'} — {fu.createdBy?.name}</h3>
                    <p className="text-sm text-gray-600">{new Date(fu.nextFollowupDate).toLocaleString()}</p>
                    <p>{fu.message}</p>
                    <div className="text-xs mt-1">
                      {overdue && <span className="text-red-500 font-semibold">❗ Overdue</span>}
                      {upcoming && <span className="text-green-600 font-semibold ml-2">⏳ Upcoming</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={fu.status} onChange={e => toggleStatus(fu.id, e.target.value)} className="border px-2 py-1 rounded">
                      <option value="PENDING">⏳ Pending</option>
                      <option value="DONE">✅ Done</option>
                      <option value="SKIPPED">🚫 Skipped</option>
                    </select>
                    <button onClick={() => fetchLogs(fu.id)} className="text-blue-600 hover:underline text-sm">{logs[fu.id] ? 'Hide Log' : 'View Log'}</button>
                  </div>
                </div>
                {logs[fu.id] && (
                  <div className="mt-2 text-sm bg-gray-50 p-2 rounded border">
                    <h4 className="font-medium mb-1">📜 Change History</h4>
                    {logs[fu.id].length === 0 ? (
                      <p>No changes logged.</p>
                    ) : (
                      <ul className="space-y-1">
                        {logs[fu.id].map(log => (
                          <li key={log.id} className="border-b py-1">
                            <span className="font-medium">{log.updatedBy?.name || 'User'}</span> changed to <strong>{log.status}</strong> on {new Date(log.timestamp).toLocaleString()}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Followups;
