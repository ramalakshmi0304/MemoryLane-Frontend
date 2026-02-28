// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/register", { name, email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role || "user");
      
      // Using a more modern notification style would be better than alert, 
      // but keeping logic consistent with your original code.
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-teal-950 px-4 py-12">
      <div className="w-full max-w-md">
        
        {/* Branding Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif font-bold text-teal-900 dark:text-teal-300">
            Join Memory Lane
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 italic">
            Start archiving your journey today.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/40 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-8 text-gray-800 dark:text-gray-100">Create Account</h2>
          
          <form className="space-y-5" onSubmit={handleRegister}>
            {/* Name Input */}
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 mb-2 ml-1">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none placeholder:text-gray-300"
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 mb-2 ml-1">Email Address</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none placeholder:text-gray-300"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 mb-2 ml-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none placeholder:text-gray-300"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-4 px-6 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-teal-200 dark:shadow-none transition-all transform active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : "Create Account"}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-teal-600 dark:text-teal-400 font-bold hover:text-teal-800 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;