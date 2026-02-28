import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Clock, FolderHeart, Home, Search, Sparkles, Shield, User } from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { to: "/dashboard", icon: Home, label: "Gallery" },
  { to: "/timeline", icon: Clock, label: "Timeline" },
  { to: "/albums", icon: FolderHeart, label: "Albums" },
  { to: "/search", icon: Search, label: "Search" },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors selection:bg-indigo-100 selection:text-indigo-700">
      
      {/* --- SIDEBAR: DESKTOP --- */}
      <aside className="sticky top-0 hidden h-screen w-24 lg:w-72 flex-col border-r border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl z-50 md:flex transition-all duration-300">
        
        {/* Minimalist Logo Icon Only */}
        <div className="flex items-center justify-center lg:justify-start p-8 lg:px-10 lg:pt-12">
          <Link to="/" className="group relative h-12 w-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-indigo-600 rounded-2xl rotate-6 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-lg shadow-indigo-500/20" />
            <div className="relative h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/10">
              <Sparkles className="text-white" size={20} />
            </div>
          </Link>
        </div>
        
        {/* Navigation Items */}
        <nav className="flex-1 space-y-2 px-4 lg:px-6 py-8">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group relative flex items-center justify-center lg:justify-between rounded-2xl p-4 lg:px-6 lg:py-4 transition-all duration-300",
                  isActive
                    ? "text-indigo-600 dark:text-white bg-indigo-50/50 dark:bg-indigo-600/10 shadow-sm"
                    : "text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-900"
                )}
              >
                <div className="flex items-center gap-4">
                  <item.icon className={cn("h-6 w-6 transition-transform duration-300 group-hover:scale-110", isActive ? "stroke-[2.5px]" : "stroke-2")} />
                  <span className="hidden lg:block text-xs font-black uppercase tracking-widest">{item.label}</span>
                </div>

                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="hidden lg:block h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"
                    />
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* User / Security Bottom Section */}
        <div className="p-4 lg:p-6 space-y-4">
          <div className="hidden lg:block rounded-2xl bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                <Shield size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Security</p>
                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 italic">Encrypted Vault</p>
              </div>
            </div>
          </div>
          
          <button className="flex w-full items-center justify-center lg:justify-start gap-4 px-6 py-4 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all">
            <User size={20} />
            <span className="hidden lg:block text-xs font-black uppercase tracking-widest">Profile</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex flex-1 flex-col relative overflow-hidden">
        <main className="flex-1 pb-32 md:pb-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* --- BOTTOM NAV: MOBILE --- */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md md:hidden">
        <div className="flex items-center justify-around p-2 rounded-[2.5rem] bg-white/80 dark:bg-slate-900/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/20 dark:border-slate-800">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="relative flex flex-col items-center justify-center p-4"
              >
                <div className={cn(
                    "transition-all duration-500",
                    isActive ? "text-indigo-600 scale-125" : "text-slate-400"
                )}>
                    <item.icon className={isActive ? "stroke-[2.5px]" : "stroke-2"} size={22} />
                </div>
                
                {isActive && (
                    <motion.div 
                      layoutId="mobile-dot"
                      className="absolute -bottom-1 h-1 w-1 bg-indigo-600 rounded-full"
                    />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}