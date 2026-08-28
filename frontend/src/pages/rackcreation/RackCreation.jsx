// import { XIcon, Edit, Trash2 } from "lucide-react";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import { toast } from "sonner";
// import TitleHead from "../../component/layout/TitleHead";
// import ReusableTable from "../../component/ReusableTable";

// const RackCreation = () => {
//   const [showData, setShowData] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [editId, setEditId] = useState(null);

//   const [racks, setRacks] = useState([]);
//   const [filteredRacks, setFilteredRacks] = useState([]);

//   const [rackData, setRackData] = useState({
//     Id: "",
//     RackNo: "",
//     SubRowNo: "",
//     SubRowSlaveId: "",
//     Size: "",
//     SubTopic: "",
//     RB: "",
//     Username: "",
//     password: "",
//   });

//   const columns = [
//     { key: "id", label: "ID" },
//     { key: "rackNo", label: "Rack No" },
//     { key: "subRowNo", label: "Sub Row No" },
//     { key: "subRowSlaveId", label: "Sub Row Slave Id" },
//     { key: "size", label: "Size" },
//     { key: "subTopic", label: "Sub Topic" },
//     { key: "rb", label: "RB" },
//     { key: "username", label: "Username" },
//   ];

//   // Default filteredRacks should be racks
//   useEffect(() => {
//     setFilteredRacks(racks);
//   }, [racks]);

//   // Open add modal
//   const handleShowAddModal = () => {
//     setIsEditMode(false);
//     setShowData(true);
//     resetForm();
//   };

//   // Open edit modal
//   const openEditModal = (row) => {
//     setIsEditMode(true);
//     setShowData(true);
//     setEditId(row.id);
//     setRackData({
//       Id: row.id,
//       RackNo: row.rackNo,
//       SubRowNo: row.subRowNo,
//       SubRowSlaveId: row.subRowSlaveId,
//       Size: row.size,
//       SubTopic: row.subTopic,
//       RB: row.rb,
//       Username: row.username,
//       password: "",
//     });
//   };

//   // Reset form
//   const resetForm = () => {
//     setRackData({
//       Id: "",
//       RackNo: "",
//       SubRowNo: "",
//       SubRowSlaveId: "",
//       Size: "",
//       SubTopic: "",
//       RB: "",
//       Username: "",
//       password: "",
//     });
//   };

//   // Close modal
//   const handleCloseModal = () => {
//     setShowData(false);
//     setIsEditMode(false);
//     setEditId(null);
//     resetForm();
//   };

//   // GET racks
//   const getRack = async () => {
//     try {
//       const res = await axios.get("http://localhost:3000/api/racks");
//       setRacks(res.data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   useEffect(() => {
//     getRack();
//   }, []);

//   // CREATE rack
//   const createRack = async () => {
//     try {
//       const res = await axios.post("http://localhost:3000/api/racks", rackData);
//       setRacks([...racks, res.data]);
//       toast.success("Rack Created Successfully");
//       handleCloseModal();
//     } catch (error) {
//       toast.error("Failed to Create Rack");
//     }
//   };

//   // UPDATE rack
//   const updateRack = async () => {
//     try {
//       const res = await axios.put(
//         `http://localhost:3000/api/racks/${editId}`,
//         rackData,
//       );

//       setRacks((prev) =>
//         prev.map((item) => (item.id === editId ? res.data : item)),
//       );

//       toast.success("Updated Rack Successfully");
//       handleCloseModal();
//     } catch (error) {
//       toast.error("Update Failed");
//     }
//   };

//   // DELETE rack
//   const deleteRack = async (id) => {
//     const confirmed = window.confirm(
//       "Are you sure you want to delete this rack?",
//     );
//     if (!confirmed) return;

//     try {
//       await axios.delete(`http://localhost:3000/api/racks/${id}`);

//       setRacks((prev) => prev.filter((item) => item.id !== id));

//       toast.success("Rack Deleted Successfully!");
//     } catch (error) {
//       toast.error("Delete Failed!");
//     }
//   };

//   // SEARCH racks
//   const handleRackSearch = (value) => {
//     const search = value.toLowerCase();

//     if (!search.trim()) {
//       setFilteredRacks(racks);
//       return;
//     }

//     const result = racks.filter(
//       (item) =>
//         item.rackNo?.toLowerCase().includes(search) ||
//         item.subRowNo?.toLowerCase().includes(search) ||
//         item.subRowSlaveId?.toLowerCase().includes(search) ||
//         item.size?.toString().includes(search) ||
//         item.subTopic?.toLowerCase().includes(search) ||
//         item.rb?.toString().includes(search) ||
//         item.username?.toLowerCase().includes(search),
//     );

//     setFilteredRacks(result);
//   };

//   return (
//     <div className="w-full min-h-screen bg-slate-50 animate-slide-up">
//       <TitleHead
//         title="Rack Creation"
//         handleClick={handleShowAddModal}
//         buttontitle="Create Rack"
//         onSearch={handleRackSearch} // If your TitleHead supports search
//       />

//       {/* Table */}
//       <div className="w-full px-6 mt-4">
//         <ReusableTable
//           columns={columns}
//           data={filteredRacks}
//           onEdit={(row) => openEditModal(row)}
//           onDelete={(row) => deleteRack(row.id)}
//           actionLabel="Edit"
//           actionIcon={<Edit className="w-4" />}
//           deleteIcon={<Trash2 className="w-4 text-red-500" />}
//         />
//       </div>

//       {/* Modal */}
//       {showData && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl w-[80%] max-h-[85%] overflow-y-auto p-8 shadow-2xl border border-slate-200">
//             <div className="flex justify-between items-center mb-6">
//               <h1 className="font-bold text-2xl text-slate-700">
//                 {isEditMode ? "Edit Rack" : "Create Rack"}
//               </h1>
//               <button
//                 onClick={handleCloseModal}
//                 className="text-slate-300 hover:text-slate-600 hover:scale-110 transition-transform"
//               >
//                 <XIcon size={28} />
//               </button>
//             </div>

//             {/* Form */}
//             <form className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
//               {/* Rack No */}
//               <div>
//                 <label className="block font-semibold text-slate-700 mb-2">
//                   Rack No
//                 </label>
//                 <select
//                   className="w-full p-3 border-2 rounded-lg bg-indigo-50 border-slate-200"
//                   value={rackData.RackNo}
//                   onChange={(e) =>
//                     setRackData({ ...rackData, RackNo: e.target.value })
//                   }
//                 >
//                   <option value=" ">-- select --</option>
//                   <option>R1</option>
//                   <option>R2</option>
//                   <option>R3</option>
//                   <option>R4</option>
//                 </select>
//               </div>

//               {/* Sub Row No */}
//               <div>
//                 <label className="block font-semibold text-slate-700 mb-2">
//                   Sub Row No
//                 </label>
//                 <select
//                   className="w-full p-3 border-2 rounded-lg bg-indigo-50 border-slate-200"
//                   value={rackData.SubRowNo}
//                   onChange={(e) =>
//                     setRackData({ ...rackData, SubRowNo: e.target.value })
//                   }
//                 >
//                   <option value="">-- select --</option>
//                   <option>01</option>
//                   <option>02</option>
//                   <option>03</option>
//                   <option>04</option>
//                 </select>
//               </div>

//               {/* Slave ID */}
//               <div>
//                 <label className="block font-semibold text-slate-700 mb-2">
//                   Sub Row Slave Id
//                 </label>
//                 <select
//                   className="w-full p-3 border-2 rounded-lg bg-indigo-50 border-slate-200"
//                   value={rackData.SubRowSlaveId}
//                   onChange={(e) =>
//                     setRackData({ ...rackData, SubRowSlaveId: e.target.value })
//                   }
//                 >
//                   <option value="">-- select --</option>
//                   <option>11</option>
//                   <option>12</option>
//                   <option>13</option>
//                   <option>14</option>
//                 </select>
//               </div>

//               {/* Size */}
//               <div>
//                 <label className="block font-semibold text-slate-700 mb-2">
//                   Size
//                 </label>
//                 <select
//                   className="w-full p-3 border-2 rounded-lg bg-indigo-50 border-slate-200"
//                   value={rackData.Size}
//                   onChange={(e) =>
//                     setRackData({ ...rackData, Size: Number(e.target.value) })
//                   }
//                 >
//                   <option value="">-- select --</option>
//                   <option value="8">8</option>
//                   <option value="12">12</option>
//                   <option value="15">15</option>
//                   <option value="24">24</option>
//                 </select>
//               </div>

//               {/* Sub Topic */}
//               <div>
//                 <label className="block font-semibold text-slate-700 mb-2">
//                   Sub Topic
//                 </label>
//                 <input
//                   className="w-full p-3 border-2 rounded-lg bg-indigo-50 border-slate-200"
//                   placeholder="Enter Sub Topic"
//                   value={rackData.SubTopic}
//                   onChange={(e) =>
//                     setRackData({ ...rackData, SubTopic: e.target.value })
//                   }
//                 />
//               </div>

//               {/* RB */}
//               <div>
//                 <label className="block font-semibold text-slate-700 mb-2">
//                   RB
//                 </label>
//                 <input
//                   type="number"
//                   className="w-full p-3 border-2 rounded-lg bg-indigo-50 border-slate-200"
//                   placeholder="Enter RB"
//                   value={rackData.RB}
//                   onChange={(e) =>
//                     setRackData({ ...rackData, RB: e.target.value })
//                   }
//                 />
//               </div>

//               {/* Username */}
//               <div>
//                 <label className="block font-semibold text-slate-700 mb-2">
//                   Username
//                 </label>
//                 <input
//                   className="w-full p-3 border-2 rounded-lg bg-indigo-50 border-slate-200"
//                   placeholder="Enter Username"
//                   value={rackData.Username}
//                   onChange={(e) =>
//                     setRackData({ ...rackData, Username: e.target.value })
//                   }
//                 />
//               </div>

//               {/* Password */}
//               <div>
//                 <label className="block font-semibold text-slate-700 mb-2">
//                   Password
//                 </label>
//                 <input
//                   type="password"
//                   className="w-full p-3 border-2 rounded-lg bg-indigo-50 border-slate-200"
//                   placeholder="Enter Password"
//                   value={rackData.password}
//                   onChange={(e) =>
//                     setRackData({ ...rackData, password: e.target.value })
//                   }
//                 />
//               </div>
//             </form>

//             <div className="flex justify-end mt-10 gap-4">
//               <button
//                 className="px-6 py-3 border-2 border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-100 transition"
//                 onClick={handleCloseModal}
//               >
//                 Cancel
//               </button>

//               {isEditMode ? (
//                 <button
//                   className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-slate-600 text-white rounded-lg shadow-md hover:scale-105"
//                   onClick={updateRack}
//                 >
//                   Update Rack
//                 </button>
//               ) : (
//                 <button
//                   className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-slate-600 text-white rounded-lg shadow-md hover:scale-105"
//                   onClick={createRack}
//                 >
//                   Create Rack
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RackCreation;
