import React, { useState, useEffect, useRef } from "react";
import { X, Save, Calendar, MapPin, Type, Image as ImageIcon, UploadCloud, Sparkles } from "lucide-react";
import API from "../api/axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const EditMemoryModal = ({ memory, isOpen, onClose, onRefresh }) => {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    memory_date: "",
    is_milestone: false
  });

  // --- LOGIC (UNTOUCHED) ---
  useEffect(() => {
    if (memory && isOpen) {
      setFormData({
        title: memory.title || "",
        description: memory.description || "",
        location: memory.location || "",
        memory_date: memory.memory_date ? memory.memory_date.split("T")[0] : "",
        is_milestone: !!memory.is_milestone
      });
      setPreviewUrl(memory.display_url || memory.media_url || (memory.media && memory.media[0]?.file_url));
      setSelectedFile(null);
    }
  }, [memory, isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("location", formData.location);
      data.append("memory_date", formData.memory_date);
      data.append("is_milestone", formData.is_milestone);
      if (selectedFile) data.append("file", selectedFile);

      await API.put(`/memories/${memory.id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Memory updated!");
      onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
      >
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Edit Memory</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Refine your captured moment</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {/* IMAGE UPLOAD SECTION */}
          <div className="space-y-3">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group relative aspect-video rounded-[2rem] overflow-hidden bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-300"
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white backdrop-blur-[2px]">
                    <UploadCloud size={32} className="mb-2" />
                    <span className="text-xs font-black uppercase tracking-widest">Replace Media</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
                    <ImageIcon size={28} className="opacity-40" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Click to upload visuals</span>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,video/*"
              onChange={handleFileChange} 
            />
          </div>

          {/* FORM FIELDS */}
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Memory Title</label>
              <div className="relative group">
                <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  type="text"
                  required
                  placeholder="What happened?"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-transparent focus:border-indigo-500/50 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none font-bold text-slate-800 dark:text-white"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Location</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="Where was this?"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-transparent focus:border-indigo-500/50 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none font-bold text-slate-800 dark:text-white text-sm"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Date</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type="date"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-transparent focus:border-indigo-500/50 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none font-bold text-slate-800 dark:text-white text-sm"
                    value={formData.memory_date}
                    onChange={(e) => setFormData({ ...formData, memory_date: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* MILESTONE TOGGLE */}
            <div 
              onClick={() => setFormData({...formData, is_milestone: !formData.is_milestone})}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                formData.is_milestone 
                ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800" 
                : "bg-slate-50 border-transparent dark:bg-slate-950"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${formData.is_milestone ? "bg-amber-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400"}`}>
                  <Sparkles size={16} />
                </div>
                <span className={`text-xs font-black uppercase tracking-widest ${formData.is_milestone ? "text-amber-700 dark:text-amber-400" : "text-slate-500"}`}>
                  Milestone Moment
                </span>
              </div>
              <div className={`w-10 h-6 rounded-full relative transition-colors ${formData.is_milestone ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_milestone ? "left-5" : "left-1"}`} />
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-slate-200 dark:shadow-none hover:-translate-y-1 disabled:opacity-50"
            >
              {loading ? "Syncing..." : <><Save size={18} strokeWidth={3} /> Save Changes</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditMemoryModal;