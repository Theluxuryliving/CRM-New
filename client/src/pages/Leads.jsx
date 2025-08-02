import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import axiosInstance from '../utils/axios'; // ✅ Custom axios instance

const Leads = () => {
  const { role } = useAuth();
  const [leads, setLeads] = useState([]);
  const [filters, setFilters] = useState({ status: '', projectId: '', agentId: '', search: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [importData, setImportData] = useState([]);
  const [importErrors, setImportErrors] = useState([]);

  const canDelete = ['DIRECTOR', 'CCO', 'ADMIN'].includes(role);
  const canReassign = canDelete;
  const canSeeAgents = ['MANAGER', 'SR_MANAGER', 'DIRECTOR', 'CCO', 'ADMIN'].includes(role);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/leads', { params: { ...filters, page } });
        const items = Array.isArray(res.data.items) ? res.data.items : [];
        const pages = typeof res.data.totalPages === 'number' ? res.data.totalPages : 1;
        setLeads(items);
        setTotalPages(pages);
      } catch (err) {
        console.error('❌ Error fetching leads:', err);
        setLeads([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, [filters, page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await axiosInstance.delete(`/leads/${id}`);
      setLeads(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error('❌ Error deleting lead:', err);
    }
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    const ext = file.name.split('.').pop();

    reader.onload = (e) => {
      if (ext === 'csv') {
        const parsed = Papa.parse(e.target.result, { header: true });
        setImportData(parsed.data);
      } else if (ext === 'xlsx') {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const parsed = XLSX.utils.sheet_to_json(sheet);
        setImportData(parsed);
      }
    };

    if (ext === 'csv') {
      reader.readAsText(file);
    } else if (ext === 'xlsx') {
      reader.readAsBinaryString(file);
    }
  };

  const handleImport = async () => {
    try {
      const res = await axiosInstance.post('/leads/import', importData);
      alert(res.data.message);
      setImportErrors(Array.isArray(res.data.errors) ? res.data.errors : []);
      setImportData([]);
    } catch (err) {
      alert('❌ Import failed.');
      console.error(err);
    }
  };

  const updateImportCell = (index, key, value) => {
    const updated = [...importData];
    updated[index][key] = value;
    setImportData(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">📋 Leads</h2>
        <div className="space-x-2">
          <input type="file" accept=".csv,.xlsx" onChange={e => handleFileUpload(e.target.files[0])} />
          <Link to="/leads/add" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            ➕ Add Lead
          </Link>
        </div>
      </div>

      {Array.isArray(importData) && importData.length > 0 && (
        <div className="border p-4 rounded bg-white shadow-md">
          <h3 className="text-lg font-semibold mb-2">📤 Preview Import</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr>
                  {Object.keys(importData[0] || {}).map(key => (
                    <th key={key} className="border p-1">{key}</th>
                  ))}
                  <th className="border p-1">Error</th>
                </tr>
              </thead>
              <tbody>
                {importData.map((row, idx) => (
                  <tr key={idx}>
                    {Object.keys(row).map(key => (
                      <td key={key} className="border p-1">
                        <input
                          type="text"
                          value={row[key] || ''}
                          onChange={e => updateImportCell(idx, key, e.target.value)}
                          className="w-full border px-1"
                        />
                      </td>
                    ))}
                    <td className="border p-1 text-red-600 text-xs">
                      {importErrors.find(e => e.row === idx + 2)?.error || ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={handleImport} className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            ✅ Confirm Import
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="🔍 Search by name, email, phone"
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          className="border p-2 rounded w-full sm:w-64"
        />
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="border p-2 rounded">
          <option value="">All Statuses</option>
          <option value="NEW">New</option>
          <option value="INQUIRY">Inquiry</option>
          <option value="MEETING_DONE">Meeting Done</option>
          <option value="CLOSED_WON">Closed Won</option>
          <option value="CLOSED_LOST">Closed Lost</option>
        </select>
        <select value={filters.projectId} onChange={e => setFilters(f => ({ ...f, projectId: e.target.value }))} className="border p-2 rounded">
          <option value="">All Projects</option>
          <option value="proj1">Project 1</option>
          <option value="proj2">Project 2</option>
        </select>
        {canSeeAgents && (
          <select value={filters.agentId} onChange={e => setFilters(f => ({ ...f, agentId: e.target.value }))} className="border p-2 rounded">
            <option value="">All Agents</option>
            <option value="agent1">Agent 1</option>
            <option value="agent2">Agent 2</option>
          </select>
        )}
      </div>

      {loading ? (
        <div className="text-center py-10 text-blue-600">Loading leads...</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-10 text-gray-500">🚫 No leads found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Phone</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Project</th>
                <th className="p-2 text-left">Status</th>
                {canSeeAgents && <th className="p-2 text-left">Assigned To</th>}
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{lead.name}</td>
                  <td className="p-2">{lead.phone}</td>
                  <td className="p-2">{lead.email}</td>
                  <td className="p-2">{lead.projectName || '—'}</td>
                  <td className="p-2">{lead.status}</td>
                  {canSeeAgents && <td className="p-2">{lead.agentName || '—'}</td>}
                  <td className="p-2 space-x-2">
                    <Link to={`/leads/${lead.id}`} className="text-blue-600 hover:underline">View</Link>
                    {canDelete && (
                      <button onClick={() => handleDelete(lead.id)} className="text-red-600 hover:underline">Delete</button>
                    )}
                    {canReassign && (
                      <button className="text-green-600 hover:underline">Reassign</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >Prev</button>
            <span>Page {page} of {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
