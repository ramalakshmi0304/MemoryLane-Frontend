import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, Share2, FileText, Sparkles, Trash2, Info, X, Wand2, Loader2, Check, RotateCcw
} from "lucide-react";
import API from "../api/axios";
import Layout from "../components/Layout";
import MemoryCard from "../components/MemoryCard";
import SearchBar from "../components/SearchBar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import domtoimage from 'dom-to-image-more';
import { jsPDF } from "jspdf";
import { cn } from "@/lib/utils";
import { triggerAlbumMagic, confirmAlbumMagic } from "../api/aiService";

const MemorySkeleton = () => (
  <div className="mb-8 break-inside-avoid relative aspect-[4/5] rounded-[2rem] bg-slate-200 animate-pulse" />
);

export default function AlbumDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pdfExportRef = useRef(null);

  const [album, setAlbum] = useState(null);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiApplying, setIsAiApplying] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null); // NEW: Holds AI preview data

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableMemories, setAvailableMemories] = useState([]);
  const [modalSelection, setModalSelection] = useState([]);

  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [isMilestone, setIsMilestone] = useState(false);

  const fetchAlbumData = useCallback(async (isInitial = false) => {
    if (id && id.length !== 36) {
      toast.error("Invalid Album ID.");
      return navigate("/albums");
    }

    try {
      if (isInitial) setLoading(true);
      const res = await API.get(`/albums/${id}`);
      setAlbum(res.data);
      setMemories(res.data.memories || []);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load album.");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchAlbumData(true);
  }, [fetchAlbumData]);

  const handleAiMagic = async () => {
    if (memories.length === 0) return toast.error("Add moments first!");

    setIsAiLoading(true);
    const toastId = toast.loading("Gemini is imagining cinematic titles...");

    try {
      const data = await triggerAlbumMagic(id, album?.user_id, album?.name);
      if (data.success && data.suggestions) {
        setAiSuggestions(data.suggestions);
        toast.success("AI Suggestions ready!", { id: toastId });
      }
    } catch (err) {
      toast.error("AI Magic failed.", { id: toastId });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyMagic = async () => {
  if (!aiSuggestions) return;
  setIsAiApplying(true);
  const toastId = toast.loading("Saving enhancements...");

  try {
    const data = await confirmAlbumMagic(id, aiSuggestions);

    if (data.success) {
      // 1. Create the updated list correctly
      const updated = memories.map((mem) => {
        const s = aiSuggestions.find((suggestion) => 
          String(suggestion.id) === String(mem.id)
        );
        
        return s 
          ? { ...mem, title: s.new_title, description: s.new_description } 
          : mem;
      });

      // 2. Update state with the new array
      setMemories([...updated]); 
      
      // 3. Clear suggestions to exit preview mode
      setAiSuggestions(null);
      
      toast.success("Album enhanced!", { id: toastId });
    }
  } catch (err) {
    // THIS WAS MISSING: The catch block
    console.error("Apply Magic Error:", err);
    toast.error("Failed to save.", { id: toastId });
  } finally {
    // THIS WAS MISSING: The finally block
    setIsAiApplying(false);
  }
};
  const handleExportPDF = async () => {
    if (memories.length === 0) return toast.error("No memories to export");
    const toastId = toast.loading("Rendering your Lookbook...");

    try {
      const element = pdfExportRef.current;
      element.style.display = "block";

      const dataUrl = await domtoimage.toPng(element, {
        bgcolor: '#ffffff',
        width: 800,
        cacheBust: true
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / 800;

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${album?.name.replace(/\s+/g, '_')}_Lookbook.pdf`);

      element.style.display = "none";
      toast.success("Lookbook exported!", { id: toastId });
    } catch (err) {
      toast.error("Export failed.", { id: toastId });
      if (pdfExportRef.current) pdfExportRef.current.style.display = "none";
    }
  };

  const openAddModal = async () => {
    try {
      const res = await API.get("/memories");
      const allLibraryMemories = res.data?.memories || res.data || [];
      const currentAlbumIds = memories.map(m => m.id);
      const available = allLibraryMemories.filter(m => !currentAlbumIds.includes(m.id));

      setAvailableMemories(available);
      setModalSelection([]);
      setIsModalOpen(true);
    } catch (error) {
      toast.error("Could not load library.");
    }
  };

  const handleAddSelected = async () => {
    if (modalSelection.length === 0) return;
    const toastId = toast.loading(`Adding ${modalSelection.length} moments...`);

    try {
      await API.post(`/albums/${id}/memories`, { memoryIds: modalSelection });
      toast.success("Album updated!", { id: toastId });
      setIsModalOpen(false);
      fetchAlbumData(false);
    } catch (err) {
      toast.error("Bulk add failed.", { id: toastId });
    }
  };

  const handleRemoveMemory = async (memoryId) => {
    try {
      await API.delete(`/albums/${id}/memories/${memoryId}`);
      toast.success("Removed from album");
      setMemories(prev => prev.filter(m => m.id !== memoryId));
    } catch (err) {
      toast.error("Failed to remove moment.");
    }
  };

  const handleDeleteAlbum = async () => {
    if (!window.confirm("Permanently delete this album?")) return;
    try {
      await API.delete(`/albums/${id}`);
      toast.success("Album deleted");
      navigate("/albums");
    } catch (err) { toast.error("Delete failed"); }
  };

  const filteredAvailable = availableMemories.filter(mem => {
    const matchesSearch = !search ||
      mem.title?.toLowerCase().includes(search.toLowerCase()) ||
      mem.description?.toLowerCase().includes(search.toLowerCase());

    const matchesTag = tagFilter === "all" || mem.tags?.includes(tagFilter);
    const matchesMilestone = !isMilestone || mem.is_milestone;

    return matchesSearch && matchesTag && matchesMilestone;
  });

  const allAvailableTags = [...new Set(availableMemories.flatMap(m => m.tags || []))];

  return (
    <Layout>
      <div className="min-h-screen bg-[#fcfcfd] dark:bg-slate-950 pb-20">

        {/* --- HEADER --- */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Link to="/albums" className="inline-flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest mb-2">
                <ArrowLeft size={14} /> Library
              </Link>
              <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
                {album?.name}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleAiMagic}
                disabled={isAiLoading || memories.length === 0 || aiSuggestions}
                className="rounded-2xl gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg border-none"
              >
                {isAiLoading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                <span className="font-bold">AI Magic</span>
              </Button>

              <Button
                onClick={handleExportPDF}
                variant="outline"
                disabled={memories.length === 0}
                className="rounded-2xl gap-2 border-indigo-100 bg-white dark:bg-slate-900"
              >
                <FileText size={16} className="text-indigo-600" />
                <span className="font-bold text-indigo-600">Lookbook</span>
              </Button>
              <Button onClick={openAddModal} className="bg-indigo-600 text-white rounded-2xl shadow-lg">
                <Plus size={18} /> Add Moments
              </Button>
              <Button onClick={handleDeleteAlbum} variant="ghost" className="text-rose-500 hover:bg-rose-50 rounded-2xl">
                <Trash2 size={18} />
              </Button>
            </div>
          </div>
        </div>

        {/* --- CONTENT --- */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12">
            <p className="max-w-3xl text-xl text-slate-500 font-medium leading-relaxed italic border-l-4 border-indigo-100 pl-6">
              {album?.description || "A curated timeline of your most cherished captures."}
            </p>
          </motion.div>

          {loading ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8">
              {[1, 2, 3, 4].map(i => <MemorySkeleton key={i} />)}
            </div>
          ) : memories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-200 rounded-[3rem] text-center">
              <Info className="text-slate-300 mb-4" size={48} />
              <h3 className="text-xl font-bold">This album is empty</h3>
              <Button onClick={openAddModal} variant="link" className="text-indigo-600">Add some memories</Button>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8">
              {memories.map((memory, idx) => {
                // Check if there is a preview suggestion for this memory
                const suggestion = aiSuggestions?.find(s => s.id === memory.id);

                return (
                  <motion.div
                    // 2. DYNAMIC KEY: When 'aiSuggestions' becomes null (after clicking Apply), 
                    // the key changes from "id-preview" to "id-stable". 
                    // This FORCES React to destroy the old card and mount a brand new one.
                    key={`${memory.id}-${aiSuggestions ? 'preview' : 'stable'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn(
                      "break-inside-avoid relative rounded-[2.5rem] transition-all duration-500",
                      suggestion && "ring-4 ring-purple-400 ring-offset-4 dark:ring-offset-slate-950"
                    )}
                  >
                    {suggestion && (
                      <div className="absolute -top-3 -right-3 z-10 bg-purple-600 text-white p-2 rounded-full shadow-lg">
                        <Sparkles size={16} />
                      </div>
                    )}
                    <MemoryCard
                      memory={{
                        ...memory,
                        // 3. PRIORITY LOGIC: Use suggestion if it exists, otherwise use memory state
                        title: suggestion?.new_title || memory.title,
                        description: suggestion?.new_description || memory.description,
                        display_url: memory.display_url || memory.media?.[0]?.file_url
                      }}
                      onRefresh={() => fetchAlbumData(false)}
                      isAlbumView={true}
                      onRemove={() => handleRemoveMemory(memory.id)}
                    />
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* --- FLOATING AI ACTIONS BAR --- */}
        <AnimatePresence>
          {aiSuggestions && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-slate-900 border-2 border-indigo-500 p-4 pl-8 rounded-[3rem] shadow-2xl flex items-center gap-8 min-w-[400px]"
            >
              <div>
                <p className="text-indigo-600 font-black text-xs uppercase tracking-widest">AI Preview Mode</p>
                <p className="text-slate-500 text-sm font-bold">Enhance {aiSuggestions.length} items?</p>
              </div>
              <div className="flex gap-2 ml-auto">
                <Button
                  variant="ghost"
                  onClick={() => setAiSuggestions(null)}
                  className="rounded-2xl gap-2 text-slate-500 font-bold"
                >
                  <RotateCcw size={16} /> Discard
                </Button>
                <Button
                  onClick={handleApplyMagic}
                  disabled={isAiApplying}
                  className="rounded-2xl gap-2 bg-indigo-600 text-white font-bold px-6"
                >
                  {isAiApplying ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                  Apply Magic
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- MODAL SECTION --- */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
              >
                <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">Add to Album</h2>
                    <p className="text-slate-500 text-sm">{filteredAvailable.length} moments match filters</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {modalSelection.length > 0 && (
                      <Button
                        onClick={handleAddSelected}
                        className="bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100"
                      >
                        Add {modalSelection.length} Selected
                      </Button>
                    )}
                    <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-full">
                      <X size={20} />
                    </Button>
                  </div>
                </div>

                <div className="px-8 py-4 border-b">
                  <SearchBar
                    search={search}
                    setSearch={setSearch}
                    tagFilter={tagFilter}
                    setTagFilter={setTagFilter}
                    tags={allAvailableTags}
                    isMilestone={isMilestone}
                    setIsMilestone={setIsMilestone}
                  />
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {filteredAvailable.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-slate-400 font-medium">No moments match your search.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredAvailable.map((mem) => {
                        const isSelected = modalSelection.includes(mem.id);
                        return (
                          <div
                            key={mem.id}
                            onClick={() => {
                              setModalSelection(prev =>
                                prev.includes(mem.id) ? prev.filter(id => id !== mem.id) : [...prev, mem.id]
                              );
                            }}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border-2",
                              isSelected
                                ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-500 shadow-sm"
                                : "bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-slate-200"
                            )}
                          >
                            <div className="w-16 h-16 rounded-xl overflow-hidden relative flex-shrink-0 bg-slate-200">
                              <img
                                src={mem.display_url || mem.media?.[0]?.file_url}
                                className="w-full h-full object-cover"
                                alt=""
                              />
                              {isSelected && (
                                <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                                  <Sparkles size={20} className="text-white fill-current" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-900 dark:text-white truncate">{mem.title || "Untitled Moment"}</h4>
                              <p className={cn(
                                "text-[10px] font-black uppercase tracking-widest",
                                isSelected ? "text-indigo-600" : "text-slate-400"
                              )}>
                                {isSelected ? "Selected" : "Click to select"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- PDF TEMPLATE (Hidden) --- */}
        <div
          ref={pdfExportRef}
          style={{
            display: "none",
            width: "800px",
            padding: "60px",
            backgroundColor: "#ffffff",
            color: "#000000",
            fontFamily: "Arial, sans-serif"
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h1 style={{ fontSize: "48px", fontWeight: "900", color: "#1e293b", margin: 0 }}>{album?.name}</h1>
            <p style={{ color: "#64748b", fontSize: "18px", marginTop: "10px" }}>{album?.description}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
            {memories.map((mem, i) => (
              <div key={i} style={{ marginBottom: "20px" }}>
                <div style={{ borderRadius: "15px", overflow: "hidden", height: "350px", backgroundColor: "#f8fafc" }}>
                  <img
                    crossOrigin="anonymous"
                    src={mem.display_url || mem.media?.[0]?.file_url}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    alt=""
                  />
                </div>
                <h4 style={{ marginTop: "12px", fontSize: "16px", fontWeight: "bold", color: "#334155" }}>
                  {mem.title || "Untitled Moment"}
                </h4>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
}