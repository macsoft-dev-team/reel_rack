import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosConfig";
import { User, Lock, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import bg from "../../assets/bg.jpeg";
import logo from "../../assets/Logo.jpg";

export default function SignIn() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ employeeId: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [keepLogged, setKeepLogged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axiosInstance.post("/signin", form);

      if (res.data.success) {
        sessionStorage.setItem("token", res.data.token);
        sessionStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/component");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 font-sans">
      {/* LEFT SIDE - BRANDING & BACKGROUND */}
      <div
        className="w-full lg:w-1/2 min-h-[340px] lg:min-h-screen relative flex flex-col justify-between items-center p-8 sm:p-12 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${bg})` }}
      >
        {/* Dark / Glass Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/65 to-blue-950/75 backdrop-blur-[2px]"></div>

        {/* Subtle Grid Overlay */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: `36px 36px`,
          }}
        ></div>

        {/* Top Spacer */}
        <div className="relative z-10 hidden lg:block"></div>

        {/* Center Content: Logo & Titles */}
        <div className="relative z-10 my-auto flex flex-col items-center text-center">
          {/* Logo Container Card */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-2xl border border-white/20 flex items-center justify-center w-28 h-28 sm:w-36 sm:h-36 mb-6 transition-transform duration-300 hover:scale-105">
            <img
              src={logo}
              alt="Macsoft Logo"
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-xl"
            />
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-wider uppercase drop-shadow-md">
            MACSOFT
          </h1>

          {/* Subtitle */}
          <p className="text-white font-bold text-lg sm:text-lg tracking-[0.2em] uppercase mt-2 drop-shadow-sm">
            REEL RACK MANAGEMENT SYSTEM
          </p>
        </div>

        {/* Bottom Footer */}
        <div className="relative z-10 text-slate-400 text-xs font-mono tracking-tight text-center mt-6 lg:mt-0">
          © 2026 Macsoft Electronic Controls
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white min-h-[calc(100vh-340px)] lg:min-h-screen">
        <div className="w-full max-w-md space-y-7">
          {/* Header */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome to Macsoft RRMS
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-2">
              Please enter your credentials to access your organization portal.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Employee ID */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Employee ID
              </label>
              <div className="relative rounded-xl bg-[#edf2fe] border border-blue-100 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-400/20 transition-all">
                <User
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  name="employeeId"
                  placeholder="Enter Employee ID"
                  value={form.employeeId}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-transparent text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="text-xs text-blue-600 font-medium hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative rounded-xl bg-[#edf2fe] border border-blue-100 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-400/20 transition-all">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-3 bg-transparent text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Keep me logged in */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={keepLogged}
                  onChange={(e) => setKeepLogged(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600"
                />
                <span>Keep me logged in</span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-medium px-4 py-3 rounded-xl animate-shake">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
