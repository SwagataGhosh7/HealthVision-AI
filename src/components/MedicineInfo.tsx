/**
 * Bilingual Medicine Information Component
 * 
 * Features:
 * - Bilingual support (English + Bengali)
 * - Medicine/drug lookup and information
 * - Uses, side effects, dosage information
 * - Interaction warnings
 * - Healthcare disclaimer
 * - Loading and error states
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
  Pill,
  Info,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BilingualText, BilingualCard } from '@/components/BilingualDisplay';
import {
  getMedicineInformation,
  type MedicineInformationRequest,
  type AnalysisLanguage,
  type BilingualContent,
} from '@/services/medicalAnalysis';
import { toast } from 'sonner';

export interface MedicineInfo {
  medicineName: string | BilingualContent;
  genericName?: string | BilingualContent;
  uses: (string | BilingualContent)[];
  dosage: string | BilingualContent;
  sideEffects: (string | BilingualContent)[];
  precautions: (string | BilingualContent)[];
  interactions?: (string | BilingualContent)[];
  language: AnalysisLanguage;
}

export const MedicineInformation: React.FC = () => {
  const { i18n } = useTranslation();
  const [medicineName, setMedicineName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MedicineInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentLanguage = i18n.language as AnalysisLanguage;

  // Get localized strings
  const getLocalizedText = (en: string, bn: string): string | BilingualContent => {
    return currentLanguage === 'bn' ? { en, bn } : en;
  };

  const handleSearchMedicine = async () => {
    if (!medicineName.trim()) {
      toast.error(
        currentLanguage === 'bn'
          ? 'অনুগ্রহ করে ওষুধের নাম প্রবেশ করুন'
          : 'Please enter a medicine name'
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request: MedicineInformationRequest = {
        medicineName: medicineName.trim(),
      };

      const info = await getMedicineInformation(request, currentLanguage);

      setResult({
        medicineName: info.medicineName,
        genericName: info.genericName,
        uses: info.uses,
        dosage: info.dosage,
        sideEffects: info.sideEffects,
        precautions: info.precautions,
        interactions: info.interactions,
        language: currentLanguage,
      });

      toast.success(
        currentLanguage === 'bn'
          ? '✓ তথ্য প্রাপ্ত'
          : '✓ Information retrieved'
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : currentLanguage === 'bn'
          ? 'তথ্য পাওয়া যায়নি'
          : 'Information not found';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMedicineName('');
    setResult(null);
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading && medicineName.trim()) {
      handleSearchMedicine();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="space-y-1 sm:space-y-2">
        <BilingualText
          content={getLocalizedText(
            'Medicine Information',
            'ওষুধের তথ্য'
          )}
          currentLanguage={currentLanguage}
          type="title"
          className="text-xl sm:text-2xl"
        />
        <BilingualText
          content={getLocalizedText(
            'Search for medicine details, uses, side effects, and dosage information',
            'ওষুধের বিবরণ, ব্যবহার, পার্শ্ব প্রতিক্রিয়া এবং মাত্রার তথ্য খুঁজুন'
          )}
          currentLanguage={currentLanguage}
          type="body"
          className="text-muted-foreground"
        />
      </div>

      {/* Search Section */}
      <Card className="p-4 sm:p-6 border-2">
        <div className="space-y-3 sm:space-y-4">
          {/* Medicine Name Input */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold">
              <BilingualText
                content={getLocalizedText('Medicine Name', 'ওষুধের নাম')}
                currentLanguage={currentLanguage}
              />
            </label>
            <Input
              placeholder={
                currentLanguage === 'bn'
                  ? 'যেমন: প্যারাসিটামল...'
                  : 'e.g., Paracetamol...'
              }
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="text-sm sm:text-base h-10 sm:h-auto"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
            <Button
              onClick={handleSearchMedicine}
              disabled={loading || !medicineName.trim()}
              className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
              size="lg"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading
                ? currentLanguage === 'bn'
                  ? 'খুঁজছি...'
                  : 'Searching...'
                : currentLanguage === 'bn'
                ? 'তথ্য খুঁজুন'
                : 'Search Info'}
            </Button>
            {(medicineName || result) && (
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
            {/* Medicine Name Header */}
            <BilingualCard
              title={getLocalizedText('Medicine Name', 'ওষুধের নাম')}
              content={result.medicineName}
              currentLanguage={currentLanguage}
              icon={<Pill className="h-4 sm:h-5 w-4 sm:w-5" />}
            />

            {/* Generic Name (if available) */}
            {result.genericName && (
              <Card className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-900">
                <p className="text-xs font-semibold text-muted-foreground mb-1 sm:mb-2">
                  {currentLanguage === 'bn' ? 'সাধারণ নাম' : 'Generic Name'}
                </p>
                <BilingualText
                  content={result.genericName}
                  currentLanguage={currentLanguage}
                  type="body"
                />
              </Card>
            )}

            {/* Uses */}
            <div className="space-y-2 sm:space-y-3">
              <BilingualText
                content={getLocalizedText('Uses', 'ব্যবহার')}
                currentLanguage={currentLanguage}
                type="title"
              />
              <div className="space-y-2">
                {result.uses.map((use, idx) => (
                  <Card key={idx} className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-950 border-blue-200">
                    <div className="flex gap-2 sm:gap-3">
                      <Info className="h-4 sm:h-5 w-4 sm:w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <BilingualText
                        content={use}
                        currentLanguage={currentLanguage}
                        type="body"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Dosage */}
            <Card className="p-3 sm:p-4 bg-indigo-50 dark:bg-indigo-950 border-indigo-200">
              <div>
                <p className="text-xs sm:text-sm font-semibold mb-1 sm:mb-2 text-indigo-900">
                  {currentLanguage === 'bn' ? 'সুপারিশকৃত মাত্রা' : 'Recommended Dosage'}
                </p>
                <BilingualText
                  content={result.dosage}
                  currentLanguage={currentLanguage}
                  type="body"
                />
              </div>
            </Card>

            {/* Precautions */}
            <div className="space-y-2 sm:space-y-3">
              <BilingualText
                content={getLocalizedText('Precautions', 'সতর্কতা')}
                currentLanguage={currentLanguage}
                type="title"
              />
              <div className="space-y-2">
                {result.precautions.map((precaution, idx) => (
                  <Card key={idx} className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-950 border-yellow-200">
                    <div className="flex gap-2 sm:gap-3">
                      <AlertCircle className="h-4 sm:h-5 w-4 sm:w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <BilingualText
                        content={precaution}
                        currentLanguage={currentLanguage}
                        type="body"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Side Effects */}
            <div className="space-y-2 sm:space-y-3">
              <BilingualText
                content={getLocalizedText('Side Effects', 'পার্শ্ব প্রতিক্রিয়া')}
                currentLanguage={currentLanguage}
                type="title"
              />
              <div className="space-y-2">
                {result.sideEffects.map((effect, idx) => (
                  <Card key={idx} className="p-3 sm:p-4 bg-red-50 dark:bg-red-950 border-red-200">
                    <div className="flex gap-2 sm:gap-3">
                      <Zap className="h-4 sm:h-5 w-4 sm:w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <BilingualText
                        content={effect}
                        currentLanguage={currentLanguage}
                        type="body"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Interactions (if available) */}
            {result.interactions && result.interactions.length > 0 && (
              <div className="space-y-2 sm:space-y-3">
                <BilingualText
                  content={getLocalizedText('Drug Interactions', 'ওষুধের ইন্টারঅ্যাকশন')}
                  currentLanguage={currentLanguage}
                  type="title"
                />
                <div className="space-y-2">
                  {result.interactions.map((interaction, idx) => (
                    <Card key={idx} className="p-3 sm:p-4 bg-orange-50 dark:bg-orange-950 border-orange-200">
                      <div className="flex gap-2 sm:gap-3">
                        <AlertCircle className="h-4 sm:h-5 w-4 sm:w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <BilingualText
                          content={interaction}
                          currentLanguage={currentLanguage}
                          type="body"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <Alert className="bg-amber-50 border-amber-300 p-3 sm:p-4">
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <AlertDescription className="text-amber-900 text-xs sm:text-sm ml-2">
                <BilingualText
                  content={getLocalizedText(
                    '⚠️ This information is for reference only. Always consult your pharmacist or healthcare provider before taking any medicine.',
                    '⚠️ এই তথ্য শুধুমাত্র সংদর্ভের জন্য। কোনো ওষুধ গ্রহণের আগে সর্বদা আপনার ফার্মাসিস্ট বা স্বাস্থ্যসেবা প্রদানকারীর সাথে পরামর্শ করুন।'
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

export default MedicineInformation;
