import React, { useState, useRef, useEffect, useCallback } from "react";
import { ImagePlus, Sparkles, X, Mic, UploadCloud, Loader2, Play, Pause } from "lucide-react";
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
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isMilestone, setIsMilestone] = useState(false);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [videoThumbnail, setVideoThumbnail] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState(null);

  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState("");

  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkFiles, setBulkFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Generate video thumbnail using canvas (bulletproof)
  const generateThumbnail = useCallback(async (videoFile) => {
    if (!videoFile?.type.startsWith('video/')) return null;

    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.src = URL.createObjectURL(videoFile);
      video.muted = true;
      video.playsInline = true;

      const drawThumbnail = () => {
        canvas.width = 320;
        canvas.height = 180;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        URL.revokeObjectURL(video.src);
        resolve(thumbnailDataUrl);
      };

      video.addEventListener('loadedmetadata', () => {
        video.currentTime = Math.min(1, video.duration * 0.1); // 1st 10% or 1s
      });

      video.addEventListener('seeked', drawThumbnail);
      video.load();
    });
  }, []);

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

  // Handle file change with thumbnail generation
  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (preview) URL.revokeObjectURL(preview);

    const MAX_SIZE = 50 * 1024 * 1024;
    const isTooLarge = selectedFiles.some(f => f.size > MAX_SIZE);

    if (isTooLarge) {
      toast.error("File under 50MB required.");
      return;
    }

    if (isBulkMode) {
      setBulkFiles((prev) => [...prev, ...selectedFiles]);
    } else if (selectedFiles[0]) {
      const selectedFile = selectedFiles[0];
      setFile(selectedFile);
      
      if (selectedFile.type.startsWith("video/")) {
        const thumbnail = await generateThumbnail(selectedFile);
        setVideoThumbnail(thumbnail);
        setPreview(URL.createObjectURL(selectedFile)); // Keep for video player
      } else {
        setPreview(URL.createObjectURL(selectedFile));
        setVideoThumbnail(null);
      }
      
      setIsVideoPlaying(false);
    }
  };

  const toggleVideoPlay = async () => {
    if (!videoRef.current || !file?.type.startsWith("video/")) return;
    
    const video = videoRef.current;
    if (video.paused) {
      try {
        await video.play();
        setIsVideoPlaying(true);
      } catch (err) {
        console.warn("Play blocked:", err);
        toast.error("Click anywhere to enable video playback");
      }
    } else {
      video.pause();
      setIsVideoPlaying(false);
    }
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setVideoThumbnail(null);
    setIsVideoPlaying(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleTag = (tagName) => {
    setSelectedTags(prev =>
      prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title && !isBulkMode) return toast.error("Please add a title.");
    setIsUploading(true);

    try {
      const formDataBase = {
        description,
        location,
        memory_date: date,
        is_milestone: String(isMilestone),
        album_id: selectedAlbum,
        tags: JSON.stringify(selectedTags)
      };

      if (isBulkMode) {
        const uploadPromises = bulkFiles.map((f, i) => {
          const fd = new FormData();
          Object.entries(formDataBase).forEach(([k, v]) => v && fd.append(k, v));
          fd.append("title", title ? `${title} (${i + 1})` : f.name);
          fd.append("file", f);
          return API.post("/memories", fd);
        });
        await Promise.all(uploadPromises);
      } else {
        const fd = new FormData();
        Object.entries(formDataBase).forEach(([k, v]) => v && fd.append(k, v));
        fd.append("title", title);
        if (file) fd.append("file", file);
        if (voiceBlob) fd.append("audio", voiceBlob, "voice.wav");
        await API.post("/memories", fd);
      }
      toast.success("Saved!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Upload failed: " + (error.response?.data?.message || error.message));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#FDFDFF] dark:bg-slate-950 pt-4 md:pt-10 pb-20 px-3 md:px-6">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6 md:mb-10">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
              New <span className="text-indigo-600">{isBulkMode ? 'Moments' : 'Moment'}</span>
            </h1>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 md:p-2 rounded-full border shadow-sm">
              <span className="text-[9px] md:text-[10px] font-black px-2 uppercase text-slate-500">Bulk Mode</span>
              <Switch 
                checked={isBulkMode} 
                onCheckedChange={(val) => {
                  setIsBulkMode(val); 
                  setPreview(null); 
                  setFile(null); 
                  setVideoThumbnail(null);
                  setBulkFiles([]);
                }} 
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

            {/* Media Column */}
            <div className="lg:col-span-5 space-y-4 md:space-y-6">
              <div
                className="relative min-h-[300px] md:aspect-square rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-slate-200 bg-white dark:bg-slate-900 flex flex-col items-center justify-center overflow-hidden shadow-xl cursor-pointer hover:shadow-2xl transition-all"
                onClick={() => !preview && !isBulkMode && fileInputRef.current?.click()}
              >
                {isBulkMode ? (
                  <div className="text-center p-6 w-full h-full flex flex-col items-center justify-center cursor-pointer">
                    <UploadCloud className="text-indigo-600 mb-2" size={40} />
                    <p className="font-black text-lg">{bulkFiles.length} Files</p>
                  </div>
                ) : preview ? (
                  <div className="relative w-full h-full group">
                    {/* Video Preview with Thumbnail */}
                    {file?.type.startsWith("video/") ? (
                      <>
                        <img 
                          src={videoThumbnail || preview} 
                          className="w-full h-full object-cover rounded-[2rem]" 
                          alt="Video thumbnail"
                        />
                        <video
                          ref={videoRef}
                          src={preview}
                          className="hidden" // Hidden, only used for playback
                          muted
                          preload="metadata"
                          playsInline
                        />
                        <div 
                          className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/50 via-transparent rounded-[2rem] cursor-pointer"
                          onClick={toggleVideoPlay}
                        >
                          <motion.div
                            animate={{ scale: isVideoPlaying ? 0 : 1 }}
                            className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                          >
                            {isVideoPlaying ? (
                              <Pause className="w-8 h-8 text-white" />
                            ) : (
                              <Play className="w-8 h-8 text-white ml-1" />
                            )}
                          </motion.div>
                        </div>
                      </>
                    ) : (
                      <img src={preview} className="w-full h-full object-cover rounded-[2rem]" alt="Preview" />
                    )}
                    <button 
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-4 right-4 p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl z-40 shadow-2xl transition-all hover:scale-110"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center w-full h-full flex flex-col items-center justify-center cursor-pointer">
                    <ImagePlus className="text-indigo-600 mb-4" size={48} />
                    <p className="font-black text-xl text-slate-600 dark:text-slate-300">Add Photo or Video</p>
                    <p className="text-sm text-slate-400 mt-1">Max 50MB</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*,video/*" 
                  multiple={isBulkMode}
                />
              </div>

              {!isBulkMode && (
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2rem] p-6 text-white shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <Mic size={20} />
                    <span className="text-sm font-black uppercase tracking-wide">Voice Note</span>
                  </div>
                  <VoiceRecorder onRecordingComplete={setVoiceBlob} onClear={() => setVoiceBlob(null)} />
                </div>
              )}
            </div>

            {/* Form Column */}
            <div className="lg:col-span-7 space-y-4 md:space-y-6">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 border border-slate-100/50 shadow-2xl space-y-6">

                <div className="space-y-2">
                  <Label className="text-xs font-black text-indigo-600 uppercase tracking-wide">Title</Label>
                  <Input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className="h-16 text-2xl font-black bg-white/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-indigo-400 focus:bg-white" 
                    placeholder="What moment is this?"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-black text-slate-400 uppercase tracking-wide">Tags</Label>
                  <Select onValueChange={toggleTag}>
                    <SelectTrigger className="h-14 bg-white/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-semibold">
                      <SelectValue placeholder="Select or type tags..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTags.map((tag) => {
                        const n = typeof tag === 'string' ? tag : tag.name;
                        return <SelectItem key={n} value={n}>{n}</SelectItem>;
                      })}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map(tag => (
                      <Badge key={tag} variant="secondary" className="py-2 px-4 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-bold">
                        {tag}
                        <X size={14} className="ml-1 cursor-pointer hover:text-indigo-900" onClick={() => toggleTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-slate-400 uppercase">Album</Label>
                    <Select value={selectedAlbum} onValueChange={setSelectedAlbum}>
                      <SelectTrigger className="h-14 bg-white/50 border-2 border-slate-200 rounded-2xl">
                        <SelectValue placeholder="Choose album" />
                      </SelectTrigger>
                      <SelectContent>
                        {albums.map((a) => (
                          <SelectItem key={a.id} value={a.id}>{a.title || a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-slate-400 uppercase">Date</Label>
                    <Input 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)} 
                      className="h-14 bg-white/50 border-2 border-slate-200 rounded-2xl font-semibold" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-400 uppercase">Location</Label>
                  <Input 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                    className="h-14 bg-white/50 border-2 border-slate-200 rounded-2xl font-semibold" 
                    placeholder="Where did this happen?"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-400 uppercase">Description</Label>
                  <Textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    className="min-h-[120px] bg-white/50 border-2 border-slate-200 rounded-2xl resize-vertical" 
                    placeholder="Tell the story behind this moment..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-slate-200">
                  <div className={`flex w-full sm:w-auto items-center justify-between p-5 rounded-2xl shadow-lg transition-all ${
                    isMilestone 
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-orange-300' 
                      : 'bg-gradient-to-r from-slate-100 to-slate-200 shadow-slate-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Sparkles size={20} className={isMilestone ? "text-white drop-shadow-lg" : "text-slate-400"} />
                      <span className="text-sm font-black uppercase tracking-wider text-white/90">Special Milestone</span>
                    </div>
                    <Switch checked={isMilestone} onCheckedChange={setIsMilestone} />
                  </div>
                  <Button 
                    type="submit"
                    disabled={isUploading} 
                    className="w-full sm:flex-1 h-16 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-black uppercase text-lg shadow-2xl hover:shadow-3xl transition-all"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save This Memory'
                    )}
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
