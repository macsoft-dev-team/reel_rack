import React, { useState, useEffect } from "react";

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
}) {
  const [currentPage, setCurrentPage] = useState(1);

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

  return (
    <>
      {/* TABLE WRAPPER */}
      <div className="w-full overflow-x-auto rounded-xl border border-stone-200 shadow-sm">
        <table className="min-w-[700px] w-full text-xs sm:text-sm bg-white">
          <thead className="bg-blue-950 text-white sticky top-0">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  // allow column-specific className and optional wrapping
                  className={`py-3 sm:py-4 px-3 sm:px-4 text-center font-semibold ${col.wrap ? "whitespace-normal" : "whitespace-nowrap"
                    } ${col.className || ""}`}
                >
                  {col.label}
                </th>
              ))}

              {(onEdit || onDelete || onTick) && (
                <th className="py-3 sm:py-4 px-3 sm:px-4 text-center font-semibold whitespace-nowrap">
                  Action
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {paginatedData.length ? (
              paginatedData.map((row, index) => (
                <tr
                  key={row.id || index}
                  className="border-b border-stone-200 hover:bg-stone-50 transition"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-3 sm:py-4 px-3 sm:px-4 text-center font-medium ${col.wrap
                          ? "whitespace-normal wrap-break-word text-left"
                          : "whitespace-nowrap"
                        } ${col.className || ""}`}
                    >
                      {renderCellValue(col, row)}
                    </td>
                  ))}

                  {(onEdit || onDelete || onTick) && (
                    <td className="py-3 px-2">
                      <div className="flex justify-center items-center gap-2 flex-wrap">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="text-gray-600 hover:text-indigo-600 transition"
                          >
                            {actionIcon}
                          </button>
                        )}

                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            className="text-gray-600 hover:text-red-600 transition"
                          >
                            {deleteIcon}
                          </button>
                        )}

                        {onTick && (
                          <button
                            onClick={() => onTick(row)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs"
                          >
                            {tickIcon}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="p-8 text-center text-slate-400"
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center sm:justify-end items-center gap-2 mt-4 px-2 sm:px-4 pb-3">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded text-xs sm:text-sm disabled:opacity-50"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i + 1)}
              className={`px-3 py-1 rounded text-xs sm:text-sm ${currentPage === i + 1 ? "bg-indigo-600 text-white" : "border"
                }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded text-xs sm:text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
