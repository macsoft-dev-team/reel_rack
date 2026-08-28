import React, { useEffect, useState } from "react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal Box */}
      <div
        className="
          relative z-10
          w-full
          max-w-md
          bg-white
          rounded-xl
          shadow-2xl
          p-5 sm:p-6
          max-h-[90vh]
          overflow-y-auto
        "
      >
        <h2 className="text-lg sm:text-xl font-semibold mb-5">
          {initialValues ? "Edit Reel" : "Add Reel"}
        </h2>

        {/* IN TYPE */}
        {filterType === "in" && (
          <div className="mb-4">
            <label className="block text-sm font-medium">Rack No</label>
            <input
              type="text"
              name="rackNo"
              value={form.rackNo || ""}
              onChange={handleChange}
              className="
                w-full
                border border-slate-300
                rounded-lg
                px-3 py-2 mt-1
                text-sm
                focus:outline-none
                focus:ring-2 focus:ring-indigo-500/40
              "
            />

            {isReelFull && (
              <p className="text-red-600 text-xs mt-1">Reel is engaged</p>
            )}
          </div>
        )}

        {/* OUT TYPE */}
        {filterType === "out" && (
          <div className="mb-4">
            <label className="block text-sm font-medium">Part No</label>
            <input
              type="text"
              name="partNo"
              value={form.partNo || ""}
              onChange={handleChange}
              className="
                w-full
                border border-slate-300
                rounded-lg
                px-3 py-2 mt-1
                text-sm
                focus:outline-none
                focus:ring-2 focus:ring-indigo-500/40
              "
            />

            {isReelFull && (
              <p className="text-red-600 text-xs mt-1">Reel is full</p>
            )}
          </div>
        )}

        {/* QUANTITY FIELDS */}
        {filterType === "in" && (
          <div className="mb-4">
            <label className="block text-sm font-medium">Reel Qty</label>
            <input
              type="number"
              name="reelQty"
              value={form.reelQty || ""}
              onChange={handleChange}
              className="
                w-full
                border border-slate-300
                rounded-lg
                px-3 py-2 mt-1
                text-sm
                focus:outline-none
                focus:ring-2 focus:ring-indigo-500/40
              "
            />
          </div>
        )}

        {filterType === "out" && (
          <div className="mb-4">
            <label className="block text-sm font-medium">Qty</label>
            <input
              type="number"
              name="qty"
              value={form.qty || ""}
              onChange={handleChange}
              className="
                w-full
                border border-slate-300
                rounded-lg
                px-3 py-2 mt-1
                text-sm
                focus:outline-none
                focus:ring-2 focus:ring-indigo-500/40
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
              px-4 py-2
              rounded-lg
              bg-slate-200
              hover:bg-slate-300
              text-sm
              transition
            "
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="
              w-full sm:w-auto
              px-4 py-2
              rounded-lg
              bg-indigo-600
              hover:bg-indigo-700
              text-white
              text-sm
              transition
            "
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReelFormModal;
