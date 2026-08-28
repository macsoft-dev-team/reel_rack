import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Zap,
  LayoutDashboard,
  Settings,
  LogOut,
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
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 font-sans">
      {/* LEFT NAVIGATION BAR (Enhanced UI) */}
      <aside className="hidden lg:flex flex-col w-24 bg-white border-r border-slate-200 items-center py-8 gap-10">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
          <Zap size={24} fill="currentColor" />
        </div>
        <nav className="flex flex-col gap-8 text-slate-400">
          <LayoutDashboard className="text-blue-600 cursor-pointer" />
          <Settings className="hover:text-slate-600 cursor-pointer transition-colors" />
        </nav>
        <div className="mt-auto text-slate-400">
          <LogOut className="hover:text-red-500 cursor-pointer transition-colors" />
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-10 relative">
        {/* TOAST */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700"
            >
              <CheckCircle2 className="text-emerald-400" size={20} />
              <span className="font-bold text-sm">
                Picklist synced to warehouse successfully.
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-6xl mx-auto">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Rack Hub
              </h1>
              <p className="text-slate-500 font-medium">
                Dashboard • System Health 98%
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="group relative bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-xl active:scale-95"
            >
              <Plus
                size={20}
                className="group-hover:rotate-90 transition-transform"
              />
              Create New
            </button>
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* STAT CARDS */}
            <div className="lg:col-span-8 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  title="Storage"
                  value="120"
                  unit="Racks"
                  color="bg-blue-500"
                />
                <StatCard
                  title="Inventory"
                  value="4.8k"
                  unit="Reels"
                  color="bg-indigo-500"
                />
                <StatCard
                  title="Active"
                  value={picklists.length}
                  unit="Tasks"
                  color="bg-emerald-500"
                />
              </div>

              {/* UTILIZATION BOX */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="font-bold text-xl uppercase tracking-tighter">
                    Utilization Index
                  </h2>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <div className="w-3 h-3 bg-slate-200 rounded-full" />
                  </div>
                </div>
                <div className="h-40 flex items-end gap-2">
                  {[30, 45, 60, 20, 90, 65, 80, 40, 50, 85, 35, 70].map(
                    (h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        className="flex-1 bg-slate-100 rounded-lg hover:bg-blue-500 transition-colors relative group"
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-white border px-1 rounded">
                          {h}%
                        </div>
                      </motion.div>
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* SIDEBAR: PICKLISTS */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h2 className="font-bold">Active Picklists</h2>
                </div>
                <div className="p-2 h-[400px] overflow-y-auto">
                  <AnimatePresence initial={false}>
                    {picklists.map((pl, i) => (
                      <motion.div
                        key={pl}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="m-2 p-4 bg-slate-50 rounded-2xl flex justify-between items-center border border-transparent hover:border-slate-200 hover:bg-white transition-all group"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {pl}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">
                            Priority High
                          </p>
                        </div>
                        {i === 0 && (
                          <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-black animate-bounce">
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
        </div>

        {/* MODAL */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl"
              >
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>

                <h2 className="text-2xl font-black mb-2">Create Task</h2>
                <p className="text-slate-500 text-sm mb-8 font-medium">
                  Enter the picklist identifier to begin.
                </p>

                <div className="space-y-6">
                  <div className="relative">
                    <input
                      disabled={isSubmitting}
                      autoFocus
                      type="text"
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        setError("");
                      }}
                      placeholder="e.g. WH-8820"
                      className={`w-full p-5 bg-slate-50 rounded-2xl border-2 transition-all outline-none font-bold placeholder:text-slate-300 ${error ? "border-red-400 ring-4 ring-red-50" : "border-transparent focus:bg-white focus:border-blue-600"}`}
                    />
                    {error && (
                      <p className="text-red-500 text-xs font-bold mt-3 flex items-center gap-1">
                        <AlertCircle size={14} /> {error}
                      </p>
                    )}
                  </div>

                  <button
                    disabled={isSubmitting}
                    onClick={handleCreate}
                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-100 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      "Initialize Picklist"
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function StatCard({ title, value, unit, color }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col items-center text-center group cursor-default">
      <div
        className={`w-2 h-2 rounded-full mb-4 ${color} group-hover:scale-[3] transition-transform duration-500`}
      />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
        {title}
      </p>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-3xl font-black text-slate-800">{value}</span>
        <span className="text-xs font-bold text-slate-400">{unit}</span>
      </div>
    </div>
  );
}
