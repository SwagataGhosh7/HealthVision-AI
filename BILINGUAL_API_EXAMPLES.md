# Medical Analysis API - Bilingual Response Examples

## Table of Contents

- [API Endpoints](#api-endpoints)
- [Request/Response Format](#requestresponse-format)
- [Example Scenarios](#example-scenarios)
- [Error Handling](#error-handling)
- [Prompt Engineering](#prompt-engineering)

---

## API Endpoints

### 1. Single Language Analysis (English)

```
POST /api/analyze
Content-Type: application/json

{
  "symptoms": ["headache", "fever", "cough"],
  "medicalHistory": "No prior conditions",
  "vitals": {
    "heartRate": 98,
    "bloodPressure": "130/85",
    "temperature": 38.5,
    "oxygenSaturation": 97
  },
  "language": "en"
}
```

**Response:**
```json
{
  "diagnosis": "Suspected viral respiratory infection (possibly common cold or mild influenza)",
  "severity": "mild",
  "recommendations": [
    "Get plenty of rest and stay hydrated",
    "Monitor temperature; take paracetamol if fever exceeds 39°C",
    "Use honey or throat lozenges for cough relief",
    "Seek medical attention if symptoms worsen within 3-5 days"
  ],
  "warningSign": false,
  "language": "en",
  "originalLanguage": "en"
}
```

---

### 2. Bilingual Analysis (Bengali + English)

```
POST /api/analyze/bilingual
Content-Type: application/json

{
  "symptoms": ["মাথাব্যথা", "জ্বর", "কাশি"],
  "medicalHistory": "কোনো পূর্ববর্তী শর্ত নেই",
  "vitals": {
    "heartRate": 98,
    "bloodPressure": "130/85",
    "temperature": 38.5,
    "oxygenSaturation": 97
  },
  "language": "bn"
}
```

**Response:**
```json
{
  "diagnosis": {
    "en": "Suspected viral respiratory infection (possibly common cold or mild influenza)",
    "bn": "সম্ভাব্য ভাইরাল শ্বাসযন্ত্রের সংক্রমণ (সম্ভবত সাধারণ সর্দি বা হালকা ইনফ্লুয়েঞ্জা)"
  },
  "severity": "mild",
  "recommendations": [
    {
      "en": "Get plenty of rest and stay hydrated",
      "bn": "প্রচুর বিশ্রাম নিন এবং হাইড্রেটেড থাকুন"
    },
    {
      "en": "Monitor temperature; take paracetamol if fever exceeds 39°C",
      "bn": "তাপমাত্রা পর্যবেক্ষণ করুন; জ্বর ৩৯°C অতিক্রম করলে প্যারাসিটামল নিন"
    },
    {
      "en": "Use honey or throat lozenges for cough relief",
      "bn": "কাশির স্বস্তির জন্য মধু বা গলার লজেন্স ব্যবহার করুন"
    },
    {
      "en": "Seek medical attention if symptoms worsen within 3-5 days",
      "bn": "৩-৫ দিনের মধ্যে লক্ষণ খারাপ হলে চিকিৎসা সেবা নিন"
    }
  ],
  "warningSign": false,
  "language": "bn",
  "originalLanguage": "bn"
}
```

---

## Request/Response Format

### TypeScript Interfaces

```typescript
// Request
export interface MedicalAnalysisRequest {
  symptoms?: string[];           // e.g., ["fever", "headache"]
  medicalHistory?: string;        // Patient's medical background
  vitals?: {
    heartRate?: number;           // bpm
    bloodPressure?: string;        // "120/80" format
    temperature?: number;          // Celsius
    oxygenSaturation?: number;     // 0-100 percent
  };
  reportDescription?: string;     // File upload description
  language?: 'en' | 'bn';        // Target language
}

// Response (Single Language)
export interface MedicalAnalysisResponse {
  diagnosis: string;              // Main diagnosis text
  severity: 'mild' | 'moderate' | 'severe';
  recommendations: string[];      // Array of medical recommendations
  warningSign: boolean;           // Requires urgent attention?
  language: 'en' | 'bn';
  originalLanguage: 'en' | 'bn';
}

// Response (Bilingual)
export interface BilingualContent {
  en: string;                     // English content
  bn: string;                     // Bengali content
}

export interface BillingualMedicalAnalysisResponse {
  diagnosis: BilingualContent;
  severity: 'mild' | 'moderate' | 'severe';
  recommendations: BilingualContent[];
  warningSign: boolean;
  language: 'bn';
  originalLanguage: 'bn';
}
```

---

## Example Scenarios

### Scenario 1: Acute Respiratory Infection

**Request:**
```json
{
  "symptoms": ["persistent cough", "chest pain", "shortness of breath"],
  "vitals": {
    "heartRate": 112,
    "temperature": 39.2,
    "oxygenSaturation": 94,
    "bloodPressure": "145/92"
  },
  "medicalHistory": "History of asthma",
  "language": "bn"
}
```

**Bilingual Response:**
```json
{
  "diagnosis": {
    "en": "Acute bronchitis with asthmatic exacerbation. Elevated oxygen demand and low oxygen saturation require immediate medical evaluation.",
    "bn": "হাঁপানির বৃদ্ধি সহ তীব্র ব্রংকাইটিস। উন্নত অক্সিজেন চাহিদা এবং কম অক্সিজেন স্যাচুরেশন তাৎক্ষণিক চিকিৎসা মূল্যায়ন প্রয়োজন।"
  },
  "severity": "severe",
  "recommendations": [
    {
      "en": "SEEK IMMEDIATE MEDICAL ATTENTION - Visit emergency department or call ambulance",
      "bn": "তাৎক্ষণিক চিকিৎসা সেবা নিন - জরুরি বিভাগে যান বা অ্যাম্বুলেন্স ডাকুন"
    },
    {
      "en": "Use rescue inhaler (albuterol/salbutamol) immediately if available",
      "bn": "উপলব্ধ থাকলে অবিলম্বে রেসকিউ ইনহেলার (অ্যালবুটেরল/সালবিউটামল) ব্যবহার করুন"
    },
    {
      "en": "Monitor oxygen levels closely; any further decline requires emergency intervention",
      "bn": "অক্সিজেন স্তর ঘনিষ্ঠভাবে পর্যবেক্ষণ করুন; আরও হ্রাস জরুরি হস্তক্ষেপের প্রয়োজন"
    }
  ],
  "warningSign": true,
  "language": "bn",
  "originalLanguage": "bn"
}
```

---

### Scenario 2: Hypertension Screening

**Request:**
```json
{
  "symptoms": [],
  "vitals": {
    "heartRate": 78,
    "temperature": 37,
    "oxygenSaturation": 98,
    "bloodPressure": "165/105"
  },
  "medicalHistory": "Family history of hypertension, sedentary lifestyle",
  "language": "bn"
}
```

**Response:**
```json
{
  "diagnosis": {
    "en": "Stage 2 Hypertension detected. Requires lifestyle modifications and possible pharmaceutical intervention.",
    "bn": "পর্যায় ২ উচ্চ রক্তচাপ সনাক্ত। জীবনধারা পরিবর্তন এবং সম্ভাব্য ফার্মাসিউটিক্যাল হস্তক্ষেপ প্রয়োজন।"
  },
  "severity": "moderate",
  "recommendations": [
    {
      "en": "Schedule immediate appointment with cardiologist or primary care physician",
      "bn": "কার্ডিওলজিস্ট বা প্রাথমিক যত্ন চিকিৎসকের সাথে তাৎক্ষণিক অ্যাপয়েন্টমেন্ট বুক করুন"
    },
    {
      "en": "Reduce daily sodium intake to less than 2,300mg (ideally 1,500mg)",
      "bn": "দৈনিক সোডিয়াম গ্রহণ ২,৩০০ মিলিগ্রামের নিচে (আদর্শভাবে ১,৫০০ মিলিগ্রাম) কমান"
    },
    {
      "en": "Increase aerobic exercise to 150 minutes per week at moderate intensity",
      "bn": "মধ্যম তীব্রতায় প্রতি সপ্তাহে ১৫০ মিনিট এরোবিক ব্যায়াম বৃদ্ধি করুন"
    },
    {
      "en": "Monitor blood pressure daily and maintain a log for physician review",
      "bn": "প্রতিদিন রক্তচাপ পর্যবেক্ষণ করুন এবং চিকিৎসক পর্যালোচনার জন্য একটি লগ রক্ষা করুন"
    },
    {
      "en": "Limit caffeine and alcohol consumption; reduce stress through meditation",
      "bn": "ক্যাফেইন এবং অ্যালকোহল সেবন সীমিত করুন; ধ্যানের মাধ্যমে চাপ কমান"
    }
  ],
  "warningSign": false,
  "language": "bn",
  "originalLanguage": "bn"
}
```

---

### Scenario 3: Multiple Chronic Conditions

**Request:**
```json
{
  "symptoms": ["fatigue", "excessive thirst", "frequent urination"],
  "medicalHistory": "Type 2 Diabetes (5 years), Hypertension (3 years), Obesity (BMI 32)",
  "vitals": {
    "heartRate": 85,
    "temperature": 36.8,
    "oxygenSaturation": 97,
    "bloodPressure": "155/98"
  },
  "language": "bn"
}
```

**Response:**
```json
{
  "diagnosis": {
    "en": "Multiple metabolic complications. Possible diabetic complications including neuropathy or early kidney disease. Blood pressure control inadequate.",
    "bn": "একাধিক বিপাকীয় জটিলতা। সম্ভাব্য ডায়াবেটিক জটিলতা যেমন নেউরোপ্যাথি বা প্রাথমিক কিডনি রোগ। রক্তচাপ নিয়ন্ত্রণ অপর্যাপ্ত।"
  },
  "severity": "moderate",
  "recommendations": [
    {
      "en": "Schedule comprehensive metabolic panel and HbA1c testing",
      "bn": "ব্যাপক বিপাকীয় প্যানেল এবং HbA1c পরীক্ষা শিডিউল করুন"
    },
    {
      "en": "Review and potentially adjust diabetes and blood pressure medications",
      "bn": "ডায়াবেটিস এবং রক্তচাপ ওষুধ পর্যালোচনা এবং সম্ভাব্যভাবে সমন্বয় করুন"
    },
    {
      "en": "Begin structured weight reduction program targeting 5-10% weight loss",
      "bn": "৫-১০% ওজন হ্রাস লক্ষ্য করে কাঠামোগত ওজন হ্রাস প্রোগ্রাম শুরু করুন"
    },
    {
      "en": "Refer to endocrinologist for diabetes management optimization",
      "bn": "ডায়াবেটিস ব্যবস্থাপনা অপ্টিমাইজেশনের জন্য এন্ডোক্রাইনোলজিস্টের কাছে পাঠান"
    }
  ],
  "warningSign": false,
  "language": "bn",
  "originalLanguage": "bn"
}
```

---

## Error Handling

### Error Responses

```json
// 400 Bad Request - Missing required fields
{
  "error": "Invalid request",
  "message": "At least one of symptoms or vitals must be provided",
  "code": "INVALID_REQUEST"
}

// 401 Unauthorized - Invalid API key
{
  "error": "Authentication failed",
  "message": "VITE_OPENAI_API_KEY not configured",
  "code": "AUTH_FAILED"
}

// 429 Too Many Requests - Rate limit
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please wait before retrying.",
  "code": "RATE_LIMIT_EXCEEDED"
}

// 500 Internal Server Error - API failure
{
  "error": "Analysis failed",
  "message": "OpenAI API error: Service temporarily unavailable",
  "code": "API_ERROR"
}
```

### Error Handling in React

```typescript
try {
  const analysis = await analyzeWithTranslation(request, language);
  setResult(analysis);
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('API key')) {
      showError('Configuration error: API key not set');
    } else if (error.message.includes('Rate limit')) {
      showError('Too many requests. Please try again later.');
    } else {
      showError(error.message);
    }
  }
}
```

---

## Prompt Engineering

### System Prompt for Bilingual Analysis

```
You are an expert medical AI assistant trained in multilingual healthcare communication.

When analyzing patient data:
1. Provide accurate, evidence-based medical insights
2. Consider both English and Bengali medical terminology
3. Ensure clinical accuracy across both languages
4. Adapt recommendations for South Asian healthcare context
5. Use simple language appropriate for patient understanding

For Bengali translations:
- Use formal medical Bengali (চিকিৎসা বাংলা)
- Maintain medical terminology accuracy
- Ensure cultural appropriateness
- Use Unicode Bengali script (not transliteration)

Remember: This is AI-assisted analysis. Always include disclaimer about consulting qualified professionals.
```

### User Prompt Template

```
Analyze the following patient case and provide medical insights in both English and Bengali.

PATIENT INFORMATION:
Symptoms: [symptoms list]
Medical History: [history]
Vital Signs:
- Heart Rate: [HR] bpm
- Blood Pressure: [BP]
- Temperature: [Temp]°C
- Oxygen Saturation: [SpO2]%

RESPONSE FORMAT (JSON):
{
  "diagnosis": {
    "en": "English diagnosis",
    "bn": "Bengali diagnosis"
  },
  "severity": "mild|moderate|severe",
  "recommendations": [
    {"en": "English recommendation", "bn": "Bengali recommendation"}
  ],
  "warningSign": true/false
}

CRITICAL REQUIREMENTS:
- Medical accuracy in both languages
- Clear, patient-friendly explanations
- Actionable, specific recommendations
- Clear risk assessment
```

---

## Performance Metrics

### Expected API Response Times

| Scenario | Language | Time |
|----------|----------|------|
| Simple analysis (1 vital) | English | 2-3s |
| Complex analysis | English | 3-5s |
| Bilingual analysis | Bengali | 3-5s |
| Translation fallback | Both | 6-8s |

### Optimization Tips

1. **Cache Common Diagnoses**: Pre-cache common conditions
2. **Parallel Processing**: Request all bilingual content simultaneously
3. **Lazy Loading**: Load recommendations only after diagnosis renders
4. **Connection Pooling**: Use persistent API connections
5. **Response Compression**: Enable gzip compression

---

## Testing

### Unit Test Example

```typescript
import { analyzeWithTranslation } from '@/services/medicalAnalysis';

describe('Bilingual Medical Analysis', () => {
  it('should return bilingual content when language is bn', async () => {
    const request = {
      symptoms: ['fever'],
      language: 'bn' as const,
    };

    const result = await analyzeWithTranslation(request, 'bn');

    expect(result).toHaveProperty('diagnosis');
    expect(typeof result.diagnosis).toBe('object');
    expect(result.diagnosis).toHaveProperty('en');
    expect(result.diagnosis).toHaveProperty('bn');
  });

  it('should return string diagnosis when language is en', async () => {
    const request = {
      symptoms: ['fever'],
      language: 'en' as const,
    };

    const result = await analyzeWithTranslation(request, 'en');

    expect(typeof result.diagnosis).toBe('string');
  });
});
```

---

## References

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Medical Terminology - English/Bengali](https://www.ncbi.nlm.nih.gov)
- [React i18n Best Practices](https://react.i18next.com/)
