import React, { useState } from "react";
import { Plus, Search } from "lucide-react";

export default function TitleHead(props) {
  const [searchValue, setSearchValue] = useState("");

  const { title, onAdd, onSearch } = props;

  return (
    <div
      className="
      w-full
      bg-white border border-slate-200 rounded-2xl
      p-4 sm:p-5 mb-6
      flex flex-col gap-4
      md:flex-row
      md:items-center
      md:justify-between
      shadow-xs
    "
    >
      {/* LEFT — TITLE */}
      <div className="w-full md:w-auto">
        {title && (
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h1>
        )}
      </div>

      {/* RIGHT SECTION */}
      <div
        className="
        w-full
        flex flex-col gap-3
        sm:flex-row
        sm:items-center
        md:w-auto
      "
      >
        {/* SEARCH */}
        {onSearch && (
          <div className="relative w-full sm:w-64 md:w-72">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={18} />
            </span>

            <input
              type="text"
              value={searchValue}
              placeholder={`Search ${title || "records"}...`}
              className="
                w-full
                bg-slate-50 border border-slate-200
                rounded-xl
                pl-10 pr-3.5 py-2.5
                text-sm text-slate-800 placeholder-slate-400
                focus:bg-white focus:outline-none
                focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600
                transition-all duration-200
              "
              onChange={(e) => {
                setSearchValue(e.target.value);
                onSearch && onSearch(e.target.value);
              }}
            />
          </div>
        )}

        {/* ADD BUTTON */}
        {onAdd && (
          <button
            onClick={onAdd}
            className="
              w-full sm:w-auto
              flex items-center justify-center gap-2
              px-5 py-2.5
              bg-blue-600 hover:bg-blue-700
              text-white text-sm font-semibold
              rounded-xl
              shadow-xs hover:shadow-md
              transition-all duration-200
              active:scale-95 cursor-pointer
            "
          >
            <Plus size={18} />
            Add {title}
          </button>
        )}
      </div>
    </div>
  );
}
