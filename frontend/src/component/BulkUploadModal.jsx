import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, Download, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function BulkUploadModal({
  visible,
  onClose,
  title = "Bulk Upload",
  sampleHeaders = [],
  sampleRows = [],
  onUploadSubmit,
}) {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState("");

  if (!visible) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const processFile = (fileToProcess) => {
    setFile(fileToProcess);
    setError("");

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { defval: "" });

        if (!data || data.length === 0) {
          setError("The uploaded file contains no rows or data.");
          setParsedData([]);
          return;
        }

        setParsedData(data);
      } catch (err) {
        console.error("Excel parse error:", err);
        setError("Failed to parse file. Please upload a valid .xlsx, .xls, or .csv file.");
      }
    };
    reader.readAsBinaryString(fileToProcess);
  };

  const downloadSample = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(sampleRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sample");
      XLSX.writeFile(wb, `${title.toLowerCase().replace(/\s+/g, "_")}_sample.xlsx`);
      toast.success("Sample template downloaded successfully!");
    } catch (err) {
      console.error("Sample download error:", err);
      toast.error("Failed to generate sample file.");
    }
  };

  const handleSubmit = async () => {
    if (parsedData.length === 0) {
      setError("Please select a valid file with records before submitting.");
      return;
    }

    setUploading(true);
    setProgress({ current: 0, total: parsedData.length });

    try {
      await onUploadSubmit(parsedData, (current, total) => {
        setProgress({ current, total });
      });

      toast.success(`Successfully uploaded ${parsedData.length} records!`);
      handleReset();
      onClose();
    } catch (err) {
      console.error("Bulk upload error:", err);
      setError(err?.response?.data?.message || err.message || "Failed to upload records. Please check file format.");
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedData([]);
    setError("");
    setProgress({ current: 0, total: 0 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => !uploading && onClose()}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="text-blue-600" size={20} />
              <span>Bulk Upload {title}</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Upload an Excel (.xlsx, .xls) or CSV file to import multiple records at once.
            </p>
          </div>

          <button
            disabled={uploading}
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Download Sample Template Section */}
        <div className="mb-5 bg-blue-50/60 border border-blue-200/80 rounded-xl p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Download size={18} className="text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-800">Need a format template?</p>
              <p className="text-[11px] text-slate-500 font-medium">Download sample Excel file with expected headers.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={downloadSample}
            className="px-3 py-1.5 bg-white border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer whitespace-nowrap"
          >
            Download Template
          </button>
        </div>

        {/* File Dropzone */}
        {!file && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/20 rounded-2xl p-8 text-center transition-all cursor-pointer relative group mb-4"
          >
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-xs">
              <Upload size={24} />
            </div>
            <p className="text-sm font-bold text-slate-800">
              Click to select or drag & drop Excel file
            </p>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Supports .xlsx, .xls, and .csv files
            </p>
          </div>
        )}

        {/* Selected File Details & Preview */}
        {file && (
          <div className="space-y-4 mb-4 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileSpreadsheet className="text-emerald-600 flex-shrink-0" size={20} />
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-800 truncate">{file.name}</p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {parsedData.length} record{parsedData.length === 1 ? "" : "s"} ready to upload
                  </p>
                </div>
              </div>
              <button
                disabled={uploading}
                onClick={handleReset}
                className="text-xs font-semibold text-red-600 hover:bg-red-50 px-2.5 py-1 rounded-lg border border-red-200/60 transition-colors"
              >
                Change File
              </button>
            </div>

            {/* PREVIEW TABLE */}
            {parsedData.length > 0 && (
              <div className="flex-1 overflow-hidden border border-slate-200 rounded-xl flex flex-col">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Data Preview ({parsedData.length} Rows)
                  </span>
                </div>
                <div className="overflow-auto flex-1 max-h-48">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0 border-b border-slate-200">
                      <tr>
                        {Object.keys(parsedData[0]).map((key) => (
                          <th key={key} className="py-2 px-3 whitespace-nowrap">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {parsedData.slice(0, 10).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          {Object.keys(parsedData[0]).map((key) => (
                            <td key={key} className="py-2 px-3 whitespace-nowrap text-slate-700">
                              {String(row[key])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedData.length > 10 && (
                  <div className="bg-slate-50 px-3 py-1.5 text-[11px] text-slate-500 font-medium border-t border-slate-200 text-center">
                    Showing first 10 rows of {parsedData.length} records.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold p-3 rounded-xl flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Progress Bar during Upload */}
        {uploading && (
          <div className="mb-4 space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Uploading records...</span>
              <span>{progress.current} / {progress.total}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
          <button
            disabled={uploading}
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            disabled={uploading || parsedData.length === 0}
            onClick={handleSubmit}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              `Import ${parsedData.length} Records`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
