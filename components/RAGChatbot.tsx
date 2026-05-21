"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, MessageSquare, Sparkle } from "lucide-react";
import { usePathname } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function RAGChatbot() {
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Halo! Selamat datang di NEXAMART. Saya adalah AI Beauty Assistant yang siap membantu Anda dengan informasi mengenai produk kecantikan kami, pemesanan, pengiriman, pembayaran, atau kebijakan pengembalian (retur). Ada yang bisa saya bantu hari ini?"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    const chatHistory = [...messages, userMessage];

    try {
      const response = await fetch("/api/rag/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages: chatHistory })
      });

      if (!response.ok) {
        throw new Error("Gagal menghubungi layanan AI.");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error("Layanan stream tidak didukung.");
      }

      // Add a placeholder message for the assistant
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      setIsTyping(false);

      let accumulatedAnswer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const textChunk = decoder.decode(value);
        accumulatedAnswer += textChunk;

        // Update the last assistant message
        setMessages((prev) => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1] = {
              role: "assistant",
              content: accumulatedAnswer
            };
          }
          return updated;
        });
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Chat error:", err.message);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Maaf, koneksi ke sistem kecerdasan buatan sedang terganggu. Hubungan ke basis pengetahuan terputus. Silakan coba beberapa saat lagi."
        }
      ]);
      setIsTyping(false);
    }
  };

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      {/* Floating Circular Action Button */}
      <div className="fixed bottom-24 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-14 h-14 bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-100 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.06)] cursor-pointer"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-5 h-5 text-neutral-500" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <MessageSquare className="w-5.5 h-5.5 text-neutral-700" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-neutral-950"></span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Elegant White Clean Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed bottom-40 right-6 z-40 w-[calc(100vw-32px)] max-w-sm h-[500px] bg-white border border-neutral-100/90 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-50 bg-neutral-50/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-neutral-950 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-semibold tracking-wide text-neutral-950 flex items-center gap-1">
                    AI Beauty Assistant
                    <Sparkle className="w-3 h-3 text-neutral-400 fill-neutral-400" />
                  </h3>
                  <span className="text-[10px] text-green-600 font-medium">Bersiaga untuk Melayani</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
              {messages.map((m, index) => (
                <div
                  key={index}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      m.role === "user"
                        ? "bg-neutral-950 text-white font-sans rounded-tr-none shadow-sm"
                        : "bg-neutral-50/70 border border-neutral-100 text-neutral-800 font-serif tracking-wide rounded-tl-none whitespace-pre-wrap"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-neutral-50 border border-neutral-100 text-neutral-400 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSend} className="p-4 border-t border-neutral-50 bg-white flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanyakan tentang produk, pengiriman, atau retur..."
                className="flex-1 px-4 py-2 text-xs bg-neutral-50 border border-neutral-200/60 rounded-full focus:outline-none focus:border-neutral-900 focus:bg-white transition-all text-neutral-800"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-950 hover:bg-neutral-900 disabled:bg-neutral-100 disabled:text-neutral-300 text-white transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
