import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import API from "@/api/axios";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await API.post("/auth/login", {
        email,
        password
      });

      const { access_token, user } = response.data;

      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      login({
        token: access_token,
        role: user.role,
        name: user.name,
        id: user.id,
      });

      navigate(user.role === "admin" ? "/admin" : "/");

    } catch (err) {
      console.log(err);
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffdfa] px-4 py-12 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-64 h-64 bg-orange-100/30 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-orange-50/50 rounded-full blur-3xl" />

      <div className="w-full max-w-md z-10">
        {/* Logo / Branding Area */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-orange-100 shadow-sm mb-4 rotate-3">
            <span className="text-2xl font-serif font-bold text-[#c87a3f]">M</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#3d2b1f]">Welcome Back</h1>
          <p className="text-slate-500 mt-2 font-light">Continue capturing your journey</p>
        </div>

        {/* Main Login Card */}
        <div className="bg-white border border-orange-100/50 p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_50px_-15px_rgba(180,140,100,0.15)]">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#c87a3f] uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#c87a3f]/30 focus:ring-0 transition-all outline-none text-[#3d2b1f]"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-[#c87a3f] uppercase tracking-widest">Password</label>
                <Link to="/forgot-password" size="sm" className="text-[10px] font-bold text-slate-400 hover:text-[#c87a3f] transition-colors uppercase">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#c87a3f]/30 focus:ring-0 transition-all outline-none text-[#3d2b1f]"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full group relative py-4 bg-[#3d2b1f] text-white rounded-2xl font-bold shadow-lg shadow-orange-900/20 hover:bg-[#2a1d15] hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:bg-slate-300 disabled:translate-y-0"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Social Divider (Optional) */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-slate-400 font-medium">New here?</span></div>
          </div>

          <p className="text-center text-slate-500 text-sm">
            Ready to start your gallery?{" "}
            <Link to="/register" className="text-[#c87a3f] font-bold hover:underline decoration-2 underline-offset-4">Create an account</Link>
          </p>
        </div>

        {/* Footer info */}
        <p className="mt-12 text-center text-slate-400 text-xs">
          &copy; {new Date().getFullYear()} Memory Gallery. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;