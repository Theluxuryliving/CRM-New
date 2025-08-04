// 📁 File: src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import { Bar, Line, Pie } from 'react-chartjs-2';
import html2pdf from 'html2pdf.js/dist/html2pdf.min.js';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const { role } = useAuth();
  const [leads, setLeads] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState('weekly');
  const [filters, setFilters] = useState({ status: '', projectId: '', agentId: '' });
  const [alerts, setAlerts] = useState([]);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [followups, setFollowups] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [leadsRes, summaryRes, followupsRes] = await Promise.all([
          axiosInstance.get(`${import.meta.env.VITE_API_BASE_URL}/api/leads`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            params: { timeFrame, ...filters },
          }),
          axiosInstance.get(`${import.meta.env.VITE_API_BASE_URL}/api/leads/summary`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            params: { timeFrame },
          }),
          axiosInstance.get(`${import.meta.env.VITE_API_BASE_URL}/api/followups`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            params: { status: 'PENDING' },
          }),
        ]);

        const raw = leadsRes.data;
        setLeads(Array.isArray(raw.items) ? raw.items : raw);
        setSummary(summaryRes.data);
        setFollowups(Array.isArray(followupsRes.data) ? followupsRes.data : []);
      } catch (err) {
        console.error('❌ Error fetching dashboard data:', err);
        setLeads([]);
        setFollowups([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeFrame, filters]);

  useEffect(() => {
    if (!Array.isArray(followups)) return;

    const now = new Date();
    const overdue = followups.filter(f => new Date(f.nextFollowupDate) < now);
    const upcoming = followups.filter(f => new Date(f.nextFollowupDate) >= now);
    const msgs = [];
    if (overdue.length > 0) msgs.push(`🔴 ${overdue.length} overdue follow-up(s)`);
    if (upcoming.length > 0) msgs.push(`🟡 ${upcoming.length} upcoming follow-up(s)`);
    setAlerts(msgs);
  }, [followups]);

  const leadCount = Array.isArray(leads) ? leads.length : 0;
  const meetings = Array.isArray(leads) ? leads.filter(l => l.status === 'MEETING_DONE').length : 0;
  const upcoming = Array.isArray(leads) ? leads.filter(l => new Date(l.nextMeeting) > new Date()).length : 0;

  const funnelStages = {
    NEW: 0, INQUIRY: 0, INFO_SHARED: 0, MEETING_DONE: 0,
    TOKEN_RECEIVED: 0, DOWNPAYMENT: 0, SPA: 0, CLOSED_WON: 0, CLOSED_LOST: 0,
  };
  if (Array.isArray(leads)) {
    leads.forEach(l => {
      const status = l.status || 'NEW';
      funnelStages[status] = (funnelStages[status] || 0) + 1;
    });
  }

  const pieData = {
    labels: Object.keys(funnelStages),
    datasets: [
      {
        label: 'Leads',
        data: Object.values(funnelStages),
        backgroundColor: ['#4bc0c0', '#ffcd56', '#36a2eb', '#ff6384', '#a0e0ff', '#8ae6e6', '#ffa0a0', '#d0ffcc', '#bbb'],
      },
    ],
  };

  const handleExportPDF = () => {
    const element = document.getElementById('dashboard-pdf');
    const opt = {
      margin: 0.3,
      filename: `dashboard-${timeFrame}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 3 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };
    html2pdf().set(opt).from(element).save();
  };

  const canExport = ['MANAGER', 'SR_MANAGER', 'DIRECTOR', 'CCO', 'ADMIN'].includes(role);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-3xl font-bold">📊 Dashboard</h2>
        <div className="flex gap-4 items-center">
          <select value={timeFrame} onChange={(e) => setTimeFrame(e.target.value)} className="p-2 border rounded">
            <option value="daily">Today</option>
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
            <option value="quarterly">This Quarter</option>
            <option value="yearly">This Year</option>
          </select>
          {canExport && (
            <button onClick={handleExportPDF} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              📥 Export PDF
            </button>
          )}
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="bg-yellow-100 text-yellow-800 p-3 rounded-xl">
          {alerts.map((a, i) => (
            <div key={i}>{a}</div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select className="border p-2 rounded" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Statuses</option>
          {Object.keys(funnelStages).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <select className="border p-2 rounded" value={filters.projectId} onChange={e => setFilters(f => ({ ...f, projectId: e.target.value }))}>
          <option value="">All Projects</option>
          <option value="proj1">Project 1</option>
          <option value="proj2">Project 2</option>
        </select>
        {canExport && (
          <select className="border p-2 rounded" value={filters.agentId} onChange={e => setFilters(f => ({ ...f, agentId: e.target.value }))}>
            <option value="">All Agents</option>
            <option value="agent1">Agent 1</option>
            <option value="agent2">Agent 2</option>
          </select>
        )}
      </div>

      {/* Date Range Picker */}
      <div className="flex gap-2">
        <input type="date" onChange={(e) => setDateRange({ ...dateRange, start: new Date(e.target.value) })} />
        <input type="date" onChange={(e) => setDateRange({ ...dateRange, end: new Date(e.target.value) })} />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-4 text-lg text-blue-600">Loading leads...</span>
        </div>
      ) : leadCount === 0 ? (
        <p className="text-center text-lg py-10">🚫 No leads found for this time frame.</p>
      ) : (
        <div id="dashboard-pdf" className="space-y-6 bg-white p-4 rounded shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white shadow-md rounded p-4 border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold">Total Leads</h3>
              <p className="text-3xl mt-2">{leadCount}</p>
            </div>
            <div className="bg-white shadow-md rounded p-4 border-l-4 border-green-500">
              <h3 className="text-lg font-semibold">Meetings Done</h3>
              <p className="text-3xl mt-2">{meetings}</p>
            </div>
            <div className="bg-white shadow-md rounded p-4 border-l-4 border-yellow-500">
              <h3 className="text-lg font-semibold">Upcoming Meetings</h3>
              <p className="text-3xl mt-2">{upcoming}</p>
            </div>
          </div>

          {canExport && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div layout className="bg-white rounded-2xl p-4 shadow-md">
                <Pie data={pieData} />
              </motion.div>
              <div className="bg-white shadow-md rounded p-4">
                <h3 className="text-lg font-semibold mb-2">Follow-up Aging</h3>
                <Line data={{
                  labels: ['0-3 Days', '4-7 Days', '8-14 Days', '15+ Days'],
                  datasets: [{
                    label: 'Overdue Followups',
                    data: summary?.followupAging ? [
                      summary.followupAging['0-3'],
                      summary.followupAging['4-7'],
                      summary.followupAging['8-14'],
                      summary.followupAging['15+']
                    ] : [0, 0, 0, 0],
                    borderColor: 'rgba(255,99,132,1)',
                    fill: false,
                  }]
                }} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} height={300} />
              </div>
            </div>
          )}

          <motion.div layout className="bg-white p-4 rounded-2xl shadow-md">
            <h2 className="text-lg font-semibold mb-2">Upcoming Follow-ups</h2>
            <Calendar tileContent={({ date }) => {
              const hasFollowup = Array.isArray(followups) && followups.some(f => new Date(f.nextFollowupDate).toDateString() === date.toDateString());
              return hasFollowup ? <span className="text-green-600 font-bold">•</span> : null;
            }} />
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
