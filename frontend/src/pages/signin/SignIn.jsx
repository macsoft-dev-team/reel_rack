import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { User, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import bg from "../../assets/bg.jpeg";

const API_URL = "http://localhost:3000/api/signin";

export default function SignIn() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ employeeId: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
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
      const res = await axios.post(API_URL, form);

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
    <div
      className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-indigo-900/60 to-purple-900/60"></div>

      {/* Card */}
      <div
        className="
          relative z-10 
          w-full 
          max-w-sm 
          sm:max-w-md 
          bg-white/10 backdrop-blur-xl border border-white/20
          rounded-2xl
          shadow-2xl
          p-6 sm:p-8
        "
      >
        {/* Heading */}
        <h1 className="text-xl sm:text-2xl font-bold text-center text-white mb-1 tracking-tight">
          Welcome Back
        </h1>
        <p className="text-center text-gray-300 text-xs sm:text-sm mb-5 sm:mb-6">
          Sign in to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee ID */}
          <div className="relative">
            <User className="absolute left-3.5 top-3 text-gray-400" size={16} />
            <input
              type="text"
              name="employeeId"
              placeholder="Employee ID"
              value={form.employeeId}
              onChange={handleChange}
              className="
                w-full pl-10 pr-4 py-2.5
                rounded-xl
                bg-white/20 text-white placeholder-gray-300
                border border-white/30
                text-xs sm:text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-400/50
              "
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 text-gray-400" size={16} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="
                w-full pl-10 pr-10 py-2.5
                rounded-xl
                bg-white/20 text-white placeholder-gray-300
                border border-white/30
                text-xs sm:text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-400/50
              "
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-gray-300 hover:text-white"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="
                bg-red-500/20 border border-red-500/40
                text-red-300 text-xs
                px-3 py-2 rounded-lg animate-shake
              "
            >
              {error}
            </div>
          )}

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-2.5
              rounded-xl
              text-xs sm:text-sm font-semibold text-white
              bg-gradient-to-r from-blue-500 to-indigo-600
              hover:from-blue-600 hover:to-indigo-700
              shadow-md hover:shadow-lg
              transition-all duration-200
              flex items-center justify-center gap-2
              disabled:opacity-60 cursor-pointer active:scale-98
            "
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Signing In...</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>

      {/* Shake Animation */}
      <style>
        {`
          @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-4px); }
            50% { transform: translateX(4px); }
            75% { transform: translateX(-4px); }
            100% { transform: translateX(0); }
          }
          .animate-shake {
            animation: shake 0.3s ease-in-out;
          }
        `}
      </style>
    </div>
  );
}
