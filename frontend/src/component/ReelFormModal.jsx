import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const ReelFormModal = ({
  visible,
  onClose,
  onSubmit,
  initialValues,
  filterType,
  existingReels,
}) => {
  const [form, setForm] = useState({});
  const [isReelFull, setIsReelFull] = useState(false);

  useEffect(() => {
    setForm(initialValues || {});
    setIsReelFull(false);
  }, [initialValues, visible, filterType]);

  const checkReelAvailability = (updatedForm) => {
    let exists = false;

    if (filterType === "in") {
      exists = existingReels?.some(
        (item) =>
          item.rackNo === updatedForm.rackNo && item.id !== initialValues?.id,
      );
    }

    if (filterType === "out") {
      exists = existingReels?.some(
        (item) =>
          item.partNo === updatedForm.partNo && item.id !== initialValues?.id,
      );
    }

    setIsReelFull(exists);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);
    checkReelAvailability(updatedForm);
  };

  const handleSubmit = () => {
    onSubmit(form);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div
        className="
          relative z-10
          w-full
          max-w-md
          bg-white
          rounded-2xl
          shadow-2xl
          border border-slate-200
          p-6
          max-h-[90vh]
          overflow-y-auto
        "
      >
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
          <h2 className="text-lg font-extrabold text-slate-900">
            {initialValues ? "Edit Reel Record" : "Add Reel Record"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* IN TYPE */}
        {filterType === "in" && (
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Rack No
            </label>
            <input
              type="text"
              name="rackNo"
              value={form.rackNo || ""}
              onChange={handleChange}
              placeholder="e.g. R1-A"
              className="
                w-full
                bg-slate-50 border border-slate-200
                rounded-xl
                px-3.5 py-2.5
                text-sm text-slate-800
                focus:bg-white focus:outline-none
                focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600
                transition-all
              "
            />

            {isReelFull && (
              <p className="text-red-600 text-xs font-semibold mt-1">Reel is engaged</p>
            )}
          </div>
        )}

        {/* OUT TYPE */}
        {filterType === "out" && (
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Part No
            </label>
            <input
              type="text"
              name="partNo"
              value={form.partNo || ""}
              onChange={handleChange}
              placeholder="e.g. PN-9902"
              className="
                w-full
                bg-slate-50 border border-slate-200
                rounded-xl
                px-3.5 py-2.5
                text-sm text-slate-800
                focus:bg-white focus:outline-none
                focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600
                transition-all
              "
            />

            {isReelFull && (
              <p className="text-red-600 text-xs font-semibold mt-1">Reel is full</p>
            )}
          </div>
        )}

        {/* QUANTITY FIELDS */}
        {filterType === "in" && (
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reel Qty
            </label>
            <input
              type="number"
              name="reelQty"
              value={form.reelQty || ""}
              onChange={handleChange}
              className="
                w-full
                bg-slate-50 border border-slate-200
                rounded-xl
                px-3.5 py-2.5
                text-sm text-slate-800
                focus:bg-white focus:outline-none
                focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600
                transition-all
              "
            />
          </div>
        )}

        {filterType === "out" && (
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Qty
            </label>
            <input
              type="number"
              name="qty"
              value={form.qty || ""}
              onChange={handleChange}
              className="
                w-full
                bg-slate-50 border border-slate-200
                rounded-xl
                px-3.5 py-2.5
                text-sm text-slate-800
                focus:bg-white focus:outline-none
                focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600
                transition-all
              "
            />
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div
          className="
            flex flex-col-reverse gap-3 mt-6
            sm:flex-row sm:justify-end
          "
        >
          <button
            onClick={onClose}
            className="
              w-full sm:w-auto
              px-4 py-2.5
              rounded-xl
              bg-slate-100
              hover:bg-slate-200
              text-slate-700
              text-sm font-semibold
              transition cursor-pointer
            "
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="
              w-full sm:w-auto
              px-5 py-2.5
              rounded-xl
              bg-blue-600
              hover:bg-blue-700
              text-white
              text-sm font-semibold
              shadow-xs
              transition cursor-pointer
            "
          >
            Save Record
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReelFormModal;
