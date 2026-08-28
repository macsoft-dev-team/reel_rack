import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  X,
  Package,
  PackageOpen,
  LayoutGrid,
  CheckCircle2,
  Box,
  Layers,
  ArrowRight,
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
  Search,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import BulkUploadModal from "../../component/BulkUploadModal";

const API = "http://localhost:3000/api";

export default function Racks() {
  const [racks, setRacks] = useState([]);
  const [active, setActive] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [reelId, setReelId] = useState("");
  const [mode, setMode] = useState(null);
  const [selectedRackId, setSelectedRackId] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  /* BULK UPLOAD MODAL STATE */
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  /* RACK MODAL STATES (CREATE / EDIT) */
  const [showRackModal, setShowRackModal] = useState(false);
  const [isEditRack, setIsEditRack] = useState(false);
  const [rackForm, setRackForm] = useState({ rackCode: "", rows: 5, cols: 30 });
  const [rackSubmitting, setRackSubmitting] = useState(false);

  /* DELETE RACK MODAL STATE */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  /* LOAD RACKS */
  const loadRacks = async (selectIdAfterLoad = null) => {
    try {
      const res = await axios.get(`${API}/rack`);
      setRacks(res.data);
      if (selectIdAfterLoad) {
        setSelectedRackId(selectIdAfterLoad.toString());
      } else if (res.data.length > 0 && !selectedRackId) {
        setSelectedRackId(res.data[0].id.toString());
      }
    } catch (err) {
      console.error("Failed to load racks", err);
    }
  };

  useEffect(() => {
    loadRacks();
  }, []);

  useEffect(() => {
    if (racks.length > 0) {
      const exists = racks.some((r) => r.id === Number(selectedRackId));
      if (!exists) {
        setSelectedRackId(racks[0].id.toString());
      }
    } else {
      setSelectedRackId("");
    }
  }, [racks]);

  const selectedRack = racks.find((r) => r.id === Number(selectedRackId));

  const occupied = selectedRack?.cells?.filter((c) => c.reelCode).length ?? 0;
  const total = selectedRack?.cells?.length ?? 0;
  const free = total - occupied;
  const occupancyPct = total > 0 ? Math.round((occupied / total) * 100) : 0;

  /* ROW NUMBERS */
  const rowNumbers = selectedRack?.cells?.length
    ? [...new Set(selectedRack.cells.map((c) => c.rowNo))].sort((a, b) => a - b)
    : [];

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

  /* OPEN CREATE RACK MODAL */
  const openCreateRack = () => {
    setIsEditRack(false);
    const nextNum = racks.length + 1;
    setRackForm({ rackCode: `RACK-0${nextNum}`, rows: 5, cols: 30 });
    setShowRackModal(true);
  };

  /* OPEN EDIT RACK MODAL */
  const openEditRack = () => {
    if (!selectedRack) return;
    setIsEditRack(true);
    const rows = selectedRack.cells.length
      ? Math.max(...selectedRack.cells.map((c) => c.rowNo))
      : 5;
    const cols = selectedRack.cells.length
      ? Math.max(...selectedRack.cells.map((c) => c.colNo))
      : 30;

    setRackForm({
      rackCode: selectedRack.rackCode,
      rows: rows,
      cols: cols,
    });
    setShowRackModal(true);
  };

  /* SAVE RACK (CREATE OR UPDATE) */
  const handleSaveRack = async (e) => {
    e.preventDefault();
    if (!rackForm.rackCode.trim()) {
      toast.error("Please enter a valid Rack Code");
      return;
    }

    setRackSubmitting(true);
    try {
      if (isEditRack) {
        const res = await axios.put(`${API}/rack/${selectedRack.id}`, rackForm);
        toast.success(`Rack ${res.data.rackCode} updated successfully!`);
        await loadRacks(res.data.id);
      } else {
        const res = await axios.post(`${API}/rack`, rackForm);
        toast.success(`Rack ${res.data.rackCode} created successfully!`);
        await loadRacks(res.data.id);
      }
      setShowRackModal(false);
    } catch (err) {
      console.error("Save rack error:", err);
      const msg = typeof err.response?.data?.error === "string" 
        ? err.response.data.error 
        : typeof err.response?.data?.message === "string"
        ? err.response.data.message
        : err.message || "Failed to save rack";
      toast.error(msg);
    } finally {
      setRackSubmitting(false);
    }
  };

  /* DELETE RACK */
  const handleDeleteRack = async () => {
    if (!selectedRack) return;
    setDeleteSubmitting(true);
    try {
      await axios.delete(`${API}/rack/${selectedRack.id}`);
      toast.success(`Rack ${selectedRack.rackCode} deleted successfully`);
      setShowDeleteModal(false);
      setActive(null);
      await loadRacks();
    } catch (err) {
      console.error("Delete rack error:", err);
      const msg = typeof err.response?.data?.error === "string" 
        ? err.response.data.error 
        : typeof err.response?.data?.message === "string"
        ? err.response.data.message
        : err.message || "Failed to delete rack";
      toast.error(msg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  /* BULK UPLOAD RACKS SUBMIT */
  const handleBulkUploadSubmit = async (rowsData, onProgress) => {
    let createdCount = 0;
    for (let i = 0; i < rowsData.length; i++) {
      const row = rowsData[i];
      const rackCode = (row.rackCode || row.RackCode || row["Rack Code"] || "").toString().trim();
      const rows = parseInt(row.rows || row.Rows || row.ROW || 5);
      const cols = parseInt(row.cols || row.Cols || row.Columns || row.COL || 15);

      if (rackCode) {
        await axios.post(`${API}/rack`, {
          rackCode,
          rows: Math.max(1, rows),
          cols: Math.max(1, cols),
        });
        createdCount++;
      }
      onProgress(i + 1, rowsData.length);
    }
    await loadRacks();
  };

  /* EXPORT CURRENT RACK LAYOUT REPORT */
  const exportRackCSV = () => {
    if (!selectedRack) return;
    const exportRows = selectedRack.cells.map((c) => ({
      "Rack Code": selectedRack.rackCode,
      "Row No": c.rowNo,
      "Column No": c.colNo,
      "Cell Code": `R${c.rowNo}-C${c.colNo}`,
      "Status": c.reelCode ? "Occupied" : "Available",
      "Reel Code": c.reelCode || "",
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rack Layout");
    XLSX.writeFile(wb, `${selectedRack.rackCode}_Layout.xlsx`);
    toast.success(`Exported ${selectedRack.rackCode} layout report!`);
  };

  return (
    <div className="w-full space-y-4 font-sans text-slate-800">
      {/* SEGMENTED RACK TABS & RACK MANAGEMENT ACTIONS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto p-1 bg-slate-100/90 rounded-xl flex-1 border border-slate-200/60">
          {racks.map((rack) => {
            const isActive = selectedRackId === rack.id.toString();
            return (
              <button
                key={rack.id}
                onClick={() => {
                  setSelectedRackId(rack.id.toString());
                  setActive(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs scale-[1.02]"
                    : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/70"
                }`}
              >
                <Layers size={14} className={isActive ? "text-white" : "text-blue-600"} />
                <span>{rack.rackCode}</span>
              </button>
            );
          })}
          {racks.length === 0 && (
            <span className="text-xs text-slate-400 font-medium px-3 py-1">
              No racks found. Create your first rack!
            </span>
          )}
        </div>

        {/* ACTIONS (BULK UPLOAD, EXPORT, CREATE, EDIT, DELETE) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* BULK UPLOAD BUTTON */}
          <button
            onClick={() => setShowBulkUpload(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl transition cursor-pointer active:scale-95 shadow-2xs"
          >
            <FileSpreadsheet size={15} className="text-emerald-600" />
            <span>Bulk Upload</span>
          </button>

          {selectedRack && (
            <>
              {/* EXPORT LAYOUT BUTTON */}
              <button
                onClick={exportRackCSV}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition cursor-pointer active:scale-95 shadow-2xs"
              >
                <Download size={14} className="text-slate-600" />
                <span>Export Report</span>
              </button>

              {/* EDIT RACK BUTTON */}
              <button
                onClick={openEditRack}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition cursor-pointer active:scale-95 shadow-2xs"
              >
                <Edit size={14} className="text-blue-600" />
                <span>Edit</span>
              </button>

              {/* DELETE RACK BUTTON */}
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-xl transition cursor-pointer active:scale-95 shadow-2xs"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </>
          )}

          {/* CREATE NEW RACK BUTTON */}
          <button
            onClick={openCreateRack}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            <Plus size={15} />
            <span>Create New Rack</span>
          </button>
        </div>
      </div>

      {selectedRack ? (
        <div className="space-y-4">
          {/* INTEGRATED SEARCH & RACK UTILIZATION TOOLBAR */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input Bar */}
            <div className="relative flex-1">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search Part Number / Location (e.g., 0402 10k or R1-C5)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
              <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Rack Utilization Bar Readout */}
            <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200/80 min-w-[280px]">
              <div className="flex-1">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                  <span>Rack Utilization</span>
                  <span className="text-blue-600">{occupied}/{total} Cells Used - {occupancyPct}%</span>
                </div>
                <div className="h-2 bg-slate-200/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${occupancyPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* MAIN MATRIX GRID CONTAINER & SIDE INSPECTION PANEL */}
          <div className="flex flex-col lg:flex-row gap-4 items-start">
            {/* HIGH-TECH RACK MATRIX GRID (15 CELLS PER LINE WITH FIXED CELL SIZE) */}
            <div className="flex-1 w-full bg-[#F3F6F9] border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs overflow-x-auto">
              <div className="space-y-4 min-w-[840px]">
                {rowNumbers.map((rowNo) => (
                  <div key={rowNo} className="bg-white/80 p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
                    {/* Row Header Label */}
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="bg-slate-900 text-white text-xs font-extrabold px-2.5 py-0.5 rounded-md shadow-2xs tracking-wider">
                        R{rowNo}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        Row {rowNo} Storage Cells
                      </span>
                      <span className="flex-1 h-px bg-slate-200/80 ml-2" />
                    </div>

                    {/* Cells in Row (Wrap naturally at 15 items per line with FIXED cell size) */}
                    <div className="flex flex-wrap gap-2 max-w-[850px]">
                      {selectedRack.cells
                        .filter((c) => c.rowNo === rowNo)
                        .sort((a, b) => a.colNo - b.colNo)
                        .map((cell) => {
                          const isSelected = active?.cell.id === cell.id;
                          const isOccupied = !!cell.reelCode;

                          // Check search filter match
                          const matchesFilter =
                            searchFilter.trim() === "" ||
                            cell.reelCode?.toLowerCase().includes(searchFilter.toLowerCase()) ||
                            `R${cell.rowNo}-C${cell.colNo}`.toLowerCase().includes(searchFilter.toLowerCase());

                          /* CELL STYLING WITH FIXED WIDTH (48px) AND HEIGHT (44px) */
                          let cellBg = isOccupied
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-xs"
                            : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-2xs";

                          let ledColor = isOccupied
                            ? "bg-emerald-300 shadow-[0_0_6px_#86efac]"
                            : "bg-slate-300/80";

                          if (isSelected) {
                            cellBg = "bg-blue-600 text-white border-blue-700 ring-4 ring-blue-400/40 scale-105 shadow-md z-10";
                            ledColor = "bg-cyan-300 shadow-[0_0_8px_#67e8f9]";
                          }

                          if (!matchesFilter && searchFilter.trim() !== "") {
                            cellBg = "bg-slate-100/50 text-slate-400 border-slate-200 opacity-30";
                          }

                          return (
                            <div key={cell.id} className="relative group flex-shrink-0">
                              <button
                                onClick={() => selectCell(selectedRack, cell)}
                                onMouseEnter={() => setHoveredCell(cell)}
                                onMouseLeave={() => setHoveredCell(null)}
                                className={`
                                  w-[48px] h-[44px] flex-shrink-0 rounded-xl border flex flex-col justify-between p-1.5 transition-all duration-150 cursor-pointer relative ${cellBg}
                                `}
                              >
                                {/* MICRO-LED STATUS INDICATOR */}
                                <span className={`w-2.5 h-1 rounded-xs transition-all ${ledColor}`} />

                                {/* CELL LABEL / REEL CODE */}
                                <span className="text-[11px] font-extrabold text-center leading-tight truncate px-0.5">
                                  {isOccupied ? cell.reelCode : `C${cell.colNo}`}
                                </span>
                              </button>

                              {/* HOVER TOOLTIP POPOVER */}
                              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-40 w-48 p-3 bg-white border border-slate-200 rounded-xl shadow-2xl text-xs text-slate-800 animate-fade-scale pointer-events-none">
                                <div className="font-extrabold text-slate-900 border-b border-slate-100 pb-1 mb-1.5 flex justify-between">
                                  <span>Slot R{cell.rowNo}-C{cell.colNo}</span>
                                  <span className={isOccupied ? "text-emerald-600 font-bold" : "text-slate-400 font-bold"}>
                                    {isOccupied ? "Occupied" : "Empty"}
                                  </span>
                                </div>
                                <p className="font-medium text-slate-600">
                                  <strong className="text-slate-800">Reel Code:</strong> {cell.reelCode || "N/A"}
                                </p>
                                <p className="font-medium text-slate-600 mt-0.5">
                                  <strong className="text-slate-800">Location:</strong> R{cell.rowNo} Row, C{cell.colNo} Col
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SIDE INSPECTION PANEL */}
            {active && (
              <div className="w-full lg:w-80 flex-shrink-0 animate-fade-scale">
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-lg overflow-hidden">
                  {/* Panel Header */}
                  <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
                    <span className="font-extrabold text-sm flex items-center gap-2">
                      {mode === "IN" ? (
                        <>
                          <CheckCircle2 size={18} className="text-emerald-400" />
                          <span>Store Reel in Cell</span>
                        </>
                      ) : (
                        <>
                          <Box size={18} className="text-amber-400" />
                          <span>Remove Reel from Cell</span>
                        </>
                      )}
                    </span>
                    <button
                      className="p-1 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      onClick={() => setActive(null)}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 text-xs border border-slate-200/80">
                      <Info label="Rack Code" value={active.rack.rackCode} />
                      <Info label="Location" value={`Row R${active.cell.rowNo}, Col C${active.cell.colNo}`} />
                      <div className="pt-2 mt-2 border-t border-slate-200/80">
                        <Info
                          label="Status"
                          value={
                            active.cell.reelCode ? (
                              <span className="font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-200">
                                {active.cell.reelCode}
                              </span>
                            ) : (
                              <span className="font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                                Empty Slot
                              </span>
                            )
                          }
                        />
                      </div>
                    </div>

                    {mode === "IN" && (
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Scan / Enter Reel Code
                        </label>
                        <input
                          autoFocus
                          type="text"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                          placeholder="e.g. REEL-84729"
                          value={reelId}
                          onChange={(e) => setReelId(e.target.value)}
                        />
                      </div>
                    )}

                    <button
                      onClick={submit}
                      disabled={loading || (mode === "IN" && !reelId.trim())}
                      className={`w-full py-2.5 text-xs font-bold text-white rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                        mode === "IN"
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-300 disabled:to-indigo-300"
                          : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:from-red-300 disabled:to-rose-300"
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
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 border border-slate-200/90 text-center flex flex-col items-center justify-center shadow-2xs">
          <Layers size={44} className="text-blue-500 mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">No Storage Rack Selected</h3>
          <p className="text-xs text-slate-500 max-w-sm mb-5">
            Create a new rack layout or select an existing rack from above to view and manage storage cells.
          </p>
          <button
            onClick={openCreateRack}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Create New Rack</span>
          </button>
        </div>
      )}

      {/* BULK UPLOAD MODAL */}
      <BulkUploadModal
        visible={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        title="Bulk Upload Racks"
        sampleHeaders={["rackCode", "rows", "cols"]}
        sampleRows={[
          { rackCode: "RACK-01", rows: 5, cols: 30 },
          { rackCode: "RACK-02", rows: 5, cols: 15 },
          { rackCode: "RACK-03", rows: 10, cols: 20 },
        ]}
        onUploadSubmit={handleBulkUploadSubmit}
      />

      {/* CREATE / EDIT RACK MODAL */}
      {showRackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => !rackSubmitting && setShowRackModal(false)}
          />

          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Layers className="text-blue-600" size={18} />
                <span>{isEditRack ? "Edit Rack Layout" : "Create Storage Rack"}</span>
              </h2>
              <button
                disabled={rackSubmitting}
                onClick={() => setShowRackModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRack} className="space-y-4">
              {/* Rack Code */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Rack Code / Identifier
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RACK-A or RACK-01"
                  value={rackForm.rackCode}
                  onChange={(e) => setRackForm({ ...rackForm, rackCode: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                />
              </div>

              {/* Rows & Columns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Total Rows (R1, R2...)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={rackForm.rows}
                    onChange={(e) => setRackForm({ ...rackForm, rows: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Total Columns (C1, C2...)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    required
                    value={rackForm.cols}
                    onChange={(e) => setRackForm({ ...rackForm, cols: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-3 text-xs text-slate-600 flex items-start gap-2">
                <LayoutGrid size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  This will generate a matrix of{" "}
                  <strong className="text-slate-900">
                    {(parseInt(rackForm.rows) || 0) * (parseInt(rackForm.cols) || 0)} storage cells
                  </strong>{" "}
                  ({rackForm.rows || 0} rows × {rackForm.cols || 0} columns).
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={rackSubmitting}
                  onClick={() => setShowRackModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rackSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                >
                  {rackSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    isEditRack ? "Update Rack Layout" : "Generate Rack"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && selectedRack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => !deleteSubmitting && setShowDeleteModal(false)}
          />

          <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Rack</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedRack.rackCode}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900">{selectedRack.rackCode}</strong>?
              This will permanently remove all {selectedRack.cells.length} cells in this rack layout.
            </p>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                disabled={deleteSubmitting}
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteSubmitting}
                onClick={handleDeleteRack}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                {deleteSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  "Delete Rack"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className="font-bold text-slate-800">{value}</span>
    </div>
  );
}
