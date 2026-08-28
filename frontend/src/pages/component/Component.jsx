import { Edit, Trash2, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import ReusableTable from "../../component/ReusableTable";
import BulkUploadModal from "../../component/BulkUploadModal";
import axiosInstance from "../../api/axiosConfig";
import { toast } from "sonner";

const Component = () => {
  const [showModal, setShowModal] = useState(false);
  const [datas, setDatas] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);

  const [formData, setFormData] = useState({
    componentType: "",
    package: "",
    manufacturer: "",
    manufacturerPartNo: "",
    macsoftPartNo: "",
    minimumStockQty: "",
    reelSize: "",
    reelQty: "",
  });

  const resetForm = () => {
    setFormData({
      componentType: "",
      package: "",
      manufacturer: "",
      manufacturerPartNo: "",
      macsoftPartNo: "",
      minimumStockQty: "",
      reelSize: "",
      reelQty: "",
    });
  };

  const handleAddClick = () => {
    setEditItem(null);
    resetForm();
    setShowModal(true);
  };

  const getComponents = async () => {
    try {
      const res = await axiosInstance.get("/component");
      setDatas(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const getManufacturers = async () => {
    try {
      const res = await axiosInstance.get("/manufacturer");
      setManufacturers(res.data);
    } catch (error) {
      console.error("Failed to fetch manufacturers:", error);
    }
  };

  useEffect(() => {
    getComponents();
    getManufacturers();
  }, []);

  const createComponent = async () => {
    try {
      const normalizedData = {
        ...formData,
        minimumStockQty: parseInt(formData.minimumStockQty || 0),
        reelSize: parseInt(formData.reelSize || 0),
        reelQty: parseInt(formData.reelQty || 0),
      };

      const user = sessionStorage.getItem("user");
      let performedByUserId;
      try {
        performedByUserId = user ? JSON.parse(user).id : undefined;
      } catch (e) { }
      const res = await axiosInstance.post("/component", {
        ...normalizedData,
        performedByUserId,
      });

      setDatas([...datas, res.data]);
      setShowModal(false);
      toast.success("Component Created Successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to Create Component");
    }
  };

  const updateComponent = async () => {
    try {
      const normalizedData = {
        ...formData,
        minimumStockQty: parseInt(formData.minimumStockQty || 0),
        reelSize: parseInt(formData.reelSize || 0),
        reelQty: parseInt(formData.reelQty || 0),
      };

      const user = sessionStorage.getItem("user");
      let performedByUserId;
      try {
        performedByUserId = user ? JSON.parse(user).id : undefined;
      } catch (e) { }
      const res = await axiosInstance.put(`/component/${editItem.id}`, {
        ...normalizedData,
        performedByUserId,
      });

      setDatas((prev) =>
        prev.map((item) => (item.id === editItem.id ? res.data : item)),
      );

      setShowModal(false);
      toast.success("Component Updated Successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to Update Component");
    }
  };

  const deleteComponent = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this component?",
    );
    if (!confirmed) return;

    try {
      const user = sessionStorage.getItem("user");
      let performedByUserId;
      try {
        performedByUserId = user ? JSON.parse(user).id : undefined;
      } catch (e) { }
      await axiosInstance.delete(`/component/${id}`, {
        params: { performedByUserId },
      });

      setDatas((prev) => prev.filter((item) => item.id !== id));
      toast.success("Component Deleted Successfully!");
      setShowModal(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to Delete Component");
    }
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const columns = [
    { key: "componentType", label: "Component Type" },
    { key: "package", label: "Package" },
    { key: "manufacturer", label: "Manufacturer" },
    { key: "manufacturerPartNo", label: "Manufacturer Part No" },
    { key: "macsoftPartNo", label: "Macsoft Part No" },
    { key: "minimumStockQty", label: "Min Stock" },
    { key: "reelSize", label: "Reel Size" },
    { key: "reelQty", label: "Reel Qty" },
  ];

  const handleSearch = (value) => {
    const search = value.toLowerCase();

    if (!search) {
      setFilteredData(datas);
      return;
    }

    const result = datas.filter(
      (item) =>
        item.componentType?.toLowerCase().includes(search) ||
        item.manufacturer?.toLowerCase().includes(search) ||
        item.package?.toLowerCase().includes(search) ||
        item.manufacturerPartNo?.toLowerCase().includes(search) ||
        item.macsoftPartNo?.toLowerCase().includes(search),
    );

    setFilteredData(result);
  };

  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const handleBulkUploadSubmit = async (rows, onProgress) => {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      await axiosInstance.post("/component", {
        componentType: row.componentType || row["Component Type"] || "",
        package: row.package || row["Package"] || "",
        manufacturer: row.manufacturer || row["Manufacturer"] || "",
        manufacturerPartNo: row.manufacturerPartNo || row["Manufacturer Part No"] || "",
        macsoftPartNo: row.macsoftPartNo || row["Macsoft Part No"] || "",
        minimumStockQty: Number(row.minimumStockQty || row["Minimum Stock Qty"] || 0),
        reelSize: row.reelSize || row["Reel Size"] || "",
        reelQty: Number(row.reelQty || row["Reel Qty"] || 0),
      });
      if (onProgress) onProgress(i + 1, rows.length);
    }
    fetchComponents();
  };

  return (
    <div className="w-full">
      <ReusableTable
        data={filteredData.length > 0 ? filteredData : datas}
        columns={columns}
        onSearch={handleSearch}
        searchPlaceholder="Search components..."
        onAdd={handleAddClick}
        addLabel="Add Component"
        onBulkUpload={() => setShowBulkUpload(true)}
        bulkUploadLabel="Bulk Upload "
        onEdit={openEditModal}
        onDelete={(row) => deleteComponent(row.id)}
        actionIcon={
          <Edit className="w-4 h-4 text-blue-600 hover:text-blue-800 transition-colors" />
        }
        deleteIcon={
          <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700 transition-colors" />
        }
        pageSize={5}
      />

      {/* BULK UPLOAD MODAL */}
      <BulkUploadModal
        visible={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        title="Components"
        sampleRows={[
          {
            componentType: "Resistor",
            package: "0603",
            manufacturer: "Yageo",
            manufacturerPartNo: "RC0603FR-0710KL",
            macsoftPartNo: "COMP-101",
            minimumStockQty: 500,
            reelSize: "7 inch",
            reelQty: 5000,
          },
        ]}
        onUploadSubmit={handleBulkUploadSubmit}
      />

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800">
                {editItem ? "Update Component" : "Create New Component"}
              </h2>
              <button
                className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                onClick={() => setShowModal(false)}
              >
                <XIcon size={20} />
              </button>
            </div>

            {/* Body / Form */}
            <div className="p-4 sm:p-6 overflow-y-auto">
              {/* Responsive Grid: 1 col on mobile, 2 on tablet, 4 on desktop */}
              <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {/* Component Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Component Type
                  </label>
                  <select
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    value={formData.componentType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        componentType: e.target.value,
                      })
                    }
                  >
                    <option value="" disabled>
                      -- select --
                    </option>
                    <option value="Resistor">Resistor</option>
                    <option value="Capacitor">Capacitor</option>
                    <option value="Inductor">Inductor</option>
                    <option value="IC">IC</option>
                  </select>
                </div>

                {/* Package */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Package
                  </label>
                  <select
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    value={formData.package}
                    onChange={(e) =>
                      setFormData({ ...formData, package: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      -- select --
                    </option>
                    <option value="0805">0805</option>
                    <option value="0603">0603</option>
                    <option value="SOT-23">SOT-23</option>
                    <option value="DIP">DIP</option>
                  </select>
                </div>

                {/* Manufacturer */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Manufacturer
                  </label>
                  <select
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    value={formData.manufacturer}
                    onChange={(e) =>
                      setFormData({ ...formData, manufacturer: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      -- select --
                    </option>
                    {manufacturers.map((mfg) => (
                      <option key={mfg.id} value={mfg.name}>
                        {mfg.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Manufacturer Part No */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Manufacturer Part No
                  </label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    placeholder="e.g. CR0805F..."
                    value={formData.manufacturerPartNo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        manufacturerPartNo: e.target.value,
                      })
                    }
                  />
                </div>

                {/* MacSoft Part No */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    MacSoft Part No
                  </label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    placeholder="e.g. MS-RES-001"
                    value={formData.macsoftPartNo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        macsoftPartNo: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Minimum Stock */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Minimum Stock Qty
                  </label>
                  <input
                    type="number"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    placeholder="0"
                    value={formData.minimumStockQty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minimumStockQty: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Reel Size */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Reel Size
                  </label>
                  <select
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    value={formData.reelSize}
                    onChange={(e) =>
                      setFormData({ ...formData, reelSize: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      -- select --
                    </option>
                    <option value="7">7 inch</option>
                    <option value="13">13 inch</option>
                    <option value="15">15 inch</option>
                  </select>
                </div>

                {/* Reel Qty */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Reel Qty
                  </label>
                  <input
                    type="number"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    placeholder="0"
                    value={formData.reelQty}
                    onChange={(e) =>
                      setFormData({ ...formData, reelQty: e.target.value })
                    }
                  />
                </div>
              </form>
            </div>

            {/* Footer / Actions - Stacks vertically on mobile, horizontal on tablet+ */}
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={editItem ? updateComponent : createComponent}
              >
                {editItem ? "Save Changes" : "Save Component"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Component;
