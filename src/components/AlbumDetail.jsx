import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, Share2, FileText, Sparkles, Trash2, Info, X
} from "lucide-react";
import API from "../api/axios";
import Layout from "../components/Layout";
import MemoryCard from "../components/MemoryCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import domtoimage from 'dom-to-image-more';
import { jsPDF } from "jspdf";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableMemories, setAvailableMemories] = useState([]);

  const fetchAlbumData = useCallback(async (isInitial = false) => {
    if (id && id.length !== 36) {
      toast.error("Invalid Album ID.");
      return navigate("/albums");
    }

    try {
      if (isInitial) setLoading(true);

      let res = await API.get(`/albums/${id}`);
      
      if (!res.data) {
        const createRes = await API.post("/albums", {
          name: "My First Album",
          description: "This is a default album",
        });
        res = { data: createRes.data };
      }

      setAlbum(res.data);
      // Flattening logic: handles both backend-flattened and direct Supabase join structures
      const fetchedMemories = res.data.memories || [];
      setMemories(fetchedMemories);

    } catch (err) {
      console.error("Album fetch failed:", err.response?.data || err.message);

      if (err.response?.status === 404) {
        try {
          const createRes = await API.post("/albums", {
            name: "My First Album",
            description: "This is a default album",
          });
          setAlbum(createRes.data);
          setMemories([]);
        } catch (createErr) {
          toast.error("Failed to load album.");
          navigate("/albums");
        }
      } else {
        toast.error(err.response?.data?.message || "Failed to load album.");
        navigate("/albums");
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchAlbumData(true);
  }, [fetchAlbumData]);

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
    
    // Get the IDs of memories already in this album
    const currentAlbumIds = memories.map(m => m.id);
    
    // Only show memories that AREN'T already here
    const available = allLibraryMemories.filter(m => !currentAlbumIds.includes(m.id));
    
    setAvailableMemories(available);
    setIsModalOpen(true);
  } catch (error) {
    toast.error("Could not load library.");
  }
};

const handleAddToAlbum = async (memoryId) => {
  try {
    // 1. Match the key name your controller is looking for (memoryIds)
    const payload = { memoryIds: [memoryId] }; 

    // 2. Make the POST request
    await API.post(`/albums/${id}/memories`, payload);
    
    toast.success("Moment added!");
    setIsModalOpen(false); // Close the modal
    fetchAlbumData(false); // Refresh the album view to show the new photo
  } catch (err) {
    console.error("Frontend Error:", err.response?.data);
    toast.error(err.response?.data?.message || "Failed to update album.");
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
              <Button onClick={handleExportPDF} variant="outline" className="rounded-2xl gap-2 border-indigo-100 bg-white dark:bg-slate-900">
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
              {memories.map((memory, idx) => (
                <motion.div 
                  key={memory.id} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: idx * 0.05 }} 
                  className="break-inside-avoid"
                >
                  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 relative group">
                    <MemoryCard 
                      memory={{
                        ...memory,
                        display_url: memory.display_url || memory.media?.[0]?.file_url
                      }} 
                      onRefresh={() => fetchAlbumData(false)} 
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* --- ADD MEMORIES MODAL --- */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[80vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
              >
                <div className="p-8 border-b flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">Add to Album</h2>
                    <p className="text-slate-500 text-sm">Select moments from your library</p>
                  </div>
                  <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-full">
                    <X size={20} />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {availableMemories.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-slate-400">No new moments available to add.</p>
                    </div>
                  ) : (
                    availableMemories.map((mem) => (
                      <div key={mem.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl group hover:bg-indigo-50 transition-colors">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200">
                          <img 
                            src={mem.display_url || mem.media?.[0]?.file_url} 
                            className="w-full h-full object-cover" 
                            alt="" 
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 dark:text-white">{mem.title || "Untitled Moment"}</h4>
                        </div>
                        <Button 
                          onClick={() => handleAddToAlbum(mem.id)} 
                          className="bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-100 rounded-xl font-bold"
                        >
                          Add
                        </Button>
                      </div>
                    ))
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