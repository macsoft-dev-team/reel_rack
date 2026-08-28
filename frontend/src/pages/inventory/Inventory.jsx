import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosConfig";
import TitleHead from "../../component/layout/TitleHead";
import ReusableTable from "../../component/ReusableTable";
import {
  Edit,
  Trash2,
  XIcon,
  Package,
  AlertTriangle,
  XCircle,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

const API = "/inventory";

const InventoryPage = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    code: "",
    name: "",
    quantity: "",
    minStock: "",
    location: "",
  });

  /* FETCH INVENTORY */
  const fetchInventory = async () => {
    try {
      const res = await axiosInstance.get(API);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Inventory fetch failed:", error);
      toast.error("Failed to load inventory");
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  /* STATS */
  const totalItems = items.length;
  const inStock = items.filter((i) => i.quantity > i.minStock).length;
  const lowStock = items.filter(
    (i) => i.quantity <= i.minStock && i.quantity > 0,
  ).length;
  const outOfStock = items.filter((i) => i.quantity === 0).length;

  /* FILTER */
  const filteredItems = items.filter(
    (i) =>
      i.name?.toLowerCase().includes(search.toLowerCase()) ||
      i.code?.toLowerCase().includes(search.toLowerCase()),
  );

  /* HANDLERS */
  const openAdd = () => {
    setForm({
      code: "",
      name: "",
      quantity: "",
      minStock: "",
      location: "",
    });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setForm(item);
    setShowModal(true);
  };

  const saveItem = async () => {
    if (!form.name || !form.code) {
      toast.error("Code and Name are required");
      return;
    }

    try {
      if (form.id) {
        await axiosInstance.put(`${API}/${form.id}`, form);
        toast.success("Inventory updated successfully");
      } else {
        await axiosInstance.post(API, form);
        toast.success("Inventory created successfully");
      }
      setShowModal(false);
      fetchInventory();
    } catch (error) {
      console.error("Save failed", error);
      toast.error("Failed to save inventory item");
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await axiosInstance.delete(`${API}/${id}`);
      toast.success("Inventory deleted successfully");
      fetchInventory();
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Failed to delete inventory item");
    }
  };

  /* TABLE COLUMNS */
  const columns = [
    { key: "code", label: "Code" },
    { key: "name", label: "Name" },
    { key: "location", label: "Location" },
    {
      key: "quantity",
      label: "Qty",
      render: (row) => (
        <span className="font-semibold text-slate-700">{row.quantity}</span>
      ),
    },
    { key: "minStock", label: "Min Stock" },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        if (row.quantity === 0) {
          return (
            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700 border border-red-200">
              Out of Stock
            </span>
          );
        }
        if (row.quantity <= row.minStock) {
          return (
            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
              Low Stock
            </span>
          );
        }
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
            In Stock
          </span>
        );
      },
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <TitleHead
          title="Inventory "
          showSearch={true}
          onAdd={openAdd}
          onSearch={(value) => setSearch(value)}
        />

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <StatCard
            title="Total Items"
            value={totalItems}
            icon={<Layers size={20} className="text-blue-600" />}
            iconBg="bg-blue-100"
          />
          <StatCard
            title="In Stock"
            value={inStock}
            icon={<Package size={20} className="text-emerald-600" />}
            iconBg="bg-emerald-100"
          />
          <StatCard
            title="Low Stock"
            value={lowStock}
            icon={<AlertTriangle size={20} className="text-amber-600" />}
            iconBg="bg-amber-100"
          />
          <StatCard
            title="Out of Stock"
            value={outOfStock}
            icon={<XCircle size={20} className="text-red-600" />}
            iconBg="bg-red-100"
          />
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mt-6">
          <div className="overflow-x-auto">
            <ReusableTable
              columns={columns}
              data={filteredItems}
              onEdit={openEdit}
              onDelete={(row) => deleteItem(row.id)}
              actionIcon={
                <Edit className="w-4 h-4 text-blue-600 hover:text-blue-800 transition-colors" />
              }
              deleteIcon={
                <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700 transition-colors" />
              }
            />
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 sm:px-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-800">
                {form.id ? "Edit Inventory Item" : "Add New Item"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <XIcon size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <div className="p-5 sm:p-6 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <Input
                  label="Item Code"
                  placeholder="e.g. IC-7400"
                  value={form.code}
                  onChange={(v) => setForm({ ...form, code: v })}
                />
                <Input
                  label="Item Name"
                  placeholder="e.g. Quad 2-Input NAND Gate"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                />
                <Input
                  label="Current Quantity"
                  type="number"
                  placeholder="0"
                  value={form.quantity}
                  onChange={(v) => setForm({ ...form, quantity: Number(v) })}
                />
                <Input
                  label="Minimum Stock Alert"
                  type="number"
                  placeholder="0"
                  value={form.minStock}
                  onChange={(v) => setForm({ ...form, minStock: Number(v) })}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Storage Location"
                    placeholder="e.g. Shelf A2, Bin 3"
                    value={form.location}
                    onChange={(v) => setForm({ ...form, location: v })}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer / Actions */}
            <div className="px-5 py-4 sm:px-6 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveItem}
                className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {form.id ? "Save Changes" : "Create Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* REUSABLE STAT CARD */
const StatCard = ({ title, value, icon, iconBg }) => (
  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}
    >
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium mb-0.5">{title}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

/* REUSABLE INPUT FIELD */
const Input = ({ label, value, onChange, type = "text", placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">
      {label}
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

export default InventoryPage;
