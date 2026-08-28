import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Package,
  Layers,
  ListChecks,
} from "lucide-react";

export default function ReelRackDashboard() {
  const [picklists, setPicklists] = useState(["PL-1023", "PL-1024", "PL-1025"]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleCreate = async () => {
    if (!inputValue.trim()) {
      setError("Required: Please enter a Picklist ID.");
      return;
    }

    setIsSubmitting(true);

    // Simulate Network Delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setPicklists([inputValue.toUpperCase(), ...picklists]);
    setIsSubmitting(false);
    setIsModalOpen(false);
    setInputValue("");
    setError("");

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="w-full space-y-6">
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 text-sm font-semibold"
          >
            <CheckCircle2 className="text-emerald-400" size={20} />
            <span>Picklist synced to warehouse successfully.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DASHBOARD HEADER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Rack Hub Dashboard
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            System Status: <span className="text-emerald-600 font-bold">Optimal (98%)</span> • Operational Overview
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-xs active:scale-95 cursor-pointer"
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
              value={picklists.length}
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
                {picklists.length} Total
              </span>
            </div>

            <div className="p-3 overflow-y-auto max-h-[420px] space-y-2 flex-1">
              <AnimatePresence initial={false}>
                {picklists.map((pl, i) => (
                  <motion.div
                    key={pl}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-slate-50 rounded-xl flex justify-between items-center border border-slate-200/70 hover:border-blue-300 hover:bg-blue-50/40 transition-all group"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900">{pl}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                        Priority: High
                      </p>
                    </div>
                    {i === 0 && (
                      <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-md font-bold shadow-2xs">
                        NEW
                      </span>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE PICKLIST MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>

              <h2 className="text-xl font-bold text-slate-900 mb-1">Create Picklist Task</h2>
              <p className="text-slate-500 text-xs mb-6 font-medium">
                Enter a unique picklist ID to initialize warehouse syncing.
              </p>

              <div className="space-y-4">
                <div>
                  <input
                    disabled={isSubmitting}
                    autoFocus
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      setError("");
                    }}
                    placeholder="e.g. PL-8820"
                    className={`w-full p-3.5 bg-slate-50 rounded-xl border text-sm font-semibold transition-all outline-none placeholder:text-slate-400 ${
                      error
                        ? "border-red-400 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                    }`}
                  />
                  {error && (
                    <p className="text-red-600 text-xs font-semibold mt-2 flex items-center gap-1">
                      <AlertCircle size={14} /> {error}
                    </p>
                  )}
                </div>

                <button
                  disabled={isSubmitting}
                  onClick={handleCreate}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xs disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Initializing Task...</span>
                    </>
                  ) : (
                    "Initialize Picklist"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
