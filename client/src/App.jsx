// ❌ Don't import BrowserRouter or Router here
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext"; // Already used in main.jsx
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import LeadForm from "./pages/LeadForm";
import LeadDetail from './pages/LeadDetail';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<PrivateRoute allowedRoles={["ADMIN", "CCO", "DIRECTOR", "SR_MANAGER", "MANAGER", "AGENT"]} />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="/leads/:id" element={<LeadDetail />} />
          <Route path="leads/add" element={<LeadForm />} />
          <Route path="followup" element={<div className="p-6">🔁 Follow-Up Page</div>} />
          <Route path="calendar" element={<div className="p-6">🗓️ Calendar Page</div>} />
          <Route path="sales-funnel" element={<div className="p-6">📈 Sales Funnel Page</div>} />
          <Route path="projects" element={<div className="p-6">🏗️ Projects Page</div>} />
          <Route path="inventory" element={<div className="p-6">📦 Inventory Page</div>} />
          <Route path="sales" element={<div className="p-6">🤝 Sales Page</div>} />
          <Route path="documents" element={<div className="p-6">📑 Documents Page</div>} />
          <Route path="affiliates" element={<div className="p-6">👥 Affiliates Page</div>} />
          <Route path="settings" element={<div className="p-6">⚙️ Settings Page (Not built yet)</div>} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
