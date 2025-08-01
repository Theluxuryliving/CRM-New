import Sidebar from "./Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";

const Layout = () => {
  const location = useLocation();

  const pageTitles = {
    "/dashboard": "📊 Dashboard",
    "/leads": "📋 Leads",
    "/leads/new": "➕ Add New Lead",
    "/followup": "🔁 Follow-Up",
    "/calendar": "🗓️ Calendar",
    "/sales-funnel": "📈 Sales Funnel",
    "/projects": "🏗️ Projects",
    "/inventory": "📦 Inventory",
    "/sales": "🤝 Sales & Deals",
    "/documents": "📑 Documents",
    "/affiliates": "👥 Affiliates",
    "/settings": "⚙️ Settings",
  };

  const title = pageTitles[location.pathname] || "LLCRM";

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white border-r shadow-md">
        <Sidebar />
      </aside>

      <main className="flex-1">
        <Header title={title} />
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
