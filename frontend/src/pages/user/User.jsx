import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit, Trash2, XIcon } from "lucide-react";
import ReusableTable from "../../component/ReusableTable";
import { toast } from "sonner";

/* API */
const API_URL = "http://localhost:3000/api/user";

/* UTILS */
const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

export default function User() {
  const storedUserRaw = sessionStorage.getItem("user");
  let currentUser = {};
  try {
    currentUser = storedUserRaw ? JSON.parse(storedUserRaw) : {};
  } catch (err) {
    console.error("User parse error:", err);
  }

  const userRole = (currentUser.role || "").toUpperCase().replace(/_/g, "");
  const isSuperAdmin = userRole === "SUPERADMIN";

  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    employeeId: "",
    password: "",
    role: "OPERATOR",
    status: "ACTIVE",
  });

  /* FETCH USERS */
  const fetchUsers = async () => {
    try {
      const res = await axios.get(API_URL);
      setUsers(
        res.data.map((u) => ({
          ...u,
          role: capitalize(u.role),
          status: capitalize(u.status),
        })),
      );
    } catch (err) {
      console.error("Fetch users failed", err);
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* TABLE */
  const columns = [
    {
      key: "name",
      label: "Name",
      render: (row) => (
        <span className="font-medium text-slate-800">{row.name}</span>
      ),
    },
    {
      key: "employeeId",
      label: "Employee ID",
      render: (row) => <span className="text-slate-600">{row.employeeId}</span>,
    },
    {
      key: "role",
      label: "Role",
      render: (row) => (
        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          {row.role}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
            row.status === "Active"
              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
              : "bg-red-100 text-red-700 border-red-200"
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  /* MODAL */
  const openAddModal = () => {
    setFormData({
      id: null,
      name: "",
      employeeId: "",
      password: "",
      role: "OPERATOR",
      status: "ACTIVE",
    });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const openEditModal = (row) => {
    setFormData({
      id: row.id,
      name: row.name,
      employeeId: row.employeeId,
      password: "",
      role: row.role.toUpperCase(),
      status: row.status.toUpperCase(),
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  /* CREATE / UPDATE */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      employeeId: formData.employeeId,
      role: formData.role,
      status: formData.status,
    };

    if (!isEditMode || formData.password) {
      payload.password = formData.password;
    }

    try {
      if (isEditMode) {
        await axios.put(`${API_URL}/${formData.id}`, payload);
        toast.success("User updated successfully");
      } else {
        await axios.post(API_URL, payload);
        toast.success("User created successfully");
      }

      await fetchUsers();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Save failed", err);
      toast.error(err.response?.data?.message || "Failed to save user");
    }
  };

  /* DELETE */
  const handleDelete = async (row) => {
    if (!window.confirm(`Are you sure you want to delete ${row.name}?`)) return;

    try {
      await axios.delete(`${API_URL}/${row.id}`);
      toast.success("User deleted successfully");
      await fetchUsers();
    } catch (err) {
      console.error("Delete failed", err);
      toast.error(err.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div className="w-full">
      <ReusableTable
        columns={columns}
        data={users}
        onAdd={isSuperAdmin ? openAddModal : undefined}
        addLabel="Add User"
        onEdit={isSuperAdmin ? openEditModal : undefined}
        onDelete={isSuperAdmin ? handleDelete : undefined}
        actionIcon={
          <Edit className="w-4 h-4 text-blue-600 hover:text-blue-800 transition-colors" />
        }
        deleteIcon={
          <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700 transition-colors" />
        }
      />

      {/* MODAL */}
      {isModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 sm:px-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-800">
                {isEditMode ? "Update User Profile" : "Create New User"}
              </h2>
              <button
                className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                <XIcon size={20} />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-5 sm:p-6 overflow-y-auto">
              <form id="userForm" onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    placeholder="e.g. John Doe"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Employee ID */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Employee ID
                  </label>
                  <input
                    placeholder="e.g. EMP-1001"
                    type="text"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow disabled:bg-slate-100 disabled:text-slate-500"
                    value={formData.employeeId}
                    onChange={(e) =>
                      setFormData({ ...formData, employeeId: e.target.value })
                    }
                    required
                    disabled={isEditMode}
                  />
                  {isEditMode && (
                    <p className="text-xs text-slate-500 mt-1">
                      Employee ID cannot be changed.
                    </p>
                  )}
                </div>

                {/* Password - ONLY VISIBLE TO SUPER ADMIN */}
                {isSuperAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {isEditMode
                        ? "New Password (leave blank to keep current)"
                        : "Password"}
                    </label>
                    <input
                      placeholder={
                        isEditMode ? "Enter new password..." : "Create a password"
                      }
                      type="password"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required={!isEditMode}
                    />
                  </div>
                )}

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    System Role
                  </label>
                  <select
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white appearance-none"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    <option value="SUPERADMIN">Super Admin</option>
                    <option value="ADMIN">Admin</option>
                    <option value="OPERATOR">Operator</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Account Status
                  </label>
                  <select
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white appearance-none"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </form>
            </div>

            {/* Footer Actions */}
            <div className="px-5 py-4 sm:px-6 border-t border-slate-100 bg-slate-50 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="userForm"
                className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                {isEditMode ? "Save Changes" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
