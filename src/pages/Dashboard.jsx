import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BookOpen, Sparkles, FolderHeart, Plus, Search, Loader2, ChevronDown, Users } from "lucide-react";
import API from "../api/axios";
import SearchBar from "../components/SearchBar";
import MemoryCard from "../components/MemoryCard";
import Pagination from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../components/Layout";

const Dashboard = () => {
  const { user } = useAuth();
  const [memories, setMemories] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagFilter, setTagFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isMilestone, setIsMilestone] = useState(false);
  const [stats, setStats] = useState({ total: 0, milestones: 0, albums: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [userScope, setUserScope] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState("all");
  const [usersList, setUsersList] = useState([]);

  // 1. Fetch Users (Only for Admins)
  const fetchUsers = useCallback(async () => {
    if (user?.role !== "admin") return;
    try {
      const res = await API.get("/admin/users");
      const list = res.data?.data || res.data || [];
      setUsersList(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load users list", err);
    }
  }, [user]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // 2. Fetch Memories
 const fetchData = useCallback(async (signal) => {
  setIsLoading(true);
  try {
    const isAdmin = user?.role === "admin";
    const isEveryone = isAdmin && userScope === "all";
    const memoryEndpoint = isEveryone ? "/memories/all" : "/memories";
    
    // Use an object to initialize params
    const params = new URLSearchParams({
      page: page.toString(),
      search: search.trim(),
      is_milestone: isMilestone ? "true" : "false",
    });

    if (tagFilter !== "all") params.append("tag", tagFilter);

    // CRITICAL: Ensure this block is exactly like this
    if (isEveryone && selectedUserId !== "all") {
      params.append("userId", selectedUserId); // Matches your frontend state
    }

    console.log(`🛰️ Fetching: ${memoryEndpoint}?${params.toString()}`);

    const [memRes, tagRes, statsRes] = await Promise.all([
      API.get(`${memoryEndpoint}?${params.toString()}`, { signal }),
      API.get("/memories/tags", { signal }),
      API.get("/memories/stats", { signal }),
    ]);

      setMemories(memRes.data?.memories || memRes.data?.data || []);
      setTotalPages(memRes.data?.pagination?.totalPages || 1);
      
      const rawTags = tagRes.data?.data || tagRes.data || [];
      setTags(rawTags.map(t => typeof t === 'object' ? t.name : t));
      
      const serverStats = statsRes.data?.data || statsRes.data || {};
      setStats({
        total: serverStats.total || 0,
        milestones: serverStats.milestones || 0,
        albums: serverStats.albums || 0
      });
    } catch (err) {
      if (err.name !== 'CanceledError') console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, tagFilter, user, isMilestone, userScope, selectedUserId]);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  // Reset page when any filter changes
  useEffect(() => { setPage(1); }, [search, tagFilter, isMilestone, userScope, selectedUserId]);

  return (
    <Layout>
      <div className="min-h-full pb-20 bg-[#FDFDFF] dark:bg-slate-950 transition-colors duration-300">
        
        {/* --- HEADER --- */}
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Your Archive</h2>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Manage your captured moments</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              {user?.role === "admin" && (
                <div className="flex items-center gap-3">
                  {/* Scope Switcher */}
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button 
                      onClick={() => { setUserScope("all"); setSelectedUserId("all"); }} 
                      className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${userScope === 'all' ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-600 dark:text-white' : 'text-slate-500'}`}
                    >
                      Network
                    </button>
                    <button 
                      onClick={() => setUserScope("mine")} 
                      className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${userScope === 'mine' ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-600 dark:text-white' : 'text-slate-500'}`}
                    >
                      Private
                    </button>
                  </div>

                  {/* USER DROPDOWN (Strictly checking userScope === "all") */}
                  {userScope === "all" && (
                    <div className="relative animate-in fade-in slide-in-from-left-2 duration-300">
                      <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="h-12 pl-10 pr-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer shadow-sm"
                        style={{ 
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, 
                          backgroundRepeat: 'no-repeat', 
                          backgroundPosition: 'right 0.75rem center', 
                          backgroundSize: '1em' 
                        }}
                      >
                        <option value="all">Every User</option>
                        {usersList.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name || u.email || "Unnamed User"}
                          </option>
                        ))}
                      </select>
                      <Users size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  )}
                </div>
              )}
              
              <Link to="/create" className="group bg-slate-900 dark:bg-indigo-600 text-white px-8 py-3.5 rounded-xl shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                New Memory <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-6 pt-12">
          {/* STATS & SEARCH (Remains same) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              { label: "Memories", val: stats.total, ic: BookOpen, col: "bg-indigo-600" },
              { label: "Milestones", val: stats.milestones, ic: Sparkles, col: "bg-amber-500" },
              { label: "Albums", val: stats.albums, ic: FolderHeart, col: "bg-rose-500" },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group">
                <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{item.label}</p>
                  <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{item.val}</h3>
                </div>
                <div className={`h-16 w-16 ${item.col} rounded-2xl flex items-center justify-center transform group-hover:-rotate-12 transition-all`}>
                  <item.ic className="text-white" size={26} />
                </div>
              </div>
            ))}
          </div>

          <section className="mb-16">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-3 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-[2.2rem] px-6 py-10 border border-white dark:border-slate-800/50">
                <SearchBar
                  search={search} setSearch={setSearch}
                  tags={tags} tagFilter={tagFilter} setTagFilter={setTagFilter}
                  isMilestone={isMilestone} setIsMilestone={setIsMilestone}
                />
              </div>
            </div>
          </section>

          {/* GRID */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Archive</p>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {memories.length > 0 ? (
                    memories.map((m) => (
                      <MemoryCard key={m.id} memory={m} onRefresh={() => fetchData()} />
                    ))
                  ) : (
                    <div className="col-span-full py-32 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                      <Search size={54} className="mx-auto text-slate-200 mb-6" />
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Empty Archive</h3>
                      <p className="text-slate-400 text-base mt-2">No memories found for these filters.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-20 flex justify-center border-t border-slate-100 dark:border-slate-800 pt-12">
            <Pagination page={page} setPage={setPage} totalPages={totalPages} />
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Dashboard;