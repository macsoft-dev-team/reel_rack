import { Plus, Search } from "lucide-react";
import { useState } from "react";

export default function TitleHead(props) {
  const [searchValue, setSearchValue] = useState("");

  const { title, onAdd, onSearch, showSearch = false } = props;

  return (
    <div
      className="
      w-full
      border-b border-slate-200
      py-4 px-4
      flex flex-col gap-4
      md:flex-row
      md:items-center
      md:justify-between
    "
    >
      {/* LEFT — TITLE */}
      <div className="w-full md:w-auto">
        {title && (
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-950 uppercase tracking-widest">
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
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <Search size={18} />
            </span>

            <input
              type="text"
              value={searchValue}
              placeholder="Search..."
              className="
                w-full
                border border-slate-300
                rounded-lg
                pl-10 pr-3 py-2
                text-sm sm:text-base
                focus:outline-none
                focus:ring-2 focus:ring-blue-900/30
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
              bg-blue-950 hover:bg-blue-900
              text-white text-sm font-semibold
              rounded-lg
              shadow-md hover:shadow-lg
              transition-all duration-200
              active:scale-95
            "
          >
            <Plus size={16} />
            Add {title}
          </button>
        )}
      </div>
    </div>
  );
}
