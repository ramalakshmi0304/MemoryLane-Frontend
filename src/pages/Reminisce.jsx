import React, { useState, useEffect, useCallback } from "react";
import { MapPin, Shuffle, Sparkles, Star, Loader2, Mic, Volume2, Quote, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../components/Layout";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import API from "../api/axios"; 
import { toast } from "sonner";

export default function Reminisce() {
  const [memory, setMemory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState(0);

  const fetchRandomMemory = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await API.get("/memories/random");
      const newMemory = response.data;
      
      if (!newMemory) {
        toast.error("No memories found to reminisce!");
      } else {
        setMemory(newMemory);
        setKey((k) => k + 1);
      }
    } catch (err) {
      toast.error("Could not load a random memory.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRandomMemory();
  }, [fetchRandomMemory]);

  const displayUrl = memory?.display_url || memory?.media_url || memory?.media?.find(m => m.file_type !== 'audio')?.file_url;
  const voiceUrl = memory?.voice_url || memory?.media?.find(m => m.file_type === 'audio')?.file_url;

  const formattedDate = memory ? new Date(memory.memory_date || memory.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }) : "";

  return (
    <Layout>
      <div className="relative flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center overflow-hidden py-12 px-6 bg-[#fdfaf7] dark:bg-slate-950">
        
        {/* --- DYNAMIC BACKGROUND AMBIENCE --- */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute -left-[10%] top-1/4 h-[500px] w-[500px] rounded-full bg-orange-200/30 blur-[120px] dark:bg-orange-900/10" 
          />
          <motion.div 
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 12, repeat: Infinity }}
            className="absolute -right-[10%] bottom-1/4 h-[500px] w-[500px] rounded-full bg-indigo-200/20 blur-[120px] dark:bg-indigo-900/10" 
          />
        </div>

        {/* --- HEADER --- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mb-12 flex flex-col items-center gap-4 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/50 dark:bg-slate-900/50 dark:border-slate-800 px-4 py-1.5 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-orange-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Memory Roulette</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-black text-[#3d2b1f] dark:text-white tracking-tight">
            A Moment in Time
          </h1>
        </motion.div>

        {/* --- MAIN CARD --- */}
        <div className="relative z-10 w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loader"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex h-[500px] items-center justify-center bg-white/50 dark:bg-slate-900/50 rounded-[3rem] border border-dashed border-orange-200 dark:border-slate-800"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="h-12 w-12 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin" />
                  <p className="text-xs font-bold uppercase tracking-widest text-orange-500 animate-pulse">Shuffling the deck...</p>
                </div>
              </motion.div>
            ) : memory ? (
              <motion.div
                key={key}
                initial={{ opacity: 0, rotateY: 45, scale: 0.9 }}
                animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                exit={{ opacity: 0, rotateY: -45, scale: 0.9 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="group relative overflow-hidden rounded-[3rem] border border-white dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] dark:shadow-none"
              >
                {/* Media Section */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  {displayUrl ? (
                    <img
                      src={displayUrl}
                      alt={memory.title}
                      className="h-full w-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-[#3d2b1f] text-orange-100/20">
                      <Quote size={80} fill="currentColor" />
                    </div>
                  )}
                  
                  {/* Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3d2b1f]/90 via-transparent to-black/20" />
                  
                  {memory.is_milestone && (
                    <div className="absolute left-8 top-8 flex items-center gap-2 rounded-2xl bg-amber-400 px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-amber-950 shadow-xl">
                      <Star className="h-3 w-3 fill-current" />
                      Milestone Moment
                    </div>
                  )}

                  <div className="absolute bottom-8 left-10">
                    <div className="flex items-center gap-2 text-orange-200/80 mb-2 font-bold text-[10px] uppercase tracking-widest">
                      <Calendar size={14} /> {formattedDate}
                    </div>
                    <h2 className="font-serif text-4xl md:text-5xl font-black text-white leading-none">
                      {memory.title}
                    </h2>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-10 bg-white dark:bg-slate-900">
                  
                  {/* Audio Player */}
                  {voiceUrl && (
                    <div className="mb-8 flex items-center gap-5 bg-orange-50/80 dark:bg-orange-950/20 p-5 rounded-[2rem] border border-orange-100 dark:border-orange-900/30">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500 shadow-lg shadow-orange-500/30 text-white">
                        <Volume2 size={24} className="animate-pulse" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">Recorded Narration</p>
                        <audio src={voiceUrl} controls className="h-8 w-full custom-audio" />
                      </div>
                    </div>
                  )}

                  <p className="text-xl leading-relaxed text-slate-600 dark:text-slate-400 font-medium italic">
                    "{memory.description}"
                  </p>

                  <div className="mt-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-t border-slate-50 dark:border-slate-800 pt-8">
                    {memory.location ? (
                      <div className="flex items-center gap-2 text-sm font-black text-[#3d2b1f] dark:text-slate-300 uppercase tracking-tighter">
                        <MapPin className="h-5 w-5 text-orange-500" />
                        {memory.location}
                      </div>
                    ) : <div />}

                    <div className="flex flex-wrap gap-2">
                      {memory.tags?.map((tag, i) => (
                        <Badge key={i} className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-none font-bold rounded-xl px-4 py-1 hover:bg-orange-500 hover:text-white transition-colors">
                          #{typeof tag === 'object' ? tag.name : tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center p-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                <p className="text-slate-500 font-bold uppercase tracking-widest">No memories found</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* --- ACTION BUTTON --- */}
        <div className="mt-16 relative z-20">
          <Button 
            onClick={fetchRandomMemory} 
            disabled={isLoading}
            className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-[#3d2b1f] dark:bg-orange-600 text-white shadow-2xl hover:scale-110 transition-transform active:scale-90 flex items-center justify-center group"
          >
            <Shuffle className={`h-8 w-8 transition-transform duration-700 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
          </Button>
          <div className="mt-4 text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600">Re-Shuffle</span>
          </div>
        </div>
      </div>

      {/* --- CORRECTED STYLE BLOCK --- */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-audio::-webkit-media-controls-enclosure {
          background-color: transparent;
        }
        .custom-audio::-webkit-media-controls-panel {
          padding: 0;
        }
      `}} />
    </Layout>
  );
}