/**
 * Bilingual Symptom & Disease Checker Component
 * 
 * Features:
 * - Bilingual support (English + Bengali)
 * - Real-time symptom analysis
 * - Disease identification and recommendations
 * - Severity indication with visual cues
 * - Loading and error states
 * - Healthcare professional disclaimer
 * 
 * Language behavior:
 * - English mode: Show English only
 * - Bengali mode: Show Bengali (primary) + English (secondary, muted)
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BilingualText, BilingualCard } from '@/components/BilingualDisplay';
import {
  analyzeMedicalData,
  analyzeWithTranslation,
  type MedicalAnalysisRequest,
  type AnalysisLanguage,
  type BilingualContent,
} from '@/services/medicalAnalysis';
import { translateAndFormat } from '@/utils/translateAndFormat';
import { toast } from 'sonner';

interface SymptomsCheckerResult {
  disease: string | BilingualContent;
  severity: 'mild' | 'moderate' | 'severe';
  recommendations: (string | BilingualContent)[];
  warningSign: boolean;
  language: AnalysisLanguage;
}

export const SymptomsChecker: React.FC = () => {
  const { i18n } = useTranslation();
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SymptomsCheckerResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentLanguage = i18n.language as AnalysisLanguage;

  // Get localized strings
  const getLocalizedText = (en: string, bn: string): string | BilingualContent => {
    return currentLanguage === 'bn' ? { en, bn } : en;
  };

  const handleAnalyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      toast.error(
        currentLanguage === 'bn'
          ? 'অনুগ্রহ করে কমপক্ষে একটি উপসর্গ বর্ণনা করুন'
          : 'Please describe at least one symptom'
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request: MedicalAnalysisRequest = {
        symptoms: symptoms
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s),
      };

      const analysis = await analyzeWithTranslation(request, currentLanguage);

      setResult({
        disease: analysis.diagnosis,
        severity: analysis.severity,
        recommendations: analysis.recommendations,
        warningSign: analysis.warningSign,
        language: currentLanguage,
      });

      toast.success(
        currentLanguage === 'bn'
          ? '✓ বিশ্লেষণ সম্পন্ন'
          : '✓ Analysis complete'
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : currentLanguage === 'bn'
          ? 'বিশ্লেষণ ব্যর্থ হয়েছে'
          : 'Analysis failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSymptoms('');
    setResult(null);
    setError(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe':
        return 'border-red-500 bg-red-50 dark:bg-red-950';
      case 'moderate':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-950';
      default:
        return 'border-green-500 bg-green-50 dark:bg-green-950';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'severe':
      case 'moderate':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
  };

  const getSeverityLabel = (severity: string): string | BilingualContent => {
    if (currentLanguage === 'bn') {
      switch (severity) {
        case 'severe':
          return { en: 'Severe', bn: 'গুরুতর' };
        case 'moderate':
          return { en: 'Moderate', bn: 'মধ্যম' };
        case 'mild':
          return { en: 'Mild', bn: 'হালকা' };
        default:
          return { en: 'Unknown', bn: 'অজানা' };
      }
    }

    switch (severity) {
      case 'severe':
        return 'Severe';
      case 'moderate':
        return 'Moderate';
      case 'mild':
        return 'Mild';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="space-y-1 sm:space-y-2">
        <BilingualText
          content={getLocalizedText(
            'Symptom & Disease Checker',
            'উপসর্গ ও রোগ নির্ণয়'
          )}
          currentLanguage={currentLanguage}
          type="title"
          className="text-xl sm:text-2xl"
        />
        <BilingualText
          content={getLocalizedText(
            'Describe your symptoms for AI-powered disease analysis',
            'আপনার উপসর্গ বর্ণনা করুন এআই-চালিত রোগ বিশ্লেষণের জন্য'
          )}
          currentLanguage={currentLanguage}
          type="body"
          className="text-muted-foreground"
        />
      </div>

      {/* Input Section */}
      <Card className="p-4 sm:p-6 border-2">
        <div className="space-y-3 sm:space-y-4">
          {/* Symptom Input */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold">
              <BilingualText
                content={getLocalizedText('Describe your symptoms', 'আপনার উপসর্গ বর্ণনা করুন')}
                currentLanguage={currentLanguage}
              />
            </label>
            <Textarea
              placeholder={
                currentLanguage === 'bn'
                  ? 'যেমন: মাথা ব্যথা, জ্বর...'
                  : 'e.g., Headache, Fever...'
              }
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="min-h-20 sm:min-h-24 resize-none text-sm"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground line-clamp-2">
              {currentLanguage === 'bn'
                ? '💡 টিপ: একাধিক উপসর্গ কমা দিয়ে আলাদা করুন'
                : '💡 Tip: Separate multiple symptoms with commas'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
            <Button
              onClick={handleAnalyzeSymptoms}
              disabled={loading || !symptoms.trim()}
              className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
              size="lg"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading
                ? currentLanguage === 'bn'
                  ? 'বিশ্লেষণ করা হচ্ছে...'
                  : 'Analyzing...'
                : currentLanguage === 'bn'
                ? 'রোগ নির্ণয় করুন'
                : 'Check Disease'}
            </Button>
            {(symptoms || result) && (
              <Button
                onClick={handleClear}
                variant="outline"
                size="lg"
                className="h-10 sm:h-12 text-sm sm:text-base sm:w-auto w-full"
              >
                {currentLanguage === 'bn' ? 'পরিষ্কার' : 'Clear'}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-3 sm:space-y-4"
          >
            {/* Disease/Diagnosis Card */}
            <BilingualCard
              title={getLocalizedText('Likely Condition', 'সম্ভাব্য রোগ')}
              content={result.disease}
              currentLanguage={currentLanguage}
              icon={<Activity className="h-4 sm:h-5 w-4 sm:w-5" />}
              severity={result.severity}
            />

            {/* Severity Indicator */}
            <Card className={`p-3 sm:p-4 border-2 ${getSeverityColor(result.severity)}`}>
              <div className="flex items-center gap-2 sm:gap-3">
                {getSeverityIcon(result.severity)}
                <div>
                  <p className="text-xs sm:text-sm font-semibold">
                    {currentLanguage === 'bn' ? 'তীব্রতা' : 'Severity'}
                  </p>
                  <BilingualText
                    content={getSeverityLabel(result.severity)}
                    currentLanguage={currentLanguage}
                    type="suggestion"
                  />
                </div>
              </div>
            </Card>

            {/* Warning Sign */}
            {result.warningSign && (
              <Alert variant="destructive" className="bg-red-50 border-red-300">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <BilingualText
                    content={getLocalizedText(
                      '⚠️ Warning: Seek immediate medical attention',
                      '⚠️ সতর্কতা: তাৎক্ষণিক চিকিৎসা সেবা নিন'
                    )}
                    currentLanguage={currentLanguage}
                  />
                </AlertDescription>
              </Alert>
            )}

            {/* Recommendations */}
            <div className="space-y-2 sm:space-y-3">
              <BilingualText
                content={getLocalizedText('Recommendations', 'সুপারিশসমূহ')}
                currentLanguage={currentLanguage}
                type="title"
              />
              <div className="space-y-2">
                {result.recommendations.map((rec, idx) => (
                  <Card key={idx} className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-950 border-blue-200">
                    <div className="flex gap-2 sm:gap-3">
                      <Info className="h-4 sm:h-5 w-4 sm:w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <BilingualText
                          content={rec}
                          currentLanguage={currentLanguage}
                          type="body"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <Alert className="bg-amber-50 border-amber-300 p-3 sm:p-4">
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <AlertDescription className="text-amber-900 text-xs sm:text-sm ml-2">
                <BilingualText
                  content={getLocalizedText(
                    '⚠️ This is an AI-assisted analysis. Always consult a qualified healthcare professional for medical decisions.',
                    '⚠️ এটি একটি এআই-সহায়ক বিশ্লেষণ। চিকিৎসা সংক্রান্ত সিদ্ধান্তের জন্য সর্বদা একজন যোগ্য স্বাস্থ্যসেবা পেশাদারের সাথে পরামর্শ করুন।'
                  )}
                  currentLanguage={currentLanguage}
                  type="suggestion"
                />
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SymptomsChecker;
