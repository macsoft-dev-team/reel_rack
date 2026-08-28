// import { Bell } from "lucide-react";
// import logo from "../../assets/Logo.jpg";
// import { useNavigate } from "react-router-dom";
// import { useState, useEffect } from "react";

// export default function Header() {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     // Get user info from sessionStorage
//     const userDataString = sessionStorage.getItem("user");
//     if (userDataString) {
//       try {
//         const userData = JSON.parse(userDataString);
//         setUser(userData);
//       } catch (error) {
//         console.error("Error parsing user data:", error);
//       }
//     }
//   }, []);

//   // Get avatar initial
//   const avatarInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";
//   const userName = user?.name || "User";
//   const employeeId = user?.employeeId || "N/A";

//   return (
//     <header className="bg-white shadow-sm px-6 py-1 max-h-14  top-0 z-50 sticky ">
//       <div className="flex items-center justify-between max-w-full mx-auto">
//         {/* LOGO */}
//         <div className="flex items-center gap-3">
//           <img src={logo} alt="Logo" className="w-5 h-5" />
//           <div>
//             <h1 className="text-base font-bold text-slate-800">MACSOFT</h1>
//             <p className="text-xs text-slate-500">Reel Rack Management</p>
//           </div>
//         </div>

//         {/* RIGHT SECTION */}
//         <div className="flex items-center gap-2 ">
          
//           <div
//             className="group flex items-center gap-4 bg-white/70 backdrop-blur-md 
//                 px-3  rounded-xl  shadow-sm border border-slate-200
//                 hover:shadow-md hover:-translate-y-px 
//                 transition-all duration-300 cursor-pointer max"
//           >
//             {/* Avatar */}
//             <div className="relative">
//               <div
//                 className="w-6 h-6 rounded-xl bg-linear-to-br 
//                     from-indigo-500 to-purple-600 
//                     flex items-center justify-center 
//                     text-white font-semibold text-xs shadow-md"
//               >
//                 {avatarInitial}
//               </div>
//             </div>

//             {/* User Info */}
//             <div className="">
//               <span className="font-semibold text-slate-700 block uppercase text-xs">
//                 {userName}
//               </span>
//               <span className="text-xs text-slate-500 tracking-wide">
//                 ID: {employeeId}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }
