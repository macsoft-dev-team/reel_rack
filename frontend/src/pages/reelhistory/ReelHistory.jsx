import React, { useEffect, useState } from "react";
import ReusableTable from "../../component/ReusableTable";
import axiosInstance from "../../api/axiosConfig";
import { toast } from "sonner";
import { Box, Grid, Activity, RotateCcw } from "lucide-react";

const API = "/history";

export default function ReelHistory() {
  const [history, setHistory] = useState([]);
  const [filters, setFilters] = useState({
    reelCode: "",
    rackCode: "",
    eventType: "",
  });

  /* FETCH */
  useEffect(() => {
    fetchHistory();

    // Set up polling to refresh history every 5 seconds
    const pollInterval = setInterval(() => {
      fetchHistory();
    }, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(pollInterval);
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axiosInstance.get(API);

      const formatted = res.data.map((h) => ({
        id: h.id,
        reelCode: h.reel?.reelCode || h.reelCode || h.reel?.code || "-",
        rackCode: h.rack?.rackCode || h.rackCode || "-",
        rowNo: h.cell?.rowNo ?? h.rowNo ?? "-",
        colNo: h.cell?.colNo ?? h.colNo ?? "-",
        eventType: h.action || h.eventType || "-",
        createdAt: h.createdAt,
      }));

      setHistory(formatted);
    } catch (err) {
      console.error("Failed to load history", err);
      toast.error("Failed to fetch reel history");
    }
  };

  /* FILTER */
  const filteredHistory = history.filter((h) => {
    return (
      (!filters.reelCode ||
        h.reelCode?.toLowerCase().includes(filters.reelCode.toLowerCase())) &&
      (!filters.rackCode ||
        h.rackCode?.toLowerCase().includes(filters.rackCode.toLowerCase())) &&
      (!filters.eventType || h.eventType === filters.eventType)
    );
  });

  /* TABLE COLUMNS */
  const columns = [
    {
      key: "date",
      label: "Date",
      render: (row) =>
        row.createdAt ? (
          <span className="text-sm font-medium text-slate-700">
            {new Date(row.createdAt).toLocaleDateString("en-IN")}
          </span>
        ) : (
          "-"
        ),
    },
    {
      key: "time",
      label: "Time",
      render: (row) =>
        row.createdAt ? (
          <span className="text-sm text-slate-500">
            {new Date(row.createdAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        ) : (
          "-"
        ),
    },
    {
      key: "reelCode",
      label: "Reel ID",
      render: (row) => (
        <span className="font-medium text-slate-800">{row.reelCode}</span>
      ),
    },
    { key: "rackCode", label: "Rack" },
    { key: "rowNo", label: "Row No" },
    { key: "colNo", label: "Col No" },
    {
      key: "eventType",
      label: "Action",
      render: (row) => {
        const action = row.eventType?.toUpperCase();
        let colorClass = "bg-slate-100 text-slate-700 border-slate-200";

        if (action === "INSERT")
          colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200";
        if (action === "REMOVE")
          colorClass = "bg-rose-100 text-rose-700 border-rose-200";

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

  return (
    <div className="w-full space-y-6">
      {/* FILTERS TOOLBAR */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              {/* Reel ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Reel ID
                </label>
                <div className="relative">
                  <Box
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    placeholder="Search reel code..."
                    className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-shadow"
                    value={filters.reelCode}
                    onChange={(e) =>
                      setFilters({ ...filters, reelCode: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Rack Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Rack Code
                </label>
                <div className="relative">
                  <Grid
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    placeholder="Search rack code..."
                    className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-shadow"
                    value={filters.rackCode}
                    onChange={(e) =>
                      setFilters({ ...filters, rackCode: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Action Type
                </label>
                <div className="relative">
                  <Activity
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <select
                    className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-shadow appearance-none"
                    value={filters.eventType}
                    onChange={(e) =>
                      setFilters({ ...filters, eventType: e.target.value })
                    }
                  >
                    <option value="">All Actions</option>
                    <option value="INSERT">INSERT</option>
                    <option value="REMOVE">REMOVE</option>
                  </select>
                </div>
              </div>

              {/* Clear Button */}
              <div>
                <button
                  onClick={() =>
                    setFilters({ reelCode: "", rackCode: "", eventType: "" })
                  }
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium px-4 py-2 transition-colors border border-slate-200"
                >
                  <RotateCcw size={16} />
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

      {/* TABLE SECTION */}
      <ReusableTable
        columns={columns}
        data={filteredHistory}
        pageSize={5}
      />
    </div>
  );
}
