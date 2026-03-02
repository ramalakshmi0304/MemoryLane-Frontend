import React, { useState } from "react";
// ADDED: CheckCircle2 for the selection badge
import { Trash2, Trophy, MapPin, PlayCircle, Sparkles, Mic, Share2, AlertTriangle, Edit3, Download, Calendar, CheckCircle2 } from "lucide-react";
import { format, isValid } from "date-fns";
import API from "../api/axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import EditMemoryModal from "./EditMemoryModal"; 

const MemoryCard = ({ memory, onRefresh, isSelectionMode, isSelected, onSelect }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Logic
  const displayUrl = memory.display_url || memory.media_url || memory.image_path || (memory.media && memory.media[0]?.file_url);
  const voiceUrl = memory.voice_url; 
  const mediaType = memory.media_type || "image";

  const formattedDate = () => {
    const dateObj = new Date(memory.memory_date || memory.created_at);
    return isValid(dateObj) ? format(dateObj, "PPP") : "Unknown Date";
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/dashboard?id=${memory.id}`;
    if (navigator.share) {
      navigator.share({ title: memory.title, url: shareUrl }).catch(() => { });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied!");
    }
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (!displayUrl) return;
    try {
      const response = await fetch(displayUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      const fileName = `${memory.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'memory'}.jpg`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      toast.error("Could not download image");
    }
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await API.delete(`/memories/${memory.id}`); 
      toast.success("Memory permanently erased");
      if (onRefresh) onRefresh(); 
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error(err.response?.data?.message || "Error deleting memory");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const renderPrimaryMedia = () => {
    if (!displayUrl || imageError) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400">
          <Sparkles size={40} className="mb-4 opacity-20" />
          <span className="text-[12px] font-black uppercase tracking-[0.3em] opacity-40 text-center px-4">
            {voiceUrl ? "Audio Record Only" : "No Visual Context"}
          </span>
        </div>
      );
    }
    if (mediaType === "video") {
      return (
        <div className="relative h-full w-full">
          <video src={displayUrl} className="h-full w-full object-cover" muted />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <PlayCircle className="text-white drop-shadow-2xl" size={64} />
          </div>
        </div>
      );
    }
    return (
      <img
        src={displayUrl}
        className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
        alt={memory.title}
        onError={() => setImageError(true)}
      />
    );
  };

  return (
    <>
      <motion.div
        layout
        onClick={() => isSelectionMode ? onSelect() : null}
        className={`group relative flex flex-col w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-4 shadow-xl transition-all duration-500 cursor-pointer ${
          isSelected 
            ? "ring-[4px] ring-indigo-600 shadow-indigo-200 dark:shadow-none translate-y-[-8px]" 
            : "hover:-translate-y-3 shadow-slate-200/50 dark:shadow-none"
        } ${
          memory.is_milestone && !isSelected ? "border-amber-200 ring-[12px] ring-amber-50/50" : "border-slate-50 dark:border-slate-800"
        }`}
      >
        {/* SELECTION BADGE */}
        <AnimatePresence>
          {isSelected && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-3 -right-3 z-[50] bg-indigo-600 text-white p-2 rounded-full shadow-xl border-4 border-white dark:border-slate-900"
            >
              <CheckCircle2 size={24} strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* MILESTONE BADGE */}
        {memory.is_milestone && (
          <div className="absolute top-6 left-6 z-40 bg-amber-500 text-white px-5 py-2 rounded-2xl shadow-xl flex items-center gap-2 border-2 border-white dark:border-slate-900">
            <Trophy size={16} fill="currentColor" />
            <span className="text-[11px] font-black uppercase tracking-widest">Milestone</span>
          </div>
        )}

        {/* FLOATING ACTIONS */}
        {!isSelectionMode && (
          <div className="absolute top-6 right-6 z-40 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
            {[
              { icon: Share2, color: "text-indigo-600", onClick: handleShare },
              { icon: Edit3, color: "text-slate-600", onClick: (e) => { e.stopPropagation(); setShowEditModal(true); } },
              { icon: Trash2, color: "text-rose-600", onClick: (e) => { e.stopPropagation(); setShowDeleteModal(true); } }
            ].map((btn, idx) => (
              <button 
                key={idx}
                onClick={btn.onClick}
                className={`h-12 w-12 flex items-center justify-center bg-white/95 dark:bg-slate-800/95 ${btn.color} hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black rounded-2xl shadow-2xl backdrop-blur-md transition-all active:scale-90 border border-slate-100 dark:border-slate-700`}
              >
                <btn.icon size={20} strokeWidth={2.5} />
              </button>
            ))}
          </div>
        )}

        {/* MEDIA BOX */}
        <div
          onClick={(e) => {
            if (isSelectionMode) return; 
            e.stopPropagation();
            displayUrl && !imageError && setIsEnlarged(true);
          }}
          className={`relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-slate-100 dark:bg-slate-800 ${displayUrl ? 'cursor-zoom-in' : 'cursor-default'}`}
        >
          {renderPrimaryMedia()}
          {isSelected && <div className="absolute inset-0 bg-indigo-600/20 backdrop-blur-[2px]" />}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* CONTENT SECTION (Only One Copy Now!) */}
        <div className="mt-8 px-4 pb-4 space-y-6">
          <div className="flex flex-wrap gap-2">
            {memory.tags?.map((tag, i) => {
              const tagName = typeof tag === "object" && tag !== null ? tag.name : tag;
              return (
                <span key={i} className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[11px] font-black uppercase rounded-xl tracking-[0.1em]">
                  #{tagName}
                </span>
              );
            })}
          </div>
          
          <div className="space-y-3">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
              {memory.title}
            </h3>
            {memory.location && (
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin size={14} className="text-indigo-500" strokeWidth={3} />
                <span className="text-sm font-bold uppercase tracking-wider">{memory.location}</span>
              </div>
            )}
          </div>

          {voiceUrl && (
            <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-[1.5rem] border border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center gap-2 mb-3">
                <Mic size={14} className="text-indigo-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Voice Archive</span>
              </div>
              <audio src={voiceUrl} controls className="w-full h-8 opacity-80" />
            </div>
          )}
          
          <div className="flex items-center justify-between pt-6 border-t-2 border-slate-50 dark:border-slate-800/60">
            <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
              <Calendar size={14} strokeWidth={3} />
              {formattedDate()}
            </div>
            <button 
              onClick={handleDownload}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
            >
              <Download size={20} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* FULLSCREEN OVERLAY */}
      <AnimatePresence>
        {isEnlarged && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-3xl flex flex-col items-center justify-center p-8 cursor-zoom-out"
            onClick={() => setIsEnlarged(false)}
          >
            <motion.img
              initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }}
              src={displayUrl} className="max-w-full max-h-[80vh] rounded-[2.5rem] shadow-2xl border border-white/10 object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <EditMemoryModal 
        memory={memory} isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} onRefresh={onRefresh} 
      />

      {/* DELETE MODAL (Ensured Buttons are Active) */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/95 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 max-w-md w-full border border-slate-100 dark:border-slate-800 text-center"
            >
              <div className="w-24 h-24 bg-rose-50 dark:bg-rose-950/30 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                <AlertTriangle size={48} strokeWidth={2.5} />
              </div>
              <h4 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">Permanent Erase?</h4>
              <p className="text-slate-500 dark:text-slate-400 mb-12">This memory will be removed forever.</p>
              <div className="grid grid-cols-1 gap-4">
                <button 
                  disabled={isDeleting}
                  onClick={(e) => { e.stopPropagation(); confirmDelete(); }}
                  className="w-full py-5 rounded-[1.5rem] bg-rose-600 text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-rose-700 disabled:opacity-50"
                >
                  {isDeleting ? "Erasing..." : "Confirm Erase"}
                </button>
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full py-5 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 text-slate-600 font-black uppercase tracking-[0.2em] text-xs"
                >
                  Keep Memory
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MemoryCard;