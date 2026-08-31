import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Inbox, Plus, Search, FileSpreadsheet } from "lucide-react";

export default function ReusableTable({
  columns = [],
  data = [],
  onEdit,
  onDelete,
  onTick,
  actionIcon = null,
  deleteIcon = null,
  tickIcon = null,
  pageSize = 5,
  onSearch,
  searchPlaceholder = "Search...",
  onAdd,
  addLabel = "Add Record",
  onBulkUpload,
  bulkUploadLabel = "Bulk Upload",
  headerTitle = null,
  getRowClassName = null,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");

  /* Reset page when data changes */
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = data.slice(startIndex, startIndex + pageSize);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const renderCellValue = (col, row) => {
    if (col.render) return col.render(row);

    const keys = col.key.split(".");
    let value = row;
    for (const key of keys) {
      value = value?.[key];
    }

    if (typeof value === "object" && value !== null) return "-";

    return value ?? "-";
  };

  const showHeaderToolbar = onSearch || onAdd || onBulkUpload || headerTitle;

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* TABLE HEADER TOOLBAR */}
      {showHeaderToolbar && (
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            {headerTitle && (
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {headerTitle}
              </h2>
            )}

            {onSearch && (
              <div className="relative w-full sm:max-w-xs">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  value={searchValue}
                  placeholder={searchPlaceholder}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    onSearch(e.target.value);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                />
              </div>
            )}
          </div>

          {/* ACTION BUTTONS (Bulk Upload + Add Button) */}
          <div className="flex items-center gap-2 flex-wrap">
            {onBulkUpload && (
              <button
                type="button"
                onClick={onBulkUpload}
                className="flex items-center justify-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer active:scale-95 whitespace-nowrap shadow-2xs"
              >
                <FileSpreadsheet size={16} className="text-emerald-600" />
                <span>{bulkUploadLabel}</span>
              </button>
            )}

            {onAdd && (
              <button
                type="button"
                onClick={onAdd}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <Plus size={16} />
                <span>{addLabel}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* TABLE GRID */}
      <div className="w-full overflow-x-auto">
        <table className="min-w-[700px] w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              {columns.map((col) => {
                const alignClass = col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left";
                return (
                  <th
                    key={col.key}
                    className={`py-3.5 px-4 ${alignClass} font-bold text-xs uppercase tracking-wider text-slate-600 ${col.wrap ? "whitespace-normal" : "whitespace-nowrap"
                      } ${col.className || ""}`}
                  >
                    {col.label}
                  </th>
                );
              })}

              {(onEdit || onDelete || onTick) && (
                <th className="py-3.5 px-4 text-center font-bold text-xs uppercase tracking-wider text-slate-600 whitespace-nowrap">
                  Action
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {paginatedData.length ? (
              paginatedData.map((row, index) => {
                const isOutOfStock = row.quantity === 0 || row.reelQty === 0;
                const rowClass = getRowClassName
                  ? getRowClassName(row, index)
                  : isOutOfStock
                    ? "bg-red-50/70 hover:bg-red-100/70 border-l-4 border-l-red-500 transition-colors duration-150"
                    : "hover:bg-blue-50/30 transition-colors duration-150";

                return (
                  <tr key={row.id || index} className={rowClass}>
                    {columns.map((col) => {
                      const alignClass = col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left";
                      return (
                        <td
                          key={col.key}
                          className={`py-3.5 px-4 ${alignClass} font-medium text-sm text-slate-700 ${col.wrap
                              ? "whitespace-normal wrap-break-word text-left"
                              : "whitespace-nowrap"
                            } ${col.className || ""}`}
                        >
                          {renderCellValue(col, row)}
                        </td>
                      );
                    })}

                    {(onEdit || onDelete || onTick) && (
                      <td className="py-3.5 px-4">
                        <div className="flex justify-center items-center gap-1.5 flex-wrap">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(row)}
                              title="Edit"
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            >
                              {actionIcon}
                            </button>
                          )}

                          {onDelete && (
                            <button
                              onClick={() => onDelete(row)}
                              title="Delete"
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              {deleteIcon}
                            </button>
                          )}

                          {onTick && (
                            <button
                              onClick={() => onTick(row)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                            >
                              {tickIcon}
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (onEdit || onDelete || onTick ? 1 : 0)}
                  className="py-12 text-center text-slate-400"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox size={32} className="text-slate-300" />
                    <p className="text-sm font-medium text-slate-500">No records found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-between items-center gap-3 p-4 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs font-medium text-slate-500">
            Showing <span className="font-semibold text-slate-700">{startIndex + 1}</span> to{" "}
            <span className="font-semibold text-slate-700">
              {Math.min(startIndex + pageSize, data.length)}
            </span>{" "}
            of <span className="font-semibold text-slate-700">{data.length}</span> entries
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 rounded-lg text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition cursor-pointer ${currentPage === i + 1
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-200 rounded-lg text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
