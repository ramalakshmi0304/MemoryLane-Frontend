import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Loader2, Sparkles, Star, Rocket, Flag, ChevronRight, Map } from "lucide-react";
import API from "../api/axios";
import Layout from "../components/Layout";
import MemoryCard from "../components/MemoryCard";

export default function Milestones() {
    const [groupedMilestones, setGroupedMilestones] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchMilestones = useCallback(async (isMounted = true) => {
        if (isMounted) setLoading(true);
        try {
            const res = await API.get("/memories/milestones");
            const milestonesArray = res.data.data || [];
            const grouped = milestonesArray.reduce((acc, m) => {
                const key = m.milestone_number || "Special";
                if (!acc[key]) acc[key] = [];
                acc[key].push({
                    ...m,
                    tags: Array.isArray(m.tags) ? m.tags.map(t => typeof t === 'object' ? t.name : t) : []
                });
                return acc;
            }, {});
            if (isMounted) setGroupedMilestones(grouped);
        } catch (err) {
            console.error(err);
        } finally {
            if (isMounted) setLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        fetchMilestones(isMounted);
        return () => { isMounted = false; };
    }, [fetchMilestones]);

    if (loading) return (
        <Layout>
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center space-y-6">
                    <div className="relative">
                        <Loader2 className="h-20 w-20 animate-spin text-indigo-600 mx-auto opacity-20" />
                        <Sparkles className="h-8 w-8 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <p className="font-black uppercase tracking-[0.4em] text-slate-400 text-xs">Curating your legacy</p>
                </div>
            </div>
        </Layout>
    );

    const sortedEntries = Object.entries(groupedMilestones).sort(([a], [b]) => {
        if (a === "Special") return 1;
        if (b === "Special") return -1;
        return parseInt(a) - parseInt(b);
    });

    return (
        <Layout>
            <div className="bg-[#FDFDFF] dark:bg-slate-950 min-h-screen pb-40 transition-colors duration-500">
                
                {/* HERO SECTION - LARGER & RESPONSIVE */}
                <div className="relative pt-24 pb-20 overflow-hidden">
                    <div className="container mx-auto px-6 relative z-10">
                        <motion.div 
                            initial={{ y: 30, opacity: 0 }} 
                            animate={{ y: 0, opacity: 1 }}
                            className="max-w-4xl"
                        >
                            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-indigo-100 dark:border-indigo-800">
                                <Rocket size={14} strokeWidth={3} /> The Achievement Vault
                            </div>
                            <h1 className="text-7xl md:text-9xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.85] mb-8">
                                Major <br /> <span className="text-indigo-600">Milestones</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-xl md:text-2xl font-medium leading-relaxed">
                                A curated timeline of the events that redefined your journey. Each card represents a pivot point in your story.
                            </p>
                        </motion.div>
                    </div>
                    
                    {/* BACKGROUND ELEMENTS */}
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-50/50 to-transparent dark:from-indigo-950/20 pointer-events-none" />
                </div>

                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="relative">
                        
                        {/* CENTERED LINE - Desktop only */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800 hidden lg:block -translate-x-1/2" />

                        {sortedEntries.map(([num, memories], idx) => {
                            const isEven = idx % 2 === 0;

                            return (
                                <div key={num} className="relative mb-32 lg:mb-56 last:mb-0">
                                    
                                    {/* STAGE MARKER */}
                                    <div className="lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:-top-6 z-30 mb-10 lg:mb-0">
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            whileInView={{ scale: 1 }}
                                            viewport={{ once: true }}
                                            className="relative"
                                        >
                                            <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 animate-pulse" />
                                            <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-2 border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center relative z-10 mx-auto">
                                                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter mb-1">
                                                    {num === "Special" ? "Icon" : "Stage"}
                                                </span>
                                                <span className="text-4xl font-black text-slate-900 dark:text-white leading-none">
                                                    {num === "Special" ? <Star className="fill-amber-400 text-amber-400" size={28} /> : num}
                                                </span>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* RESPONSIVE GRID LAYOUT */}
                                    <div className={`flex flex-col lg:flex-row items-start gap-10 lg:gap-20 ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                                        
                                        {/* MEMORY CARD SIDE */}
                                        <div className="w-full lg:w-[48%]">
                                            <div className="space-y-8">
                                                {memories.map((memory, mIdx) => (
                                                    <motion.div
                                                        key={memory.id}
                                                        initial={{ y: 40, opacity: 0 }}
                                                        whileInView={{ y: 0, opacity: 1 }}
                                                        viewport={{ once: true, margin: "-100px" }}
                                                        transition={{ duration: 0.6, delay: mIdx * 0.1 }}
                                                        className="group"
                                                    >
                                                        {/* High-End Card Wrapper */}
                                                        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-3 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-3xl">
                                                            <MemoryCard 
                                                                memory={memory} 
                                                                isMilestoneView={true} 
                                                                onRefresh={() => fetchMilestones(true)} 
                                                            />
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* DECORATIVE CONTEXT SIDE */}
                                        <div className="w-full lg:w-[48%] pt-10">
                                            <div className={`flex flex-col ${isEven ? 'lg:items-start' : 'lg:items-end'} space-y-6`}>
                                                <div className={`flex items-center gap-4 ${!isEven && 'lg:flex-row-reverse'}`}>
                                                    <div className="h-px w-12 bg-indigo-500 hidden lg:block" />
                                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                                        Chapter {num === "Special" ? "Endless" : num}
                                                    </h3>
                                                </div>
                                                <p className={`text-lg text-slate-400 font-medium max-w-sm ${isEven ? 'text-left' : 'lg:text-right'}`}>
                                                    {num === "Special" 
                                                        ? "Extraordinary moments that transcend the standard timeline." 
                                                        : `Detailed records and breakthroughs achieved during your ${num} developmental cycle.`}
                                                </p>
                                                <div className="flex gap-2">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="h-1.5 w-1.5 rounded-full bg-slate-200 dark:bg-slate-800" />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* FINAL CTA / FOOTER */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="container mx-auto px-6 mt-20 text-center"
                >
                    <div className="bg-indigo-600 rounded-[4rem] p-16 text-white relative overflow-hidden shadow-2xl shadow-indigo-200 dark:shadow-none">
                        <div className="relative z-10">
                            <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter">Your story is still <br/> being written.</h2>
                            <p className="text-indigo-100 text-xl font-medium mb-10 opacity-80 uppercase tracking-widest">Stage {sortedEntries.length + 1} awaits</p>
                            <button className="bg-white text-indigo-600 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:scale-105 transition-transform">
                                Create New Memory
                            </button>
                        </div>
                        <Map className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full text-white/5 pointer-events-none scale-150" />
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
}