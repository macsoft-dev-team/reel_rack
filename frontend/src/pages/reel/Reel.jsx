import React, { useEffect, useState } from "react";
import ReusableTable from "../../component/ReusableTable";
import BulkUploadModal from "../../component/BulkUploadModal";
import axiosInstance from "../../api/axiosConfig";
import { toast } from "sonner";
import { Edit, Trash2, XIcon, Search } from "lucide-react";

const API_URL = "/reel";
const INVENTORY_API = "/inventory";

export default function Reel() {
  const [reels, setReels] = useState([]);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const [inwardQty, setInwardQty] = useState("");
  const [alreadyAvailableQty, setAlreadyAvailableQty] = useState(0);

  // Component Search Dropdown State
  const [compSearch, setCompSearch] = useState("");
  const [compSuggestions, setCompSuggestions] = useState([]);

  const [form, setForm] = useState({
    componentid: "",
    lotnumber: "",
    qtyinitial: "",
    qtyremaining: "",
  });

  /* FETCH */
  useEffect(() => {
    fetchReels();
    fetchComponents();
  }, []);

  const fetchReels = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API_URL);
      setReels(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch reels");
    } finally {
      setLoading(false);
    }
  };

  const fetchComponents = async () => {
    try {
      const res = await axiosInstance.get(INVENTORY_API);
      setComponents(res.data || []);
    } catch (error) {
      console.error("Failed to fetch components", error);
    }
  };

  /* OPEN CREATE */
  const openCreate = () => {
    setEditData(null);
    setCompSearch("");
    setCompSuggestions([]);
    setInwardQty("");
    setAlreadyAvailableQty(0);
    setForm({
      componentid: "",
      lotnumber: "",
      qtyinitial: "",
      qtyremaining: "",
    });
    setIsModalOpen(true);
  };

  /* OPEN EDIT */
  const openEdit = (row) => {
    setEditData(row);
    setCompSearch(row.componentid || "");
    setCompSuggestions([]);
    setInwardQty(row.qtyremaining || "");

    const matchingComp = components.find(
      (c) => (c.code || c.name || "").toString().toLowerCase() === (row.componentid || "").toString().toLowerCase()
    );
    const avail = matchingComp ? (typeof matchingComp.quantity === "number" ? matchingComp.quantity : 0) : 0;
    setAlreadyAvailableQty(avail);

    setForm({
      componentid: row.componentid,
      lotnumber: row.lotnumber,
      qtyinitial: row.qtyinitial,
      qtyremaining: row.qtyremaining,
    });
    setIsModalOpen(true);
  };

  /* HANDLE COMPONENT SEARCH & SELECTION */
  const handleCompSearch = (val) => {
    setCompSearch(val);
    setForm((prev) => ({ ...prev, componentid: val }));
    if (!val.trim()) {
      setCompSuggestions([]);
      setAlreadyAvailableQty(0);
      return;
    }
    const matches = components.filter(
      (c) =>
        (c.code && c.code.toLowerCase().includes(val.toLowerCase())) ||
        (c.name && c.name.toLowerCase().includes(val.toLowerCase()))
    );
    setCompSuggestions(matches);
  };

  const selectComponent = (c) => {
    const code = c.code || c.name || "";
    setCompSearch(code);
    setCompSuggestions([]);

    const avail = typeof c.quantity === "number" ? c.quantity : 0;
    setAlreadyAvailableQty(avail);

    const inward = Number(inwardQty) || 0;
    setForm((prev) => ({
      ...prev,
      componentid: code,
      qtyinitial: avail + inward,
      qtyremaining: inward,
    }));
  };

  /* HANDLE INWARD QTY CHANGE */
  const handleInwardQtyChange = (val) => {
    setInwardQty(val);
    const inward = Number(val) || 0;
    const avail = Number(alreadyAvailableQty) || 0;
    setForm((prev) => ({
      ...prev,
      qtyinitial: avail + inward,
      qtyremaining: inward,
    }));
  };

  /* HANDLE CHANGE FOR OTHER FIELDS */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* SUBMIT */
  const handleSubmit = async () => {
    if (!form.componentid) {
      toast.error("Please select or specify a Component ID");
      return;
    }
    try {
      const user = sessionStorage.getItem("user");
      let performedByUserId;
      try {
        performedByUserId = user ? JSON.parse(user).id : undefined;
      } catch (e) { }
      const payload = {
        ...form,
        qtyinitial: Number(form.qtyinitial) || 0,
        qtyremaining: Number(form.qtyremaining) || 0,
        performedByUserId,
      };

      if (editData) {
        await axiosInstance.put(`${API_URL}/${editData.id}`, payload);
        toast.success("Reel updated successfully");
      } else {
        await axiosInstance.post(API_URL, payload);
        toast.success("Reel created successfully");
      }

      fetchReels();
      setIsModalOpen(false);
    } catch (error) {
      toast.error(editData ? "Failed to update reel" : "Failed to create reel");
    }
  };

  /* DELETE */
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this reel?",
    );
    if (!confirmed) return;

    try {
      const user = sessionStorage.getItem("user");
      let performedByUserId;
      try {
        performedByUserId = user ? JSON.parse(user).id : undefined;
      } catch (e) { }
      await axiosInstance.delete(`${API_URL}/${id}`, {
        params: { performedByUserId },
      });
      toast.success("Reel deleted successfully");
      fetchReels();
    } catch (error) {
      toast.error("Failed to delete reel");
    }
  };

  /* TABLE COLUMNS */
  const columns = [
    { key: "componentid", label: "Component ID", align: "left" },
    { key: "lotnumber", label: "Lot Number", align: "left" },
    { key: "qtyinitial", label: "Initial Qty", align: "left" },
    { key: "qtyremaining", label: "Remaining Qty", align: "left" },
    {
      key: "reelstatus",
      label: "Status",
      align: "left",
      render: (row) => (
        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          {row.reelstatus || "UNKNOWN"}
        </span>
      ),
    },
  ];

  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const handleBulkUploadSubmit = async (rows, onProgress) => {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      await axiosInstance.post("/reel", {
        componentid: Number(row.componentid || row["Component ID"] || 1),
        lotnumber: String(row.lotnumber || row["Lot Number"] || ""),
        qtyinitial: Number(row.qtyinitial || row["Qty Initial"] || 0),
        qtyremaining: Number(row.qtyremaining || row["Qty Remaining"] || 0),
        reelstatus: row.reelstatus || row["Status"] || "OPEN",
      });
      if (onProgress) onProgress(i + 1, rows.length);
    }
    fetchReels();
  };

  return (
    <div className="w-full">
      <ReusableTable
        columns={columns}
        data={reels}
        loading={loading}
        onAdd={openCreate}
        addLabel="Add Reel"
        onBulkUpload={() => setShowBulkUpload(true)}
        bulkUploadLabel="Bulk Upload "
        onEdit={openEdit}
        onDelete={(row) => handleDelete(row.id)}
        actionIcon={
          <Edit className="w-4 h-4 text-blue-600 hover:text-blue-800 transition-colors" />
        }
        deleteIcon={
          <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700 transition-colors" />
        }
        pageSize={5}
      />

      {/* BULK UPLOAD MODAL */}
      <BulkUploadModal
        visible={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        title="Reels"
        sampleRows={[
          {
            componentid: 1,
            lotnumber: "LOT-2026-001",
            qtyinitial: 5000,
            qtyremaining: 5000,
            reelstatus: "OPEN",
          },
        ]}
        onUploadSubmit={handleBulkUploadSubmit}
      />

      {/* RESPONSIVE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg sm:max-w-xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-visible">
            {/* Modal Header */}
            <div className="px-5 py-4 sm:px-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-800">
                {editData ? "Update Reel" : "Create New Reel"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <XIcon size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <div className="p-5 sm:p-6 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Searchable / Selectable Component Dropdown */}
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Select Component <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search component code/name..."
                      value={compSearch}
                      onChange={(e) => handleCompSearch(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white"
                    />
                    <Search className="absolute right-3 top-2.5 text-slate-400" size={16} />
                  </div>

                  {compSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                      {compSuggestions.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => selectComponent(c)}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-xs border-b border-slate-100 last:border-0"
                        >
                          <div className="font-semibold text-slate-800">{c.code} - {c.name}</div>
                          <div className="text-slate-500">Available Qty: {c.quantity || 0}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Lot Number */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Lot Number
                  </label>
                  <input
                    type="text"
                    name="lotnumber"
                    placeholder="e.g. LOT-2023-A"
                    value={form.lotnumber}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white"
                  />
                </div>

                {/* Inward Qty Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Inward Qty
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1000"
                    value={inwardQty}
                    onChange={(e) => handleInwardQtyChange(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white font-medium"
                  />
                  {alreadyAvailableQty > 0 && (
                    <p className="text-[11px] text-blue-600 font-semibold mt-1">
                      Already Available: {alreadyAvailableQty}
                    </p>
                  )}
                </div>

                {/* Initial Qty (Auto calculated: Available + Inward) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Initial Quantity <span className="text-xs text-slate-400 font-normal">(Avail + Inward)</span>
                  </label>
                  <input
                    type="number"
                    name="qtyinitial"
                    placeholder="0"
                    value={form.qtyinitial}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-slate-50 font-semibold text-slate-800"
                  />
                </div>

                {/* Remaining Qty (Replaced with Inward Qty) */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Remaining Quantity <span className="text-xs text-slate-400 font-normal">(Replaced with Inward Qty)</span>
                  </label>
                  <input
                    type="number"
                    name="qtyremaining"
                    placeholder="0"
                    value={form.qtyremaining}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-slate-50 font-semibold text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer / Actions */}
            <div className="px-5 py-4 sm:px-6 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editData ? "Save Changes" : "Create Reel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
