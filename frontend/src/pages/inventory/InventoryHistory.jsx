import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosConfig";
import ReusableTable from "../../component/ReusableTable";
import { toast } from "sonner";
import { Search, Filter, Calendar, Activity, Loader2 } from "lucide-react";

const API = "/inventory-history";

export default function InventoryHistory() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("Reel"); // Capitalized to match select option
  const [actionFilter, setActionFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);

  const storedUserRaw = localStorage.getItem("user");
  let currentUser = {};

  try {
    currentUser = storedUserRaw ? JSON.parse(storedUserRaw) : {};
  } catch (err) {
    console.error("User parse error:", err);
  }

  const userRole = (currentUser.role || "").toUpperCase().replace(/_/g, "");
  const canDelete = userRole === "SUPERADMIN" || userRole === "ADMIN";

  useEffect(() => {
    const timer = setTimeout(fetchHistory, 300);
    return () => clearTimeout(timer);
  }, [search, moduleFilter, actionFilter, dateFrom, dateTo]);

  const fetchHistory = async () => {
    setLoading(true);

    try {
      const params = {};
      if (search) params.search = search;
      if (moduleFilter) params.moduleName = moduleFilter;
      if (actionFilter) params.actionType = actionFilter;
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;

      const res = await axiosInstance.get(API, { params });

      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    if (!canDelete) return;

    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      await axiosInstance.delete(`${API}/${row.id}`);
      toast.success("Record deleted");
      fetchHistory();
    } catch (err) {
      toast.error("Failed to delete record");
    }
  };

  /*
  DYNAMIC COLUMNS BASED ON MODULE
  */
  const getColumns = () => {
    const baseColumns = [
      {
        key: "timestamp",
        label: "Date & Time",
        render: (row) => (
          <span className="text-sm text-slate-600 whitespace-nowrap">
            {new Date(row.timestamp).toLocaleString("en-IN", {
              hour12: true,
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        ),
      },
      {
        key: "moduleName",
        label: "Module",
        render: (row) => (
          <span className="font-medium text-slate-700">{row.moduleName}</span>
        ),
      },
      {
        key: "itemName",
        label: "Item Name",
        render: (row) => (
          <span className="text-slate-800">
            {row.itemName || row.itemId || "-"}
          </span>
        ),
      },
      {
        key: "actionType",
        label: "Action",
        render: (row) => {
          const action = row.actionType?.toUpperCase();
          let colorClass = "bg-slate-100 text-slate-700 border-slate-200";

          if (action === "CREATE")
            colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200";
          if (action === "UPDATE")
            colorClass = "bg-blue-100 text-blue-700 border-blue-200";
          if (action === "DELETE")
            colorClass = "bg-red-100 text-red-700 border-red-200";

          return (
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-bold border ${colorClass}`}
            >
              {action || "-"}
            </span>
          );
        },
      },
    ];

    const changeColumn = {
      key: "updatedFields",
      label: "Changes",
      wrap: true,
      render: (row) => {
        if (!row.updatedFields)
          return <span className="text-slate-400">-</span>;

        try {
          const obj =
            typeof row.updatedFields === "string"
              ? JSON.parse(row.updatedFields)
              : row.updatedFields;

          // Filter out unwanted fields like createdAt and updatedAt
          const filteredEntries = Object.entries(obj).filter(([k]) => {
            const lowerKey = k.toLowerCase();
            return lowerKey !== "createdat" && lowerKey !== "updatedat";
          });

          // If there are no actual user changes after filtering, return a dash
          if (filteredEntries.length === 0) {
            return <span className="text-slate-400">-</span>;
          }

          return (
            <div className="flex flex-col gap-1 text-xs">
              {filteredEntries.map(([k, v], idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-100 px-2 py-1 rounded inline-block w-fit"
                >
                  <span className="font-semibold text-slate-600 capitalize">
                    {k}:
                  </span>{" "}
                  <span className="text-red-500 line-through mr-1">
                    {v.before}
                  </span>{" "}
                  <span className="text-emerald-600 font-medium">
                    → {v.after}
                  </span>
                </div>
              ))}
            </div>
          );
        } catch {
          return <span className="text-slate-400">-</span>;
        }
      },
    };

    const quantityColumn = {
      key: "quantityChange",
      label: "Qty Change",
      render: (row) => {
        const qty = row.quantityChange;
        if (!qty) return <span className="text-slate-400">-</span>;
        const isPositive = qty > 0;
        return (
          <span
            className={`font-bold ${isPositive ? "text-emerald-600" : "text-red-500"}`}
          >
            {isPositive ? "+" : ""}
            {qty}
          </span>
        );
      },
    };

    const userColumn = {
      key: "performedByUser",
      label: "Performed By",
      render: (row) => (
        <span className="text-slate-700 font-medium">
          {row.performedByUser?.name || "-"}
        </span>
      ),
    };

    /* MODULE BASED STRUCTURE */
    if (moduleFilter === "Manufacturer" || moduleFilter === "PickList") {
      return [...baseColumns, userColumn];
    }
    if (moduleFilter === "Component") {
      return [...baseColumns, changeColumn, quantityColumn, userColumn];
    }
    if (moduleFilter === "Reel") {
      return [...baseColumns, quantityColumn, userColumn];
    }

    return [...baseColumns, quantityColumn, userColumn];
  };

  return (
    <div className="w-full space-y-6">
      {/* FILTERS TOOLBAR */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Search
              </label>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  placeholder="Item name or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-shadow"
                />
              </div>
            </div>

            {/* Module Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Module
              </label>
              <div className="relative">
                <Filter
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <select
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-shadow appearance-none"
                >
                  <option value="Reel">Reel</option>
                  <option value="Component">Component</option>
                  <option value="PickList">PickList</option>
                  <option value="Manufacturer">Manufacturer</option>
                </select>
              </div>
            </div>

            {/* Action Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Action
              </label>
              <div className="relative">
                <Activity
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-shadow appearance-none"
                >
                  <option value="">All Actions</option>
                  <option value="CREATE">CREATE</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Date From
              </label>
              <div className="relative">
                <Calendar
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-shadow"
                />
              </div>
            </div>

            {/* Date To */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Date To
              </label>
              <div className="relative">
                <Calendar
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-shadow"
                />
              </div>
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500">
              <Loader2 size={32} className="animate-spin mb-4 text-blue-500" />
              <p className="font-medium">Fetching history logs...</p>
            </div>
          ) : (
            <ReusableTable
              columns={getColumns()}
              data={history}
            />
          )}
        </div>
    </div>
  );
}
