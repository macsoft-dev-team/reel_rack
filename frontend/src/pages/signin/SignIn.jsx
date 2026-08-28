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
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
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
      className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-cover bg-center"
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
          lg:max-w-lg
          bg-white/10 backdrop-blur-xl border border-white/20
          rounded-2xl sm:rounded-3xl
          shadow-2xl
          p-6 sm:p-8 lg:p-10
        "
      >
        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-white mb-1">
          Welcome Back
        </h1>
        <p className="text-center text-gray-300 text-sm sm:text-base mb-6 sm:mb-8">
          Sign in to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Employee ID */}
          <div className="relative">
            <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
            <input
              type="text"
              name="employeeId"
              placeholder="Employee ID"
              value={form.employeeId}
              onChange={handleChange}
              className="
                w-full pl-11 pr-4 py-2.5 sm:py-3
                rounded-lg sm:rounded-xl
                bg-white/20 text-white placeholder-gray-300
                border border-white/30
                text-sm sm:text-base
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="
                w-full pl-11 pr-11 py-2.5 sm:py-3
                rounded-lg sm:rounded-xl
                bg-white/20 text-white placeholder-gray-300
                border border-white/30
                text-sm sm:text-base
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3.5 text-gray-300 hover:text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="
                bg-red-500/20 border border-red-500/40
                text-red-300 text-xs sm:text-sm
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
              w-full py-2.5 sm:py-3
              rounded-lg sm:rounded-xl
              text-sm sm:text-lg font-semibold text-white
              bg-gradient-to-r from-blue-500 to-indigo-600
              hover:from-blue-600 hover:to-indigo-700
              shadow-lg hover:shadow-xl
              transition-all duration-300
              flex items-center justify-center gap-2
              disabled:opacity-60
            "
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Signing In...
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
