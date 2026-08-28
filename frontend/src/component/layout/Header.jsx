import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PanelLeft, PanelLeftClose, Menu, ShieldCheck, LogOut } from "lucide-react";

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
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const userDataString = sessionStorage.getItem("user");
    if (userDataString) {
      try {
        setUser(JSON.parse(userDataString));
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    navigate("/");
  };

  const pageTitle = ROUTE_NAMES[location.pathname] || "Dashboard";
  const avatarInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";
  const userName = user?.name || "User";
  const employeeId = user?.employeeId || "N/A";

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-xs">
        {/* LEFT: Page Breadcrumb & Mobile Toggle */}
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={onMobileToggle}
            className="lg:hidden flex items-center justify-center w-9 h-9 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            <Menu size={20} />
          </button>

          {/* Page Title */}
          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* RIGHT: Status Badge, User Info & Logout */}
        <div className="flex items-center gap-2.5 sm:gap-3">
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

          {/* Log Out Button in Header */}
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            title="Log Out"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/80 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer shadow-2xs active:scale-95"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* LIGHT LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setShowLogoutModal(false)}
          />

          <div className="relative z-10 w-full max-w-sm p-6 rounded-2xl bg-white text-slate-800 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Confirm Logout</h2>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to end your current session?
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
