import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Boxes,
  Layers,
  History,
  Warehouse,
  ListChecks,
  Users,
  X,
  Factory,
  Film,
  Settings,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import logo from "../../assets/Logo.jpg";

export default function Sidebar({ isCollapsed, onToggleCollapse, mobileOpen, setMobileOpen }) {
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Pick List", path: "/picklist", icon: ListChecks },
    { label: "Components", path: "/component", icon: Boxes },
    { label: "Racks", path: "/racks", icon: Layers },
    { label: "Reel", path: "/reel", icon: Film },
    { label: "Inventory", path: "/inventory", icon: Warehouse },
    { label: "History", path: "/inventoryhistory", icon: History },
    { label: "User", path: "/user", icon: Users },
    { label: "Audit Log", path: "/auditlog", icon: History },
    { label: "Manufacturer", path: "/manufecturer", icon: Factory },
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* MOBILE OVERLAY BACKDROP */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside
        className={`
          fixed lg:static top-0 left-0 z-50
          h-screen
          bg-white text-slate-700 border-r border-slate-200 shadow-xs
          flex flex-col justify-between
          transition-all duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "lg:w-20" : "lg:w-64"}
        `}
      >
        <div className="flex flex-col h-full overflow-y-auto px-3 py-4">
          {/* HEADER / BRANDING */}
          <div className="flex items-center justify-between mb-6 px-2 pt-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <img
                src={logo}
                alt="Logo"
                className="w-9 h-9 rounded-xl border border-slate-200 shadow-xs object-cover flex-shrink-0"
              />
              {!isCollapsed && (
                <div className="truncate">
                  <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                    MACSOFT
                  </h1>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    Rack Management
                  </p>
                </div>
              )}
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X size={20} />
            </button>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={onToggleCollapse}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              className="hidden lg:flex p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            >
              {isCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
            </button>
          </div>

          {/* NAVIGATION ITEMS */}
          <nav className="space-y-1.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    relative group flex items-center gap-3
                    ${isCollapsed ? "justify-center px-0 py-3" : "px-3.5 py-2.5"}
                    rounded-xl font-medium text-sm
                    transition-all duration-200
                    ${
                      active
                        ? "bg-[#EAF2FF] text-blue-600 font-semibold shadow-2xs border-l-4 border-blue-600"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }
                  `}
                >
                  <Icon
                    size={20}
                    className={`flex-shrink-0 ${active ? "text-blue-600" : "text-slate-500 group-hover:text-slate-800"}`}
                  />
                  
                  {!isCollapsed && (
                    <span className="truncate flex-1 tracking-wide">{item.label}</span>
                  )}

                  {/* ACTIVE INDICATOR ARROW */}
                  {!isCollapsed && active && (
                    <ChevronRight size={16} className="text-blue-600 opacity-80" />
                  )}

                  {/* FLOATING TOOLTIP FOR COLLAPSED MODE */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
