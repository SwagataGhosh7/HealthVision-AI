import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, X, Send, Loader2, Bot, User, Globe, Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { streamChat, type Msg } from "@/lib/streamChat";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MedicalAnalysis } from "./MedicalAnalysis";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AnalysisLanguage } from "@/services/medicalAnalysis";

const HealthChatbot = () => {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatLanguage, setChatLanguage] = useState<AnalysisLanguage>("en");
  const [activeTab, setActiveTab] = useState<"chat" | "analysis">("chat");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  if (!user) return null;

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Msg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        mode: "chat",
        messages: [...messages, userMsg],
        onDelta: upsert,
        onDone: () => setIsLoading(false),
      });
    } catch (e: any) {
      toast.error(e.message || "Chat request failed");
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-accent text-accent-foreground shadow-lg glow flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-card border border-border/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ height: "500px" }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border/50 bg-secondary/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-accent flex items-center justify-center">
                    <Bot className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">HealthVision AI</p>
                    <p className="text-xs text-primary">{chatLanguage === "bn" ? "অনলাইন • সাহায্য করতে প্রস্তুত" : "Online • Ready to help"}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Tabs and Language selector */}
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "chat" | "analysis")} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-8 text-xs">
                  <TabsTrigger value="chat" className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    {chatLanguage === "bn" ? "চ্যাট" : "Chat"}
                  </TabsTrigger>
                  <TabsTrigger value="analysis" className="flex items-center gap-1">
                    <Stethoscope className="h-3 w-3" />
                    {chatLanguage === "bn" ? "বিশ্লেষণ" : "Analysis"}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Content Area */}
            {activeTab === "chat" ? (
              <>
                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <Bot className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">
                        {chatLanguage === "bn"
                          ? "নমস্কার! আমি আপনার স্বাস্থ্য সহায়ক। স্বাস্থ্য, সুস্থতা বা প্রাথমিক চিকিৎসা সম্পর্কে যা কিছু জানতে চান তা আমাকে জিজ্ঞাসা করুন।"
                          : "Hi! I'm your health assistant. Ask me anything about health, wellness, or first aid."}
                      </p>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "assistant" && (
                        <div className="h-6 w-6 rounded-full bg-gradient-accent flex items-center justify-center shrink-0 mt-1">
                          <Bot className="h-3 w-3 text-accent-foreground" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary/50 border border-border/40 text-foreground"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <div className="prose prose-sm prose-invert max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>
                      {msg.role === "user" && (
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                    <div className="flex gap-2">
                      <div className="h-6 w-6 rounded-full bg-gradient-accent flex items-center justify-center shrink-0">
                        <Bot className="h-3 w-3 text-accent-foreground" />
                      </div>
                      <div className="bg-secondary/50 border border-border/40 rounded-xl px-3 py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-3 border-t border-border/50 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Globe className="h-3 w-3 text-muted-foreground" />
                    <Select value={chatLanguage} onValueChange={(v) => setChatLanguage(v as AnalysisLanguage)}>
                      <SelectTrigger className="w-24 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="bn">Bengali (বাংলা)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder={chatLanguage === "bn" ? "স্বাস্থ্য সম্পর্কে জিজ্ঞাসা করুন..." : "Ask about health, symptoms, first aid..."}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                      className="bg-secondary/30 border-border/60 text-sm"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      size="icon"
                      className="bg-gradient-accent text-accent-foreground glow hover:opacity-90 shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* Analysis Tab */
              <div className="flex-1 overflow-y-auto p-4">
                <MedicalAnalysis />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HealthChatbot;
