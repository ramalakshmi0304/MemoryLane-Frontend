import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, HardDrive, Activity, Loader2, ShieldCheck, Trophy, ExternalLink, ArrowUpRight } from "lucide-react";
import API from "../api/axios";
import Layout from "../components/Layout";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ 
    totalUsers: 0, 
    totalMemories: 0, 
    totalMilestones: 0, 
    storageUsed: "0.0 GB" 
  });
  const [activeListData, setActiveListData] = useState([]);
  const [activeTab, setActiveTab] = useState("activity");
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await API.get("/admin/stats");
      const data = res.data?.data || res.data;
      setStats({
        totalUsers: data?.totalUsers || 0,
        totalMemories: data?.totalMemories || 0,
        totalMilestones: data?.totalMilestones || 0,
        storageUsed: data?.storageUsed || "0.0 GB"
      });
    } catch (err) {
      console.error("Stats Fetch Error:", err);
      toast.error("Could not load system stats");
    }
  }, []);

  const fetchTabData = useCallback(async (tab) => {
    setLoading(true);
    try {
      let endpoint = tab === "activity" ? "/memories/all?limit=20" : "/admin/users";
      const res = await API.get(endpoint);
      const data = res.data?.data || res.data?.memories || res.data?.users || (Array.isArray(res.data) ? res.data : []);
      setActiveListData(data);
    } catch (err) {
      toast.error(`Failed to load ${tab} data`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchTabData(activeTab);
  }, [fetchStats, fetchTabData, activeTab]);

  return (
    <Layout>
      <div className="bg-[#FDFDFF] dark:bg-slate-950 min-h-screen">
        <div className="max-w-[1400px] mx-auto py-16 px-6 lg:px-10 space-y-12">
          
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                <ShieldCheck size={24} strokeWidth={2.5} />
                <span className="text-xs font-black uppercase tracking-[0.3em]">System Core</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter">
                Admin Console<span className="text-indigo-600">.</span>
              </h1>
            </motion.div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard title="Total Users" value={stats.totalUsers} Icon={Users} color="blue" />
            <StatCard title="Total Memories" value={stats.totalMemories} Icon={Activity} color="purple" />
            <StatCard title="Milestones" value={stats.totalMilestones} Icon={Trophy} color="amber" />
            <StatCard title="Storage" value={stats.storageUsed} Icon={HardDrive} color="emerald" />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-slate-100/50 dark:bg-slate-900 p-1.5 rounded-[1.5rem] mb-8 border border-slate-200/50 dark:border-slate-800">
              <TabsTrigger value="activity" className="rounded-2xl px-8 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 text-xs font-black uppercase tracking-widest">
                Activity
              </TabsTrigger>
              <TabsTrigger value="users" className="rounded-2xl px-8 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 text-xs font-black uppercase tracking-widest">
                Directory
              </TabsTrigger>
            </TabsList>

            <div className="relative min-h-[400px]">
              <AnimatePresence mode="wait">
                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 dark:bg-slate-950/50 z-50 backdrop-blur-sm">
                    <Loader2 className="animate-spin text-indigo-600" size={48} />
                  </motion.div>
                )}
              </AnimatePresence>

              <TabsContent value="activity" className="mt-0 space-y-4 outline-none">
                {activeListData.map((m, idx) => (
                  <motion.div 
                    key={m.id || `mem-${idx}`} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between group hover:shadow-xl transition-all gap-4"
                  >
                    <div className="flex items-center gap-6 w-full">
                      <div className={`h-16 w-16 shrink-0 rounded-[1.25rem] flex items-center justify-center ${m.is_milestone ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
                        {m.is_milestone ? <Trophy size={28} /> : <Activity size={28} />}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xl font-black text-slate-800 dark:text-slate-100">{m.title || "Untitled Memory"}</h4>
                        <p className="text-sm text-slate-500">
                          by <span className="font-bold">{m.profiles?.name || 'Unknown'}</span> • {m.created_at ? new Date(m.created_at).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       {/* THE FIX: Added ?. before slice and a fallback string */}
                       <span className="text-[10px] text-slate-300 font-mono font-black">
                        #{m.id?.slice(0, 12).toUpperCase() ?? "NEW-ENTRY"}
                       </span>
                       <div className="h-12 w-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                          <ArrowUpRight size={20} />
                       </div>
                    </div>
                  </motion.div>
                ))}
              </TabsContent>

              <TabsContent value="users" className="mt-0 outline-none">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl shadow-slate-200/50">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Contributor</th>
                          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Identity</th>
                          <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Vault Access</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {activeListData.map((u, idx) => (
                          <tr key={u.id || `user-${idx}`} className="group hover:bg-indigo-50/30 transition-colors">
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-4">
                                  {/* THE FIX: Added ?. before slice for user names */}
                                  <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-indigo-600">
                                    {u.name?.slice(0, 2).toUpperCase() ?? "??"}
                                  </div>
                                  <span className="text-lg font-black text-slate-800 dark:text-slate-100">{u.name || "Anonymous"}</span>
                               </div>
                            </td>
                            <td className="px-8 py-6 text-sm font-medium text-slate-500">
                              {u.email || u.role || "N/A"}
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button onClick={() => toast.info(`Accessing ${u.name}'s vault...`)} className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                View <ExternalLink size={14} className="inline ml-2" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

const StatCard = ({ title, value, Icon, color }) => {
  const themes = {
    blue: "from-blue-500/10 to-transparent border-blue-500 text-blue-600",
    purple: "from-purple-500/10 to-transparent border-purple-500 text-purple-600",
    emerald: "from-emerald-500/10 to-transparent border-emerald-500 text-emerald-600",
    amber: "from-amber-500/10 to-transparent border-amber-500 text-amber-600"
  };
  
  return (
    <motion.div whileHover={{ y: -5 }}>
      <Card className="border-none bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl overflow-hidden relative group">
        <div className={`absolute inset-0 bg-gradient-to-br ${themes[color]} opacity-30`} />
        <CardContent className="p-8 flex justify-between items-start relative z-10">
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm w-fit">
                <Icon size={24} strokeWidth={2.5} />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{title}</p>
                <div className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tighter">
                    {typeof value === 'number' ? value.toLocaleString() : value || 0}
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminDashboard;