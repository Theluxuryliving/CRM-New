import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  BarChart2,
  Building2,
  Boxes,
  ClipboardList,
  FileText,
  UserCheck,
  Settings,
  Repeat,
} from "lucide-react";

const Sidebar = () => {
  const links = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Leads", path: "/leads", icon: Users },
    { name: "Follow-Up", path: "/followup", icon: Repeat },
    { name: "Calendar", path: "/calendar", icon: Calendar },
    { name: "Sales Funnel", path: "/sales-funnel", icon: BarChart2 },
    { name: "Projects", path: "/projects", icon: Building2 },
    { name: "Inventory", path: "/inventory", icon: Boxes },
    { name: "Sales/Deals", path: "/sales", icon: ClipboardList },
    { name: "Documents", path: "/documents", icon: FileText },
    { name: "Affiliates", path: "/affiliates", icon: UserCheck },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className="w-full h-full p-6">
      <h1 className="text-2xl font-extrabold text-blue-600 mb-8 tracking-wide">
        🏠 LLCRM
      </h1>
      <nav className="space-y-2">
        {links.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={name}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-5 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <Icon size={18} />
            <span className="whitespace-nowrap">{name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
