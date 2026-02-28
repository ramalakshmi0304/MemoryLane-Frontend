import { useState, useEffect, forwardRef } from "react";
import { NavLink as RouterNavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";
import {
  ShieldCheck,
  BookCopy,
  BookOpen,
  Plus,
  Shuffle,
  LayoutDashboard,
  History,
  LogOut,
  Sun,
  Moon,
  Sparkles,
  Menu,
  X,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NavLink = forwardRef(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(
            className,
            isActive && activeClassName,
            isPending && pendingClassName
          )
        }
        {...props}
      />
    );
  }
);
NavLink.displayName = "NavLink";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    logout();
    navigate("/login");
  };

  const navLinks = [
    { to: "/dashboard", label: "Gallery", icon: LayoutDashboard, color: "hover:text-indigo-600", active: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30" },
    { to: "/reminisce", label: "Reminisce", icon: Shuffle, color: "hover:text-purple-600", active: "text-purple-600 bg-purple-50 dark:bg-purple-950/30" },
    { to: "/milestones", label: "Milestones", icon: Sparkles, color: "hover:text-amber-600", active: "text-amber-600 bg-amber-50 dark:bg-amber-950/30" },
    { to: "/timeline", label: "Timeline", icon: History, color: "hover:text-indigo-600", active: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30" },
    { to: "/albums", label: "Albums", icon: BookCopy, color: "hover:text-indigo-600", active: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30" },
  ];

  return (
    <nav className="sticky top-0 z-[100] w-full border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        
        {/* LOGO SECTION */}
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-400 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 shadow-xl group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
            {/* UPDATED BRANDING: MemoryLane */}
            <span className="font-sans text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
              Memory<span className="text-indigo-600">Lane</span>
            </span>
          </Link>

          {/* DESKTOP LINKS */}
          {user && (
            <div className="hidden xl:flex items-center gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={cn("px-4 py-2.5 flex items-center gap-2.5 text-[15px] font-bold text-slate-600 dark:text-slate-400 transition-all rounded-xl", link.color)}
                  activeClassName={link.active}
                >
                  <link.icon size={18} /> {link.label}
                </NavLink>
              ))}
              
              {user.role === "admin" && (
                <NavLink
                  to="/admin"
                  className="px-4 py-2.5 flex items-center gap-2.5 text-[15px] font-bold text-orange-600 dark:text-orange-400 transition-all rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950/20"
                  activeClassName="bg-orange-100 dark:bg-orange-900/30 text-orange-700"
                >
                  <ShieldCheck size={18} /> Console
                </NavLink>
              )}
            </div>
          )}
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-3 sm:gap-5">
          <button
            onClick={() => setDark(!dark)}
            className="w-11 h-11 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all"
          >
            {dark ? <Sun size={22} /> : <Moon size={22} />}
          </button>

          {user ? (
            <>
              <div className="hidden sm:flex flex-col items-end pl-4 border-l-2 border-slate-200 dark:border-slate-800">
                <span className="text-[15px] font-black text-slate-900 dark:text-white leading-none">{user.name || "Explorer"}</span>
                <span className="text-[11px] text-indigo-500 font-black uppercase tracking-[0.2em] mt-1.5">{user.role}</span>
              </div>
              
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden w-11 h-11 flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-xl text-slate-600 dark:text-slate-300"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <button
                onClick={handleLogout}
                className="hidden xl:flex items-center gap-2 h-11 px-5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-rose-600 transition-all shadow-lg"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="px-7 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-xl">
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="xl:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
          >
            <div className="p-5 space-y-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-5 py-5 flex items-center justify-between text-base font-bold text-slate-700 dark:text-slate-300 rounded-2xl transition-colors active:bg-slate-100"
                  activeClassName="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-white"
                >
                  <div className="flex items-center gap-5">
                    <link.icon size={22} /> {link.label}
                  </div>
                  <ChevronRight size={18} className="opacity-40" />
                </NavLink>
              ))}

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-900 space-y-3">
                <NavLink
                  to="/create"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-5 py-5 flex items-center gap-5 text-base font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl"
                >
                  <Plus size={22} strokeWidth={3} /> Create Memory
                </NavLink>

                {user.role === "admin" && (
                  <NavLink
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-5 py-5 flex items-center gap-5 text-base font-black text-orange-600 bg-orange-50 dark:bg-orange-950/20 rounded-2xl"
                  >
                    <ShieldCheck size={22} /> Admin Control
                  </NavLink>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-5 px-5 py-5 text-base font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-2xl transition-colors"
                >
                  <LogOut size={22} /> Logout
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;