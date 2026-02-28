import React, { useEffect, useState, useCallback } from "react";
import API from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ImageIcon, Loader2, Download, Trash2, FolderPlus, X, ChevronRight, Layers, Share2, Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Albums() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newAlbum, setNewAlbum] = useState({ name: "", description: "" });

  const fetchAlbums = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/albums");
      const data = res.data?.albums || res.data || [];
      setAlbums(data);
    } catch (err) {
      toast.error("Failed to load collections.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  const handleShareAlbum = async (e, album) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Copy internal dashboard link for authenticated team members
    const internalUrl = `${window.location.origin}/albums/${album.id}`;

    try {
      await navigator.clipboard.writeText(internalUrl);
      toast.success("Internal link copied to clipboard!");
    } catch (err) { 
      toast.error("Could not copy link."); 
    }
  };

  const handleDeleteAlbum = async (e, albumId) => {
    e.preventDefault(); e.stopPropagation();
    if (!window.confirm("Delete this collection? This cannot be undone.")) return;
    try {
      await API.delete(`/albums/${albumId}`);
      setAlbums((prev) => prev.filter((a) => a.id !== albumId));
      toast.success("Collection removed");
    } catch (err) { toast.error("Delete failed"); }
  };

  const handleDownloadAlbum = async (e, album) => {
    e.preventDefault(); e.stopPropagation();
    const toastId = toast.loading(`Preparing archive for "${album.name}"...`);
    try {
      const res = await API.get(`/albums/${album.id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${album.name.replace(/\s+/g, '_')}_Archive.zip`;
      link.click();
      toast.success("Download started!", { id: toastId });
    } catch (err) { 
      toast.error("Failed to generate archive.", { id: toastId }); 
    }
  };

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    if (!newAlbum.name.trim()) return toast.error("Please enter an album name");
    
    try {
      const res = await API.post("/albums", newAlbum);
      const createdAlbum = res.data?.album || res.data;
      
      // Update local state with the new album
      setAlbums((prev) => [{ ...createdAlbum, total_memories: 0 }, ...prev]);
      setNewAlbum({ name: "", description: "" });
      setIsCreating(false);
      toast.success("Collection initialized!");
    } catch (err) { 
      toast.error("Error creating collection"); 
    }
  };

  return (
    <Layout>
      <div className="bg-[#FDFDFF] dark:bg-slate-950 min-h-screen pb-24">
        <div className="max-w-[1400px] mx-auto px-6 pt-16">
          
          {/* --- HEADER --- */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-indigo-600">
                <Layers size={24} strokeWidth={2.5} />
                <span className="text-xs font-black uppercase tracking-[0.3em]">Archive</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter">
                Collections<span className="text-indigo-600">.</span>
              </h1>
            </div>
            <Button 
              onClick={() => setIsCreating(!isCreating)} 
              className={cn(
                "h-16 px-8 rounded-2xl font-black uppercase text-xs tracking-widest transition-all", 
                isCreating 
                  ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
                  : "bg-indigo-600 text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300"
              )}
            >
              {isCreating ? <X size={18} className="mr-2"/> : <FolderPlus size={18} className="mr-2"/>}
              {isCreating ? "Discard" : "New Album"}
            </Button>
          </div>

          {/* --- CREATE ALBUM FORM --- */}
          <AnimatePresence>
            {isCreating && (
              <motion.form 
                onSubmit={handleCreateAlbum} 
                initial={{ height: 0, opacity: 0, y: -20 }} 
                animate={{ height: "auto", opacity: 1, y: 0 }} 
                exit={{ height: 0, opacity: 0, y: -20 }} 
                className="mb-16 grid gap-6 p-8 bg-white dark:bg-slate-900 border-2 border-indigo-50 rounded-[2.5rem] shadow-2xl overflow-hidden"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Identity</label>
                    <Input 
                      className="h-14 rounded-xl bg-slate-50 border-none font-bold focus-visible:ring-2 focus-visible:ring-indigo-500" 
                      placeholder="Album Name (e.g., Summer Solstice)" 
                      value={newAlbum.name} 
                      onChange={(e) => setNewAlbum({ ...newAlbum, name: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Context</label>
                    <Input 
                      className="h-14 rounded-xl bg-slate-50 border-none font-medium focus-visible:ring-2 focus-visible:ring-indigo-500" 
                      placeholder="Brief description..." 
                      value={newAlbum.description} 
                      onChange={(e) => setNewAlbum({ ...newAlbum, description: e.target.value })} 
                    />
                  </div>
                </div>
                <Button type="submit" className="h-14 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-xs">
                  Initialize Collection
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* --- ALBUM GRID --- */}
          {loading ? (
             <div className="flex flex-col items-center py-40">
               <Loader2 className="h-16 w-16 animate-spin text-indigo-600 opacity-20" />
               <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Loading Archive</p>
             </div>
          ) : albums.length === 0 ? (
            <div className="text-center py-32 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
               <Layers className="mx-auto text-slate-200 mb-4" size={48} />
               <h3 className="text-xl font-bold text-slate-900">No collections found</h3>
               <p className="text-slate-500 mb-6">Start by creating your first curated album.</p>
               <Button onClick={() => setIsCreating(true)} variant="outline" className="rounded-xl">Create Album</Button>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {albums.map((album) => (
                <Link to={`/albums/${album.id}`} key={album.id} className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-xl hover:-translate-y-2 transition-all duration-500">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img 
                      src={album.cover_url || "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80"} 
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      alt={album.name} 
                    />
                    
                    {/* OVERLAY ACTIONS */}
                    <div className="absolute top-4 right-4 z-40 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <button onClick={(e) => handleShareAlbum(e, album)} title="Copy Internal Link" className="h-10 w-10 bg-white/90 backdrop-blur-md text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-lg"><Share2 size={18} /></button>
                      <button onClick={(e) => handleDownloadAlbum(e, album)} title="Download ZIP" className="h-10 w-10 bg-white/90 backdrop-blur-md text-slate-900 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-lg"><Download size={18} /></button>
                      <button onClick={(e) => handleDeleteAlbum(e, album.id)} title="Delete Album" className="h-10 w-10 bg-white/90 backdrop-blur-md text-rose-600 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-lg"><Trash2 size={18} /></button>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-60" />
                    <div className="absolute bottom-6 left-6 right-6">
                        <div className="flex items-center gap-2 mb-1">
                             <div className="h-1 w-8 bg-indigo-500 rounded-full" />
                             {album.has_ai_video && (
                               <span className="flex items-center gap-1 bg-indigo-500/30 px-2 py-0.5 rounded-full text-[8px] font-black text-white uppercase backdrop-blur-sm">
                                 <Sparkles size={10}/> AI Video
                               </span>
                             )}
                             <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">Collection</span>
                        </div>
                        <h3 className="text-2xl font-black text-white leading-tight">{album.name}</h3>
                    </div>
                  </div>
                  <div className="p-7 flex flex-col flex-grow">
                    <p className="text-slate-500 text-sm line-clamp-2 mb-6 h-10">
                      {album.description || "A curated selection of meaningful moments."}
                    </p>
                    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-indigo-600">
                        <ImageIcon size={16} />
                        <span className="text-xs font-black uppercase tracking-tighter">
                          {(album.total_memories || 0)} Memories
                        </span>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}