import React, { useState } from "react";
import {
  Shield,
  User,
  Key,
  Save,
  Lock,
  Eye,
  EyeOff,
  BadgeCheck,
  Clock,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosConfig";

export default function Settings() {
  const navigate = useNavigate();

  // User session data
  const storedUserRaw = sessionStorage.getItem("user");
  let currentUser = {};
  try {
    currentUser = storedUserRaw ? JSON.parse(storedUserRaw) : {};
  } catch (err) {
    console.error("Error parsing user:", err);
  }

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword) {
      toast.error("Please enter a new password");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setSaving(true);
    try {
      if (currentUser.id) {
        await axiosInstance.put(`/user/${currentUser.id}`, {
          password: passwordForm.newPassword,
        });
      }
      setPasswordForm({
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password updated successfully!");
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to update password";
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    navigate("/");
  };

  const avatarInitial = currentUser.name
    ? currentUser.name.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="w-full space-y-6">
      {/* PAGE HEADER */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Shield className="text-blue-600" size={24} />
          Account & Security Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your account profile, security credentials, and active session.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT CARD - ACCOUNT PROFILE */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
              <User size={16} className="text-blue-600" />
              Account Profile
            </h2>

            {/* Profile Avatar & Primary Info */}
            <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-slate-100">
              <div className="w-20 h-20 rounded-3xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-md border-4 border-blue-50">
                {avatarInitial}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {currentUser.name || "System User"}
                </h3>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 mt-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
                  <BadgeCheck size={14} className="text-blue-600" />
                  {currentUser.role || "OPERATOR"}
                </span>
              </div>
            </div>

            {/* User Meta Details */}
            <div className="pt-4 space-y-3.5 text-xs sm:text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Employee ID</span>
                <span className="font-semibold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {currentUser.employeeId || "N/A"}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Account Status</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">Session Status</span>
                <span className="inline-flex items-center gap-1.5 text-slate-600 text-xs font-medium">
                  <Clock size={14} className="text-slate-400" />
                  Active Session
                </span>
              </div>
            </div>
          </div>

          {/* Quick Sign Out Action */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200/80 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-98"
            >
              <LogOut size={16} />
              <span>Log Out of Session</span>
            </button>
          </div>
        </div>

        {/* RIGHT CARD - PASSWORD UPDATE FORM */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 mb-2 flex items-center gap-2">
            <Key size={16} className="text-blue-600" />
            Set New Password
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Enter your new password below. Current password is not required while logged in.
          </p>

          <form onSubmit={handlePasswordChange} className="space-y-5">
            {/* New Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  New Password
                </label>
                <div className="relative rounded-xl border border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-400/20 transition-all bg-white">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full pl-10 pr-10 py-3 bg-transparent text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative rounded-xl border border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-400/20 transition-all bg-white">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full pl-10 pr-10 py-3 bg-transparent text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-semibold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save size={16} />
                <span>{saving ? "Updating Password..." : "Update Password"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
