import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Share2, 
  Link2, 
  Check, 
  Copy, 
  MessageCircle, 
  Twitter,
  Facebook
} from "lucide-react";
import { toast } from "sonner";
import API from "../api/axios";

export default function ShareModal({ memoryId, isAlbum = false }) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Generate the public URL (Replace with your actual production domain later)
  const shareUrl = `${window.location.origin}/share/${isAlbum ? 'album' : 'memory'}/${memoryId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      
      // Log the share action to the backend
      await API.post(`/memories/${memoryId}/share-log`, {
        platform: "copy_link",
        is_album: isAlbum
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const shareToPlatform = async (platform) => {
    let url = "";
    const text = isAlbum ? "Check out this photo album on MemoryLane!" : "Check out this memory on MemoryLane!";

    switch (platform) {
      case "whatsapp":
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + shareUrl)}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      default:
        break;
    }

    if (url) {
      window.open(url, "_blank");
      // Log the share
      await API.post(`/memories/${memoryId}/share-log`, { platform, is_album: isAlbum });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-2xl gap-2 border-slate-200 hover:bg-slate-50">
          <Share2 size={16} className="text-slate-600" />
          <span className="font-bold text-slate-600">Share</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">
            Share {isAlbum ? "Album" : "Moment"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-6 py-4">
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Input
                readOnly
                value={shareUrl}
                className="bg-slate-50 border-none rounded-xl focus-visible:ring-indigo-500"
              />
            </div>
            <Button 
              size="icon" 
              onClick={handleCopy} 
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shrink-0"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => shareToPlatform("whatsapp")}
              className="flex flex-col gap-2 h-auto py-4 rounded-2xl border-slate-100 hover:border-green-200 hover:bg-green-50"
            >
              <MessageCircle size={24} className="text-green-600" />
              <span className="text-xs font-bold">WhatsApp</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => shareToPlatform("twitter")}
              className="flex flex-col gap-2 h-auto py-4 rounded-2xl border-slate-100 hover:border-blue-200 hover:bg-blue-50"
            >
              <Twitter size={24} className="text-blue-400" />
              <span className="text-xs font-bold">Twitter</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => shareToPlatform("facebook")}
              className="flex flex-col gap-2 h-auto py-4 rounded-2xl border-slate-100 hover:border-indigo-200 hover:bg-indigo-50"
            >
              <Facebook size={24} className="text-indigo-600" />
              <span className="text-xs font-bold">Facebook</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}