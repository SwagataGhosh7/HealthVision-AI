# LLM Medical Analysis Integration Guide

## Overview

HealthVision AI now includes an **AI-powered Medical Analysis** feature that uses OpenAI's LLM to analyze symptoms and vital signs. Results can be displayed in **English or Bengali**.

## Features

### 1. **Medical Analysis Component**
- Analyzes symptoms, medical history, and vital signs
- Provides:
  - AI-generated diagnosis
  - Severity assessment (mild/moderate/severe)
  - Personalized recommendations
  - Warning signs detection

### 2. **Bengali Language Support**
- Complete UI translation to Bengali
- Analysis results automatically translated to Bengali
- Easy language toggle in the chat interface

### 3. **Integration Points**

#### In HealthChatbot Component:
- New "Analysis" tab alongside "Chat"
- Language selector with English/Bengali options
- Embedded MedicalAnalysis component

#### New Files Created:
- `/src/services/medicalAnalysis.ts` - LLM integration service
- `/src/components/MedicalAnalysis.tsx` - Analysis UI component
- `/src/i18n/locales/` - Updated translations

## Setup Instructions

### Step 1: Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy your API key

### Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your OpenAI API key:
   ```
   VITE_OPENAI_API_KEY=sk-your-api-key-here
   ```

### Step 3: Install Dependencies (if needed)

```bash
bun install
# or
npm install
```

### Step 4: Run Development Server

```bash
bun dev
# or
npm run dev
```

## Usage

### For Users:

1. **In Chat Mode:**
   - Click the HealthVision AI chatbot icon
   - Toggle language using the Language selector
   - Ask health-related questions

2. **In Analysis Mode:**
   - Click the HealthVision AI chatbot icon
   - Switch to the "Analysis" tab
   - Select your preferred language (English/Bengali)
   - Enter symptoms, medical history, and vital signs
   - Click "Analyze" to get AI insights

### For Developers:

#### Using the Medical Analysis Service:

```typescript
import { analyzeMedicalData, analyzeWithTranslation } from '@/services/medicalAnalysis';

// Analyze in English
const result = await analyzeMedicalData({
  symptoms: ['headache', 'fever'],
  medicalHistory: 'No chronic conditions',
  vitals: {
    heartRate: 92,
    temperature: 101.5,
  },
  language: 'en'
});

// Analyze with Bengali translation
const bengaliResult = await analyzeWithTranslation({
  symptoms: ['মাথাব্যথা', 'জ্বর'],
  language: 'en'
}, 'bn');
```

#### Component Usage:

```tsx
import { MedicalAnalysis } from '@/components/MedicalAnalysis';

export default function MyPage() {
  return <MedicalAnalysis />;
}
```

## API Response Structure

```typescript
interface MedicalAnalysisResponse {
  diagnosis: string;              // AI-generated diagnosis
  severity: 'mild' | 'moderate' | 'severe';
  recommendations: string[];      // Array of recommendations
  warningSign: boolean;           // True if severe condition detected
  language: 'en' | 'bn';         // Response language
  originalLanguage: 'en' | 'bn'; // Original analysis language
}
```

## Error Handling

The service includes error handling for:
- Missing OpenAI API key
- Network failures
- Invalid responses
- Translation failures (gracefully falls back to original language)

All errors are logged to console and shown to users via toast notifications.

## Security Considerations

1. **API Key:** Store your OpenAI API key securely in `.env.local` (not in git)
2. **Client-side calls:** API calls are made from the client browser
3. **Rate limiting:** Implement rate limiting on your backend if needed
4. **Cost management:** Monitor your OpenAI usage and set spending limits

## Supported Languages

- **English (en)** - Default
- **Bengali (বাংলা) (bn)** - Full translation

## Model Information

- **Model:** GPT-4 Turbo (v1106)
- **Temperature:** 0.3 (low randomness for medical accuracy)
- **Max tokens:** 1000 per response

## Troubleshooting

### "OpenAI API key not configured"
- Ensure `.env.local` contains `VITE_OPENAI_API_KEY`
- Build needs to be rerun after env changes

### Analysis not working
- Check browser console for API errors
- Verify OpenAI API key is valid
- Check your OpenAI account has credits

### Bengali text not displaying
- Check if Bengali locale is loaded in i18n
- Verify font supports Bengali characters
- Check browser console for i18n errors

## Future Enhancements

- [ ] Medical report image analysis
- [ ] Integration with health records database
- [ ] Multi-language support (Spanish, Hindi, etc.)
- [ ] Conversational follow-up questions
- [ ] Health history tracking
- [ ] Integration with wearable devices

## License & Disclaimer

⚠️ **IMPORTANT MEDICAL DISCLAIMER:**
This AI analysis is **NOT a substitute for professional medical advice**. Always consult a qualified healthcare professional for:
- Medical diagnoses
- Treatment decisions
- Medication recommendations
- Emergency situations

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review OpenAI API documentation
3. Check console errors (F12 → Console tab)

---

**Last Updated:** April 2026
**Version:** 1.0
