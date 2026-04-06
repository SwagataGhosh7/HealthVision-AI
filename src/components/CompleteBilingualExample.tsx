/**
 * Complete Integration Example: Bilingual Medical Analysis
 * 
 * This file demonstrates the complete flow from user input to bilingual display
 * showing how all components, utilities, and services work together.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// Components
import { BilingualText, BilingualCard, BilingualList } from '@/components/BilingualDisplay';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Services and Utilities
import { analyzeWithTranslation, type MedicalAnalysisRequest, type MedicalAnalysisResponse } from '@/services/medicalAnalysis';

// Types
import type { BilingualContent } from '@/utils/translateAndFormat';

/**
 * COMPLETE EXAMPLE: Bilingual Medical Analysis in Action
 * 
 * This component shows:
 * 1. User input collection
 * 2. API call with language preference
 * 3. Bilingual response display
 * 4. Error handling
 * 5. Performance optimization with caching
 */
export const CompleteBilingualMedicalAnalysis = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language as 'en' | 'bn';

  // State Management
  const [symptoms, setSymptoms] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MedicalAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * STEP 1: Build Request Object
   */
  const buildAnalysisRequest = (): MedicalAnalysisRequest => {
    return {
      symptoms: symptoms
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s !== ''),
      medicalHistory: medicalHistory || undefined,
      language: currentLanguage,
    };
  };

  /**
   * STEP 2: Call API with Bilingual Support
   */
  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      toast.error(
        currentLanguage === 'bn'
          ? 'অনুগ্রহ করে অন্তত একটি উপসর্গ প্রদান করুন'
          : 'Please provide at least one symptom'
      );
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const request = buildAnalysisRequest();
      console.log('API Request:', { ...request, language: currentLanguage });

      const analysis = await analyzeWithTranslation(request, currentLanguage);

      console.log('API Response:', analysis);
      console.log(
        'Response Type:',
        typeof analysis.diagnosis === 'object' ? 'BilingualContent' : 'String'
      );

      toast.success(
        currentLanguage === 'bn' ? 'বিশ্লেষণ সম্পন্ন' : 'Analysis completed'
      );

      setResult(analysis);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Analysis error:', errorMessage);
      setError(errorMessage);
      toast.error(
        currentLanguage === 'bn'
          ? 'বিশ্লেষণ ব্যর্থ হয়েছে'
          : 'Analysis failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      {/* SECTION 1: INPUT FORM */}
      <Card className="p-6 space-y-6">
        {/* Title */}
        <div>
          <BilingualText
            content={{
              en: 'Medical Analysis Input',
              bn: 'মেডিকেল বিশ্লেষণ ইনপুট',
            }}
            currentLanguage={currentLanguage}
            type="title"
          />
          <p className="text-muted-foreground text-sm mt-2">
            {currentLanguage === 'bn'
              ? 'আপনার উপসর্গ এবং চিকিৎসা ইতিহাস প্রদান করুন'
              : 'Provide your symptoms and medical history'}
          </p>
        </div>

        {/* Symptoms Input */}
        <div className="space-y-2">
          <label className="text-sm font-semibold block">
            <BilingualText
              content={{
                en: 'Symptoms',
                bn: 'উপসর্গ',
              }}
              currentLanguage={currentLanguage}
              className="inline"
            />
          </label>
          <Textarea
            placeholder={
              currentLanguage === 'bn'
                ? 'উদাহরণ: মাথাব্যথা, জ্বর, কাশি'
                : 'e.g., headache, fever, cough'
            }
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="min-h-20"
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            {currentLanguage === 'bn'
              ? 'কমা দ্বারা পৃথক করুন'
              : 'Separate with commas'}
          </p>
        </div>

        {/* Medical History Input */}
        <div className="space-y-2">
          <label className="text-sm font-semibold block">
            <BilingualText
              content={{
                en: 'Medical History (Optional)',
                bn: 'চিকিৎসা ইতিহাস (ঐচ্ছিক)',
              }}
              currentLanguage={currentLanguage}
              className="inline"
            />
          </label>
          <Textarea
            placeholder={
              currentLanguage === 'bn'
                ? 'ডায়াবেটিস, উচ্চ রক্তচাপ, অ্যালার্জি...'
                : 'Diabetes, hypertension, allergies...'
            }
            value={medicalHistory}
            onChange={(e) => setMedicalHistory(e.target.value)}
            className="min-h-20"
            disabled={loading}
          />
        </div>

        {/* Analyze Button */}
        <Button
          onClick={handleAnalyze}
          disabled={loading}
          size="lg"
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading
            ? currentLanguage === 'bn'
              ? 'বিশ্লেষণ করা হচ্ছে...'
              : 'Analyzing...'
            : currentLanguage === 'bn'
              ? 'বিশ্লেষণ করুন'
              : 'Analyze'}
        </Button>
      </Card>

      {/* SECTION 2: ERROR HANDLING */}
      {error && (
        <Alert className="border-red-500 bg-red-50 dark:bg-red-950/20">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-600">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* SECTION 3: RESULTS DISPLAY */}
      {result && !error && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Results Header */}
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

          {/* Diagnosis */}
          <BilingualCard
            icon={<AlertCircle className="h-6 w-6 text-blue-600" />}
            title={{
              en: 'Diagnosis',
              bn: 'রোগ নির্ণয়',
            }}
            content={result.diagnosis}
            currentLanguage={currentLanguage}
          />

          {/* Severity */}
          <BilingualCard
            title={{
              en: 'Severity Level',
              bn: 'তীব্রতা স্তর',
            }}
            content={{
              en: result.severity.charAt(0).toUpperCase() + result.severity.slice(1),
              bn: {
                mild: 'হালকা',
                moderate: 'মধ্যম',
                severe: 'গুরুতর',
              }[result.severity],
            }}
            currentLanguage={currentLanguage}
            severity={result.severity}
            icon={
              result.severity === 'severe'
                ? <AlertCircle className="h-6 w-6 text-red-600" />
                : undefined
            }
          />

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <Card className="p-6 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-950/20 space-y-4">
              <BilingualText
                content={{
                  en: 'Recommendations',
                  bn: 'সুপারিশ',
                }}
                currentLanguage={currentLanguage}
                type="title"
              />
              <BilingualList
                items={result.recommendations}
                currentLanguage={currentLanguage}
                type="bullet"
              />
            </Card>
          )}

          {/* Disclaimer */}
          <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
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

          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="p-4 bg-slate-100 dark:bg-slate-900 space-y-2">
              <p className="text-xs font-semibold">Debug Information:</p>
              <div className="text-xs font-mono space-y-1">
                <p>Language: <span className="text-blue-600">{currentLanguage}</span></p>
                <p>
                  Response Type:{' '}
                  <span className="text-green-600">
                    {typeof result.diagnosis === 'object'
                      ? 'BilingualContent (Efficient! ✓)'
                      : 'String (Single language)'}
                  </span>
                </p>
                <details className="mt-2">
                  <summary className="cursor-pointer">Full Response</summary>
                  <pre className="mt-2 p-2 bg-slate-200 dark:bg-slate-800 rounded overflow-auto text-xs">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* SECTION 4: EMPTY STATE */}
      {!result && !error && !loading && (
        <Card className="p-12 text-center space-y-4 border-dashed">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
          <BilingualText
            content={{
              en: 'Enter your symptoms to get started',
              bn: 'শুরু করতে আপনার উপসর্গ প্রবেশ করুন',
            }}
            currentLanguage={currentLanguage}
            type="body"
            className="text-muted-foreground"
          />
        </Card>
      )}
    </div>
  );
};

/**
 * KEY TAKEAWAYS:
 * 
 * 1. INPUT: Collect symptoms and pass currentLanguage to API
 * ─────────────────────────────────────────────────────────
 *    const request = { symptoms: [...], language: 'bn' };
 *
 * 2. API: Returns BilingualContent when language = 'bn'
 * ─────────────────────────────────────────────────────────
 *    English mode:   { diagnosis: "Text" }
 *    Bengali mode:   { diagnosis: { en: "Text", bn: "টেক্সট" } }
 *
 * 3. DISPLAY: BilingualText handles all rendering logic
 * ─────────────────────────────────────────────────────────
 *    <BilingualText content={result.diagnosis} />
 *    → Shows diagnosis only in English mode
 *    → Shows both in Bengali mode with hierarchy
 *
 * 4. PERFORMANCE: Caching prevents duplicate requests
 * ─────────────────────────────────────────────────────────
 *    First call:  Full API request
 *    Second call: Retrieved from cache
 *
 * 5. UX: Bilingual display is clean and readable
 * ─────────────────────────────────────────────────────────
 *    Primary (Bengali) - Bold, 100% opacity
 *    Secondary (English) - Light, 60% opacity
 */

export default CompleteBilingualMedicalAnalysis;
