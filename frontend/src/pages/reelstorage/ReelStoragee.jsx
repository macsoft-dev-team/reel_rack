// import React, { useEffect, useState } from "react";
// import { Edit } from "lucide-react";
// import TitleHead from "../../component/layout/TitleHead";
// import ReusableTable from "../../component/ReusableTable";
// import ReelFormModal from "../../component/ReelFormModal";
// import { toast } from "sonner";
// import axios from "axios";

// const ReelStorage = () => {
//   const [showModal, setShowModal] = useState(false);
//   const [editItem, setEditItem] = useState(null);
//   const [filterType, setFilterType] = useState("in");

//   const [reelData, setReelData] = useState([]);
//   const [filteredReel, setFilteredReel] = useState([]);

//   /*  STATUS BADGE  */
//   const getStatusBadge = (status) => {
//     const base = "px-2 py-1 rounded-full text-xs font-semibold inline-block";

//     switch (status) {
//       case "PENDING":
//         return (
//           <span className={`${base} bg-yellow-100 text-yellow-700`}>
//             PENDING
//           </span>
//         );
//       case "RECEIVED":
//       case "DISPATCHED":
//         return (
//           <span className={`${base} bg-green-100 text-green-700`}>
//             {status}
//           </span>
//         );
//       case "FAILED":
//         return (
//           <span className={`${base} bg-red-100 text-red-700`}>FAILED</span>
//         );
//       default:
//         return (
//           <span className={`${base} bg-slate-100 text-slate-600`}>IDLE</span>
//         );
//     }
//   };

//   /*  FETCH  */
//   const getReel = async () => {
//     try {
//       const res = await axios.get("http://localhost:3000/api/reels", {
//         params: { status: filterType },
//       });

//       const withStatus = res.data.map((item) => ({
//         ...item,
//         status: item.status || "IDLE",
//       }));

//       setReelData(withStatus);
//     } catch {
//       toast.error("Failed to fetch reel data");
//     }
//   };

//   useEffect(() => {
//     getReel();
//   }, [filterType]);

//   /*  REFRESH TABLE  */
//   useEffect(() => {
//     setFilteredReel(
//       reelData
//         .filter((i) => i.type === filterType)
//         .map((item) => ({
//           ...item,
//           status: getStatusBadge(item.status),
//         })),
//     );
//   }, [reelData, filterType]);

//   /*  VALIDATION  */
//   const validateForm = (formValues) => {
//     if (filterType === "in") {
//       if (!formValues.rackNo || !formValues.reelQty) {
//         toast.error("Please fill Rack No and Reel Qty");
//         return false;
//       }
//       if (isNaN(formValues.reelQty)) {
//         toast.error("Reel Qty must be a number");
//         return false;
//       }
//       if (Number(formValues.reelQty) <= 0) {
//         toast.error("Reel Qty must be greater than 0");
//         return false;
//       }
//     }

//     if (filterType === "out") {
//       if (!formValues.partNo || !formValues.qty) {
//         toast.error("Please fill Part No and Qty");
//         return false;
//       }
//       if (isNaN(formValues.qty)) {
//         toast.error("Qty must be a number");
//         return false;
//       }
//       if (Number(formValues.qty) <= 0) {
//         toast.error("Qty must be greater than 0");
//         return false;
//       }
//     }

//     return true;
//   };

//   const checkDuplicate = (formValues) => {
//     if (filterType === "in") {
//       const exists = reelData.some(
//         (i) =>
//           i.type === "in" &&
//           i.rackNo === formValues.rackNo &&
//           i.id !== editItem?.id,
//       );
//       if (exists) {
//         toast.error("This Rack already has a reel");
//         return true;
//       }
//     }

//     if (filterType === "out") {
//       const exists = reelData.some(
//         (i) =>
//           i.type === "out" &&
//           i.partNo === formValues.partNo &&
//           i.id !== editItem?.id,
//       );
//       if (exists) {
//         toast.error("This Part already exists in OUT");
//         return true;
//       }
//     }

//     return false;
//   };

//   /*  TIMEOUT  */
//   const startAckTimeout = (key, type) => {
//     setTimeout(() => {
//       setReelData((prev) =>
//         prev.map((item) =>
//           type === "in"
//             ? item.type === "in" &&
//               item.rackNo === key &&
//               item.status === "PENDING"
//               ? { ...item, status: "FAILED" }
//               : item
//             : item.type === "out" &&
//                 item.partNo === key &&
//                 item.status === "PENDING"
//               ? { ...item, status: "FAILED" }
//               : item,
//         ),
//       );
//       toast.error("Hardware not responding. Marked as FAILED");
//     }, 10000);
//   };

//   /*  CREATE  */
//   const createReel = async (formValues) => {
//     const payload = {
//       ...formValues,
//       type: filterType,
//       status: "PENDING",
//     };

//     const res = await axios.post("http://localhost:3000/api/reels", payload);

//     setReelData((prev) => [res.data, ...prev]);

//     if (filterType === "in") {
//       publishReelIn(formValues.rackNo, formValues.reelQty);
//       startAckTimeout(formValues.rackNo, "in");
//     } else {
//       publishReelOut(formValues.partNo, formValues.qty);
//       startAckTimeout(formValues.partNo, "out");
//     }

//     toast.success("Reel sent to hardware");
//   };

//   /*  UPDATE  */
//   const updateReel = async (formValues) => {
//     const payload = {
//       ...formValues,
//       type: filterType,
//       status: "PENDING",
//     };

//     const res = await axios.put(
//       `http://localhost:3000/api/reels/${editItem.id}`,
//       payload,
//     );

//     setReelData((prev) =>
//       prev.map((i) => (i.id === editItem.id ? res.data : i)),
//     );

//     if (filterType === "in") {
//       publishReelIn(formValues.rackNo, formValues.reelQty);
//       startAckTimeout(formValues.rackNo, "in");
//     } else {
//       publishReelOut(formValues.partNo, formValues.qty);
//       startAckTimeout(formValues.partNo, "out");
//     }

//     toast.success("Reel updated & sent");
//   };

//   const handleSubmit = async (formValues) => {
//     if (!validateForm(formValues)) return;
//     if (checkDuplicate(formValues)) return;

//     editItem ? await updateReel(formValues) : await createReel(formValues);
//     setShowModal(false);
//   };

//   /*  SEARCH  */
//   const handleReelSearch = (value) => {
//     const search = value.toLowerCase();

//     const result = reelData
//       .filter((i) => i.type === filterType)
//       .filter((item) =>
//         filterType === "in"
//           ? item.rackNo?.toLowerCase().includes(search)
//           : item.partNo?.toLowerCase().includes(search),
//       )
//       .map((item) => ({
//         ...item,
//         status: getStatusBadge(item.status),
//       }));

//     setFilteredReel(search ? result : result);
//   };

//   const columns = {
//     in: [
//       { key: "id", label: "ID" },
//       { key: "type", label: "Type" },
//       { key: "reelposition", label: "Reel Position" },
//       { key: "reelQty", label: "Reel Qty" },
//       { key: "status", label: "Status" },
//     ],
//     out: [
//       { key: "id", label: "ID" },
//       { key: "type", label: "Type" },
//       { key: "partNo", label: "Part No" },
//       { key: "qty", label: "Qty" },
//       { key: "status", label: "Status" },
//     ],
//   };

//   return (
//     <div className="min-h-screen bg-slate-50">
//       <TitleHead
//         title="Reel Storage"
//         buttontitle="Add Reel"
//         handleClick={() => {
//           setEditItem(null);
//           setShowModal(true);
//         }}
//         onSearch={handleReelSearch}
//       />

//       <div className="flex justify-end my-4 px-10">
//         <div className="flex bg-slate-200 rounded-full p-1 border">
//           {["in", "out"].map((t) => (
//             <button
//               key={t}
//               onClick={() => setFilterType(t)}
//               className={`px-6 py-2 rounded-full ${
//                 filterType === t ? "bg-indigo-600 text-white" : "text-slate-700"
//               }`}
//             >
//               {t.toUpperCase()}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div className="px-6">
//         <ReusableTable
//           columns={columns[filterType]}
//           data={filteredReel}
//           onEdit={(item) => {
//             setEditItem(item);
//             setShowModal(true);
//           }}
//           actionLabel="Edit"
//           actionIcon={<Edit className="w-4" />}
//         />
//       </div>

//       <ReelFormModal
//         visible={showModal}
//         onClose={() => setShowModal(false)}
//         onSubmit={handleSubmit}
//         initialValues={editItem}
//         filterType={filterType}
//       />
//     </div>
//   );
// };

// export default ReelStorage;
