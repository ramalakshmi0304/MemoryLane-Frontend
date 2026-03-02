import React, { useState, useRef, useEffect } from "react";
import { ImagePlus, Sparkles, X, Mic, UploadCloud, Hash, Check, Loader2 } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VoiceRecorder from "@/components/VoiceRecorder";

export default function CreateMemory() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState(""); 
  const [description, setDescription] = useState(""); 
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isMilestone, setIsMilestone] = useState(false);
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [voiceBlob, setVoiceBlob] = useState(null);
  
  const [albums, setAlbums] = useState([]); 
  const [selectedAlbum, setSelectedAlbum] = useState(""); 
  
  // Tag States
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkFiles, setBulkFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tagsRes, albumsRes] = await Promise.all([
          API.get("/memories/tags"),
          API.get("/albums"),
        ]);
        setAvailableTags(tagsRes.data.data || tagsRes.data || []);
        setAlbums(albumsRes.data.data || albumsRes.data || []);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchData();
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (isBulkMode) {
      setBulkFiles((prev) => [...prev, ...selectedFiles]);
    } else if (selectedFiles[0]) {
      setFile(selectedFiles[0]);
      setPreview(URL.createObjectURL(selectedFiles[0]));
    }
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleTag = (tagName) => {
    setSelectedTags(prev => 
      prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title && !isBulkMode) return toast.error("Please give your memory a title.");
    if (isBulkMode && bulkFiles.length === 0) return toast.error("No files selected for bulk upload.");

    setIsUploading(true);

    try {
      if (isBulkMode) {
        const uploadPromises = bulkFiles.map((f, index) => {
          const formData = new FormData();
          formData.append("title", title ? `${title} (${index + 1})` : f.name);
          formData.append("description", description);
          formData.append("memory_date", date);
          formData.append("is_milestone", String(isMilestone));
          if (selectedAlbum) formData.append("album_id", selectedAlbum);
          // Only send tags if they exist
          if (selectedTags.length) formData.append("tags", JSON.stringify(selectedTags));
          formData.append("file", f);
          return API.post("/memories", formData);
        });

        await Promise.all(uploadPromises);
        toast.success(`${bulkFiles.length} memories preserved!`);
      } else {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("location", location);
        formData.append("memory_date", date);
        formData.append("is_milestone", String(isMilestone));
        if (selectedAlbum) formData.append("album_id", selectedAlbum);
        if (selectedTags.length) formData.append("tags", JSON.stringify(selectedTags));
        if (file) formData.append("file", file);
        if (voiceBlob) formData.append("audio", voiceBlob, "voice.wav");

        await API.post("/memories", formData);
        toast.success("Memory preserved!");
      }
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#FDFDFF] dark:bg-slate-950 pt-10 pb-20 px-4">
        <div className="container max-w-6xl mx-auto">
          
          <div className="flex justify-between items-end mb-10">
            <div>
              <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white">
                New <span className="text-indigo-600">{isBulkMode ? 'Moments' : 'Moment'}</span>
              </h1>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-full border shadow-sm">
               <span className="text-[10px] font-black px-2 uppercase text-slate-500">Bulk Mode</span>
               <Switch checked={isBulkMode} onCheckedChange={(val) => {
                 setIsBulkMode(val);
                 setPreview(null);
                 setFile(null);
                 setBulkFiles([]);
               }} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div className="lg:col-span-5 space-y-6">
              <div 
                onClick={() => fileInputRef.current.click()}
                className="relative aspect-square rounded-[3rem] border-2 border-dashed border-slate-200 bg-white dark:bg-slate-900 flex flex-col items-center justify-center overflow-hidden transition-all shadow-xl cursor-pointer hover:border-indigo-500"
              >
                {isBulkMode ? (
                   <div className="text-center p-6">
                      <UploadCloud className="text-indigo-600 mx-auto mb-4" size={48} />
                      <p className="font-black text-lg">{bulkFiles.length} Files Selected</p>
                      <p className="text-xs text-slate-400 font-bold uppercase mt-2">Click to add more</p>
                   </div>
                ) : preview ? (
                  <>
                    <img src={preview} className="h-full w-full object-cover" alt="Preview" />
                    <button type="button" onClick={handleRemoveImage} className="absolute top-6 right-6 p-3 bg-red-500 text-white rounded-2xl z-10"><X size={20} /></button>
                  </>
                ) : (
                  <div className="text-center">
                    <ImagePlus className="text-indigo-600 mx-auto mb-4" size={32} />
                    <p className="font-black text-lg">Add Photo</p>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple={isBulkMode} />
              </div>
              
              {!isBulkMode && (
                <div className="bg-indigo-600 rounded-[2.5rem] p-6 text-white shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Mic size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Voice Note</span>
                  </div>
                  <VoiceRecorder onRecordingComplete={setVoiceBlob} onClear={() => setVoiceBlob(null)} />
                </div>
              )}
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 shadow-2xl space-y-6">
                
                <div className="space-y-2">
                  <Label className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">Title {isBulkMode && '(Optional)'}</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-16 text-2xl font-black bg-slate-50 border-none" placeholder="Moment title..." />
                </div>

                {/* --- TAGS DROPDOWN --- */}
                <div className="space-y-2">
                  <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tags</Label>
                  <Select onValueChange={(val) => toggleTag(val)}>
                    <SelectTrigger className="h-14 bg-slate-50 border-none rounded-2xl font-bold">
                      <SelectValue placeholder="Select tags..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTags.map((tag) => {
                        const name = typeof tag === 'string' ? tag : tag.name;
                        return (
                          <SelectItem key={name} value={name}>
                            <div className="flex items-center justify-between w-[200px]">
                              <span>{name}</span>
                              {selectedTags.includes(name) && <Check size={14} className="text-indigo-600" />}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  {/* Selected Tags Display */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <AnimatePresence>
                      {selectedTags.map(tag => (
                        <motion.div key={tag} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                          <Badge className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-none py-1.5 pl-3 pr-2 flex items-center gap-1 rounded-lg">
                            <span className="text-[10px] font-black uppercase">{tag}</span>
                            <X size={14} className="cursor-pointer" onClick={() => toggleTag(tag)} />
                          </Badge>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Album</Label>
                    <Select value={selectedAlbum} onValueChange={setSelectedAlbum}>
                      <SelectTrigger className="h-14 bg-slate-50 border-none rounded-2xl font-bold"><SelectValue placeholder="Album" /></SelectTrigger>
                      <SelectContent>
                        {albums.map((a) => <SelectItem key={a.id} value={a.id}>{a.title || a.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Date</Label>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-14 bg-slate-50 border-none rounded-2xl font-bold" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[100px] bg-slate-50 border-none rounded-2xl" placeholder="Describe the scene..." />
                </div>

                <div className="flex items-center gap-4 pt-4 border-t">
                  <div className={`flex flex-1 items-center justify-between p-4 rounded-2xl ${isMilestone ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50'}`}>
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className={isMilestone ? "text-amber-500" : "text-slate-300"} />
                      <span className="text-[10px] font-black uppercase">Milestone</span>
                    </div>
                    <Switch checked={isMilestone} onCheckedChange={setIsMilestone} />
                  </div>

                  <Button 
                    disabled={isUploading}
                    className="flex-[2] h-16 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white font-black uppercase tracking-widest"
                  >
                    {isUploading ? <Loader2 className="animate-spin" /> : isBulkMode ? `Save ${bulkFiles.length} Moments` : 'Save Memory'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}