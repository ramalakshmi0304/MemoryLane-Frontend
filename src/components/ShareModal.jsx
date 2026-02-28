import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import API from "../api/axios";

export default function ShareModal({ memoryId }) {
  const [targetId, setTargetId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    if (!targetId) return;
    setLoading(true);
    try {
      await API.post(`/memories/share`, { memoryId, targetUserId: targetId });
      toast.success("Access granted!");
      setTargetId("");
    } catch (err) {
      toast.error(err.response?.data?.error || "Sharing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Share2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Memory</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Enter the User ID of the person you want to share this moment with.
          </p>
          <div className="flex gap-2">
            <Input 
              placeholder="User UUID..." 
              value={targetId} 
              onChange={(e) => setTargetId(e.target.value)}
            />
            <Button onClick={handleShare} disabled={loading}>
              {loading ? "Sharing..." : <UserPlus className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}