import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  X,
  Package,
  PackageOpen,
  LayoutGrid,
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2, // Added for enhanced side panel
  Box, // Added for enhanced side panel
} from "lucide-react";
import TitleHead from "../../component/layout/TitleHead";
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

  const occupied = selectedRack?.cells.filter((c) => c.reelCode).length ?? 0;
  const total = selectedRack?.cells.length ?? 0;
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
    <div className="min-h-screen bg-gray-50 px-3 sm:px-6 py-4">
      <TitleHead title="Racks" />

      {selectedRack && (
        <div className="mt-6 space-y-6">
          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Cells"
              value={total}
              icon={<LayoutGrid size={16} />}
              bgColor="bg-blue-300"
            />
            <StatCard
              title="Occupied"
              value={occupied}
              icon={<Package size={16} />}
              bgColor="bg-red-300"
            />
            <StatCard
              title="Available"
              value={free}
              icon={<PackageOpen size={16} />}
              bgColor="bg-green-300"
            />
          </div>

          {/* Occupancy Bar */}
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex justify-between text-xs mb-2">
              <span>Occupancy</span>
              <span>{occupancyPct}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all"
                style={{ width: `${occupancyPct}%` }}
              />
            </div>
          </div>

          {/* Rack Tabs */}
          <div className="flex mt-4 gap-2 overflow-x-auto pb-2 ">
            {racks.map((rack) => (
              <button
                key={rack.id}
                onClick={() => {
                  setSelectedRackId(rack.id.toString());
                  setActive(null);
                }}
                className={`px-10 py-2 whitespace-nowrap  rounded-md text-sm font-medium border transition cursor-pointer ${
                  selectedRackId === rack.id.toString()
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                {rack.rackCode}
              </button>
            ))}
          </div>

          {/* GRID + PANEL */}
          <div className="flex flex-col lg:flex-row gap-6 relative ">
            {/* GRID */}
            <div className="flex-1">
              <div className="space-y-5">
                {[...new Set(selectedRack.cells.map((c) => c.rowNo))].map(
                  (rowNo) => (
                    <div key={rowNo}>
                      <p className="text-xs font-semibold mb-2 text-gray-400 uppercase">
                        Row {rowNo}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedRack.cells
                          .filter((c) => c.rowNo === rowNo)
                          .map((cell) => {
                            const isSelected = active?.cell.id === cell.id;

                            return (
                              <button
                                key={cell.id}
                                onClick={() => selectCell(selectedRack, cell)}
                                className={`w-10 h-9 text-xs font-bold rounded-lg border transition ${
                                  isSelected
                                    ? "bg-indigo-100 border-indigo-500"
                                    : cell.reelCode
                                      ? "bg-red-50 border-red-300 text-red-600"
                                      : "bg-gray-50 border-gray-200 text-gray-400"
                                }`}
                              >
                                C{cell.colNo}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* SIDE PANEL (Updated & Enhanced) */}
            {active && (
              <div className="w-full lg:w-80">
                <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xl lg:shadow-md">
                  <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                    <span className="font-bold text-slate-800 text-base flex items-center gap-2">
                      {mode === "IN" ? (
                        <>
                          <CheckCircle2
                            size={18}
                            className="text-emerald-500"
                          />{" "}
                          Store Reel
                        </>
                      ) : (
                        <>
                          <Box size={18} className="text-amber-500" /> Remove
                          Reel
                        </>
                      )}
                    </span>
                    <button
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      onClick={() => setActive(null)}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-2 space-y-3 text-sm mb-3 border border-slate-100">
                    <Info label="Rack Code" value={active.rack.rackCode} />
                    <Info label="Row No." value={active.cell.rowNo} />
                    <Info label="Column No." value={active.cell.colNo} />
                    <div className="pt-2 mt-2 border-t border-slate-200">
                      <Info
                        label="Current Status"
                        value={
                          active.cell.reelCode ? (
                            active.cell.reelCode
                          ) : (
                            <span className="text-emerald-600 font-semibold">
                              Empty
                            </span>
                          )
                        }
                      />
                    </div>
                  </div>

                  {mode === "IN" && (
                    <div className="mb-5">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Scan / Enter Reel Code
                      </label>
                      <input
                        autoFocus
                        className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white"
                        placeholder="e.g. REEL-84729"
                        value={reelId}
                        onChange={(e) => setReelId(e.target.value)}
                      />
                    </div>
                  )}

                  <button
                    onClick={submit}
                    disabled={loading || (mode === "IN" && !reelId.trim())}
                    className={`w-full py-2.5 text-sm font-semibold text-white rounded-lg transition-all shadow-sm ${
                      mode === "IN"
                        ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
                        : "bg-red-500 hover:bg-red-600 disabled:bg-red-300"
                    }`}
                  >
                    {loading
                      ? "Processing..."
                      : mode === "IN"
                        ? "Confirm Storage"
                        : "Confirm Removal"}
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

/* COMPONENTS */

const StatCard = ({ title, value, icon, bgColor = "bg-white" }) => (
  <div
    className={`${bgColor} rounded-xl p-4 shadow-sm border flex items-center gap-3`}
  >
    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
      {icon}
    </div>
    <div>
      <p className="text-sm text-black font-semibold">{title}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  </div>
);

const Info = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-gray-400">{label}</span>
    <span className="font-medium text-gray-700">{value}</span>
  </div>
);
