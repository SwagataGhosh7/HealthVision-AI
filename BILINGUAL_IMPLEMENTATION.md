# Bilingual Medical Dashboard Implementation Guide

## Overview

This guide demonstrates how to implement dual-language display in the HealthVision AI dashboard. When users switch between English and Bengali, the Analysis Results section displays content intelligently:

- **English Mode**: Shows English only
- **Bengali Mode**: Shows Bengali (primary, bold) + English (secondary, lighter)

---

## Architecture

### 1. **Utility Layer** (`src/utils/translateAndFormat.ts`)

Core translation and formatting logic:

```typescript
// Main function
translateAndFormat(content: string | BilingualContent, language: 'en' | 'bn'): FormattedContent

// Example usage
const formatted = translateAndFormat({
  en: "Hypertension detected",
  bn: "উচ্চ রক্তচাপ সনাক্ত"
}, 'bn')

// Returns:
// {
//   primary: "উচ্চ রক্তচাপ সনাক্ত",
//   secondary: "Hypertension detected",
//   isPrimary: true
// }
```

**Key Features:**
- ✅ Caching to avoid duplicate API calls
- ✅ Bilingual content detection
- ✅ Medical-specific formatting
- ✅ Stateless and reusable

---

## 2. **Component Layer** (`src/components/BilingualDisplay.tsx`)

Reusable React components for display:

### `BilingualText` Component

```typescript
<BilingualText
  content={{
    en: "Analysis Results",
    bn: "বিশ্লেষণ ফলাফল"
  }}
  currentLanguage="bn"
  type="title"
/>

// Output in Bengali mode:
// বিশ্লেষণ ফলাফল (bold)
// Analysis Results (small, italic, lighter)
```

**Props:**
- `content`: String or `BilingualContent` object
- `currentLanguage`: 'en' | 'bn'
- `type`: 'title' | 'body' | 'suggestion' | 'warning'
- `className`: Additional Tailwind classes

### `BilingualCard` Component

```typescript
<BilingualCard
  title={{
    en: "Diagnosis",
    bn: "রোগ নির্ণয়"
  }}
  content={{
    en: "Mild hypertension with seasonal factors",
    bn: "ঋতুগত কারণ সহ হালকা উচ্চ রক্তচাপ"
  }}
  currentLanguage="bn"
  severity="moderate"
  icon={<Info className="h-6 w-6" />}
/>
```

### `BilingualList` Component

```typescript
<BilingualList
  items={[
    {
      en: "Monitor blood pressure daily",
      bn: "দৈনিক রক্তচাপ পর্যবেক্ষণ করুন"
    },
    {
      en: "Reduce sodium intake",
      bn: "সোডিয়াম গ্রহণ কমান"
    }
  ]}
  currentLanguage="bn"
  type="bullet"
/>
```

---

## 3. **API Response Format** (`src/services/medicalAnalysis.ts`)

### Single Language (English)

```json
{
  "diagnosis": "Mild hypertension suspected based on blood pressure reading of 140/90 mmHg",
  "severity": "moderate",
  "recommendations": [
    "Monitor blood pressure daily for one week",
    "Reduce salt intake and increase physical activity",
    "Consult with a cardiologist if symptoms persist"
  ],
  "warningSign": false,
  "language": "en",
  "originalLanguage": "en"
}
```

### Bilingual Response (Bengali)

```json
{
  "diagnosis": {
    "en": "Mild hypertension suspected based on blood pressure reading of 140/90 mmHg",
    "bn": "রক্তচাপ পাঠ ১৪০/৯০ এমএমএইচজি-এর উপর ভিত্তি করে হালকা উচ্চ রক্তচাপ সন্দেহজনক"
  },
  "severity": "moderate",
  "recommendations": [
    {
      "en": "Monitor blood pressure daily for one week",
      "bn": "এক সপ্তাহের জন্য প্রতিদিন রক্তচাপ পর্যবেক্ষণ করুন"
    },
    {
      "en": "Reduce salt intake and increase physical activity",
      "bn": "লবণ গ্রহণ কমান এবং শারীরিক কার্যকলাপ বৃদ্ধি করুন"
    },
    {
      "en": "Consult with a cardiologist if symptoms persist",
      "bn": "লক্ষণ অব্যাহত থাকলে একজন কার্ডিওলজিস্টের সাথে পরামর্শ করুন"
    }
  ],
  "warningSign": false,
  "language": "bn",
  "originalLanguage": "bn"
}
```

---

## 4. **Usage in Components**

### Complete Example: MedicalAnalysis Component

```typescript
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { analyzeWithTranslation } from '@/services/medicalAnalysis';
import { AnalysisResults } from '@/components/AnalysisResults';

export const MedicalAnalysis = () => {
  const { i18n } = useTranslation();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (request) => {
    setLoading(true);
    try {
      // API automatically returns bilingual content when language is 'bn'
      const analysis = await analyzeWithTranslation(
        request,
        i18n.language as 'en' | 'bn'
      );
      setResult(analysis);
    } finally {
      setLoading(false);
    }
  };

  if (!result) return null;

  // AnalysisResults component automatically handles bilingual display
  return <AnalysisResults analysis={result} />;
};
```

---

## 5. **Styling Guide**

### Tailwind CSS Classes for Bilingual Display

```typescript
// Primary text (Bengali) - Bold, darker
<p className="text-foreground font-semibold text-lg">বাংলা টেক্সট</p>

// Secondary text (English) - Lighter, smaller, italic
<p className="text-muted-foreground text-sm italic leading-relaxed">
  English text
</p>

// Severity indicators
const severityStyles = {
  mild: 'border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20',
  moderate: 'border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20',
  severe: 'border-l-4 border-red-500 bg-red-50 dark:bg-red-950/20',
};
```

---

## 6. **Performance Optimization**

### Preventing Duplicate API Calls

**Strategy**: When Bengali is selected, request both languages in one API call:

```typescript
// Instead of: 2 API calls (English + Translate)
await analyzeMedicalData(request, 'en');
await translateText(result, 'bn');
// ❌ 2 requests

// Use: 1 API call for both
await analyzeBilingualMedicalData(request);
// ✅ 1 request, both languages
```

### Caching

```typescript
import { setCachedTranslation, getCachedBilingual } from '@/utils/translateAndFormat';

// Save translation after API call
setCachedTranslation('Hypertension', {
  en: 'Hypertension',
  bn: 'উচ্চ রক্তচাপ'
});

// Reuse from cache
const cached = getCachedBilingual('Hypertension');
```

---

## 7. **UI/UX Best Practices for Bilingual Healthcare Dashboards**

### A. Clear Hierarchy

```
Primary (Bengali) - Bold, 100% opacity
└─ Secondary (English) - Lighter, 60% opacity, smaller font

Visual separation prevents cognitive overload
```

### B. Context-Aware Styling

|  Type  | Primary | Secondary | Use Case |
|--------|---------|-----------|----------|
| Title  | Bold 18px | Regular 12px | Section headers |
| Body   | Semibold 16px | Italic 14px | Descriptions |
| Warning| Semibold + Color | Regular + Color | Alerts |

### C. Spacing and Readability

```css
/* Always include gap between primary and secondary */
.bilingual-content {
  space-y-1; /* Not 0 - visual separation */
}

/* 1.5 line height for readability */
.bilingual-text {
  line-height: 1.5;
}

/* Add padding around cards */
.analysis-card {
  padding: 1.5rem; /* p-6 in Tailwind */
}
```

### D. Color Coding for Medical Severity

```
Mild (Green)          → Checkmark icon + green border
Moderate (Orange)     → Alert icon + orange border  
Severe (Red)          → Warning icon + red border
Normal (Blue)         → Info icon + blue border
```

### E. Accessibility Considerations

```typescript
// Always provide language attribute
<div lang={currentLanguage === 'bn' ? 'bn' : 'en'}>
  <BilingualText content={...} />
</div>

// Use semantic HTML
<section aria-label="Analysis Results">
  <BilingualText type="title" />
</section>

// Ensure sufficient contrast
// Primary (Bengali): #000 on white = 21:1 ✓
// Secondary (English): #666 on white = 7:1 ✓
```

---

## 8. **Example UI Layout**

```
┌─────────────────────────────────────┐
│  Analysis Results                   │
│  ════════════════════              │
│                                     │
│  ┌─ Severity Assessment ──────────┐│
│  │ ⚠️  তীব্রতা মূল্যায়ন            ││
│  │    Severity Assessment         ││
│  │                                 ││
│  │ মধ্যম (Moderate)                ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─ Diagnosis ────────────────────┐│
│  │ ℹ️  রোগ নির্ণয়                  ││
│  │    Diagnosis                    ││
│  │                                 ││
│  │ উচ্চ রক্তচাপ সনাক্ত              ││
│  │ Hypertension detected           ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─ Recommendations ──────────────┐│
│  │ ℹ️  সুপারিশ                      ││
│  │    Recommendations              ││
│  │                                 ││
│  │ • দৈনিক রক্তচাপ পর্যবেক্ষণ      ││
│  │   Monitor blood pressure daily  ││
│  │                                 ││
│  │ • সোডিয়াম গ্রহণ কমান            ││
│  │   Reduce sodium intake          ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

## 9. **Troubleshooting**

### Issue: Secondary text not showing in Bengali mode

```typescript
// ❌ Wrong
<BilingualText content="String only" currentLanguage="bn" />

// ✅ Correct
<BilingualText
  content={{ en: "English", bn: "বাংলা" }}
  currentLanguage="bn"
/>
```

### Issue: API returns single language

```typescript
// Ensure using `analyzeBilingualMedicalData` for Bengali
if (language === 'bn') {
  const result = await analyzeBilingualMedicalData(request);
}
```

### Issue: Performance lag with large lists

```typescript
// Use React.memo for list items
const BillingualListItem = memo(({ item, language }) => (
  <BilingualText content={item} currentLanguage={language} />
));
```

---

## 10. **Summary Checklist**

- [ ] Import `BilingualText`, `BilingualCard`, `BilingualList` components
- [ ] Use `translateAndFormat()` utility for content
- [ ] Ensure API returns `BilingualContent` when `language === 'bn'`
- [ ] Apply correct Tailwind classes for hierarchy
- [ ] Add spacing between primary/secondary text
- [ ] Test with real Bengali content (Unicode)
- [ ] Verify fallback when API fails
- [ ] Check accessibility (contrast, lang attribute)
- [ ] Profile performance (caching working)
- [ ] Handle edge cases (very long text, special characters)

---

## References

- Utility: `src/utils/translateAndFormat.ts`
- Components: `src/components/BilingualDisplay.tsx`
- Example: `src/components/AnalysisResults.tsx`
- Service: `src/services/medicalAnalysis.ts`
