"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveVisualizer } from "./live-visualizer";

interface LiveModeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  isListening: boolean;
  isPlaying: boolean;
  transcript: string;
  isLoading: boolean;
  userVolume: number;
  onMicToggle: () => void;
  onStopAudio: () => void;
}

export function LiveModeOverlay({
  isOpen,
  onClose,
  isListening,
  isPlaying,
  transcript,
  isLoading,
  userVolume,
  onMicToggle,
  onStopAudio,
}: LiveModeOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-between p-8 text-white"
        >
          {/* Header */}
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-medium tracking-wider uppercase opacity-80">Live Session</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-white/10 text-white"
            >
              <X className="size-6" />
            </Button>
          </div>

          {/* Center Visualizer & Transcript */}
          <div className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center gap-12">
            <LiveVisualizer isListening={isListening} isPlaying={isPlaying} userVolume={userVolume} />
            
            <div className="text-center space-y-6 px-4">
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-2 text-primary/60 font-medium tracking-widest text-xs uppercase"
                >
                  <div className="size-1 rounded-full bg-primary animate-bounce" />
                  <div className="size-1 rounded-full bg-primary animate-bounce delay-75" />
                  <div className="size-1 rounded-full bg-primary animate-bounce delay-150" />
                  <span>AI Thinking</span>
                </motion.div>
              )}
              
              <AnimatePresence mode="wait">
                {(transcript && isListening && !isPlaying) ? (
                  <motion.p
                    key="transcript"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-medium text-white/90 leading-relaxed"
                  >
                    "{transcript}"
                  </motion.p>
                ) : (
                  <motion.p
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    className="text-xl text-white/40 italic"
                  >
                    {isPlaying ? "Agent is speaking..." : isListening ? "Listening..." : "Microphone muted"}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Controls */}
          <div className="w-full max-w-lg flex flex-col items-center gap-8 pb-12">
            {/* Playback Interruption Button (Only shows when AI is speaking) */}
            <AnimatePresence>
              {isPlaying && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <Button
                    onClick={onStopAudio}
                    variant="outline"
                    className="rounded-full px-6 py-6 bg-white/5 border-white/10 hover:bg-white/10 text-white/80 gap-3 group transition-all"
                  >
                    <VolumeX className="size-5 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">Stop AI Response</span>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-center gap-10">
              {/* Mute Button */}
              <div className="flex flex-col items-center gap-2">
                <Button
                  onClick={onMicToggle}
                  variant="outline"
                  size="icon"
                  className={`rounded-full size-14 transition-all duration-300 ${
                    !isListening 
                      ? "bg-red-500/20 border-red-500/30 text-red-500 hover:bg-red-500/30" 
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {isListening ? <Mic className="size-6" /> : <MicOff className="size-6" />}
                </Button>
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                  {isListening ? "Mute" : "Unmute"}
                </span>
              </div>

              {/* Main Mic Button */}
              <div className="relative">
                <motion.div
                  animate={{
                    scale: isListening ? [1, 1.2, 1] : 1,
                    opacity: isListening ? [0.2, 0.4, 0.2] : 0,
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -inset-4 rounded-full bg-primary blur-xl"
                />
                <Button
                  onClick={onMicToggle}
                  className={`rounded-full size-20 relative z-10 transition-all duration-500 ${
                    isListening 
                      ? "bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/40 scale-110" 
                      : "bg-white/10 hover:bg-white/20 border border-white/10"
                  }`}
                >
                  {isListening ? <div className="size-7 bg-white rounded-full animate-pulse" /> : <Mic className="size-8" />}
                </Button>
              </div>

              {/* End Button */}
              <div className="flex flex-col items-center gap-2">
                <Button
                  onClick={onClose}
                  variant="outline"
                  size="icon"
                  className="rounded-full size-14 bg-white/5 border-white/10 text-white/60 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-500 transition-all duration-300"
                >
                  <X className="size-6" />
                </Button>
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">End</span>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-white/20 font-bold tracking-[0.3em] uppercase">
            SMT.AI LIVE
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
