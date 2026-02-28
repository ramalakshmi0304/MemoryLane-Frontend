import React, { useState, useRef } from "react";
import { Mic, Square, Trash2, Play } from "lucide-react";
import { Button } from "./ui/button";

export default function VoiceRecorder({ onRecordingComplete, onClear }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        onRecordingComplete(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const clear = () => {
    setAudioURL(null);
    onClear();
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
      {!audioURL ? (
        <Button 
          type="button" 
          onClick={isRecording ? stopRecording : startRecording}
          variant={isRecording ? "destructive" : "outline"}
          className="rounded-full w-10 h-10 p-0"
        >
          {isRecording ? <Square size={16} /> : <Mic size={16} />}
        </Button>
      ) : (
        <div className="flex items-center gap-2 w-full">
          <audio src={audioURL} controls className="h-8 flex-1" />
          <Button type="button" variant="ghost" onClick={clear} className="text-rose-500">
            <Trash2 size={16} />
          </Button>
        </div>
      )}
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {isRecording ? "Recording..." : audioURL ? "Ready" : "Record Story"}
      </span>
    </div>
  );
}