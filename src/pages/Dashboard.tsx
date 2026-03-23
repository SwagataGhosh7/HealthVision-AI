import { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity, Upload, FileText, HeartPulse, Brain, AlertTriangle,
  CheckCircle, LogOut, TrendingUp, MapPin, Stethoscope, UserCog, CalendarPlus, Download
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import VitalSignsPanel from "@/components/dashboard/VitalSignsPanel";
import DiagnosisHistory from "@/components/dashboard/DiagnosisHistory";
import QuickStatsCards from "@/components/dashboard/QuickStatsCards";
import ExportPDFReport from "@/components/dashboard/ExportPDFReport";
import LanguageToggle from "@/components/LanguageToggle";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [description, setDescription] = useState("");
  const [activeTab, setActiveTab] = useState<"diagnose" | "book" | "nearby" | "tools" | "vitals" | "history" | "export" | "profile">("diagnose");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast.error(t('dashboard.upload.uploadError'));
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error(t('dashboard.upload.sizeError'));
      return;
    }

    setSelectedFile(file);
    setAnalysisResult(null);

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !user) return;

    setAnalyzing(true);
    try {
      const fileExt = selectedFile.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("medical-uploads")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: diagnosis, error: insertError } = await supabase
        .from("diagnoses")
        .insert({
          user_id: user.id,
          title: selectedFile.name,
          description: description || "Medical report analysis",
          image_url: filePath,
          status: "analyzing",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];

        try {
          console.log("Calling analyze-medical function...");
          const resp = await supabase.functions.invoke("analyze-medical", {
            body: {
              image_base64: base64,
              file_type: selectedFile.type,
              description: description,
            },
          });

          console.log("Function response:", resp);

          if (resp.error) {
            console.error("Function error:", resp.error);
            throw new Error(resp.error.message || "Analysis service unavailable");
          }

          const result = resp.data;
          setAnalysisResult(result);

          await supabase
            .from("diagnoses")
            .update({
              analysis_result: result.analysis,
              severity: result.severity,
              recommendations: result.recommendations,
              status: "completed",
            })
            .eq("id", diagnosis.id);

          toast.success("Analysis complete!");
        } catch (error: any) {
          console.error("Analysis error:", error);
          
          // Handle different types of errors
          let errorMessage = "Analysis failed";
          if (error.message?.includes("404") || error.message?.includes("not found")) {
            errorMessage = "Analysis service not available - please try again later";
          } else if (error.message?.includes("429")) {
            errorMessage = "Too many requests - please wait a moment";
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          toast.error(errorMessage);
          
          // Update diagnosis with error status
          await supabase
            .from("diagnoses")
            .update({
              status: "failed",
              error_message: errorMessage,
            })
            .eq("id", diagnosis.id);
        } finally {
          setAnalyzing(false);
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
      setAnalyzing(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const severityColors: Record<string, string> = {
    low: "text-green-400 bg-green-400/10 border-green-400/30",
    moderate: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    high: "text-orange-400 bg-orange-400/10 border-orange-400/30",
    critical: "text-red-400 bg-red-400/10 border-red-400/30",
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
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <span className="text-sm text-muted-foreground hidden md:block">
              {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1" /> {t('dashboard.signOut')}
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-8">
          {[
            { id: "diagnose" as const, icon: Brain, label: t('dashboard.tabs.diagnose') },
            { id: "book" as const, icon: CalendarPlus, label: t('dashboard.tabs.book') },
            { id: "nearby" as const, icon: MapPin, label: t('dashboard.tabs.nearby') },
            { id: "tools" as const, icon: Stethoscope, label: t('dashboard.tabs.tools') },
            { id: "vitals" as const, icon: HeartPulse, label: t('dashboard.tabs.vitals') },
            { id: "history" as const, icon: FileText, label: t('dashboard.tabs.history') },
            { id: "export" as const, icon: Download, label: t('dashboard.tabs.export') },
            { id: "profile" as const, icon: UserCog, label: t('dashboard.tabs.profile') },
          ].map(({ id, icon: Icon, label }) => (
            <Button
              key={id}
              variant={activeTab === id ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (id === "nearby") {
                  navigate("/nearby");
                } else if (id === "tools") {
                  navigate("/medical-tools");
                } else if (id === "profile") {
                  navigate("/profile");
                } else if (id === "book") {
                  navigate("/book-doctor");
                } else {
                  setActiveTab(id);
                }
              }}
              className={`justify-start ${activeTab === id
                ? "bg-gradient-accent text-accent-foreground glow"
                : "border-border/60 text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4 mr-2" /> {label}
            </Button>
          ))}
        </div>

        <QuickStatsCards />

        {activeTab === "diagnose" && (
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="bg-card border-border/60">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    {t('dashboard.upload.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('dashboard.upload.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="border-2 border-dashed border-border/60 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                    ) : (
                      <div>
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm">{t('dashboard.upload.clickToUpload')}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t('dashboard.upload.supports')}</p>
                      </div>
                    )}
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleFileSelect}
                      title="Upload medical report"
                      placeholder="Choose file"
                    />
                  </div>

                  {selectedFile && (
                    <p className="text-sm text-primary">
                      ✓ {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)}MB)
                    </p>
                  )}

                  <div>
                    <Label className="text-foreground text-sm">{t('dashboard.upload.descriptionLabel')}</Label>
                    <Input
                      placeholder={t('dashboard.upload.descriptionPlaceholder')}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1 bg-secondary/30 border-border/60"
                    />
                  </div>

                  <Button
                    onClick={handleAnalyze}
                    disabled={!selectedFile || analyzing}
                    className="w-full bg-gradient-accent text-accent-foreground glow hover:opacity-90"
                  >
                    {analyzing ? (
                      <><Brain className="h-4 w-4 mr-2 animate-pulse" /> {t('dashboard.upload.analyzingButton')}</>
                    ) : (
                      <><Brain className="h-4 w-4 mr-2" /> {t('dashboard.upload.analyzeButton')}</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="bg-card border-border/60">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {t('dashboard.analysis.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analyzing ? (
                    <div className="text-center py-12">
                      <Brain className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
                      <p className="text-foreground font-medium">{t('dashboard.analysis.analyzing')}</p>
                      <p className="text-muted-foreground text-sm mt-1">{t('dashboard.analysis.analyzingSubtext')}</p>
                    </div>
                  ) : analysisResult ? (
                    <div className="space-y-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${severityColors[analysisResult.severity] || severityColors.low}`}>
                        {analysisResult.severity === "critical" || analysisResult.severity === "high" ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        {t('dashboard.analysis.severity')}: {analysisResult.severity?.toUpperCase()}
                      </div>

                      <div>
                        <h4 className="text-foreground font-semibold mb-2">{t('dashboard.analysis.diagnosis')}</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {typeof analysisResult.analysis === "string"
                            ? analysisResult.analysis
                            : JSON.stringify(analysisResult.analysis)}
                        </p>
                      </div>

                      {analysisResult.recommendations?.length > 0 && (
                        <div>
                          <h4 className="text-foreground font-semibold mb-2">{t('dashboard.analysis.recommendations')}</h4>
                          <ul className="space-y-2">
                            {analysisResult.recommendations.map((rec: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <TrendingUp className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground/60 italic">
                        {t('dashboard.analysis.disclaimer')}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Brain className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground">{t('dashboard.analysis.uploadPrompt')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {activeTab === "vitals" && <VitalSignsPanel />}
        {activeTab === "history" && <DiagnosisHistory />}
        {activeTab === "export" && <ExportPDFReport />}
      </div>
    </div>
  );
};

export default Dashboard;
