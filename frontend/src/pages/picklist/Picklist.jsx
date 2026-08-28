import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosConfig";
import ReusableTable from "../../component/ReusableTable";
import { Trash2, X, Eye, Edit, Plus, Search, AlertCircle, Sparkles, CheckCircle2, PackageCheck } from "lucide-react";
import { toast } from "sonner";

/* CONFIG */
const API_URL = "/picklist";
const USER_API = "/user";
const INVENTORY_API = "/inventory";

const statusBadge = (status) => {
  if (status === "COMPLETED")
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (status === "IN_PROGRESS")
    return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
};

export default function Picklist() {
  // ROLE-BASED ACCESS CONTROL
  const storedUserRaw = sessionStorage.getItem("user");
  let currentUser = {};
  try {
    currentUser = storedUserRaw ? JSON.parse(storedUserRaw) : {};
  } catch (err) {
    console.error("User parse error:", err);
  }

  const userRole = (currentUser.role || "").toUpperCase().replace(/_/g, "");
  const isSuperAdmin = userRole === "SUPERADMIN";
  const isAdmin = userRole === "ADMIN";
  const isOperator = userRole === "OPERATOR";

  const canCreate = isSuperAdmin || isAdmin || isOperator;
  const canEdit = isSuperAdmin || isAdmin || isOperator;
  const canDelete = isSuperAdmin || isAdmin;

  const [picklists, setPicklists] = useState([]);
  const [operators, setOperators] = useState([]);
  const [components, setComponents] = useState([]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [activePick, setActivePick] = useState(null);

  const [formData, setFormData] = useState({ name: "", operator: "" });
  const [items, setItems] = useState([]);
  const [editItems, setEditItems] = useState([]);

  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);

  /* FETCH DATA  */
  const fetchPicklists = async () => {
    try {
      const res = await axiosInstance.get(API_URL);
      setPicklists(res.data || []);
    } catch (err) {
      console.error("Error fetching picklists:", err);
      toast.error("Failed to fetch picklists");
    }
  };

  const fetchOperators = async () => {
    try {
      const res = await axiosInstance.get(USER_API);
      setOperators(res.data || []);
    } catch (err) {
      console.error("Error fetching operators:", err);
      toast.error("Failed to fetch operators");
    }
  };

  const fetchComponents = async () => {
    try {
      const res = await axiosInstance.get(INVENTORY_API);
      setComponents(res.data || []);
    } catch (err) {
      console.error("Error fetching components:", err);
      toast.error("Failed to fetch components");
    }
  };

  useEffect(() => {
    fetchPicklists();
    fetchOperators();
    fetchComponents();
  }, []);

  /* CREATE  */
  const openCreate = () => {
    setFormData({ name: "", operator: "" });
    setItems([]);
    setSearch("");
    setSuggestions([]);
    setIsCreateOpen(true);
  };

  const saveCreate = async () => {
    if (!formData.name || !formData.operator) {
      toast.error("Please fill in all required fields (Name and Operator)");
      return;
    }
    if (!items.length) {
      toast.error("Please add at least one component to the picklist");
      return;
    }

    try {
      const user = sessionStorage.getItem("user");
      let performedByUserId;
      try {
        performedByUserId = user ? JSON.parse(user).id : undefined;
      } catch (e) {}
      const payload = {
        code: `PL-${Date.now()}`,
        name: formData.name,
        operator: formData.operator,
        items: items.map((i) => ({
          componentId: i.id,
          componentCode: i.code,
          componentName: i.name,
          availableQty: i.availableQty,
          usedQty: 0,
          location: i.location,
        })),
        performedByUserId,
      };

      const response = await axiosInstance.post(API_URL, payload);

      if (response && response.data) {
        toast.success("Picklist created successfully");
        closeAll();
        await fetchPicklists();
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to create picklist";
      toast.error(errorMsg);
    }
  };

  /* VIEW  */
  const openView = async (row) => {
    try {
      if (row.status === "CREATED") {
        const user = sessionStorage.getItem("user");
        let performedByUserId;
        try {
          performedByUserId = user ? JSON.parse(user).id : undefined;
        } catch (e) {}
        await axiosInstance.put(`${API_URL}/${row.id}`, {
          status: "IN_PROGRESS",
          performedByUserId,
        });
      }

      const updatedRes = await axiosInstance.get(`${API_URL}/${row.id}`);
      setActivePick(updatedRes.data);
      setIsViewOpen(true);
    } catch (err) {
      toast.error("Failed to open picklist");
    }
  };

  /* EDIT  */
  const openEdit = (row) => {
    setActivePick(row);
    setEditItems(
      row.items.map((i) => ({
        id: i.id,
        componentName: i.componentName,
        availableQty: i.availableQty,
        usedQty: i.usedQty,
      })),
    );
    setIsEditOpen(true);
  };

  const updateUsedQty = (idx, val) => {
    setEditItems((prev) =>
      prev.map((i, index) =>
        index === idx
          ? {
              ...i,
              usedQty: Math.min(Math.max(Number(val), 0), i.availableQty),
            }
          : i,
      ),
    );
  };

  const saveEdit = async () => {
    try {
      const payload = {
        items: editItems.map((i) => ({ id: i.id, usedQty: i.usedQty })),
      };
      const response = await axiosInstance.put(
        `${API_URL}/${activePick.id}/execute`,
        payload,
      );

      if (response && response.data) {
        const user = sessionStorage.getItem("user");
        let performedByUserId;
        try {
          performedByUserId = user ? JSON.parse(user).id : undefined;
        } catch (e) {}
        await axiosInstance.put(`${API_URL}/${activePick.id}`, {
          status: "COMPLETED",
          performedByUserId,
        });

        toast.success("Picklist completed successfully");
        await Promise.all([fetchPicklists(), fetchComponents()]);
        closeAll();
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to update picklist";
      toast.error(errorMsg);
    }
  };

  const closeAll = () => {
    setIsCreateOpen(false);
    setIsViewOpen(false);
    setIsEditOpen(false);
    setActivePick(null);
    setItems([]);
    setEditItems([]);
    setSearch("");
    setSuggestions([]);
    fetchPicklists();
  };

  /* COMPONENT SEARCH  */
  const isOpenedReel = (c) => {
    if (c.hasOpenReel === true) return true;
    if (typeof c.quantity === "number" && typeof c.minStock === "number") {
      return c.quantity < c.minStock;
    }
    const status = (c.status || c.condition || c.state || "")
      .toString()
      .toUpperCase();
    if (
      status.includes("OPEN") ||
      status.includes("IN_USE") ||
      status.includes("USED")
    )
      return true;
    if (c.isOpened === true || c.opened === true) return true;
    return false;
  };

  const handleSearch = (val) => {
    setSearch(val);
    if (!val.trim()) return setSuggestions([]);

    const matches = components.filter(
      (c) =>
        c.code.toLowerCase().includes(val.toLowerCase()) ||
        c.name.toLowerCase().includes(val.toLowerCase()),
    );

    matches.sort((a, b) => {
      const aOpen = isOpenedReel(a) ? 1 : 0;
      const bOpen = isOpenedReel(b) ? 1 : 0;
      return bOpen - aOpen;
    });

    setSuggestions(matches);
  };

  const selectComponent = (c) => {
    setSelectedComponent(c);
    setSearch(`${c.code} - ${c.name}`);
    setSuggestions([]);
  };

  const addItem = () => {
    if (!selectedComponent) return;
    if (items.some((i) => i.id === selectedComponent.id)) return;

    setItems([
      ...items,
      {
        id: selectedComponent.id,
        code: selectedComponent.code,
        name: selectedComponent.name,
        availableQty: selectedComponent.quantity,
        location: selectedComponent.location,
      },
    ]);

    setSearch("");
    setSelectedComponent(null);
  };

  const removeItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  /* TABLE COLUMNS  */
  const columns = [
    { key: "code", label: "Pick Code" },
    { key: "name", label: "Name" },
    { key: "operator", label: "Operator" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`px-2.5 py-1 rounded-md text-xs font-medium border ${statusBadge(row.status)}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "components",
      label: "Components",
      render: (row) => (
        <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
          {row.items?.length || 0}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Action",
      render: (row) => (
        <div className="flex gap-2 justify-center">
          {canEdit &&
            (row.status === "IN_PROGRESS" || row.status === "COMPLETED") && (
              <button
                onClick={() => openEdit(row)}
                className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                title={isOperator ? "Update Quantity" : "Edit Picklist"}
              >
                <Edit size={16} />
              </button>
            )}

          {canEdit && row.status === "CREATED" && (
            <button
              disabled
              className="p-1.5 text-slate-400 bg-slate-50 border border-slate-200 rounded-md cursor-not-allowed"
              title="Click View first to enable edit"
            >
              <Edit size={16} />
            </button>
          )}

          <button
            onClick={() => openView(row)}
            className="p-1.5 text-slate-600 bg-slate-50 hover:bg-slate-200 hover:text-slate-900 rounded-md transition-colors"
            title="View Details & Start Progress"
          >
            <Eye size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <ReusableTable
        data={picklists}
        columns={columns}
        onAdd={canCreate ? openCreate : undefined}
        addLabel="Add Picklist"
      />

      {/* CREATE MODAL  */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-800">
                Create New Picklist
              </h2>
              <button
                onClick={closeAll}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Picklist Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm"
                    placeholder="e.g. Morning Assembly Shift"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Assigned Operator <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm bg-white"
                    value={formData.operator}
                    onChange={(e) =>
                      setFormData({ ...formData, operator: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      Select Operator
                    </option>
                    {operators.map((op) => (
                      <option key={op.id} value={op.name}>
                        {op.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Search & Add Components
                </label>
                <div className="flex gap-2 relative">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={16} className="text-slate-400" />
                    </div>
                    <input
                      className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Type component code or name..."
                      value={search}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={addItem}
                    disabled={!selectedComponent}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    <Plus size={16} /> Add
                  </button>

                  {/* Suggestions Dropdown */}
                  {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-24 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                      {suggestions.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => selectComponent(c)}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-start justify-between border-b border-slate-100 last:border-0"
                        >
                          <div>
                            <div className="font-medium text-sm text-slate-800">
                              {c.code} - {c.name}
                            </div>
                            {c.hasOpenReel &&
                              c.openReels &&
                              c.openReels.length > 0 && (
                                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                  <AlertCircle
                                    size={12}
                                    className="text-amber-500"
                                  />
                                  {c.openReels.length} open reel(s) • Qty:{" "}
                                  {c.openReels.reduce(
                                    (sum, r) => sum + (r.qtyremaining || 0),
                                    0,
                                  )}{" "}
                                  remaining
                                </div>
                              )}
                          </div>
                          {isOpenedReel(c) && (
                            <span className="text-xs font-medium px-2 py-0.5 bg-amber-100 text-amber-700 rounded border border-amber-200">
                              🔓 Open
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden mt-4">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-xs font-semibold">
                    <tr>
                      <th className="px-4 py-3">Component</th>
                      <th className="px-4 py-3 text-center">Available Qty</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3 text-center w-16">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-4 py-8 text-center text-slate-500 bg-slate-50/50"
                        >
                          No components added yet. Search above to add.
                        </td>
                      </tr>
                    ) : (
                      items.map((i, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-slate-800">
                            {i.code}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium border border-slate-200">
                              {i.availableQty}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {i.location}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => removeItem(idx)}
                              className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={closeAll}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveCreate}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Picklist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL  */}
      {isViewOpen && activePick && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-800">
                Picklist Details
              </h2>
              <button
                onClick={closeAll}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 flex gap-4 text-sm text-slate-600">
                <div>
                  <span className="font-semibold text-slate-800">
                    Operator:
                  </span>{" "}
                  {activePick.operator}
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Status:</span>{" "}
                  <span
                    className={`ml-1 px-2 py-0.5 rounded text-xs border ${statusBadge(activePick.status)}`}
                  >
                    {activePick.status}
                  </span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-xs font-semibold">
                    <tr>
                      <th className="px-4 py-3">Component</th>
                      <th className="px-4 py-3 text-center">Available Qty</th>
                      <th className="px-4 py-3 text-center">Used Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activePick.items.map((i) => (
                      <tr key={i.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {i.componentName}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600">
                          {i.availableQty}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-blue-600">
                          {i.usedQty}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={closeAll}
                className="px-6 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL  */}
      {isEditOpen && activePick && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {isOperator ? "Update Used Quantity" : "Edit Picklist"}
                </h2>
                {isOperator && (
                  <p className="text-xs text-slate-500 mt-1">
                    Please log the exact quantity used for each component.
                  </p>
                )}
              </div>
              <button
                onClick={closeAll}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-xs font-semibold">
                    <tr>
                      <th className="px-4 py-3">Component</th>
                      <th className="px-4 py-3 text-center">Available</th>
                      <th className="px-4 py-3 text-center">Used Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {editItems.map((i, idx) => (
                      <tr key={i.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {i.componentName}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600">
                          {i.availableQty}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max={i.availableQty}
                            value={i.usedQty}
                            onChange={(e) => updateUsedQty(idx, e.target.value)}
                            className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
                            disabled={!canEdit}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={closeAll}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              {canEdit && (
                <button
                  onClick={saveEdit}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isOperator ? "Save Quantities" : "Save Changes"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
