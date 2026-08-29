import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Layers, Package, ListChecks, ArrowRight } from "lucide-react";
import axiosInstance from "../../api/axiosConfig";

export default function ReelRackDashboard() {
  const navigate = useNavigate();
  const [picklists, setPicklists] = useState([]);
  const [loading, setLoading] = useState(true);

  // User Session Data
  const storedUserRaw = sessionStorage.getItem("user");
  let currentUser = {};
  try {
    currentUser = storedUserRaw ? JSON.parse(storedUserRaw) : {};
  } catch (err) {
    console.error("User parse error:", err);
  }

  const userRole = (currentUser.role || "").toUpperCase().replace(/_/g, "");
  const isSuperAdmin = userRole === "SUPERADMIN";

  // Fetch real picklists from API
  const fetchPicklists = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/picklist");
      setPicklists(res.data || []);
    } catch (err) {
      console.error("Error fetching dashboard picklists:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPicklists();
  }, []);

  // Filter picklists role-wise (SuperAdmin sees all, others see assigned)
  const filteredPicklists = picklists.filter((pl) => {
    if (isSuperAdmin) return true;
    if (!pl || !pl.operator) return false;

    const opLower = pl.operator.toString().trim().toLowerCase();
    const currentNameLower = (currentUser.name || "").toString().trim().toLowerCase();
    const currentEmpIdLower = (currentUser.employeeId || "").toString().trim().toLowerCase();
    const currentIdStr = (currentUser.id || "").toString().trim();

    if (currentNameLower && opLower === currentNameLower) return true;
    if (currentEmpIdLower && opLower === currentEmpIdLower) return true;
    if (currentIdStr && opLower === currentIdStr) return true;

    if (opLower === "operator_1" || opLower === "operator 1") {
      if (currentEmpIdLower === "op-001" || currentNameLower === "kumar") return true;
    }
    if (opLower === "operator_2" || opLower === "operator 2") {
      if (currentEmpIdLower === "op-002" || currentNameLower === "arun") return true;
    }

    return false;
  });

  return (
    <div className="w-full space-y-6 font-sans">
      {/* TOP ACTIONS HEADER */}
      <div className="flex justify-end">
        <button
          onClick={() => navigate("/picklist")}
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <Plus size={18} />
          <span>Create New Task</span>
        </button>
      </div>

      {/* MAIN GRID CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* STATS & UTILIZATION */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Storage Racks"
              value="120"
              unit="Racks"
              icon={<Layers size={20} />}
              iconBg="bg-[#EAF2FF]"
              iconColor="text-[#2563EB]"
            />
            <StatCard
              title="Total Inventory"
              value="4.8k"
              unit="Reels"
              icon={<Package size={20} />}
              iconBg="bg-[#EAFBF1]"
              iconColor="text-[#16A34A]"
            />
            <StatCard
              title="Active Tasks"
              value={filteredPicklists.length}
              unit="Picklists"
              icon={<ListChecks size={20} />}
              iconBg="bg-[#FFF1F1]"
              iconColor="text-[#DC2626]"
            />
          </div>

          {/* UTILIZATION INDEX CHART BOX */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">
                  Warehouse Utilization Index
                </h2>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Hourly rack capacity utilization metrics
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                <span className="text-xs font-semibold text-slate-600">Active Load</span>
              </div>
            </div>

            <div className="h-44 flex items-end gap-2 pt-4">
              {[30, 45, 60, 20, 90, 65, 80, 40, 50, 85, 35, 70].map(
                (h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className="flex-1 bg-slate-100 rounded-lg hover:bg-blue-600 transition-colors relative group"
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white px-2 py-0.5 rounded-md shadow-md pointer-events-none">
                      {h}%
                    </div>
                  </motion.div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* ACTIVE PICKLISTS SIDEBAR */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs h-full flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-900 text-base">Active Picklists</h2>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                {filteredPicklists.length} Total
              </span>
            </div>

            <div className="p-3 overflow-y-auto max-h-[420px] space-y-2 flex-1">
              {loading ? (
                <div className="p-6 text-center text-xs text-slate-400">Loading picklists...</div>
              ) : filteredPicklists.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 font-medium">
                  No active picklists assigned to you.
                </div>
              ) : (
                filteredPicklists.map((pl) => (
                  <div
                    key={pl.id || pl.code}
                    onClick={() => navigate("/picklist")}
                    className="p-4 bg-slate-50 rounded-xl flex justify-between items-center border border-slate-200/70 hover:border-blue-300 hover:bg-blue-50/40 transition-all cursor-pointer group"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {pl.code || `PL-${pl.id}`} - {pl.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                        Operator: <span className="text-slate-700">{pl.operator}</span> • Status: <span className="text-blue-600 font-bold">{pl.status}</span>
                      </p>
                    </div>
                    <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, unit, icon, iconBg, iconColor }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between hover:border-blue-200 hover:shadow-md transition-all duration-200">
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </span>
          <span className="text-xs font-medium text-slate-400">{unit}</span>
        </div>
      </div>
      <div className={`w-12 h-12 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center shadow-2xs`}>
        {icon}
      </div>
    </div>
  );
}
