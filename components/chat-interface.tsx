"use client";

import { useCallback, useState, useEffect } from "react";
import { useMounted } from "@/hooks/use-mounted";
import { useChat } from "@/hooks/use-chat";
import { useAudio } from "@/hooks/use-audio";
import { useSpeechRecognitionWithDebounce } from "@/hooks/use-speech-recognition";
import { useAudioMonitor } from "@/hooks/use-audio-monitor";
import { ChatHeader } from "@/components/chat-header";
import { ChatMessages } from "@/components/chat-messages";
import { ChatInput } from "@/components/chat-input";
import { LiveModeOverlay } from "@/components/live-mode-overlay";
import { AlertCircle } from "lucide-react";

export function ChatInterface() {
  const hasMounted = useMounted();
  const { messages, isLoading, sendMessage } = useChat();
  const { playAudio, stopAudio, isPlaying, playingText } = useAudio();
  const [isLiveMode, setIsLiveMode] = useState(false);

  const [lastFinishedAt, setLastFinishedAt] = useState<number>(0);

  const handleProcessMessage = useCallback(
    async (text: string, reset?: () => void) => {
      const isRecentlyPlaying = isPlaying || (Date.now() - lastFinishedAt < 2500);

      if (isRecentlyPlaying && playingText && text.length > 0) {
        const transWords = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
        const playingWords = playingText.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
        
        if (transWords.length > 0 && playingWords.length > 0) {
          const matchCount = transWords.filter(word => playingWords.includes(word)).length;
          const matchRatio = matchCount / transWords.length;
          
          const isShortEcho = transWords.length <= 2 && matchCount >= 1;
          
          if (matchRatio >= 0.5 || isShortEcho) {
            if (reset) reset();
            return;
          }
        }
      }

      const botMessage = await sendMessage(text);
      if (botMessage) {
        await playAudio(botMessage.content);
      }
    },
    [sendMessage, playAudio, playingText, isPlaying, lastFinishedAt],
  );

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    startListening,
    stopListening,
  } = useSpeechRecognitionWithDebounce({
    onTranscriptComplete: handleProcessMessage,
    continuous: isLiveMode,
  });

  const { volume: userVolume, frequencies: userFrequencies } = useAudioMonitor(listening && isLiveMode);

  useEffect(() => {
    if (isPlaying && transcript.length > 3) {
      const transWords = transcript.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
      const playingWords = playingText.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
      
      if (transWords.length > 0 && playingWords.length > 0) {
        const matchCount = transWords.filter(word => playingWords.includes(word)).length;
        const matchRatio = matchCount / transWords.length;
        
        if (matchRatio < 0.3) {
          stopAudio();
          resetTranscript();
        } else {
          resetTranscript();
        }
      }
    }
  }, [transcript, isPlaying, playingText, stopAudio, resetTranscript]);

  useEffect(() => {
    if (!isPlaying) {
      setLastFinishedAt(Date.now());
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isLiveMode && !listening) {
      startListening();
    }
  }, [isLiveMode, listening, startListening]);

  const handleMicClick = () => {
    if (listening) {
      stopListening();
      resetTranscript();
    } else {
      startListening();
    }
  };

  const handleInputSubmit = async (message: string) => {
    resetTranscript();
    await handleProcessMessage(message);
  };

  const toggleLiveMode = () => {
    if (!isLiveMode) {
      setIsLiveMode(true);
    } else {
      setIsLiveMode(false);
      stopListening();
      stopAudio();
    }
  };

  if (!hasMounted) return null;

  return (
    <div className="flex flex-col h-dvh bg-transparent font-sans overflow-hidden">
      <ChatHeader />

      <main className="flex-1 overflow-y-auto pt-24 pb-32 no-scrollbar">
        {!browserSupportsSpeechRecognition ? (
          <div className="h-full flex items-center justify-center p-6">
            <div className="glass p-8 rounded-3xl max-w-md text-center space-y-4">
              <div className="size-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
                <AlertCircle className="text-red-500 w-8 h-8" />
              </div>
              <p className="text-white/80 font-medium">
                Speech recognition is not supported in your browser. Please try Chrome or Safari.
              </p>
            </div>
          </div>
        ) : (
          <ChatMessages messages={messages} isLoading={isLoading} />
        )}
      </main>

      <ChatInput
        onSubmit={handleInputSubmit}
        transcript={transcript}
        listening={listening}
        isLoading={isLoading}
        browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
        onMicClick={handleMicClick}
        isPlaying={isPlaying}
        onStopAudio={stopAudio}
        isLiveMode={isLiveMode}
        onLiveClick={toggleLiveMode}
      />

      <LiveModeOverlay
        isOpen={isLiveMode}
        onClose={() => {
          setIsLiveMode(false);
          stopListening();
          stopAudio();
        }}
        isListening={listening}
        isPlaying={isPlaying}
        transcript={transcript}
        isLoading={isLoading}
        userVolume={userVolume}
        userFrequencies={userFrequencies}
        onMicToggle={handleMicClick}
        onStopAudio={stopAudio}
      />
    </div>
  );
}
