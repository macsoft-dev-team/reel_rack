import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Boxes,
  Layers,
  History,
  Warehouse,
  ListChecks,
  Users,
  Menu,
  X,
  ArrowRight,
  Factory,
  Film,
} from "lucide-react";
import logo from "../../assets/Logo.jpg";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navItems = [
    { label: "Pick List", path: "/picklist", icon: ListChecks },
    { label: "Components", path: "/component", icon: Boxes },
    { label: "Racks", path: "/racks", icon: Layers },
    { label: "Reel", path: "/reel", icon: Film },
    { label: "Inventory", path: "/inventory", icon: Warehouse },
    { label: "History", path: "/inventoryhistory", icon: Warehouse },
    { label: "User", path: "/user", icon: Users },
    { label: "Audit Log", path: "/auditlog", icon: History },
    { label: "Manufacturer", path: "/manufecturer", icon: Factory },
  ];

  const avatarInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";
  const userName = user?.name || "User";
  const employeeId = user?.employeeId || "N/A";

  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <>
      {/* MOBILE HEADER */}
      <header className="lg:hidden fixed top-0 left-0 w-full z-50 bg-blue-950 shadow-md">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-8 h-8 rounded-lg" />
            <h1 className="text-white font-semibold text-sm tracking-wide">
              MACSOFT
            </h1>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg">
            {isOpen ? (
              <X size={20} className="text-white" />
            ) : (
              <Menu size={20} className="text-white" />
            )}
          </button>
        </div>
      </header>

      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
        fixed lg:static top-0 left-0 z-50
        h-screen
        w-72 sm:w-72 md:w-64 lg:w-64
        bg-blue-950 text-white shadow-xl
        transform ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
        transition-transform duration-300 ease-in-out
      `}
      >
        <div className="flex flex-col h-full overflow-y-auto px-5 py-6 pt-20 lg:pt-6">
          {/* Desktop Logo */}
          <div className="hidden lg:flex items-center gap-3 mb-8">
            <img src={logo} alt="Logo" className="w-10 h-10 rounded-xl" />
            <div>
              <h1 className="text-lg font-semibold">MACSOFT</h1>
              <p className="text-xs text-blue-200 font-bold uppercase">
                Rack Management
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 text-xs sm:text-sm uppercase tracking-wider">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3
                    px-4 py-3
                    rounded-xl
                    transition-all duration-300
                    ${active
                      ? "bg-white/20 backdrop-blur-xl"
                      : "hover:bg-blue-900"
                    }
                  `}
                >
                  <Icon size={18} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="mt-auto pt-6">
            {/* User Card */}
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-xl px-4 py-3 rounded-xl">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-500 flex items-center justify-center font-semibold">
                {avatarInitial}
              </div>

              <div className="overflow-hidden">
                <span className="block text-xs font-semibold uppercase tracking-widest truncate">
                  {userName}
                </span>
                <span className="text-xs text-blue-200 truncate">
                  ID: {employeeId}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full mt-4 flex items-center justify-center gap-2
              bg-red-500 hover:bg-red-600
              text-white text-sm font-medium
              px-4 py-2.5 rounded-xl
              transition-all duration-300 active:scale-95"
            >
              Log Out
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowLogoutModal(false)}
          />

          <div className="relative z-10 w-full max-w-sm p-6 rounded-2xl bg-blue-950 text-white shadow-2xl">
            <h2 className="text-lg font-semibold mb-2">Confirm Logout</h2>

            <p className="text-sm text-blue-200 mb-6">
              Are you sure you want to log out?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-lg text-sm bg-blue-900 hover:bg-blue-800"
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg text-sm bg-red-500 hover:bg-red-600"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
