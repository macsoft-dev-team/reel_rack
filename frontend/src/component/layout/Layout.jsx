// import Header from "../../pages/header/Header";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="min-h-screen">
      {/* TOP HEADER */}

      <div className="flex ">
        {/* LEFT SIDEBAR */}
        <Sidebar />

        {/* MAIN CONTENT */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
