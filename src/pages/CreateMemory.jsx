import React, { useState, useRef, useEffect } from "react";
import { ImagePlus, MapPin, Sparkles, Tag, X, BookCopy, Calendar, Type, Mic, UploadCloud, ChevronRight, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import API from "../api/axios";

import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import VoiceRecorder from "@/components/VoiceRecorder";

export default function CreateMemory() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // --- State ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isMilestone, setIsMilestone] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState([]); 
  const [fetchedTags, setFetchedTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [albums, setAlbums] = useState([]); // Now used below!
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const [voiceBlob, setVoiceBlob] = useState(null);

  // --- Bulk Logic State ---
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkFiles, setBulkFiles] = useState([]);

  // --- Fetch Tags and Albums ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tagsRes, albumsRes] = await Promise.all([
          API.get("/memories/tags"),
          API.get("/albums"),
        ]);
        // Handle potential nested data structures
        setFetchedTags(tagsRes.data.data || tagsRes.data || []);
        setAlbums(albumsRes.data.data || albumsRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load category data.");
      }
    };
    fetchData();
  }, []);

  // --- Tag Filtering Logic ---
  useEffect(() => {
    if (tagInput.trim()) {
      const suggestions = fetchedTags.filter(
        (t) =>
          t.name.toLowerCase().includes(tagInput.toLowerCase()) &&
          !selectedTags.some(sel => sel.id === t.id)
      );
      setFilteredTags(suggestions);
    } else {
      setFilteredTags([]);
    }
  }, [tagInput, fetchedTags, selectedTags]);

  const handleFileChange = (e) => {
    if (isBulkMode) {
      const selectedFiles = Array.from(e.target.files);
      setBulkFiles(selectedFiles);
    } else {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
      }
    }
  };
  
  const handleBulkSubmit = async () => {
    if (!title.trim()) return toast.error("Please provide a title for this batch.");
    if (bulkFiles.length === 0) return toast.error("Please select files.");

    const toastId = toast.loading(`Archiving ${bulkFiles.length} moments...`);

    try {
      let albumIdToUse = selectedAlbum;

      // Handle Auto-Album Creation for Bulk
      if (!selectedAlbum && title.trim()) {
        try {
          const albumRes = await API.post("/albums", {
            name: title.trim(),
            description: "Batch Upload",
          });
          albumIdToUse = albumRes.data.id;
          setAlbums(prev => [...prev, albumRes.data]);
        } catch (err) {
          console.error("Album creation failed, continuing...");
        }
      }

      const formData = new FormData();
      bulkFiles.forEach((f) => {
        formData.append("files", f); 
      });

      formData.append("title", title.trim());
      formData.append("location", location.trim());
      formData.append("memory_date", date);
      if (albumIdToUse) formData.append("album_id", albumIdToUse);

      const uploadRes = await API.post("/memories/bulk", formData);
      toast.success(`${uploadRes.data?.memories?.length || bulkFiles.length} memories preserved!`, { id: toastId });
      navigate("/dashboard");

    } catch (err) {
      toast.error(err.response?.data?.error || "Batch upload failed", { id: toastId });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return toast.error("Please give your memory a title.");
    if (!file && !voiceBlob) return toast.error("Please add a photo or a voice note.");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("location", location);
    formData.append("memory_date", date);
    formData.append("is_milestone", String(isMilestone));

    if (file) formData.append("file", file);
    if (voiceBlob) formData.append("audio", voiceBlob, "voicenote.wav");
    
    const tagIds = selectedTags.map(t => t.id);
    formData.append("tags", JSON.stringify(tagIds));
    if (selectedAlbum) formData.append("album_id", selectedAlbum);

    toast.promise(API.post("/memories", formData), {
      loading: "Archiving...",
      success: () => {
        navigate("/dashboard");
        return "Memory preserved!";
      },
      error: (err) => err.response?.data?.error || "Failed to save.",
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#FDFDFF] dark:bg-slate-950 pt-10 pb-20 px-4 transition-colors">
        <div className="container max-w-6xl mx-auto">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 px-2">
            <div>
              <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
                {isBulkMode ? "Batch" : "Preserve"} <span className="text-indigo-600">Moment</span>
              </h1>
              <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mt-2">
                {isBulkMode ? "Lightning fast multi-upload" : "New Entry for your Timeline"}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-3 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
               <span className={`text-[10px] font-black uppercase tracking-widest ${!isBulkMode ? 'text-indigo-600' : 'text-slate-400'}`}>Single</span>
               <Switch checked={isBulkMode} onCheckedChange={(val) => {
                 setIsBulkMode(val);
                 setPreview(null);
                 setFile(null);
                 setBulkFiles([]);
               }} />
               <span className={`text-[10px] font-black uppercase tracking-widest ${isBulkMode ? 'text-indigo-600' : 'text-slate-400'}`}>Batch</span>
            </div>
          </div>

          {isBulkMode ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" multiple />
              <div 
                onClick={() => fileInputRef.current.click()}
                className="w-full aspect-[21/9] rounded-[4rem] border-4 border-dashed border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/30 dark:bg-indigo-900/10 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 transition-all group"
              >
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl group-hover:scale-110 transition-transform">
                  <Layers size={48} className="text-indigo-600" />
                </div>
                <h2 className="mt-8 text-3xl font-black text-slate-900 dark:text-white">Select multiple visuals</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest mt-2">
                  {bulkFiles.length > 0 ? `${bulkFiles.length} files ready` : "Drag and drop or click to browse"}
                </p>
              </div>

              {bulkFiles.length > 0 && (
                <div className="flex justify-center">
                   <Button onClick={handleBulkSubmit} className="h-20 px-20 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.4em] shadow-2xl">
                     Preserve {bulkFiles.length} Moments
                   </Button>
                </div>
              )}
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT COLUMN */}
              <div className="lg:col-span-5 space-y-6">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                <motion.div
                  whileHover={{ scale: 0.99 }}
                  onClick={() => fileInputRef.current.click()}
                  className="relative aspect-square cursor-pointer rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden transition-all hover:border-indigo-500 group shadow-xl"
                >
                  {preview ? (
                    <>
                      <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-md">
                        <UploadCloud size={48} className="text-white mb-2" />
                        <p className="text-sm font-black text-white uppercase tracking-widest">Change Photo</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-10 group-hover:scale-110 transition-transform">
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                        <ImagePlus className="h-10 w-10 text-indigo-600" />
                      </div>
                      <p className="text-slate-900 dark:text-white font-black text-2xl tracking-tight">Drop your visual here</p>
                    </div>
                  )}
                </motion.div>

                <div className="bg-indigo-600 rounded-[2.5rem] p-6 text-white shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Mic size={20} className="text-white/80" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Voice Capture</span>
                  </div>
                  <VoiceRecorder
                    onRecordingComplete={(blob) => setVoiceBlob(blob)}
                    onClear={() => setVoiceBlob(null)}
                  />
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="lg:col-span-7">
                <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl space-y-8">
                  
                  {/* TITLE */}
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em] px-1">Memory Title</Label>
                    <div className="relative">
                      <Type className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300" size={28} />
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="The Beginning..."
                        className="h-20 pl-12 rounded-none border-b-2 border-t-0 border-x-0 border-slate-100 dark:border-slate-800 bg-transparent focus:ring-0 focus:border-indigo-500 font-black text-4xl text-slate-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  {/* ALBUM SELECTION - NOW ACTIVE */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-[2rem] space-y-3 border-2 border-transparent focus-within:border-indigo-500/20 transition-all">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <BookCopy size={14} /> Assign to Album
                    </Label>
                    <select 
                      value={selectedAlbum} 
                      onChange={(e) => setSelectedAlbum(e.target.value)}
                      className="w-full bg-transparent font-black text-xl text-slate-900 dark:text-white border-none focus:ring-0 cursor-pointer appearance-none"
                    >
                      <option value="" className="dark:bg-slate-900">No Album (Standalone)</option>
                      {albums.map((album) => (
                        <option key={album.id} value={album.id} className="dark:bg-slate-900">
                          {album.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">The Story</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Capture the details..."
                      className="min-h-[120px] rounded-3xl border-none bg-slate-50 dark:bg-slate-950 p-6 font-bold text-xl"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-[2rem] space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Calendar size={12} /> Date</Label>
                      <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border-none bg-transparent font-black text-lg" />
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-[2rem] space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><MapPin size={12} /> Location</Label>
                      <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Where?" className="border-none bg-transparent font-black text-lg" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">Categories</Label>
                    <div className="relative">
                      <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 h-5 w-5" />
                      <Input
                        className="h-16 pl-14 rounded-2xl border-none bg-slate-50 dark:bg-slate-950 font-black text-lg"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add tags..."
                      />
                      <AnimatePresence>
                        {filteredTags.length > 0 && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute z-50 w-full bg-white dark:bg-slate-900 border rounded-3xl mt-2 shadow-2xl max-h-48 overflow-auto p-2"
                          >
                            {filteredTags.map(t => (
                              <div key={t.id} className="px-5 py-3 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl font-black" onClick={() => { setSelectedTags([...selectedTags, t]); setTagInput(""); }}>
                                {t.name}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map(t => (
                        <Badge key={t.id} className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 px-4 py-2 rounded-xl flex gap-2 border-none">
                          <span className="font-black text-[11px]">#{t.name}</span>
                          <X className="h-4 w-4 cursor-pointer" onClick={() => setSelectedTags(selectedTags.filter(tag => tag.id !== t.id))} />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-4 pt-4">
                    <div className={`flex flex-1 items-center justify-between w-full rounded-3xl border-2 p-5 ${isMilestone ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20' : 'bg-slate-50 border-transparent dark:bg-slate-950'}`}>
                      <div className="flex items-center gap-3">
                        <Sparkles className={isMilestone ? 'text-amber-500' : 'text-slate-300'} size={20} />
                        <span className="text-[11px] font-black uppercase tracking-widest">Milestone</span>
                      </div>
                      <Switch checked={isMilestone} onCheckedChange={setIsMilestone} />
                    </div>
                    <Button type="submit" className="w-full md:w-auto md:flex-[2] h-20 text-sm font-black uppercase tracking-[0.4em] rounded-3xl bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xl">
                      Save Memory
                    </Button>
                  </div>

                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}