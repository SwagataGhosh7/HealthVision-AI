import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity, ArrowLeft, Search, Pill, Stethoscope, Send, Loader2, Bot, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { streamChat, type Msg } from "@/lib/streamChat";

type Tool = "symptom-checker" | "medicine-info";

const MedicalTools = () => {
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState<Tool>("symptom-checker");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSwitchTool = (tool: Tool) => {
    setActiveTool(tool);
    setMessages([]);
    setInput("");
  };

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
        mode: activeTool,
        messages: [...messages, userMsg],
        onDelta: upsert,
        onDone: () => setIsLoading(false),
      });
    } catch (e: any) {
      toast.error(e.message || "AI request failed");
      setIsLoading(false);
    }
  };

  const placeholders: Record<Tool, string> = {
    "symptom-checker": "Describe symptoms, e.g. 'headache, fever, body ache for 3 days'",
    "medicine-info": "Enter a medicine name, e.g. 'Ibuprofen' or 'Amoxicillin'",
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="h-9 w-9 rounded-lg bg-gradient-accent flex items-center justify-center glow">
              <Activity className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">
              HealthVision <span className="text-gradient">AI</span>
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground mb-1">AI Medical Tools</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Get AI-powered insights on symptoms, diseases, and medicines
          </p>
        </motion.div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTool === "symptom-checker" ? "default" : "outline"}
            onClick={() => handleSwitchTool("symptom-checker")}
            className={activeTool === "symptom-checker"
              ? "bg-gradient-accent text-accent-foreground glow"
              : "border-border/60 text-muted-foreground"
            }
          >
            <Stethoscope className="h-4 w-4 mr-2" /> Symptom Checker
          </Button>
          <Button
            variant={activeTool === "medicine-info" ? "default" : "outline"}
            onClick={() => handleSwitchTool("medicine-info")}
            className={activeTool === "medicine-info"
              ? "bg-gradient-accent text-accent-foreground glow"
              : "border-border/60 text-muted-foreground"
            }
          >
            <Pill className="h-4 w-4 mr-2" /> Medicine Info
          </Button>
        </div>

        <Card className="bg-card border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-foreground text-sm flex items-center gap-2">
              {activeTool === "symptom-checker" ? (
                <><Stethoscope className="h-4 w-4 text-primary" /> Symptom & Disease Checker</>
              ) : (
                <><Pill className="h-4 w-4 text-primary" /> Medicine Information</>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              ref={scrollRef}
              className="min-h-[300px] max-h-[450px] overflow-y-auto space-y-4 mb-4 p-2"
            >
              {messages.length === 0 && (
                <div className="text-center py-12">
                  {activeTool === "symptom-checker" ? (
                    <Stethoscope className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  ) : (
                    <Pill className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  )}
                  <p className="text-muted-foreground text-sm">
                    {activeTool === "symptom-checker"
                      ? "Describe your symptoms or a disease to get AI-powered medicine and remedy suggestions"
                      : "Enter a medicine name to learn about its uses, side effects, and interactions"
                    }
                  </p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="h-7 w-7 rounded-full bg-gradient-accent flex items-center justify-center shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-accent-foreground" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/50 border border-border/40 text-foreground"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-3">
                  <div className="h-7 w-7 rounded-full bg-gradient-accent flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div className="bg-secondary/50 border border-border/40 rounded-xl px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder={placeholders[activeTool]}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                className="bg-secondary/30 border-border/60"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-accent text-accent-foreground glow hover:opacity-90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground/60 italic mt-3 text-center">
              ⚠ AI-generated content. Always consult a healthcare professional before taking any medication.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MedicalTools;
