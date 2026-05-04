import { FormEvent, useEffect, useState } from "react";
import { MicIcon, SendIcon, Square, Loader2, Radio } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  transcript: string;
  listening: boolean;
  isLoading: boolean;
  browserSupportsSpeechRecognition: boolean;
  onMicClick: () => void;
  isPlaying: boolean;
  onStopAudio: () => void;
  isLiveMode: boolean;
  onLiveClick: () => void;
}

export function ChatInput({
  onSubmit,
  transcript,
  listening,
  isLoading,
  browserSupportsSpeechRecognition,
  onMicClick,
  isPlaying,
  onStopAudio,
  isLiveMode,
  onLiveClick,
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState<string>("");

  useEffect(() => {
    setInputValue(transcript);
  }, [transcript]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSubmit(inputValue);
      setInputValue("");
    }
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-4xl mx-auto px-4 pb-8 flex flex-col items-center gap-4">
        <form
          onSubmit={handleSubmit}
          className={`flex items-center w-full glass rounded-2xl px-4 py-3 transition-all duration-300 ${
            listening ? "ring-2 ring-primary/50" : ""
          }`}
        >
          <div className="flex-1 flex items-center gap-3">
            {listening && (
              <div className="flex items-center gap-1 px-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-1 bg-primary rounded-full animate-bounce"
                    style={{
                      height: "12px",
                      animationDuration: `${0.5 + i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            )}
            <Input
              className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder-white/40 text-lg h-10"
              placeholder={listening ? "I'm listening..." : "Type or speak a command..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={listening}
            />
          </div>

          <div className="flex items-center gap-2 ml-2">
            {isPlaying && (
              <Button
                type="button"
                onClick={onStopAudio}
                size="icon"
                className="rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg animate-pulse"
              >
                <Square size={20} />
              </Button>
            )}
            
            <Button
              type="button"
              onClick={onLiveClick}
              size="icon"
              className={`rounded-full transition-all duration-500 ${
                isLiveMode
                  ? "bg-primary text-white scale-110 shadow-lg shadow-primary/30"
                  : "bg-white/5 hover:bg-white/10 text-white/60"
              }`}
              title="Go Live"
            >
              <Radio size={20} className={isLiveMode ? "animate-pulse" : ""} />
            </Button>

            <Button
              type="button"
              onClick={onMicClick}
              size="icon"
              disabled={!browserSupportsSpeechRecognition}
              className={`rounded-full transition-all duration-500 ${
                listening
                  ? "bg-red-500 hover:bg-red-600 scale-125 shadow-[0_0_20px_oklch(0.577_0.245_27.325/0.5)]"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              <MicIcon size={20} />
            </Button>

            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !inputValue.trim()}
              className={`rounded-full transition-all duration-300 ${
                inputValue.trim() && !isLoading
                  ? "premium-gradient text-white shadow-lg hover:scale-110"
                  : "bg-white/5 text-white/20"
              }`}
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <SendIcon size={20} />
              )}
            </Button>
          </div>
        </form>
        
        <div className="flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity duration-300">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white font-bold">
            SMT.AI
          </span>
          <div className="w-1 h-1 rounded-full bg-primary" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-white font-bold">
            HYPER-VOICE V2.0
          </span>
        </div>
      </div>
    </footer>
  );
}


