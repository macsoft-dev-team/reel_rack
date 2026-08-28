import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosConfig";
import ReusableTable from "../../component/ReusableTable";
import BulkUploadModal from "../../component/BulkUploadModal";
import { Edit, Trash2, XIcon } from "lucide-react";
import { toast } from "sonner";

const API = "/manufacturer";

const ManufacturerPage = () => {
  const [manufacturers, setManufacturers] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    country: "",
    phone: "",
    email: "",
  });

  /* FETCH */
  const fetchManufacturers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API);
      setManufacturers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Fetch failed:", error);
      toast.error("Failed to fetch manufacturers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManufacturers();
  }, []);

  /* FILTER */
  const filteredManufacturers = manufacturers.filter(
    (m) =>
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.country?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()),
  );

  /* HANDLERS */
  const openAdd = () => {
    setForm({
      name: "",
      country: "",
      phone: "",
      email: "",
    });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setForm(item);
    setShowModal(true);
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const saveManufacturer = async () => {
    if (!form.name) {
      toast.error("Name is required");
      return;
    }

    if (form.email && !isValidEmail(form.email)) {
      toast.error("Enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      // include performedByUserId if available
      const user = localStorage.getItem("user");
      let performedByUserId;
      try {
        performedByUserId = user ? JSON.parse(user).id : undefined;
      } catch (e) { }
      const payload = { ...form, performedByUserId };

      if (form.id) {
        await axiosInstance.put(`${API}/${form.id}`, payload);
        toast.success("Manufacturer updated successfully");
      } else {
        await axiosInstance.post(API, payload);
        toast.success("Manufacturer created successfully");
      }

      setShowModal(false);
      fetchManufacturers();
    } catch (error) {
      console.error("Save failed:", error);
      toast.error(
        error.response?.data?.message || "Failed to save manufacturer",
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteManufacturer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this manufacturer?"))
      return;

    try {
      setLoading(true);
      const user = localStorage.getItem("user");
      let performedByUserId;
      try {
        performedByUserId = user ? JSON.parse(user).id : undefined;
      } catch (e) { }
      await axiosInstance.delete(`${API}/${id}`, {
        params: { performedByUserId },
      });
      toast.success("Manufacturer deleted successfully");
      fetchManufacturers();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete manufacturer",
      );
    } finally {
      setLoading(false);
    }
  };

  /* TABLE COLUMNS */
  const columns = [
    {
      key: "name",
      label: "Name",
      render: (row) => (
        <span className="font-medium text-slate-800">{row.name}</span>
      ),
    },
    { key: "country", label: "Country" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
  ];

  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const handleBulkUploadSubmit = async (rows, onProgress) => {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      await axiosInstance.post("/manufacturer", {
        name: String(row.name || row["Name"] || ""),
        country: String(row.country || row["Country"] || ""),
        phone: String(row.phone || row["Phone"] || ""),
        email: String(row.email || row["Email"] || ""),
      });
      if (onProgress) onProgress(i + 1, rows.length);
    }
    fetchManufacturers();
  };

  return (
    <div className="w-full">
      <ReusableTable
        columns={columns}
        data={filteredManufacturers}
        onSearch={(value) => setSearch(value)}
        searchPlaceholder="Search manufacturers..."
        onAdd={openAdd}
        addLabel="Add Manufacturer"
        onBulkUpload={() => setShowBulkUpload(true)}
        bulkUploadLabel="Bulk Upload "
        onEdit={openEdit}
        onDelete={(row) => deleteManufacturer(row.id)}
        actionIcon={
          <Edit className="w-4 h-4 text-blue-600 hover:text-blue-800 transition-colors" />
        }
        deleteIcon={
          <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700 transition-colors" />
        }
      />

      {/* BULK UPLOAD MODAL */}
      <BulkUploadModal
        visible={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        title="Manufacturers"
        sampleRows={[
          {
            name: "Texas Instruments",
            country: "USA",
            phone: "+1-800-123-4567",
            email: "contact@ti.com",
          },
        ]}
        onUploadSubmit={handleBulkUploadSubmit}
      />

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 sm:px-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-800">
                {form.id ? "Edit Manufacturer" : "Add New Manufacturer"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <XIcon size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              <Input
                label="Company Name"
                placeholder="e.g. Acme Corp"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
                required
              />

              <Input
                label="Country"
                placeholder="e.g. United States"
                value={form.country}
                onChange={(v) => setForm({ ...form, country: v })}
              />

              <Input
                label="Phone Number"
                placeholder="e.g. +1 (555) 012-3456"
                type="tel"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
              />

              <Input
                label="Email Address"
                placeholder="e.g. contact@acmecorp.com"
                type="email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
              />
            </div>

            {/* Modal Footer / Actions */}
            <div className="px-5 py-4 sm:px-6 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={saveManufacturer}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
              >
                {loading
                  ? "Saving..."
                  : form.id
                    ? "Save Changes"
                    : "Create Manufacturer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* REUSABLE INPUT COMPONENT */
const Input = ({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white"
    />
  </div>
);

export default ManufacturerPage;
