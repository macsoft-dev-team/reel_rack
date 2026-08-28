import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { PanelLeft, PanelLeftClose, Menu, ShieldCheck } from "lucide-react";

const ROUTE_NAMES = {
  "/dashboard": "Rack Hub Dashboard",
  "/picklist": "Pick List Management",
  "/component": "Components Catalog",
  "/racks": "Rack Storage & Cells",
  "/reel": "Reel Inventory",
  "/inventory": "Inventory",
  "/inventoryhistory": "Inventory History",
  "/user": "User Management",
  "/auditlog": "Audit Logs",
  "/manufecturer": "Manufacturers",
  "/reelhistory": "Reel Action Logs",
};

export default function Header({ isCollapsed, onToggleSidebar, onMobileToggle }) {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      try {
        setUser(JSON.parse(userDataString));
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, []);

  const pageTitle = ROUTE_NAMES[location.pathname] || "Dashboard";
  const avatarInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";
  const userName = user?.name || "User";
  const employeeId = user?.employeeId || "N/A";

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* LEFT: Toggle Button & Page Breadcrumb */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Desktop Toggle Button */}
        <button
          onClick={onToggleSidebar}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          className="hidden lg:flex items-center justify-center w-9 h-9 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
        >
          {isCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>

        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={onMobileToggle}
          className="lg:hidden flex items-center justify-center w-9 h-9 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-slate-200 hidden sm:block" />

        {/* Page Title & Breadcrumb */}
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* RIGHT: Status Badge & User Info */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* System Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-xs font-semibold text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>System Active</span>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {avatarInitial}
          </div>
          <div className="hidden sm:block text-left">
            <span className="block text-xs font-bold text-slate-800 leading-tight">
              {userName}
            </span>
            <span className="text-[10px] font-medium text-slate-500 block leading-tight">
              ID: {employeeId}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
