import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  X,
  Package,
  PackageOpen,
  LayoutGrid,
  CheckCircle2,
  Box,
  Layers,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

const API = "http://localhost:3000/api";

export default function Racks() {
  const [racks, setRacks] = useState([]);
  const [active, setActive] = useState(null);
  const [reelId, setReelId] = useState("");
  const [mode, setMode] = useState(null);
  const [selectedRackId, setSelectedRackId] = useState("");
  const [loading, setLoading] = useState(false);

  /* LOAD RACKS */
  const loadRacks = async () => {
    try {
      const res = await axios.get(`${API}/rack`);
      setRacks(res.data);
    } catch (err) {
      console.error("Failed to load racks", err);
    }
  };

  useEffect(() => {
    loadRacks();
  }, []);

  useEffect(() => {
    if (racks.length > 0 && !selectedRackId) {
      setSelectedRackId(racks[0].id.toString());
    }
  }, [racks]);

  const selectedRack = racks.find((r) => r.id === Number(selectedRackId));

  const occupied = selectedRack?.cells?.filter((c) => c.reelCode).length ?? 0;
  const total = selectedRack?.cells?.length ?? 0;
  const free = total - occupied;
  const occupancyPct = total > 0 ? Math.round((occupied / total) * 100) : 0;

  const selectCell = (rack, cell) => {
    setActive({ rack, cell });
    setMode(cell.reelCode ? "OUT" : "IN");
    setReelId("");
  };

  const submit = async () => {
    setLoading(true);
    try {
      const { rack, cell } = active;

      await axios.post(`${API}/history`, {
        reelCode: mode === "IN" ? reelId : cell.reelCode,
        action: mode === "IN" ? "INSERT" : "REMOVE",
        rackId: rack.id,
        cellId: cell.id,
      });

      toast.success(
        `Reel ${mode === "IN" ? "inserted" : "removed"} successfully`,
      );
      await loadRacks();
      setActive(null);
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {selectedRack && (
        <div className="space-y-6">
          {/* STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Cells"
              value={total}
              unit="Storage Slots"
              icon={<LayoutGrid size={20} />}
              iconBg="bg-[#EAF2FF]"
              iconColor="text-[#2563EB]"
            />
            <StatCard
              title="Occupied"
              value={occupied}
              unit="Cells Filled"
              icon={<Package size={20} />}
              iconBg="bg-[#FFF1F1]"
              iconColor="text-[#DC2626]"
            />
            <StatCard
              title="Available"
              value={free}
              unit="Cells Empty"
              icon={<PackageOpen size={20} />}
              iconBg="bg-[#EAFBF1]"
              iconColor="text-[#16A34A]"
            />
          </div>

          {/* OCCUPANCY SECTION */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">
                  Rack Utilization Rate
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {occupied} of {total} cells currently occupied
                </p>
              </div>
              <span className="text-lg font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
                {occupancyPct}%
              </span>
            </div>

            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${occupancyPct}%` }}
              />
            </div>
          </div>

          {/* SEGMENTED RACK TABS */}
          <div className="bg-slate-100/80 p-1.5 rounded-2xl flex items-center gap-1.5 overflow-x-auto border border-slate-200/80">
            {racks.map((rack) => {
              const isActive = selectedRackId === rack.id.toString();
              return (
                <button
                  key={rack.id}
                  onClick={() => {
                    setSelectedRackId(rack.id.toString());
                    setActive(null);
                  }}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60"
                  }`}
                >
                  <Layers size={16} className={isActive ? "text-white" : "text-slate-400"} />
                  <span>{rack.rackCode}</span>
                </button>
              );
            })}
          </div>

          {/* GRID & SIDE ACTION PANEL */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* RACK GRID CONTAINER */}
            <div className="flex-1 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    Rack Overview: {selectedRack.rackCode}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Click any cell to inspect, store, or remove a reel.
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-white border border-slate-300 shadow-2xs" />
                    <span className="text-slate-600">Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-[#FFF1F1] border border-red-200" />
                    <span className="text-slate-600">Occupied</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-blue-100 border border-blue-500" />
                    <span className="text-slate-600">Selected</span>
                  </div>
                </div>
              </div>

              {/* ROWS */}
              <div className="space-y-6">
                {[...new Set(selectedRack.cells.map((c) => c.rowNo))].map(
                  (rowNo) => (
                    <div key={rowNo} className="space-y-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <span>Row {rowNo}</span>
                        <span className="flex-1 h-px bg-slate-100" />
                      </p>

                      <div className="flex flex-wrap gap-2.5">
                        {selectedRack.cells
                          .filter((c) => c.rowNo === rowNo)
                          .map((cell) => {
                            const isSelected = active?.cell.id === cell.id;
                            const isOccupied = !!cell.reelCode;

                            return (
                              <button
                                key={cell.id}
                                onClick={() => selectCell(selectedRack, cell)}
                                className={`w-12 h-10 text-xs font-bold rounded-xl border transition-all duration-200 cursor-pointer flex flex-col items-center justify-center ${
                                  isSelected
                                    ? "bg-blue-100 border-blue-600 text-blue-700 ring-2 ring-blue-500/20 shadow-xs"
                                    : isOccupied
                                      ? "bg-[#FFF1F1] border-red-200 text-red-600 hover:bg-red-100/70"
                                      : "bg-white border-slate-200 text-slate-600 hover:bg-blue-50/50 hover:border-blue-300"
                                }`}
                              >
                                <span>C{cell.colNo}</span>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* SIDE PANEL */}
            {active && (
              <div className="w-full lg:w-80 flex-shrink-0 animate-fade-scale">
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md">
                  <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                    <span className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      {mode === "IN" ? (
                        <>
                          <CheckCircle2
                            size={20}
                            className="text-emerald-600"
                          />
                          Store Reel
                        </>
                      ) : (
                        <>
                          <Box size={20} className="text-amber-500" />
                          Remove Reel
                        </>
                      )}
                    </span>
                    <button
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      onClick={() => setActive(null)}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3.5 space-y-2.5 text-xs mb-4 border border-slate-100">
                    <Info label="Rack Code" value={active.rack.rackCode} />
                    <Info label="Row No." value={`Row ${active.cell.rowNo}`} />
                    <Info label="Column No." value={`Col ${active.cell.colNo}`} />
                    <div className="pt-2 mt-2 border-t border-slate-200">
                      <Info
                        label="Status"
                        value={
                          active.cell.reelCode ? (
                            <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                              {active.cell.reelCode}
                            </span>
                          ) : (
                            <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                              Empty Slot
                            </span>
                          )
                        }
                      />
                    </div>
                  </div>

                  {mode === "IN" && (
                    <div className="mb-5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Scan / Enter Reel Code
                      </label>
                      <input
                        autoFocus
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                        placeholder="e.g. REEL-84729"
                        value={reelId}
                        onChange={(e) => setReelId(e.target.value)}
                      />
                    </div>
                  )}

                  <button
                    onClick={submit}
                    disabled={loading || (mode === "IN" && !reelId.trim())}
                    className={`w-full py-3 text-sm font-bold text-white rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                      mode === "IN"
                        ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
                        : "bg-red-600 hover:bg-red-700 disabled:bg-red-300"
                    }`}
                  >
                    <span>
                      {loading
                        ? "Processing..."
                        : mode === "IN"
                          ? "Confirm Storage"
                          : "Confirm Removal"}
                    </span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* SUBCOMPONENTS */

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

function Info({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}
