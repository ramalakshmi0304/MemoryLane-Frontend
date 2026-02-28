import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Heart,
  ArrowRight,
  Shuffle,
  Camera,
  Calendar,
  Layers,
} from "lucide-react";
import { motion } from "framer-motion";

/* ----------------------------- Animation Config ---------------------------- */

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

/* ------------------------------ Stat Component ----------------------------- */

const Stat = ({ value, label }) => (
  <div className="flex flex-col items-center group">
    <span className="text-4xl font-black tracking-tighter text-[#3d2b1f] transition-transform group-hover:scale-110 duration-300">
      {value}
    </span>
    <span className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-orange-500/60">
      {label}
    </span>
  </div>
);

/* ------------------------------ Home Component ----------------------------- */

const Home = () => {
  const navigate = useNavigate();

  const handleCreateMemory = () => navigate("/create");
  const handleViewTimeline = () => navigate("/timeline");

  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-x-hidden bg-[#FCF9F6] px-6 selection:bg-orange-100 dark:bg-slate-950 transition-colors duration-500">
      
      {/* --- PREMIUM BACKGROUND ELEMENTS --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-100/40 rounded-full blur-[120px] dark:bg-indigo-900/20" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/30 rounded-full blur-[120px] dark:bg-orange-900/10" />
      </div>

      <section className="relative z-10 max-w-6xl w-full pt-20 pb-20 flex flex-col items-center">

        {/* Floating Badge */}
        <motion.div
          {...fadeUp}
          className="mb-8 flex items-center gap-3 rounded-full border border-orange-200/50 bg-white/80 dark:bg-slate-900/80 dark:border-slate-800 backdrop-blur-md px-6 py-2 shadow-sm"
        >
          <Sparkles className="h-4 w-4 text-orange-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Your life, archived beautifully</span>
        </motion.div>

        {/* Hero Heading */}
        <motion.div {...staggerContainer} initial="initial" animate="animate" className="text-center mb-10">
          <motion.h1
            variants={fadeUp}
            className="mb-6 font-serif text-7xl md:text-[7rem] leading-[0.9] tracking-tight text-[#3d2b1f] dark:text-white"
          >
            Capture the <br />
            <span className="inline-block italic font-light text-orange-600 dark:text-orange-400">Unforgettable</span>
          </motion.h1>
          
          <motion.p
            variants={fadeUp}
            className="mx-auto max-w-xl text-lg font-medium leading-relaxed text-slate-500/80 dark:text-slate-400"
          >
            MemoryLane isn't just an archive—it's a living story. Every photo, every thought, every milestone, kept safe forever.
          </motion.p>
        </motion.div>

        
        {/* Call to Actions */}
        <div className="mb-32 flex flex-col sm:flex-row items-center gap-6">
          <button
            onClick={handleCreateMemory}
            className="group relative flex items-center gap-4 rounded-3xl bg-[#3d2b1f] dark:bg-orange-600 px-14 py-6 text-lg font-bold text-white shadow-2xl transition-all duration-500 hover:scale-105 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Heart size={20} className="group-hover:fill-white transition-colors" />
            Save a New Memory
          </button>

          <button
            onClick={handleViewTimeline}
            className="group flex items-center gap-3 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-14 py-6 text-lg font-bold text-slate-700 dark:text-white transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-xl"
          >
            Open Vault
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

        {/* Feature Bento Grid */}
        <div className="grid w-full grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Main Visual Feature */}
          <motion.article 
            whileHover={{ y: -5 }}
            className="md:col-span-8 group relative overflow-hidden rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-10 shadow-xl shadow-slate-200/50 dark:shadow-none"
          >
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="w-full md:w-1/2 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-orange-100 dark:bg-orange-950 flex items-center justify-center text-orange-600">
                  <Calendar size={24} />
                </div>
                <h3 className="text-3xl font-serif text-[#3d2b1f] dark:text-white">The Living Timeline</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  Scroll through a cinematic thread of your life. Our visual engine intelligently clusters moments by date and location.
                </p>
              </div>
              
              {/* Animated Preview Element */}
              <div className="w-full md:w-1/2 h-64 relative flex items-center justify-center">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      rotate: [i * 5, i * -5, i * 5],
                      y: [0, -10, 0]
                    }}
                    transition={{ repeat: Infinity, duration: 4, delay: i }}
                    className="absolute w-40 h-48 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-lg p-2 flex flex-col"
                    style={{ left: `${20 + i * 15}%`, zIndex: 10 - i }}
                  >
                    <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-lg flex items-center justify-center">
                      <Camera className="text-slate-200 dark:text-slate-800" size={32} />
                    </div>
                    <div className="h-6 mt-2 w-2/3 bg-slate-50 dark:bg-slate-950 rounded" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.article>

          {/* Secondary Feature */}
          <motion.article 
            whileHover={{ scale: 0.98 }}
            className="md:col-span-4 rounded-[3rem] bg-[#3d2b1f] p-10 text-white flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl group-hover:bg-orange-500/30 transition-colors" />
            <div className="space-y-6">
              <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                <Shuffle className="text-orange-400" size={28} />
              </div>
              <h3 className="text-3xl font-serif">Reminisce</h3>
              <p className="text-orange-100/60 leading-relaxed">
                Let our AI surface moments you haven't seen in years. Rediscover the magic in the mundane.
              </p>
            </div>
            <button className="mt-8 flex items-center gap-2 text-orange-400 font-bold uppercase tracking-widest text-xs">
              Try it now <ArrowRight size={14} />
            </button>
          </motion.article>

        </div>
      </section>

      {/* Elegant Footer */}
      <footer className="w-full max-w-6xl py-20 border-t border-slate-100 dark:border-slate-800 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="h-px w-20 bg-orange-300" />
          <p className="font-serif text-2xl italic text-slate-400 max-w-lg">
            "We do not remember days, we remember moments."
          </p>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 dark:text-slate-700">
            MemoryLane v2.0 &bull; 2026
          </p>
        </div>
      </footer>
    </main>
  );
};

export default Home;