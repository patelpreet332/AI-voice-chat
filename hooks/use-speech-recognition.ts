import { useEffect, useRef, useCallback } from "react";
import { useDebounce } from "use-debounce";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { CONFIG } from "@/lib/constants";

interface UseSpeechRecognitionWithDebounceProps {
  onTranscriptComplete: (transcript: string, reset: () => void) => void;
  onSpeechStart?: () => void;
  debounceMs?: number;
  continuous?: boolean;
}

export const useSpeechRecognitionWithDebounce = ({
  onTranscriptComplete,
  onSpeechStart,
  debounceMs = CONFIG.SPEECH_DEBOUNCE_MS,
  continuous = false,
}: UseSpeechRecognitionWithDebounceProps) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [debouncedTranscript] = useDebounce(transcript, debounceMs);
  const lastProcessedTranscript = useRef<string>("");
  const isSpeakingRef = useRef<boolean>(false);

  // Detect when user starts speaking
  useEffect(() => {
    if (transcript.length > 0 && !isSpeakingRef.current) {
      isSpeakingRef.current = true;
      onSpeechStart?.();
    }
    if (transcript.length === 0) {
      isSpeakingRef.current = false;
    }
  }, [transcript, onSpeechStart]);

  useEffect(() => {
    if (
      debouncedTranscript &&
      debouncedTranscript !== lastProcessedTranscript.current &&
      listening
    ) {
      lastProcessedTranscript.current = debouncedTranscript;
      
      if (!continuous) {
        SpeechRecognition.stopListening();
      }
      
      onTranscriptComplete(debouncedTranscript, resetTranscript);
      resetTranscript();
      isSpeakingRef.current = false;
    }
  }, [debouncedTranscript, listening, onTranscriptComplete, resetTranscript, continuous]);

  const startListening = useCallback(() => {
    resetTranscript();
    lastProcessedTranscript.current = "";
    isSpeakingRef.current = false;
    SpeechRecognition.startListening({ continuous: true });
  }, [resetTranscript]);

  const stopListening = useCallback(() => {
    SpeechRecognition.stopListening();
    isSpeakingRef.current = false;
  }, []);

  return {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    startListening,
    stopListening,
  };
};
