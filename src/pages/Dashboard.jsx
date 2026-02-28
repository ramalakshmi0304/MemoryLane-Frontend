import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BookOpen, Sparkles, FolderHeart, Plus, Search, Loader2 } from "lucide-react";
import API from "../api/axios";
import SearchBar from "../components/SearchBar";
import MemoryCard from "../components/MemoryCard";
import Pagination from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../components/Layout";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [memories, setMemories] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagFilter, setTagFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isMilestone, setIsMilestone] = useState(false); 
  const [stats, setStats] = useState({ total: 0, milestones: 0, albums: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [userScope, setUserScope] = useState("all"); 
  const [selectedUserId, setSelectedUserId] = useState("all"); 
  const [usersList, setUsersList] = useState([]); 

  // --- LOGIC (UNTOUCHED) ---
  const fetchUsers = useCallback(async () => {
    if (user?.role !== "admin") return;
    try {
      const res = await API.get("/admin/users"); 
      const list = res.data?.data || res.data || [];
      if (Array.isArray(list)) setUsersList(list);
    } catch (err) { console.error(err); }
  }, [user]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const fetchData = useCallback(async (signal) => {
    setIsLoading(true);
    try {
      const isAdmin = user?.role === "admin";
      const isEveryone = isAdmin && userScope === "all";
      const memoryEndpoint = isEveryone ? "/memories/all" : "/memories";
      const params = new URLSearchParams({
        page: page.toString(), search: search.trim(),
        is_milestone: isMilestone ? "true" : "false",
      });
      if (isEveryone && selectedUserId !== "all") params.append("userId", selectedUserId);
      if (tagFilter !== "all") params.append("tag", tagFilter);

      const [memRes, tagRes, statsRes] = await Promise.all([
        API.get(`${memoryEndpoint}?${params.toString()}`, { signal }),
        API.get("/memories/tags", { signal }),
        API.get("/memories/stats", { signal }),
      ]);

      const rawMemories = memRes.data?.memories || memRes.data?.data || [];
      setMemories(rawMemories);
      const rawTags = tagRes.data?.data || tagRes.data || [];
      setTags(rawTags.map(t => typeof t === 'object' ? t.name : t));
      const serverStats = statsRes.data?.data || statsRes.data || {};
      setStats({
        total: serverStats.total || rawMemories.length,
        milestones: serverStats.milestones || rawMemories.filter(m => m.is_milestone).length,
        albums: serverStats.albums || 0
      });
      setTotalPages(memRes.data?.pagination?.totalPages || 1);
    } catch (err) { if (err.name !== 'CanceledError') console.error(err); }
    finally { setIsLoading(false); }
  }, [page, search, tagFilter, user, isMilestone, userScope, selectedUserId]);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  useEffect(() => { setPage(1); }, [search, tagFilter, isMilestone, userScope, selectedUserId]);

  return (
    <Layout>
      {/* FIX: Removed overflow-related classes that cause nested scrolling. 
         The Layout handles the document scroll.
      */}
      <div className="min-h-full pb-20 bg-[#FDFDFF] dark:bg-slate-950 transition-colors duration-300">
        
        {/* HEADER SECTION */}
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Your Archive</h2>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Manage your captured moments</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              {user?.role === "admin" && (
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <button onClick={() => {setUserScope("all"); setSelectedUserId("all");}} className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${userScope === 'all' ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-600 dark:text-white' : 'text-slate-500'}`}>Network</button>
                  <button onClick={() => setUserScope("mine")} className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${userScope === 'mine' ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-600 dark:text-white' : 'text-slate-500'}`}>Private</button>
                </div>
              )}
              <Link to="/create" className="group bg-slate-900 dark:bg-indigo-600 text-white px-8 py-3.5 rounded-xl shadow-xl shadow-slate-200 dark:shadow-none hover:-translate-y-0.5 transition-all flex items-center gap-3 text-xs font-black uppercase tracking-widest ml-auto md:ml-0">
                New Memory <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-6 pt-12">
          
          {/* STATS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              { label: "Memories", val: stats.total, ic: BookOpen, col: "bg-indigo-600 shadow-indigo-100 dark:shadow-none" },
              { label: "Milestones", val: stats.milestones, ic: Sparkles, col: "bg-amber-500 shadow-amber-100 dark:shadow-none" },
              { label: "Albums", val: stats.albums, ic: FolderHeart, col: "bg-rose-500 shadow-rose-100 dark:shadow-none" },
            ].map((item, i) => (
              <motion.div 
                key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center justify-between group"
              >
                <div>
                  <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">{item.label}</p>
                  <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{item.val}</h3>
                </div>
                <div className={`h-16 w-16 ${item.col} rounded-2xl flex items-center justify-center transform group-hover:-rotate-12 transition-transform duration-300`}>
                  <item.ic className="text-white" size={26} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* SEARCH BAR CONTAINER */}
          <section className="mb-16">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-3 shadow-[0_2px_15px_rgb(0,0,0,0.02)] border border-slate-100 dark:border-slate-800">
              <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-[2.2rem] px-6 py-10 border border-white dark:border-slate-800/50">
                  <SearchBar 
                    search={search} setSearch={setSearch} 
                    tags={tags} tagFilter={tagFilter} setTagFilter={setTagFilter} 
                    isMilestone={isMilestone} setIsMilestone={setIsMilestone} 
                  />
              </div>
            </div>
          </section>

          {/* CONTENT GRID */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div 
                  key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Archive</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                >
                  {memories.length > 0 ? (
                    memories.map((m) => (
                      <motion.div layout key={m.id} className="h-full">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl h-full shadow-[0_2px_15px_rgb(0,0,0,0.02)] hover:shadow-xl hover:shadow-indigo-100/30 transition-all duration-500 overflow-hidden border border-slate-100 dark:border-slate-800">
                          <MemoryCard memory={m} onRefresh={() => fetchData()} />
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full py-32 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800 px-6">
                      <Search size={54} className="mx-auto text-slate-200 dark:text-slate-700 mb-6" />
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