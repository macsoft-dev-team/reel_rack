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

  // FILTER PICKLISTS: Show all for Super Admin, and only assigned picklists for other users
  const filteredPicklists = picklists.filter((pl) => {
    if (isSuperAdmin) return true;
    if (!pl || !pl.operator) return false;

    const opLower = pl.operator.toString().trim().toLowerCase();
    const currentNameLower = (currentUser.name || "").toString().trim().toLowerCase();
    const currentEmpIdLower = (currentUser.employeeId || "").toString().trim().toLowerCase();
    const currentIdStr = (currentUser.id || "").toString().trim();

    if (currentNameLower && opLower === currentNameLower) return true;
    if (currentEmpIdLower && opLower === currentEmpIdLower) return true;
    if (currentIdStr && opLower === currentIdStr) return true;

    if (opLower === "operator_1" || opLower === "operator 1") {
      if (currentEmpIdLower === "op-001" || currentNameLower === "kumar") return true;
    }
    if (opLower === "operator_2" || opLower === "operator 2") {
      if (currentEmpIdLower === "op-002" || currentNameLower === "arun") return true;
    }

    return false;
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [activePick, setActivePick] = useState(null);

  const [formData, setFormData] = useState({ name: "", operator: "" });
  const [items, setItems] = useState([]);
  const [editItems, setEditItems] = useState([]);

  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [addRequiredQty, setAddRequiredQty] = useState(1);
  const [tempUsedQty, setTempUsedQty] = useState({});

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

  /* OPERATOR WORKFLOW HANDLERS */
  const handlePickReel = async (picklistId, itemId) => {
    try {
      await axiosInstance.post(`/picklist/${picklistId}/items/${itemId}/pick`, {
        operator: currentUser.name || currentUser.employeeId || "OPERATOR_1",
        userId: currentUser.id || 1,
      });
      toast.success("Rack location identified. Ready to pick Reel from Rack!");
      fetchPicklists();
      if (activePick) {
        const updated = await axiosInstance.get(`/picklist/${picklistId}`);
        setActivePick(updated.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to pick reel");
    }
  };

  const handleSaveUsedQty = async (picklistId, itemId, usedQtyVal) => {
    const qty = Number(usedQtyVal);
    if (isNaN(qty) || qty < 0) {
      toast.error("Please enter a valid non-negative used quantity");
      return;
    }
    try {
      await axiosInstance.patch(`/picklist/${picklistId}/items/${itemId}/quantity`, {
        usedQty: qty,
        operator: currentUser.name || currentUser.employeeId || "OPERATOR_1",
      });
      toast.success("Used quantity saved. Item is ready for return.");
      fetchPicklists();
      if (activePick) {
        const updated = await axiosInstance.get(`/picklist/${picklistId}`);
        setActivePick(updated.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save used quantity");
    }
  };

  const handleReturnReel = async (picklistId, itemId) => {
    try {
      await axiosInstance.post(`/picklist/${picklistId}/items/${itemId}/return`, {
        operator: currentUser.name || currentUser.employeeId || "OPERATOR_1",
      });
      toast.success("Return initiated. Please return reel to original rack location.");
      fetchPicklists();
      if (activePick) {
        const updated = await axiosInstance.get(`/picklist/${picklistId}`);
        setActivePick(updated.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to initiate return");
    }
  };

  const handleConfirmReturn = async (picklistId, itemId) => {
    try {
      await axiosInstance.post(`/picklist/${picklistId}/items/${itemId}/confirm-return`, {
        operator: currentUser.name || currentUser.employeeId || "OPERATOR_1",
      });
      toast.success("Reel return confirmed and item marked COMPLETED!");
      fetchPicklists();
      if (activePick) {
        const updated = await axiosInstance.get(`/picklist/${picklistId}`);
        setActivePick(updated.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to confirm return");
    }
  };

  /* CREATE  */
  const openCreate = () => {
    setFormData({ name: "", operator: "" });
    setItems([]);
    setSearch("");
    setSuggestions([]);
    setAddRequiredQty(1);
    setIsCreateOpen(true);
  };

  const saveCreate = async () => {
    if (!formData.name || !formData.operator) {
      toast.error("Please fill in all required fields (Name and Operator)");
      return;
    }

    // Check for duplicate picklist name
    const existingName = picklists.find(
      (pl) => (pl.name || "").trim().toLowerCase() === formData.name.trim().toLowerCase()
    );
    if (existingName) {
      toast.error(`Picklist with name '${formData.name.trim()}' already exists`);
      return;
    }

    if (!items.length) {
      toast.error("Please add at least one component to the picklist");
      return;
    }

    // Check for 0 available quantity item
    const zeroStockItem = items.find((i) => Number(i.availableQty) <= 0);
    if (zeroStockItem) {
      toast.error(`Cannot create picklist: Component '${zeroStockItem.code}' has no available quantity`);
      return;
    }

    // Check for required quantity exceeding available quantity
    const invalidReqItem = items.find((i) => Number(i.requiredQty) > Number(i.availableQty));
    if (invalidReqItem) {
      toast.error(
        `Required quantity (${invalidReqItem.requiredQty}) exceeds available quantity (${invalidReqItem.availableQty}) for '${invalidReqItem.code}'`
      );
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
          requiredQty: Number(i.requiredQty) || 0,
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

  /* DELETE  */
  const deletePicklist = (row) => {
    setDeleteTarget(row);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const user = sessionStorage.getItem("user");
      let performedByUserId;
      try {
        performedByUserId = user ? JSON.parse(user).id : undefined;
      } catch (e) {}

      await axiosInstance.delete(`${API_URL}/${deleteTarget.id}`, {
        params: { performedByUserId },
      });

      toast.success("Picklist deleted successfully");
      setDeleteTarget(null);
      await fetchPicklists();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error(err.response?.data?.message || "Failed to delete picklist");
    }
  };

  /* EDIT  */
  const openEdit = (row) => {
    setActivePick(row);
    setEditItems(
      row.items.map((i) => ({
        id: i.id,
        componentName: i.componentName || i.componentCode || i.code || i.name || "—",
        componentCode: i.componentCode || i.code || "",
        availableQty: i.availableQty,
        requiredQty: i.requiredQty || 0,
        usedQty: i.usedQty,
        openReelSuggestion: i.openReelSuggestion,
        suggestedReels: i.suggestedReels,
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
    if (c.openReels && c.openReels.length > 0) return true;
    if (c.reels && c.reels.some((r) => r.isopen || r.reelstatus === "OPEN")) return true;
    if (c.suggestedReel && (c.suggestedReel.isopen || c.suggestedReel.reelstatus === "OPEN")) return true;
    return false;
  };

  const computeReelSuggestions = (c, reqQty = 1) => {
    const openReels = (c.openReels && c.openReels.length > 0)
      ? c.openReels
      : (c.reels ? c.reels.filter(r => r.isopen || r.reelstatus === "OPEN") : []);
    const allReels = c.reels || [];
    const unopenedReels = allReels.filter(r => !r.isopen && r.reelstatus !== "OPEN");

    const suggested = [];
    let needed = Number(reqQty) || 1;

    for (const r of openReels) {
      if (needed <= 0) break;
      const rem = Number(r.qtyremaining) || 0;
      if (rem > 0) {
        const take = Math.min(rem, needed);
        suggested.push({ ...r, suggestedTake: take, isOpen: true });
        needed -= take;
      }
    }

    for (const r of unopenedReels) {
      if (needed <= 0) break;
      const rem = Number(r.qtyremaining) || 0;
      if (rem > 0) {
        const take = Math.min(rem, needed);
        suggested.push({ ...r, suggestedTake: take, isOpen: false });
        needed -= take;
      }
    }

    return suggested;
  };

  const handleSearch = (val) => {
    setSearch(val);
    if (!val.trim()) return setSuggestions([]);

    const matches = components.filter(
      (c) =>
        (c.code.toLowerCase().includes(val.toLowerCase()) ||
          c.name.toLowerCase().includes(val.toLowerCase())) &&
        Number(c.quantity) > 0,
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
    if (Number(selectedComponent.quantity) <= 0) {
      toast.error(`Component '${selectedComponent.code}' is out of stock (0 available)`);
      return;
    }
    if (items.some((i) => i.id === selectedComponent.id)) return;

    const reqQty = Math.max(1, Number(addRequiredQty) || 1);
    const suggestedReels = computeReelSuggestions(selectedComponent, reqQty);

    setItems([
      ...items,
      {
        id: selectedComponent.id,
        code: selectedComponent.code,
        name: selectedComponent.name,
        availableQty: selectedComponent.quantity,
        requiredQty: reqQty,
        location: selectedComponent.location,
        openReelSuggestion:
          selectedComponent.suggestedReel ||
          (selectedComponent.openReels && selectedComponent.openReels[0]) ||
          null,
        suggestedReels,
      },
    ]);

    setSearch("");
    setSelectedComponent(null);
    setAddRequiredQty(1);
  };

  const updateItemRequiredQty = (idx, val) => {
    setItems((prev) =>
      prev.map((item, index) =>
        index === idx
          ? { ...item, requiredQty: Math.max(0, Number(val)) }
          : item,
      ),
    );
  };

  const removeItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  /* TABLE COLUMNS  */
  const columns = [
    { key: "code", label: "Pick Code", align: "left" },
    { key: "name", label: "Name", align: "left" },
    { key: "operator", label: "Operator", align: "left" },
    {
      key: "status",
      label: "Status",
      align: "center",
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
      align: "center",
      render: (row) => (
        <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-semibold min-w-8">
          {row.items?.length || 0}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Action",
      align: "center",
      render: (row) => (
        <div className="flex gap-2 justify-center items-center">
          {canEdit &&
            (row.status === "IN_PROGRESS" || row.status === "COMPLETED") && (
              <button
                onClick={() => openEdit(row)}
                className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
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
            className="p-1.5 text-slate-600 bg-slate-50 hover:bg-slate-200 hover:text-slate-900 rounded-md transition-colors cursor-pointer"
            title="View Details & Start Progress"
          >
            <Eye size={16} />
          </button>

          {canDelete && (
            <button
              onClick={() => deletePicklist(row)}
              className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-800 rounded-md transition-colors cursor-pointer"
              title="Delete Picklist"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <ReusableTable
        data={filteredPicklists}
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
                <div className="flex flex-col sm:flex-row gap-2 relative">
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
                  <div className="w-full sm:w-32">
                    <input
                      type="number"
                      min="1"
                      placeholder="Req Qty"
                      title="Required Quantity"
                      value={addRequiredQty}
                      onChange={(e) => setAddRequiredQty(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                    />
                  </div>
                  <button
                    onClick={addItem}
                    disabled={!selectedComponent}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    <Plus size={16} /> Add
                  </button>

                  {/* Suggestions Dropdown */}
                  {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50 divide-y divide-slate-100">
                      {suggestions.map((c) => {
                        const isOpened = isOpenedReel(c);
                        const computedSugg = computeReelSuggestions(c, addRequiredQty);
                        return (
                          <div
                            key={c.id}
                            onClick={() => selectComponent(c)}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex flex-col gap-1 text-left"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-sm text-slate-800">
                                {c.code} - {c.name}
                              </span>
                              {isOpened && (
                                <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded border border-emerald-300 flex items-center gap-1">
                                  🔓 Open Reel Available
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 flex flex-wrap gap-2 items-center">
                              <span>Available Qty: <strong className="text-slate-700">{c.quantity}</strong></span>
                              <span>• Req Qty: <strong className="text-blue-600">{addRequiredQty}</strong></span>
                            </div>

                            {/* Multi-Reel Suggestion Preview */}
                            {computedSugg.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                {computedSugg.map((s, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                                      s.isOpen
                                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                        : "bg-blue-50 text-blue-800 border-blue-200"
                                    }`}
                                  >
                                    {s.isOpen ? "🔓 Open Reel:" : "📦 Next Reel:"} Lot {s.lotnumber || `Reel-${s.id}`} ({s.suggestedTake || s.qtyremaining} needed)
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden mt-4">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-xs font-semibold">
                    <tr>
                      <th className="px-4 py-3 text-left">Component</th>
                      <th className="px-4 py-3 text-left">Available Qty</th>
                      <th className="px-4 py-3 text-left">Required Qty</th>
                      <th className="px-4 py-3 text-left">Suggested Reel</th>
                      <th className="px-4 py-3 text-left">Location</th>
                      <th className="px-4 py-3 text-center w-16">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-4 py-8 text-center text-slate-500 bg-slate-50/50"
                        >
                          No components added yet. Search above to add.
                        </td>
                      </tr>
                    ) : (
                      items.map((i, idx) => {
                        const exceeds = Number(i.requiredQty) > Number(i.availableQty);
                        return (
                          <tr
                            key={idx}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="px-4 py-3 font-medium text-slate-800 text-left">
                              {i.code}
                            </td>
                            <td className="px-4 py-3 text-left">
                              <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium border border-slate-200">
                                {i.availableQty}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-left">
                              <div className="flex flex-col gap-1">
                                <input
                                  type="number"
                                  min="1"
                                  value={i.requiredQty}
                                  onChange={(e) => updateItemRequiredQty(idx, e.target.value)}
                                  className={`w-20 border rounded px-2 py-1 text-xs text-left focus:outline-none focus:ring-1 ${
                                    exceeds
                                      ? "border-amber-400 bg-amber-50 text-amber-900 focus:ring-amber-500 font-semibold"
                                      : "border-slate-300 focus:ring-blue-500"
                                  }`}
                                />
                                {exceeds && (
                                  <span className="text-[10px] text-amber-700 font-medium flex items-center gap-0.5">
                                    <AlertCircle size={10} /> Exceeds Available ({i.availableQty})
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-left">
                              {i.suggestedReels && i.suggestedReels.length > 0 ? (
                                <div className="flex flex-col gap-1.5">
                                  {i.suggestedReels.map((s, sIdx) => (
                                    <div
                                      key={sIdx}
                                      className={`flex flex-col text-xs px-2.5 py-1 rounded border ${
                                        s.isOpen
                                          ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                                          : "bg-blue-50 text-blue-900 border-blue-200"
                                      }`}
                                    >
                                      <div className="flex items-center gap-1 font-semibold">
                                        <span>{s.isOpen ? "🔓 Open:" : "📦 Next:"}</span>
                                        <span>Lot {s.lotnumber || `Reel-${s.id}`} ({s.suggestedTake || s.qtyremaining} needed)</span>
                                      </div>
                                      {s.rackLocation && (
                                        <span className="text-[10px] text-slate-600 font-bold mt-0.5">
                                          📍 {s.rackLocation}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : i.openReelSuggestion ? (
                                <div className="inline-flex flex-col text-xs bg-emerald-50 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-md">
                                  <span className="font-semibold">🔓 Open: Lot {i.openReelSuggestion.lotnumber}</span>
                                  <span className="text-[10px] text-emerald-700">{i.openReelSuggestion.qtyremaining} remaining</span>
                                  {i.openReelSuggestion.rackLocation && (
                                    <span className="text-[10px] text-slate-700 font-bold mt-0.5">
                                      📍 {i.openReelSuggestion.rackLocation}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 italic">No open reel</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-slate-600 text-left">
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
                        );
                      })
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

      {/* VIEW / OPERATOR WORKFLOW MODAL */}
      {isViewOpen && activePick && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl flex flex-col max-h-[92vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span>Picklist Details & Execution</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-blue-100 text-blue-700 border border-blue-200">
                    {activePick.code}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Follow step-by-step picking and return procedures below.
                </p>
              </div>
              <button
                onClick={closeAll}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div className="flex gap-4">
                  <div>
                    <span className="font-semibold text-slate-500">Picklist Name:</span>{" "}
                    <strong className="text-slate-800">{activePick.name}</strong>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">Assigned Operator:</span>{" "}
                    <strong className="text-slate-800">{activePick.operator}</strong>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-500">Overall Status:</span>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${statusBadge(activePick.status)}`}>
                    {activePick.status}
                  </span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 uppercase font-extrabold tracking-wider">
                    <tr>
                      <th className="px-4 py-3 text-left">Reel / Component</th>
                      <th className="px-3 py-3 text-center">Req Qty</th>
                      <th className="px-3 py-3 text-center">Used Qty</th>
                      <th className="px-4 py-3 text-left">Rack Location (Row / Col)</th>
                      <th className="px-3 py-3 text-center">Item Status</th>
                      <th className="px-4 py-3 text-center">Operator Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activePick.items.map((i) => {
                      const itemLoc = i.pickedLocation || (i.suggestedReels?.[0]?.rackLocation) || (i.openReelSuggestion?.rackLocation) || (i.location !== "Unassigned" ? i.location : null);
                      const hasLocation = !!itemLoc;
                      const itemSt = i.status || "PENDING";

                      return (
                        <tr key={i.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-800 text-left">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-slate-900">{i.componentName || i.componentCode || "—"}</span>
                              {i.reelId && (
                                <span className="text-[10px] text-blue-600 font-mono">Reel: {i.reelId}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center font-extrabold text-slate-700">
                            {i.requiredQty}
                          </td>
                          <td className="px-3 py-3 text-center">
                            {itemSt === "PICKED" || itemSt === "IN_USE" || itemSt === "READY_FOR_RETURN" ? (
                              <input
                                type="number"
                                min="0"
                                max={i.availableQty}
                                value={tempUsedQty[i.id] !== undefined ? tempUsedQty[i.id] : i.usedQty}
                                onChange={(e) => setTempUsedQty((prev) => ({ ...prev, [i.id]: e.target.value }))}
                                className="w-16 border border-slate-300 rounded px-2 py-1 text-center font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                              />
                            ) : (
                              <span className="font-bold text-blue-600">{i.usedQty}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-left">
                            {hasLocation ? (
                              <div className="flex flex-col text-xs text-slate-700 font-medium">
                                <span className="font-bold text-slate-800 flex items-center gap-1">
                                  📍 {itemLoc}
                                </span>
                                {itemSt === "PICKED" && (
                                  <span className="text-[10px] text-emerald-600 font-bold">
                                    ✓ Rack location identified
                                  </span>
                                )}
                                {itemSt === "RETURN_PENDING" && (
                                  <span className="text-[10px] text-purple-700 font-bold">
                                    RETURN TO: {itemLoc}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-red-500 font-semibold italic text-[11px]">
                                Rack location not found for this Reel.
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider border ${
                                itemSt === "COMPLETED"
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                  : itemSt === "RETURN_PENDING"
                                  ? "bg-purple-100 text-purple-800 border-purple-300"
                                  : itemSt === "READY_FOR_RETURN"
                                  ? "bg-blue-100 text-blue-800 border-blue-300"
                                  : itemSt === "PICKED" || itemSt === "IN_USE"
                                  ? "bg-amber-100 text-amber-800 border-amber-300"
                                  : "bg-slate-100 text-slate-700 border-slate-300"
                              }`}
                            >
                              {itemSt === "IN_USE" ? "PICKED / IN USE" : itemSt}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {/* STEP 1: PENDING -> PICK REEL */}
                              {itemSt === "PENDING" && (
                                <button
                                  onClick={() => handlePickReel(activePick.id, i.id)}
                                  disabled={!hasLocation}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold text-white transition-all shadow-2xs flex items-center gap-1 cursor-pointer ${
                                    hasLocation
                                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                      : "bg-slate-300 text-slate-500 cursor-not-allowed"
                                  }`}
                                  title={hasLocation ? "Pick Reel from Rack" : "Cannot PICK - Rack location not found"}
                                >
                                  <span>🚀 PICK REEL</span>
                                </button>
                              )}

                              {/* STEP 2: PICKED / IN_USE -> SAVE USED QTY */}
                              {(itemSt === "PICKED" || itemSt === "IN_USE") && (
                                <button
                                  onClick={() =>
                                    handleSaveUsedQty(
                                      activePick.id,
                                      i.id,
                                      tempUsedQty[i.id] !== undefined ? tempUsedQty[i.id] : i.usedQty
                                    )
                                  }
                                  className="px-3 py-1.5 rounded-lg text-xs font-extrabold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                                >
                                  <span>💾 SAVE USED QTY</span>
                                </button>
                              )}

                              {/* STEP 3: READY_FOR_RETURN -> RETURN REEL */}
                              {itemSt === "READY_FOR_RETURN" && (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      handleSaveUsedQty(
                                        activePick.id,
                                        i.id,
                                        tempUsedQty[i.id] !== undefined ? tempUsedQty[i.id] : i.usedQty
                                      )
                                    }
                                    className="px-2 py-1 rounded text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all cursor-pointer"
                                    title="Update Quantity"
                                  >
                                    Edit Qty
                                  </button>
                                  <button
                                    onClick={() => handleReturnReel(activePick.id, i.id)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-extrabold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>🔄 RETURN REEL</span>
                                  </button>
                                </div>
                              )}

                              {/* STEP 4: RETURN_PENDING -> CONFIRM RETURN (DEV ACK) */}
                              {itemSt === "RETURN_PENDING" && (
                                <button
                                  onClick={() => handleConfirmReturn(activePick.id, i.id)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                                  title="Hardware ACK Simulation"
                                >
                                  <span>✅ CONFIRM RETURN (Dev ACK)</span>
                                </button>
                              )}

                              {/* STEP 5: COMPLETED */}
                              {itemSt === "COMPLETED" && (
                                <span className="text-emerald-700 font-extrabold text-xs flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                                  <CheckCircle2 size={14} /> Completed
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={closeAll}
                className="px-6 py-2 text-xs font-extrabold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
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
                      <th className="px-4 py-3 text-left">Component</th>
                      <th className="px-4 py-3 text-left">Available</th>
                      <th className="px-4 py-3 text-left">Required Qty</th>
                      <th className="px-4 py-3 text-left">Used Qty</th>
                      <th className="px-4 py-3 text-left">Suggested Reel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {editItems.map((i, idx) => {
                      const exceeds = Number(i.requiredQty) > Number(i.availableQty);
                      return (
                        <tr key={i.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-slate-800 text-left">
                            {i.componentName || i.componentCode || i.code || i.name || "—"}
                          </td>
                          <td className="px-4 py-3 text-left text-slate-600">
                            {i.availableQty}
                          </td>
                          <td className="px-4 py-3 text-left">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-800">{i.requiredQty || "-"}</span>
                              {exceeds && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded border border-amber-200">
                                  ⚠️ Exceeds Avail
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-left">
                            <input
                              type="number"
                              min="0"
                              max={i.availableQty}
                              value={i.usedQty}
                              onChange={(e) => updateUsedQty(idx, e.target.value)}
                              className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
                              disabled={!canEdit}
                            />
                          </td>
                          <td className="px-4 py-3 text-left">
                            {i.suggestedReels && i.suggestedReels.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {i.suggestedReels.map((s, sIdx) => (
                                  <div
                                    key={sIdx}
                                    className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded border ${
                                      s.isOpen
                                        ? "bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold"
                                        : "bg-blue-50 text-blue-800 border-blue-200"
                                    }`}
                                  >
                                    <span>{s.isOpen ? "🔓 Open:" : "📦 Next:"}</span>
                                    <span>Lot {s.lotnumber || `Reel-${s.id}`} ({s.suggestedTake || s.qtyremaining} needed)</span>
                                  </div>
                                ))}
                              </div>
                            ) : i.openReelSuggestion ? (
                              <div className="inline-flex flex-col text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md">
                                <span className="font-semibold">🔓 Open: Lot {i.openReelSuggestion.lotnumber}</span>
                                <span className="text-[10px] text-emerald-600">{i.openReelSuggestion.qtyremaining} remaining</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">No open reel</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-200">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Picklist</h3>
              <p className="text-sm text-slate-600 mb-6">
                Are you sure you want to delete picklist{" "}
                <strong className="text-slate-800">'{deleteTarget.name || deleteTarget.code}'</strong>?
                <br />
                This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-xs"
                >
                  Delete Picklist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
