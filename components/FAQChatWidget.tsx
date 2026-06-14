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

export function FAQChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm the Deepfake Detection project assistant. Ask me anything about how the project works, supported formats, or detection accuracy!",
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
  const timer = setTimeout(() => setShowBubble(false), 30000);
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
      // API call to FAQ endpoint
      // Strip initial welcome message from API history to avoid polluting LLM context unnecessarily, 
      // or send the full history. Let's send history.
      const response = await chatbotAPI.faqChat(
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
          content: "Sorry, I'm having trouble connecting to the service. Please make sure the backend is running and GROQ_API_KEY is configured." 
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
      <div className="fixed bottom-24 right-6 z-50 max-w-[210px] bg-card border border-primary/30 rounded-2xl rounded-br-none px-4 py-3 text-sm text-foreground shadow-xl animate-bounce">
        👋 Ask me anything about this project!
        <div className="absolute -bottom-2 right-5 w-3 h-3 bg-card border-r border-b border-primary/30 rotate-45" />
      </div>
    )}

    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-primary hover:bg-primary/95 text-primary-foreground shadow-lg glow-blue hover:scale-105 transition-all duration-300 cursor-pointer animate-pulse-glow"
      aria-label="Open project support chat"
    >
      <MessageSquare className="h-6 w-6" />
    </button>
  </>
)}

      {/* Chat Window */}
      {isOpen && (
        
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] flex flex-col rounded-2xl glass border border-primary/30 shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-primary/10 border-b border-primary/20">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <h3 className="font-bold text-sm text-foreground">Project FAQ Bot</h3>
                <p className="text-[10px] text-muted-foreground">Ask about this project</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-full hover:bg-primary/20 text-muted-foreground hover:text-foreground"
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
                  <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm break-words",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none glow-blue border border-primary/40"
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
                <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                  <Bot className="h-4 w-4 text-primary animate-pulse" />
                </div>
                <div className="rounded-2xl rounded-tl-none px-4 py-2.5 text-sm bg-muted/70 text-muted-foreground border border-border/80 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Thinking...</span>
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
              placeholder="Ask a question..."
              disabled={isLoading}
              className="flex-1 min-w-0 bg-background/50 border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-primary/50 transition-all disabled:opacity-50"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="rounded-xl h-9 w-9 bg-primary hover:bg-primary/90 text-primary-foreground glow-blue"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
