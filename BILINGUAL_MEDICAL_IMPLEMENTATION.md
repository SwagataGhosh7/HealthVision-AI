# ✨ Bilingual System Implementation Guide

**HealthVision AI** - Complete English + Bengali support for medical features

---

## 🎯 System Overview

### Language Display Rules

#### English Mode
```
Show ONLY English content
```

#### Bengali Mode
```
Show BOTH:
├─ Bengali (Primary, bold, larger, text-white)
└─ English (Secondary, muted, lighter, text-gray-400)
```

---

## 📱 UI Components

### 1. **SymptomsChecker** (`src/components/SymptomsChecker.tsx`)

Interactive symptom analyzer with bilingual support.

**Features:**
- Symptom input textarea
- AI-powered disease identification
- Severity indicators (mild/moderate/severe)
- Recommendations with color-coded cards
- Warning signs for severe conditions
- Healthcare professional disclaimer

**Usage:**
```tsx
import { SymptomsChecker } from '@/components/SymptomsChecker';

export function MedicalTools() {
  return (
    <div className="p-6">
      <SymptomsChecker />
    </div>
  );
}
```

**Example Flow:**
```
USER INPUT (Bengali Mode):
├─ আমার মাথা ব্যথা এবং জ্বর আছে
└─ (I have headache and fever)

SYSTEM RESPONSE:
├─ Title: সম্ভাব্য রোগ (Likely Condition)
├─ Disease: ভাইরাল ইনফেকশন (Viral Infection)
├─ Severity: মধ্যম (Moderate)
├─ Recommendations:
│  ├─ বেশি বেশি পানি পান (Drink plenty of water)
│  ├─ বিশ্রাম নিন (Get adequate rest)
│  └─ ওভার-দ্য-কাউন্টার ওষুধ (OTC medications)
└─ Disclaimer: এটি একটি এআই-সহায়ক বিশ্লেষণ...
```

### 2. **MedicineInformation** (`src/components/MedicineInfo.tsx`)

Medicine/drug lookup with comprehensive information.

**Features:**
- Medicine name search
- Generic name display
- Clinical uses
- Recommended dosage
- Side effects list
- Precautions and warnings
- Drug interactions
- Healthcare disclaimer

**Usage:**
```tsx
import { MedicineInformation } from '@/components/MedicineInfo';

export function MedicineTools() {
  return (
    <div className="p-6">
      <MedicineInformation />
    </div>
  );
}
```

**Example Flow:**
```
USER INPUT (Bengali Mode):
└─ প্যারাসিটামল (Paracetamol)

SYSTEM RESPONSE:
├─ Medicine: প্যারাসিটামল (Paracetamol)
├─ Generic: অ্যাসিটামিনোফেন (Acetaminophen)
├─ Uses:
│  ├─ জ্বর কমায় (Reduces fever)
│  ├─ ব্যথা উপশম করে (Relieves pain)
│  └─ মাথা ব্যথায় কার্যকর (Effective for headaches)
├─ Dosage: প্রতি ৪-৬ ঘন্টায় ৫০০-১০০০ মিগ্রা
│          (500-1000mg every 4-6 hours)
├─ Side Effects:
│  ├─ ত্বকে দাঁদ (Skin rash)
│  └─ অ্যালার্জিক প্রতিক্রিয়া (Allergic reactions)
├─ Precautions:
│  ├─ গর্ভবতী মহিলারা চিকিৎসকের পরামর্শ নিন
│  └─ যকৃত সমস্যায় না নেওয়ার পরামর্শ
└─ Disclaimer: ফার্মাসিস্টের সাথে পরামর্শ করুন...
```

---

## 🔌 API Integration

### Backend Response Formats

#### Symptom Analysis Response

**English Mode:**
```json
{
  "diagnosis": "Viral Infection",
  "severity": "moderate",
  "recommendations": [
    "Drink plenty of fluids",
    "Get adequate rest",
    "Use over-the-counter pain relievers"
  ],
  "warningSign": false,
  "language": "en"
}
```

**Bengali Mode (Bilingual):**
```json
{
  "diagnosis": {
    "en": "Viral Infection",
    "bn": "ভাইরাল সংক্রমণ"
  },
  "severity": "moderate",
  "recommendations": [
    {
      "en": "Drink plenty of fluids",
      "bn": "বেশি বেশি তরল পান"
    },
    {
      "en": "Get adequate rest",
      "bn": "পর্যাপ্ত বিশ্রাম নিন"
    },
    {
      "en": "Use over-the-counter pain relievers",
      "bn": "ওভার-দ্য-কাউন্টার ব্যথার ওষুধ ব্যবহার করুন"
    }
  ],
  "warningSign": false,
  "language": "bn"
}
```

#### Medicine Information Response

**English Mode:**
```json
{
  "medicineName": "Paracetamol",
  "genericName": "Acetaminophen",
  "uses": [
    "Reduces fever",
    "Relieves mild to moderate pain",
    "Effective for headaches and muscle aches"
  ],
  "dosage": "500-1000mg every 4-6 hours (max 4000mg daily)",
  "sideEffects": [
    "Skin rash or itching",
    "Allergic reactions (rare)",
    "Liver damage (if overdose)"
  ],
  "precautions": [
    "Avoid if pregnant without medical advice",
    "Caution in liver disease",
    "Do not exceed maximum dosage"
  ],
  "interactions": [
    "May interact with warfarin",
    "Combined effect with alcohol"
  ],
  "language": "en"
}
```

**Bengali Mode (Bilingual):**
```json
{
  "medicineName": {
    "en": "Paracetamol",
    "bn": "প্যারাসিটামল"
  },
  "genericName": {
    "en": "Acetaminophen",
    "bn": "অ্যাসিটামিনোফেন"
  },
  "uses": [
    {
      "en": "Reduces fever",
      "bn": "জ্বর কমায়"
    },
    {
      "en": "Relieves mild to moderate pain",
      "bn": "হালকা থেকে মধ্যম ব্যথা উপশম করে"
    },
    {
      "en": "Effective for headaches and muscle aches",
      "bn": "মাথা ব্যথা এবং পেশী ব্যথায় কার্যকর"
    }
  ],
  "dosage": {
    "en": "500-1000mg every 4-6 hours (max 4000mg daily)",
    "bn": "প্রতি ৪-৬ ঘন্টায় ৫০০-১০০০ মিগ্রা (সর্বোচ্চ দৈনিক ৪০০০ মিগ্রা)"
  },
  "sideEffects": [
    {
      "en": "Skin rash or itching",
      "bn": "ত্বকে দাঁদ বা চুলকানি"
    },
    {
      "en": "Allergic reactions (rare)",
      "bn": "অ্যালার্জিক প্রতিক্রিয়া (বিরল)"
    },
    {
      "en": "Liver damage (if overdose)",
      "bn": "অতিরিক্ত মাত্রায় যকৃত ক্ষতি"
    }
  ],
  "precautions": [
    {
      "en": "Avoid if pregnant without medical advice",
      "bn": "চিকিৎসকের পরামর্শ ছাড়া গর্ভবতী অবস্থায় এড়িয়ে চলুন"
    },
    {
      "en": "Caution in liver disease",
      "bn": "যকৃত রোগে সতর্কতা প্রয়োজন"
    },
    {
      "en": "Do not exceed maximum dosage",
      "bn": "সর্বোচ্চ মাত্রা অতিক্রম করবেন না"
    }
  ],
  "interactions": [
    {
      "en": "May interact with warfarin",
      "bn": "ওয়ারফারিনের সাথে বিক্রিয়া করতে পারে"
    },
    {
      "en": "Combined effect with alcohol",
      "bn": "অ্যালকোহলের সাথে মিশ্রিত প্রভাব"
    }
  ],
  "language": "bn"
}
```

---

## 🛠️ Backend Implementation (Django)

### Example Endpoints

#### Symptom Analysis

```python
# views.py
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
import openai

class SymptomAnalysisView(APIView):
    def post(self, request):
        symptoms = request.data.get('symptoms', [])
        language = request.data.get('language', 'en')
        
        if language == 'bn':
            # Bilingual prompt
            response = self._get_bilingual_analysis(symptoms)
        else:
            # English only
            response = self._get_english_analysis(symptoms)
        
        return Response(response)
    
    def _get_bilingual_analysis(self, symptoms):
        prompt = f"""
        Analyze these symptoms and provide response in JSON with both English and Bengali:
        Symptoms: {', '.join(symptoms)}
        
        Response format:
        {{
            "diagnosis": {{"en": "...", "bn": "..."}},
            "severity": "mild|moderate|severe",
            "recommendations": [{{"en": "...", "bn": "..."}}],
            "warningSign": boolean
        }}
        """
        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-4-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        return json.loads(response.choices[0].message.content)
    
    def _get_english_analysis(self, symptoms):
        # Similar, but English only
        pass
```

#### Medicine Information

```python
class MedicineInformationView(APIView):
    def post(self, request):
        medicine_name = request.data.get('medicineName')
        language = request.data.get('language', 'en')
        
        if language == 'bn':
            response = self._get_bilingual_medicine_info(medicine_name)
        else:
            response = self._get_english_medicine_info(medicine_name)
        
        return Response(response)
    
    def _get_bilingual_medicine_info(self, medicine_name):
        prompt = f"""
        Provide medicine information for {medicine_name} in JSON format 
        with both English and Bengali:
        
        {{
            "medicineName": {{"en": "...", "bn": "..."}},
            "genericName": {{"en": "...", "bn": "..."}},
            "uses": [{{"en": "...", "bn": "..."}}],
            "dosage": {{"en": "...", "bn": "..."}},
            "sideEffects": [{{"en": "...", "bn": "..."}}],
            "precautions": [{{"en": "...", "bn": "..."}}],
            "interactions": [{{"en": "...", "bn": "..."}}]
        }}
        """
        # Call OpenAI API
        pass
```

---

## ⚙️ Utility Functions

### `translateAndFormat()`

Located in `src/utils/translateAndFormat.ts`

```typescript
// Simple usage
import { translateAndFormat } from '@/utils/translateAndFormat';

// English mode
const result = translateAndFormat("Fever", "en");
// Returns: { primary: "Fever", secondary: undefined }

// Bengali mode with bilingual content
const content = { en: "Fever", bn: "জ্বর" };
const result = translateAndFormat(content, "bn");
// Returns: { primary: "জ্বর", secondary: "Fever" }
```

### `BilingualText` Component

Render bilingual content with proper styling:

```tsx
import { BilingualText } from '@/components/BilingualDisplay';

<BilingualText
  content={{ en: "Fever", bn: "জ্বর" }}
  currentLanguage={language}
  type="title"  // 'title', 'body', 'suggestion', 'warning'
/>

// Output (Bengali mode):
// <জ্বর> (bold, large)
// <Fever> (muted, smaller)
```

### `BilingualCard` Component

Card with bilingual content:

```tsx
<BilingualCard
  title={{ en: "Diagnosis", bn: "রোগ নির্ণয়" }}
  content={{ en: "Viral Infection", bn: "ভাইরাল সংক্রমণ" }}
  currentLanguage={language}
  icon={<Activity />}
  severity="moderate"
/>
```

---

## 🎨 Tailwind Design System

### Primary Text (Bengali)
```tailwind
text-white font-semibold text-lg text-foreground
```

### Secondary Text (English)
```tailwind
text-gray-400 text-sm text-muted-foreground italic
```

### Color Coding
- **Severe**: `border-red-500 bg-red-50`
- **Moderate**: `border-orange-500 bg-orange-50`
- **Mild**: `border-green-500 bg-green-50`
- **Warning**: `bg-amber-50 border-amber-300`
- **Info**: `bg-blue-50 dark:bg-blue-950 border-blue-200`

---

## 🚀 Performance Optimization

### Single API Call Strategy
```
Request Flow:
├─ English Mode
│  └─ Call API once → Get English only
│
└─ Bengali Mode
   └─ Call API once (bilingual prompt) → Get EN + BN in single response
```

### Benefits
✓ No duplicate API calls
✓ Faster response time
✓ Reduced latency
✓ Cost-effective (single token usage)

---

## 🔐 Security & Healthcare Compliance

### Disclaimers
All responses include compliance disclaimers:

```
⚠️ This is an AI-assisted analysis. 
Always consult a qualified healthcare professional for medical decisions.
```

### Data Privacy
- No personal data storage
- HIPAA-compliant API calls
- Encrypted transmission
- Secure OpenAI API integration

---

## 📊 Translation Quality

### Medical Terminology Accuracy
- Proper Bengali transliteration
- Medically correct terminology
- Consistent terminology usage
- Context-aware translations

### Example Translations
| English | Bengali |
|---------|---------|
| Fever | জ্বর |
| Headache | মাথা ব্যথা |
| Viral Infection | ভাইরাল সংক্রমণ |
| Symptom | উপসর্গ |
| Dosage | মাত্রা |
| Side Effect | পার্শ্ব প্রতিক্রিয়া |

---

## 🧪 Testing Examples

### Test Case 1: Symptom Analysis (Bengali)
```
Input: "মাথা ব্যথা, জ্বর"
Expected Output:
├─ Disease: (Bengali + English)
├─ Severity: moderate
├─ Recommendations: 3 items (bilingual)
└─ Disclaimer: Present
```

### Test Case 2: Medicine Search (English)
```
Input: "Aspirin"
Expected Output:
├─ Medicine: "Aspirin" (English only)
├─ Uses: 3 items (English)
├─ Dosage: (English)
├─ Side Effects: (English)
└─ Disclaimer: Present
```

---

## ✅ Implementation Checklist

- [x] BilingualText component with typography
- [x] BilingualCard component for sections
- [x] SymptomsChecker component
- [x] MedicineInformation component
- [x] translateAndFormat utility
- [x] Service functions with bilingual support
- [x] API response handling
- [x] Error states and loading states
- [x] Healthcare disclaimers
- [x] Tailwind styling
- [x] Language toggle integration
- [x] Animation transitions
- [x] Mobile responsive design

---

## 📚 Further Reading

- [i18n Configuration](./src/i18n/index.ts)
- [Translation Utils](./src/utils/translateAndFormat.ts)
- [Medical Analysis Service](./src/services/medicalAnalysis.ts)
- [Bilingual Display Components](./src/components/BilingualDisplay.tsx)

---

**Built with ❤️ for HealthVision AI**
