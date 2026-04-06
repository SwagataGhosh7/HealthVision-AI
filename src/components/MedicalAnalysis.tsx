import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, CheckCircle, Info, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  analyzeMedicalData,
  analyzeWithTranslation,
  type MedicalAnalysisRequest,
  type AnalysisLanguage,
} from "@/services/medicalAnalysis";
import { toast } from "sonner";

interface AnalysisResult {
  diagnosis: string;
  severity: "mild" | "moderate" | "severe";
  recommendations: string[];
  warningSign: boolean;
  language: AnalysisLanguage;
}

export const MedicalAnalysis = () => {
  const { i18n } = useTranslation();
  const [symptoms, setSymptoms] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [temperature, setTemperature] = useState("");
  const [oxygenSat, setOxygenSat] = useState("");
  const [language, setLanguage] = useState<AnalysisLanguage>("en");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!symptoms.trim() && !medicalHistory.trim() && !heartRate.trim()) {
      toast.error("Please provide at least one piece of information");
      return;
    }

    setLoading(true);
    try {
      const request: MedicalAnalysisRequest = {
        symptoms: symptoms
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        medicalHistory: medicalHistory || undefined,
        vitals: {
          heartRate: heartRate ? parseInt(heartRate) : undefined,
          bloodPressure: bloodPressure || undefined,
          temperature: temperature ? parseFloat(temperature) : undefined,
          oxygenSaturation: oxygenSat ? parseInt(oxygenSat) : undefined,
        },
      };

      const analysis = await analyzeWithTranslation(request, language);
      setResult(analysis);
      toast.success(language === "bn" ? "বিশ্লেষণ সম্পন্ন" : "Analysis completed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "severe":
        return "text-red-600 bg-red-50";
      case "moderate":
        return "text-orange-600 bg-orange-50";
      default:
        return "text-green-600 bg-green-50";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "severe":
      case "moderate":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <CheckCircle className="h-5 w-5" />;
    }
  };

  const getSeverityLabel = (severity: string): string => {
    if (language === "bn") {
      switch (severity) {
        case "severe":
          return "গুরুতর";
        case "moderate":
          return "মধ্যম";
        case "mild":
          return "হালকা";
        default:
          return severity;
      }
    } else {
      return severity.charAt(0).toUpperCase() + severity.slice(1);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
      {/* Language Selector */}
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-primary" />
        <Select value={language} onValueChange={(v) => setLanguage(v as AnalysisLanguage)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="bn">Bengali (বাংলা)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Input Form */}
      <Card className="p-6 space-y-4">
        <div>
          <label className="text-sm font-semibold block mb-2">
            {language === "bn" ? "উপসর্গ" : "Symptoms"}
          </label>
          <Textarea
            placeholder={language === "bn" ? "মাথাব্যথা, জ্বর, কাশি..." : "e.g., headache, fever, cough..."}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="min-h-16"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {language === "bn" ? "কমা দ্বারা পৃথক করুন" : "Separate with commas"}
          </p>
        </div>

        <div>
          <label className="text-sm font-semibold block mb-2">
            {language === "bn" ? "চিকিৎসা ইতিহাস" : "Medical History"}
          </label>
          <Textarea
            placeholder={language === "bn" ? "কোনো দীর্ঘমেয়াদী রোগ বা অ্যালার্জি..." : "Any chronic conditions or allergies..."}
            value={medicalHistory}
            onChange={(e) => setMedicalHistory(e.target.value)}
            className="min-h-16"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold block mb-2">
              {language === "bn" ? "হার্ট রেট (bpm)" : "Heart Rate (bpm)"}
            </label>
            <input
              type="number"
              placeholder="60-100"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-semibold block mb-2">
              {language === "bn" ? "রক্তচাপ" : "Blood Pressure"}
            </label>
            <input
              type="text"
              placeholder="120/80"
              value={bloodPressure}
              onChange={(e) => setBloodPressure(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-semibold block mb-2">
              {language === "bn" ? "তাপমাত্রা (°F)" : "Temperature (°F)"}
            </label>
            <input
              type="number"
              placeholder="98.6"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-semibold block mb-2">
              {language === "bn" ? "অক্সিজেন স্যাচুরেশন (%)" : "Oxygen Saturation (%)"}
            </label>
            <input
              type="number"
              placeholder="95-100"
              min="0"
              max="100"
              value={oxygenSat}
              onChange={(e) => setOxygenSat(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md"
            />
          </div>
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {language === "bn" ? "বিশ্লেষণ চলছে..." : "Analyzing..."}
            </>
          ) : (
            language === "bn" ? "বিশ্লেষণ করুন" : "Analyze"
          )}
        </Button>
      </Card>

      {/* Analysis Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4"
          >
            {/* Results Title */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                {language === "bn" ? "বিশ্লেষণ ফলাফল" : "Analysis Results"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {language === "bn" 
                  ? "আপনার স্বাস্থ্য ডেটার AI বিশ্লেষণ"
                  : "AI-powered analysis of your health data"}
              </p>
            </div>

            {/* Warning Alert */}
            {result.warningSign && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {language === "bn"
                    ? "সাবধানী সতর্কতা: এটি একটি গুরুতর অবস্থা হতে পারে। অবিলম্বে চিকিৎসকের পরামর্শ নিন।"
                    : "Warning: This appears to be a serious condition. Seek medical attention immediately."}
                </AlertDescription>
              </Alert>
            )}

            {/* Severity Badge */}
            <Card className={`p-6 flex items-center gap-4 ${getSeverityColor(result.severity)}`}>
              {getSeverityIcon(result.severity)}
              <div>
                <p className="font-semibold">
                  {language === "bn" ? "তীব্রতা" : "Severity"}: <span className="uppercase">{getSeverityLabel(result.severity)}</span>
                </p>
              </div>
            </Card>

            {/* Diagnosis */}
            <Card className="p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                {language === "bn" ? "রোগ নির্ণয়" : "Diagnosis"}
              </h3>
              <p className="text-sm text-foreground/80">{result.diagnosis}</p>
            </Card>

            {/* Recommendations */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">
                {language === "bn" ? "সুপারিশ" : "Recommendations"}
              </h3>
              <ul className="space-y-3">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex gap-3 text-sm">
                    <span className="font-bold text-primary min-w-6">{idx + 1}.</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Disclaimer */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {language === "bn"
                  ? "⚠️ এটি একটি AI-সহায়ক বিশ্লেষণ। চিকিৎসকীয় সিদ্ধান্তের জন্য সর্বদা যোগ্য স্বাস্থ্যসেবা পেশাদারের পরামর্শ নিন।"
                  : "⚠️ This is an AI-assisted analysis. Always consult a qualified healthcare professional for medical decisions."}
              </AlertDescription>
            </Alert>

            <Button
              onClick={() => {
                setResult(null);
                setSymptoms("");
                setMedicalHistory("");
                setHeartRate("");
                setBloodPressure("");
                setTemperature("");
                setOxygenSat("");
              }}
              variant="outline"
              className="w-full"
            >
              {language === "bn" ? "নতুন বিশ্লেষণ" : "New Analysis"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
