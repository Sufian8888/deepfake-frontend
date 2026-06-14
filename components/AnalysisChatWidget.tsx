"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Loader2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { chatbotAPI } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AnalysisChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your Analysis Assistant. I can help explain the deepfake detection results for your uploaded videos. Ask me questions like:\n\n- \"Show all my analyzed videos\"\n- \"What's the result for my_video.mp4?\"\n- \"Why was wedding_clip.mp4 flagged as fake?\"",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);
const [showBubble, setShowBubble] = useState(true);

useEffect(() => {
  const timer = setTimeout(() => setShowBubble(false), 20000);
  return () => clearTimeout(timer);
}, []);
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message locally
    const updatedMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // API call to the protected RAG query endpoint
      const response = await chatbotAPI.analysisChat(
        userMessage, 
        messages.map(m => ({ role: m.role, content: m.content }))
      );

      setMessages(prev => [...prev, { role: "assistant", content: response.reply }]);
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev,
        { 
          role: "assistant", 
          content: "Sorry, I encountered an error. Please make sure the video name is correct and you are logged in." 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
  <>
    {/* Animated Bubble */}
    {showBubble && (
      <div className="fixed bottom-24 right-6 z-50 max-w-[210px] bg-card border border-secondary/30 rounded-2xl rounded-br-none px-4 py-3 text-sm text-foreground shadow-xl animate-bounce">
        🔍 Ask about your video analysis results!
        <div className="absolute -bottom-2 right-5 w-3 h-3 bg-card border-r border-b border-secondary/30 rotate-45" />
      </div>
    )}

    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-secondary hover:bg-secondary/95 text-secondary-foreground shadow-lg glow-purple hover:scale-105 transition-all duration-300 cursor-pointer animate-pulse-glow"
      aria-label="Open Analysis Assistant"
    >
      <MessageSquare className="h-6 w-6" />
    </button>
  </>
)}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] flex flex-col rounded-2xl glass border border-secondary/30 shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-secondary/10 border-b border-secondary/20">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
              <div>
                <h3 className="font-bold text-sm text-foreground">Analysis Assistant</h3>
                <p className="text-[10px] text-muted-foreground">Query video analysis reports</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-full hover:bg-secondary/20 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-start gap-2 max-w-[85%]",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="h-7 w-7 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 border border-secondary/30">
                    <Bot className="h-4 w-4 text-secondary" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm break-words",
                    msg.role === "user"
                      ? "bg-secondary text-secondary-foreground rounded-tr-none glow-purple border border-secondary/40"
                      : "bg-muted/70 text-foreground rounded-tl-none border border-border/80"
                  )}
                >
                  {msg.content.split("\n").map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < msg.content.split("\n").length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2 max-w-[85%] mr-auto">
                <div className="h-7 w-7 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 border border-secondary/30">
                  <Bot className="h-4 w-4 text-secondary animate-pulse" />
                </div>
                <div className="rounded-2xl rounded-tl-none px-4 py-2.5 text-sm bg-muted/70 text-muted-foreground border border-border/80 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-secondary" />
                  <span>Analyzing database...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-card/60 border-t border-border/50 flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your videos..."
              disabled={isLoading}
              className="flex-1 min-w-0 bg-background/50 border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-secondary/50 transition-all disabled:opacity-50"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="rounded-xl h-9 w-9 bg-secondary hover:bg-secondary/90 text-secondary-foreground glow-purple"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
