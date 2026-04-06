/**
 * Enhanced Medical Analysis Results Component
 * Demonstrates bilingual display with dual-language support
 * 
 * Features:
 * - Single language when English
 * - Dual language when Bengali
 * - Clean UI hierarchy
 * - Efficient caching to avoid duplicate API calls
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import {
  BilingualText,
  BilingualCard,
  BilingualList,
} from '@/components/BilingualDisplay';
import {
  translateAndFormat,
  formatMedicalAnalysis,
  BilingualContent,
} from '@/utils/translateAndFormat';
import { MedicalAnalysisResponse } from '@/services/medicalAnalysis';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';

interface AnalysisResultsProps {
  analysis: MedicalAnalysisResponse;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis }) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language as 'en' | 'bn';

  /**
   * Severity icon and styles
   */
  const getSeverityIcon = () => {
    switch (analysis.severity) {
      case 'severe':
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      case 'moderate':
        return <AlertCircle className="h-6 w-6 text-orange-600" />;
      default:
        return <CheckCircle className="h-6 w-6 text-green-600" />;
    }
  };

  /**
   * Severity label in both languages
   */
  const getSeverityLabel = (): BilingualContent => {
    const labels: Record<string, BilingualContent> = {
      mild: { en: 'Mild', bn: 'হালকা' },
      moderate: { en: 'Moderate', bn: 'মধ্যম' },
      severe: { en: 'Severe', bn: 'গুরুতর' },
    };
    return labels[analysis.severity];
  };

  const severityLabel = getSeverityLabel();

  return (
    <motion.div
      className="w-full space-y-6 animate-in fade-in duration-500"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Section Title */}
      <div>
        <BilingualText
          content={{
            en: 'Analysis Results',
            bn: 'বিশ্লেষণ ফলাফল',
          }}
          currentLanguage={currentLanguage}
          type="title"
          className="text-2xl mb-2"
        />
        <div className="h-1 w-12 bg-primary rounded-full" />
      </div>

      {/* Severity Card */}
      <BilingualCard
        icon={getSeverityIcon()}
        title={{
          en: 'Severity Assessment',
          bn: 'তীব্রতা মূল্যায়ন',
        }}
        content={severityLabel}
        currentLanguage={currentLanguage}
        severity={analysis.severity}
      />

      {/* Diagnosis Card */}
      <BilingualCard
        icon={<Info className="h-6 w-6 text-blue-600" />}
        title={{
          en: 'Diagnosis',
          bn: 'রোগ নির্ণয়',
        }}
        content={analysis.diagnosis as string | BilingualContent}
        currentLanguage={currentLanguage}
      />

      {/* Recommendations Card */}
      {analysis.recommendations.length > 0 && (
        <Card className="p-6 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-950/20">
          <div className="flex gap-3 items-start">
            <Info className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <BilingualText
                content={{
                  en: 'Recommendations',
                  bn: 'সুপারিশ',
                }}
                currentLanguage={currentLanguage}
                type="title"
                className="mb-4"
              />
              <BilingualList
                items={analysis.recommendations as (string | BilingualContent)[]}
                currentLanguage={currentLanguage}
                type="bullet"
                className="ml-2"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Warning Alert */}
      {analysis.warningSign && (
        <Alert className="border-red-500 bg-red-50 dark:bg-red-950/20">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-600">
            <BilingualText
              content={{
                en: 'This analysis detected warning signs. Please seek immediate medical consultation.',
                bn: 'এই বিশ্লেষণ সতর্কতা চিহ্ন সনাক্ত করেছে। অবিলম্বে চিকিৎসা পরামর্শ নিন।',
              }}
              currentLanguage={currentLanguage}
              type="body"
            />
          </AlertDescription>
        </Alert>
      )}

      {/* Disclaimer */}
      <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-200">
          <BilingualText
            content={{
              en: '⚠️ This is an AI-assisted analysis. Always consult a qualified healthcare professional for medical decisions.',
              bn: '⚠️ এটি একটি এআই-সহায়ক বিশ্লেষণ। মেডিকেল সিদ্ধান্তের জন্য সর্বদা একজন যোগ্য স্বাস্থ্যসেবা পেশাদারের সাথে পরামর্শ করুন।',
            }}
            currentLanguage={currentLanguage}
            type="body"
          />
        </AlertDescription>
      </Alert>

      {/* Debug Info (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="p-3 bg-slate-100 dark:bg-slate-900">
          <p className="text-xs text-muted-foreground font-mono">
            Language: {currentLanguage} | Bilingual: {currentLanguage === 'bn' ? 'Yes' : 'No'}
          </p>
        </Card>
      )}
    </motion.div>
  );
};

export default AnalysisResults;
