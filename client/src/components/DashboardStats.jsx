const DashboardStats = ({ totalLeads, assignedLeads }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
    <div className="bg-white p-4 rounded shadow">📊 Total Leads: <strong>{totalLeads}</strong></div>
    <div className="bg-white p-4 rounded shadow">👤 Assigned to You: <strong>{assignedLeads}</strong></div>
  </div>
);

export default DashboardStats;

