import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BotIcon, UserIcon, Sparkles } from "lucide-react";
import { Message } from "@/hooks/use-chat";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6 mt-12">
        <motion.div
          className="max-w-lg w-full glass p-16 rounded-[3rem] text-center relative overflow-hidden group"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute top-0 left-0 w-full h-1.5 premium-gradient opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="flex flex-col items-center gap-10 relative z-10">
            <div className="size-24 rounded-3xl premium-gradient flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] float">
              <BotIcon className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-4">
              <h2 className="text-5xl font-extrabold text-white tracking-tight leading-tight">
                SMT<span className="text-primary">.</span>AI
              </h2>
              <p className="text-white/40 text-xl font-medium max-w-[280px] mx-auto leading-relaxed">
                Hyper-realistic voice agent. Always active.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {["Voice Analysis", "Deep Logic", "Live Sync"].map((tag) => (
                <span key={tag} className="px-5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/10 text-[10px] uppercase tracking-widest text-white/30 font-bold hover:bg-white/10 hover:text-white/80 transition-all cursor-default">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto px-4 py-8">
      <AnimatePresence initial={false}>
        {messages.map((message) => (
          <motion.div
            key={message.id}
            layout
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex w-full gap-5 ${
              message.role === "assistant" ? "flex-row" : "flex-row-reverse"
            }`}
          >
            <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl transition-transform hover:scale-110 ${
              message.role === "assistant" 
                ? "premium-gradient text-white shadow-primary/20" 
                : "bg-white/[0.05] border border-white/10 text-white/80"
            }`}>
              {message.role === "assistant" ? <BotIcon size={24} /> : <UserIcon size={24} />}
            </div>
            
            <div className={`flex flex-col gap-3 max-w-[85%] ${
              message.role === "assistant" ? "items-start" : "items-end"
            }`}>
              <div className={`px-7 py-4 rounded-[2rem] text-lg leading-relaxed transition-all duration-500 shadow-2xl ${
                message.role === "assistant"
                  ? "glass text-white/90 rounded-tl-none hover:bg-white/[0.05]"
                  : "premium-gradient text-white rounded-tr-none shadow-primary/10 hover:brightness-110"
              }`}>
                {message.content}
              </div>
              <span className="text-[11px] text-white/20 uppercase tracking-[0.2em] px-2 font-semibold">
                {message.role === "assistant" ? "Neural Core" : "User Access"}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-row gap-4 items-center"
        >
          <div className="size-10 rounded-xl premium-gradient flex items-center justify-center animate-pulse">
            <Sparkles size={20} className="text-white" />
          </div>
          <div className="flex gap-1.5 px-4 py-3 glass rounded-2xl rounded-tl-none">
            {[0, 0.15, 0.3].map((delay) => (
              <motion.div
                key={delay}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay }}
                className="w-1.5 h-1.5 bg-primary rounded-full"
              />
            ))}
          </div>
        </motion.div>
      )}
      <div ref={messagesEndRef} className="h-10" />
    </div>
  );
}


