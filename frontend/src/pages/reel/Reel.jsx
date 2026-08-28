import React, { useEffect, useState } from "react";
import ReusableTable from "../../component/ReusableTable";
import BulkUploadModal from "../../component/BulkUploadModal";
import axiosInstance from "../../api/axiosConfig";
import { toast } from "sonner";
import { Edit, Trash2, XIcon } from "lucide-react";

const API_URL = "/reel";

export default function Reel() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const [form, setForm] = useState({
    componentid: "",
    lotnumber: "",
    qtyinitial: "",
    qtyremaining: "",
  });

  /* FETCH */
  useEffect(() => {
    fetchReels();
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

  /* OPEN CREATE */
  const openCreate = () => {
    setEditData(null);
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
    setForm({
      componentid: row.componentid,
      lotnumber: row.lotnumber,
      qtyinitial: row.qtyinitial,
      qtyremaining: row.qtyremaining,
    });
    setIsModalOpen(true);
  };

  /* HANDLE CHANGE */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* SUBMIT */
  const handleSubmit = async () => {
    try {
      const user = sessionStorage.getItem("user");
      let performedByUserId;
      try {
        performedByUserId = user ? JSON.parse(user).id : undefined;
      } catch (e) { }
      const payload = {
        ...form,
        qtyinitial: Number(form.qtyinitial),
        qtyremaining: Number(form.qtyremaining),
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
    { key: "componentid", label: "Component ID" },
    { key: "lotnumber", label: "Lot Number" },
    { key: "qtyinitial", label: "Initial Qty" },
    { key: "qtyremaining", label: "Remaining Qty" },
    {
      key: "reelstatus",
      label: "Status",
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
          <div className="bg-white w-full max-w-lg sm:max-w-xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
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
                {/* Component ID */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Component ID
                  </label>
                  <input
                    type="text"
                    name="componentid"
                    placeholder="e.g. COMP-101"
                    value={form.componentid}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white"
                  />
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

                {/* Initial Qty */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Initial Quantity
                  </label>
                  <input
                    type="number"
                    name="qtyinitial"
                    placeholder="0"
                    value={form.qtyinitial}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white"
                  />
                </div>

                {/* Remaining Qty */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Remaining Quantity
                  </label>
                  <input
                    type="number"
                    name="qtyremaining"
                    placeholder="0"
                    value={form.qtyremaining}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white"
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
