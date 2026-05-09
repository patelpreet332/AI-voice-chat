import { useCallback, useState } from "react";

export const useAudio = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playingText, setPlayingText] = useState<string>("");

  const stopAudio = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setPlayingText("");
  }, []);

  const playAudio = useCallback(
    async (text: string) => {
      try {
        stopAudio();

        if (!window.speechSynthesis) {
          console.error("Speech synthesis not supported");
          return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => 
          v.name.includes("Google") || 
          v.name.includes("Female") || 
          v.name.includes("Natural")
        );
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onstart = () => {
          setIsPlaying(true);
          setPlayingText(text);
        };
        utterance.onend = () => {
          setIsPlaying(false);
          setPlayingText("");
        };
        utterance.onerror = () => {
          setIsPlaying(false);
          setPlayingText("");
        };

        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
        setPlayingText("");
      }
    },
    [stopAudio],
  );

  return { playAudio, stopAudio, isPlaying, playingText };
};
