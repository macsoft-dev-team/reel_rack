import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosConfig";
import ReusableTable from "../../component/ReusableTable";
import { toast } from "sonner";

const API = "/inventorytransaction";

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    type: "",
    fromDate: "",
    toDate: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  useEffect(() => {
    fetchLogs();

    // Set up polling to refresh logs every 5 seconds
    const pollInterval = setInterval(() => {
      fetchLogs();
    }, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, logs]);

  const fetchLogs = async () => {
    try {
      const res = await axiosInstance.get(API);
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch error", err);
      toast.error("Failed to fetch transaction logs");
    }
  };

  const applyFilters = () => {
    let data = [...logs];

    if (filters.type) {
      data = data.filter((i) => i.transactionType === filters.type);
    }

    if (filters.fromDate) {
      data = data.filter(
        (i) => new Date(i.createdAt) >= new Date(filters.fromDate),
      );
    }

    if (filters.toDate) {
      data = data.filter(
        (i) => new Date(i.createdAt) <= new Date(filters.toDate),
      );
    }

    setFilteredData(data);
    setCurrentPage(1);
  };

  /* Pagination */
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const columns = [
    { key: "transactionType", label: "Transaction Type" },
    { key: "reel.id", label: "Reel ID" },
    { key: "reel.componentid", label: "Component ID" },
    { key: "pickTask.code", label: "Picklist Code" },
    { key: "qtyBefore", label: "Qty Before" },
    { key: "qtyAfter", label: "Qty After" },
    { key: "qtyDelta", label: "Qty Delta" },
    { key: "performedByUser.name", label: "Performed By" },
    // { key: "transactionReason", label: "Reason" },
    { key: "createdAt", label: "Date" },
  ];

  return (
    <div className="w-full space-y-6">
      {/* FILTER SECTION */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <select
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-sm text-slate-800"
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="COMPONENT_PLACED">Component Placed</option>
              <option value="PICKLIST_QTY_UPDATE">Picklist Qty Update</option>
              <option value="PICKLIST_CREATED">Picklist Created</option>
              <option value="RACK_CREATED">Rack Created</option>
              <option value="COMPONENT_CREATED">Component Created</option>
              <option value="MANUFACTURER_CREATED">Manufacturer Created</option>
            </select>

            <input
              type="date"
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              onChange={(e) =>
                setFilters({ ...filters, fromDate: e.target.value })
              }
            />

            <input
              type="date"
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              onChange={(e) =>
                setFilters({ ...filters, toDate: e.target.value })
              }
            />

            {/* Refresh Button */}
            <button
              onClick={fetchLogs}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm px-4 py-2"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* TABLE */}
        <ReusableTable columns={columns} data={paginatedData} />

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50"
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded text-sm ${
                  currentPage === i + 1 ? "bg-indigo-600 text-white" : "border"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
    </div>
  );
}
