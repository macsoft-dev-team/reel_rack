import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = sessionStorage.getItem("sidebar_collapsed");
    return saved ? JSON.parse(saved) : false;
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    sessionStorage.setItem("sidebar_collapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const toggleMobile = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800 antialiased font-sans">
      {/* LEFT SIDEBAR */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleSidebar}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* MAIN CONTENT AREA WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-hidden">
        {/* TOP HEADER */}
        <Header
          isCollapsed={isCollapsed}
          onToggleSidebar={toggleSidebar}
          onMobileToggle={toggleMobile}
        />

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
