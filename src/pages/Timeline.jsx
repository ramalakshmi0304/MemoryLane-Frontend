import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CalendarDays, 
  Loader2, 
  Search, 
  X, 
  History, 
  ChevronUp, 
  Star,
  Sparkles 
} from "lucide-react";
import Layout from "../components/Layout";
import MemoryCard from "../components/MemoryCard";
import { Input } from "@/components/ui/input";
import API from "../api/axios";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export default function Timeline() {
  const { user } = useAuth();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showThisDayOnly, setShowThisDayOnly] = useState(false);

  // ================= 1. DATA FETCHING (Logic Preserved) =================
  const fetchMemories = useCallback(async (query = "") => {
    try {
      setLoading(true);
      const baseEndpoint = user?.role === "admin" ? "/memories/all" : "/memories";
      const params = new URLSearchParams();
      if (query.trim()) params.append("search", query.trim());

      const res = await API.get(`${baseEndpoint}${params.toString() ? `?${params.toString()}` : ''}`);
      const data = res.data?.memories || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      
      const sanitized = data.map(m => ({
        ...m,
        tags: Array.isArray(m.tags) ? m.tags.map(t => typeof t === 'object' ? t.name : t) : []
      }));

      setMemories(sanitized);
    } catch (err) {
      console.error("Timeline Fetch Error:", err);
      toast.error("Failed to load memories");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchMemories(searchQuery);
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, fetchMemories]);

  // ================= 2. LOGIC: FILTERING & GROUPING (Logic Preserved) =================
  const getAnniversaryLabel = (memoryDate) => {
    const today = new Date();
    const mDate = new Date(memoryDate);
    const isSameDay = today.getMonth() === mDate.getMonth() && today.getDate() === mDate.getDate();
    
    if (isSameDay) {
      const yearsAgo = today.getFullYear() - mDate.getFullYear();
      if (yearsAgo > 0) return `${yearsAgo} Year${yearsAgo > 1 ? 's' : ''} Ago Today`;
    }
    return null;
  };

  const displayMemories = useMemo(() => {
    if (!showThisDayOnly) return memories;
    const today = new Date();
    return memories.filter(m => {
      const d = new Date(m.memory_date || m.created_at);
      return d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
    });
  }, [memories, showThisDayOnly]);

  const groups = useMemo(() => {
    const sortedData = [...displayMemories].sort(
      (a, b) => new Date(b.memory_date || b.created_at).getTime() - new Date(a.memory_date || a.created_at).getTime()
    );
    
    const grouped = {};
    sortedData.forEach((m) => {
      const date = new Date(m.memory_date || m.created_at);
      const key = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(m);
    });
    return grouped;
  }, [displayMemories]);

  const years = useMemo(() => {
    const uniqueYears = [...new Set(displayMemories.map(m => 
      new Date(m.memory_date || m.created_at).getFullYear()
    ))];
    return uniqueYears.sort((a, b) => b - a);
  }, [displayMemories]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 120, behavior: "smooth" });
    }
  };

  return (
    <Layout>
      <div className="bg-[#FDFDFF] dark:bg-slate-950 min-h-screen pb-40 relative transition-colors selection:bg-indigo-100 selection:text-indigo-900">
        
        {/* SIDE NAV - Hidden on small screens */}
        {!showThisDayOnly && (
          <aside className="hidden xl:flex fixed left-8 top-1/2 -translate-y-1/2 flex-col gap-3 z-40">
            <div className="p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl">
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-4 text-center">Eras</p>
              <div className="flex flex-col gap-2">
                {years.map(year => (
                  <button
                    key={year}
                    onClick={() => scrollToSection(`year-${year}`)}
                    className="px-5 py-3 text-sm font-black text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-2xl transition-all text-center"
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        )}

        <div className="container max-w-[1400px] mx-auto px-6 pt-16">
          
          {/* HEADER SECTION */}
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 mb-28">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">
                <History size={16} strokeWidth={3} /> Chronological Flow
              </div>
              <h1 className="text-7xl md:text-9xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                Timeline<span className="text-indigo-600">.</span>
              </h1>
            </motion.div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
              {/* ON THIS DAY TOGGLE */}
              <button
                onClick={() => setShowThisDayOnly(!showThisDayOnly)}
                className={`flex items-center justify-center gap-3 px-8 h-20 w-full sm:w-auto rounded-[2rem] border-2 transition-all font-black text-xs uppercase tracking-widest ${
                  showThisDayOnly 
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-200" 
                  : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-indigo-500"
                }`}
              >
                <Sparkles size={20} className={showThisDayOnly ? "animate-pulse" : ""} />
                {showThisDayOnly ? "On This Day Active" : "Filter: On This Day"}
              </button>

              <div className="relative w-full sm:w-80 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                <Input
                  placeholder="Search memories..."
                  className="h-20 pl-16 pr-14 rounded-[2rem] bg-white dark:bg-slate-900 border-none shadow-xl shadow-slate-200/50 dark:shadow-none focus-visible:ring-4 focus-visible:ring-indigo-500/10 font-bold text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-6 top-1/2 -translate-y-1/2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                    <X className="h-4 w-4 text-slate-500" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="relative">
            {/* THE RIBBON LINE */}
            <div className="absolute left-10 top-0 hidden h-full w-0.5 bg-gradient-to-b from-indigo-500 via-slate-200 dark:via-slate-800 to-transparent md:block opacity-40" />

            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 space-y-8">
                <Loader2 className="h-16 w-16 animate-spin text-indigo-600 stroke-[3px]" />
                <p className="font-black text-xs uppercase tracking-[0.5em] text-slate-400">Loading Continuity</p>
              </div>
            ) : displayMemories.length === 0 ? (
              <div className="text-center py-32 bg-slate-50 dark:bg-slate-900/40 rounded-[4rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                <History className="text-slate-200 dark:text-slate-800 h-16 w-16 mx-auto mb-8" />
                <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                   {showThisDayOnly ? "No Echoes Found Today" : "The Archive is Quiet"}
                </h3>
                {showThisDayOnly && (
                  <button onClick={() => setShowThisDayOnly(false)} className="text-indigo-600 font-black uppercase text-xs tracking-widest hover:underline">
                    Restore Full Timeline
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-48">
                {Object.entries(groups).map(([monthYear, groupMemories]) => {
                   const year = monthYear.split(" ").pop();
                   const isFirstMonthOfYear = Object.keys(groups).find(key => key.endsWith(year)) === monthYear;

                   return (
                    <motion.div
                      key={monthYear}
                      id={isFirstMonthOfYear ? `year-${year}` : undefined}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true, margin: "-100px" }}
                      className="scroll-mt-32 relative"
                    >
                      {/* MONTH HEADER */}
                      <div className="mb-16 flex items-center gap-10 md:pl-28">
                        <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-200 md:-ml-[105px] md:flex z-10 border-4 border-[#FDFDFF] dark:border-slate-950">
                          <CalendarDays className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{monthYear}</h2>
                            <div className="h-1.5 w-24 bg-indigo-600 mt-2 rounded-full" />
                        </div>
                      </div>

                      {/* RESPONSIVE GRID */}
                      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 md:pl-28">
                        {groupMemories.map((memory, i) => {
                          const anniversary = getAnniversaryLabel(memory.memory_date || memory.created_at);
                          return (
                            <div key={memory.id} className="relative group">
                              <AnimatePresence>
                                {anniversary && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute -top-4 left-6 z-30 bg-indigo-600 text-white text-[10px] font-black px-4 py-2 rounded-xl shadow-2xl border-2 border-white dark:border-slate-900 flex items-center gap-2"
                                  >
                                    <Star size={10} fill="currentColor" />
                                    {anniversary}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                              
                              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-3 shadow-xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-3 transition-all duration-500 border border-slate-50 dark:border-slate-800">
                                <MemoryCard memory={memory} index={i} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                   );
                })}
              </div>
            )}
          </div>
        </div>

        {/* BACK TO TOP */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-10 right-10 h-16 w-16 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
        >
          <ChevronUp size={28} />
        </button>
      </div>
    </Layout>
  );
}