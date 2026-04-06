/**
 * Bilingual Translation & Formatting Utility
 * Handles dual-language display for healthcare content
 * 
 * Strategy:
 * - English: Show English only
 * - Bengali: Show Bengali (primary) + English (secondary, lighter)
 * - Caches translations to avoid duplicate API calls
 */

type Language = 'en' | 'bn';

export interface BilingualContent {
  en: string;
  bn: string;
}

export interface FormattedContent {
  primary: string;
  secondary?: string;
  isPrimary: boolean;
}

// Simple in-memory cache for translations (implement with Redis for production)
const translationCache = new Map<string, BilingualContent>();

/**
 * Ensures content is in bilingual format
 * If already bilingual, returns as-is
 * If only one language, returns the same for both
 */
export function ensureBilingual(
  content: string | BilingualContent,
  sourceLanguage: Language = 'en'
): BilingualContent {
  if (typeof content === 'object' && 'en' in content && 'bn' in content) {
    return content;
  }

  const text = typeof content === 'string' ? content : '';
  return sourceLanguage === 'en'
    ? { en: text, bn: text }
    : { bn: text, en: text };
}

/**
 * Main translation and formatting function
 * Returns formatted content in the requested language with bilingual support
 * 
 * @param content - String or BilingualContent object
 * @param currentLanguage - Active app language
 * @returns FormattedContent with primary and optional secondary text
 */
export function translateAndFormat(
  content: string | BilingualContent,
  currentLanguage: Language
): FormattedContent {
  const bilingual = ensureBilingual(content, 'en');

  // English mode: show English only
  if (currentLanguage === 'en') {
    return {
      primary: bilingual.en,
      secondary: undefined,
      isPrimary: true,
    };
  }

  // Bengali mode: show Bengali + English
  return {
    primary: bilingual.bn,
    secondary: bilingual.en,
    isPrimary: true,
  };
}

/**
 * Format medical analysis text with bilingual support
 * Preserves medical terminology accuracy
 */
export function formatMedicalAnalysis(
  analysis: string | BilingualContent,
  currentLanguage: Language,
  type: 'diagnosis' | 'recommendation' | 'warning' = 'diagnosis'
): FormattedContent {
  const content = translateAndFormat(analysis, currentLanguage);

  // Add emphasis for medical content in Bengali mode
  if (currentLanguage === 'bn' && type === 'diagnosis') {
    content.primary = `🔍 ${content.primary}`;
    if (content.secondary) {
      content.secondary = `${content.secondary}`;
    }
  }

  if (currentLanguage === 'bn' && type === 'warning') {
    content.primary = `⚠️ ${content.primary}`;
  }

  return content;
}

/**
 * Format array of items (like recommendations) with bilingual support
 */
export function formatItemList(
  items: (string | BilingualContent)[],
  currentLanguage: Language
): FormattedContent[] {
  return items.map(item => translateAndFormat(item, currentLanguage));
}

/**
 * Build cache key for translation lookups
 */
function getCacheKey(text: string, targetLanguage: Language): string {
  return `${text}::${targetLanguage}`;
}

/**
 * Store translation in cache (used by API service)
 */
export function setCachedTranslation(
  sourceText: string,
  bilingualContent: BilingualContent
): void {
  const enKey = getCacheKey(sourceText, 'en');
  const bnKey = getCacheKey(sourceText, 'bn');
  translationCache.set(enKey, bilingualContent);
  translationCache.set(bnKey, bilingualContent);
}

/**
 * Get cached translation if available
 */
export function getCachedBilingual(sourceText: string): BilingualContent | null {
  const key = getCacheKey(sourceText, 'en');
  return translationCache.get(key) || null;
}

/**
 * Clear cache (useful for testing or memory management)
 */
export function clearTranslationCache(): void {
  translationCache.clear();
}

/**
 * Get cache statistics for debugging
 */
export function getTranslationCacheStats(): {
  size: number;
  keys: string[];
} {
  return {
    size: translationCache.size,
    keys: Array.from(translationCache.keys()),
  };
}
