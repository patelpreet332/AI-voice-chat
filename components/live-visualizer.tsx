"use client";

import { motion } from "framer-motion";

interface LiveVisualizerProps {
  isListening: boolean;
  isPlaying: boolean;
  userVolume: number;
}

export function LiveVisualizer({ isListening, isPlaying, userVolume }: LiveVisualizerProps) {
  // Determine color based on state (Cyan for Speaking, Electric Blue for Listening)
  const glowColor = isPlaying ? "rgba(6, 182, 212, 0.6)" : isListening ? "rgba(56, 189, 248, 0.6)" : "rgba(255, 255, 255, 0.1)";
  const coreColor = isPlaying ? "rgba(8, 145, 178, 0.8)" : isListening ? "rgba(14, 165, 233, 0.8)" : "rgba(255, 255, 255, 0.2)";

  // Enhanced pulse based on volume
  const volumeScale = 1 + (userVolume * 1.5);

  return (
    <div className="relative w-full h-64 flex items-center justify-center">
      {/* Ambient Outer Glow */}
      <motion.div
        animate={{
          scale: (isListening || isPlaying) ? [1, 1.4 * volumeScale, 1] : 1,
          opacity: (isListening || isPlaying) ? [0.2, 0.5 + (userVolume * 0.3), 0.2] : 0.1,
        }}
        transition={{ duration: isListening ? 0.5 : 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute size-64 rounded-full blur-[60px]"
        style={{ backgroundColor: glowColor }}
      />
      
      {/* Middle Floating Aura */}
      <motion.div
        animate={{
          scale: isListening ? [1, 1.2 * volumeScale, 1] : isPlaying ? [1, 1.3, 1] : 1,
          rotate: isPlaying ? [0, 90, 180, 270, 360] : isListening ? userVolume * 10 : 0,
          borderRadius: isPlaying ? ["50%", "40% 60%", "60% 40%", "50%"] : isListening ? ["50%", "45% 55%", "55% 45%", "50%"] : "50%",
        }}
        transition={{ duration: isListening ? 0.4 : 4, repeat: Infinity, ease: isListening ? "easeInOut" : "linear" }}
        className="absolute size-40 blur-[30px] opacity-70"
        style={{ backgroundColor: glowColor }}
      />

      {/* Core Orb */}
      <motion.div
        animate={{
          scale: isListening ? [1, 1.05 + (userVolume * 0.4), 1] : isPlaying ? [1, 1.15, 0.95, 1.1, 1] : 1,
          borderRadius: (isPlaying || (isListening && userVolume > 0.1))
            ? ["50%", "45% 55% 50% 50%", "50% 50% 45% 55%", "55% 45% 50% 50%", "50%"] 
            : ["50%", "48% 52% 50% 50%", "50%"],
        }}
        transition={{ 
          duration: isPlaying ? 0.8 : isListening ? 0.3 : 3, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="relative size-24 shadow-[inset_0_0_20px_rgba(255,255,255,0.5)] z-10"
        style={{
          background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), ${coreColor})`,
          boxShadow: `0 0 ${40 + (userVolume * 100)}px ${glowColor}, inset 0 0 20px rgba(255,255,255,0.5)`
        }}
      />
    </div>
  );
}
