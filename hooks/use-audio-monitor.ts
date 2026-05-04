import { useEffect, useRef, useState } from "react";

export const useAudioMonitor = (isActive: boolean) => {
  const [volume, setVolume] = useState(0);
  const [frequencies, setFrequencies] = useState<number[]>(new Array(16).fill(0));
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      setVolume(0);
      setFrequencies(new Array(16).fill(0));
      return;
    }

    const startMonitoring = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;

        const analyzer = audioContext.createAnalyser();
        analyzer.fftSize = 64; // Smaller for smoother bar visualization
        analyzerRef.current = analyzer;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyzer);

        const dataArray = new Uint8Array(analyzer.frequencyBinCount);
        
        const updateVolume = () => {
          if (!analyzerRef.current) return;
          analyzerRef.current.getByteFrequencyData(dataArray);
          
          let sum = 0;
          const newFrequencies: number[] = [];
          
          // Capture 16 frequency bands
          for (let i = 0; i < 16; i++) {
            const val = dataArray[i] || 0;
            newFrequencies.push(val / 255); // Normalize to 0-1
            sum += val;
          }

          const average = sum / 16;
          setVolume(Math.min(1, average / 100));
          setFrequencies(newFrequencies);
          
          animationFrameRef.current = requestAnimationFrame(updateVolume);
        };

        updateVolume();
      } catch (err) {
        console.error("Error accessing microphone for monitoring:", err);
      }
    };

    startMonitoring();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [isActive]);

  return { volume, frequencies };
};
