/**
 * Medical Analysis Service using OpenAI LLM
 * Analyzes health data and provides medical insights with bilingual support
 * 
 * Bilingual Strategy:
 * - English mode: Returns English only
 * - Bengali mode: Returns BilingualContent { en: string, bn: string }
 *   This avoids duplicate API calls by providing both languages from a single request
 */

export type AnalysisLanguage = 'en' | 'bn';

export interface BilingualContent {
  en: string;
  bn: string;
}

export interface MedicalAnalysisRequest {
  symptoms?: string[];
  medicalHistory?: string;
  vitals?: {
    heartRate?: number;
    bloodPressure?: string;
    temperature?: number;
    oxygenSaturation?: number;
  };
  reportDescription?: string;
  language?: AnalysisLanguage;
}

export interface MedicalAnalysisResponse {
  diagnosis: string | BilingualContent;
  severity: 'mild' | 'moderate' | 'severe';
  recommendations: (string | BilingualContent)[];
  warningSign: boolean;
  language: AnalysisLanguage;
  originalLanguage: AnalysisLanguage;
}

export interface MedicineInformationRequest {
  medicineName: string;
  language?: AnalysisLanguage;
}

export interface MedicineInformationResponse {
  medicineName: string | BilingualContent;
  genericName?: string | BilingualContent;
  uses: (string | BilingualContent)[];
  dosage: string | BilingualContent;
  sideEffects: (string | BilingualContent)[];
  precautions: (string | BilingualContent)[];
  interactions?: (string | BilingualContent)[];
  language: AnalysisLanguage;
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_MODEL = 'gpt-4-turbo';

/**
 * Prompt for English analysis
 */
const MEDICAL_ANALYSIS_PROMPT_EN = `You are an expert medical AI assistant. Analyze the provided patient information and provide medical insights.

Respond in JSON format only (no markdown, no code blocks):
{
  "diagnosis": "Clear diagnosis based on symptoms",
  "severity": "mild|moderate|severe",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "warningSign": true/false
}

If severity is severe or there are warning signs, set warningSign to true.
ALWAYS include this disclaimer: "⚠️ This is an AI-assisted analysis. Always consult a qualified healthcare professional for medical decisions."`;

/**
 * Prompt for bilingual analysis (English + Bengali)
 * Optimized to get both languages in a single API call
 */
const MEDICAL_ANALYSIS_PROMPT_BILINGUAL = `You are an expert medical AI assistant. Analyze the provided patient information and provide medical insights in BOTH English and Bengali.

CRITICAL: Respond with this EXACT JSON format (no markdown, no code blocks):
{
  "diagnosis": {
    "en": "Clear diagnosis in English",
    "bn": "Clear diagnosis in Bengali"
  },
  "severity": "mild|moderate|severe",
  "recommendations": [
    {
      "en": "English recommendation 1",
      "bn": "Bengali recommendation 1"
    },
    {
      "en": "English recommendation 2",
      "bn": "Bengali recommendation 2"
    }
  ],
  "warningSign": true/false
}

Guidelines:
- Keep medical terminology accurate in both languages
- Use proper Bengali script (Unicode)
- Recommendations should be 2-3 items
- If severity is severe or there are warning signs, set warningSign to true
- ALWAYS include disclaimer: "⚠️ This is an AI-assisted analysis. Always consult a qualified healthcare professional for medical decisions."`;

/**
 * Prompt for medicine information in English
 */
const MEDICINE_INFORMATION_PROMPT_EN = `You are a pharmacist and medical information specialist. Provide detailed information about the requested medicine.

Respond in JSON format only (no markdown, no code blocks):
{
  "medicineName": "Full medicine name",
  "genericName": "Generic/active ingredient name",
  "uses": [
    "Primary use 1",
    "Primary use 2",
    "Primary use 3"
  ],
  "dosage": "Standard dosage recommendation (e.g., 500mg twice daily)",
  "sideEffects": [
    "Common side effect 1",
    "Common side effect 2",
    "Rare but serious side effect"
  ],
  "precautions": [
    "Precaution or contraindication 1",
    "Precaution or contraindication 2",
    "Special patient groups warning"
  ],
  "interactions": [
    "Common drug interaction 1",
    "Common drug interaction 2"
  ]
}

Guidelines:
- Include 2-3 uses, 2-4 side effects, 2-3 precautions
- Be accurate with dosage recommendations
- Include interaction warnings if known
- ALWAYS include disclaimer: "⚠️ This information is for reference only. Always consult your pharmacist or healthcare provider before taking any medicine."`;

/**
 * Prompt for bilingual medicine information (English + Bengali)
 */
const MEDICINE_INFORMATION_PROMPT_BILINGUAL = `You are a pharmacist and medical information specialist. Provide detailed medicine information in BOTH English and Bengali.

CRITICAL: Respond with this EXACT JSON format (no markdown, no code blocks):
{
  "medicineName": {
    "en": "Full medicine name in English",
    "bn": "ওষুধের সম্পূর্ণ নাম বাংলায়"
  },
  "genericName": {
    "en": "Generic name in English",
    "bn": "সাধারণ নাম বাংলায়"
  },
  "uses": [
    {
      "en": "Use in English",
      "bn": "বাংলায় ব্যবহার"
    }
  ],
  "dosage": {
    "en": "Standard dosage in English",
    "bn": "বাংলায় মাত্রা"
  },
  "sideEffects": [
    {
      "en": "Side effect in English",
      "bn": "বাংলায় পার্শ্ব প্রতিক্রিয়া"
    }
  ],
  "precautions": [
    {
      "en": "Precaution in English",
      "bn": "বাংলায় সতর্কতা"
    }
  ],
  "interactions": [
    {
      "en": "Interaction in English",
      "bn": "বাংলায় ইন্টারঅ্যাকশন"
    }
  ]
}

Guidelines:
- Include 2-3 uses, 2-4 side effects, 2-3 precautions
- Use proper Bengali script (Unicode)
- Keep medical terminology accurate in both languages
- Include interaction warnings if known`;

const TRANSLATE_PROMPT = (text: string, targetLanguage: AnalysisLanguage) => `Translate the following medical text to ${targetLanguage === 'bn' ? 'Bengali' : 'English'}. Keep medical terminology accurate.

Text to translate:
${text}

Provide only the translated text, no explanations.`;

async function callOpenAI(prompt: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Set VITE_OPENAI_API_KEY in environment variables.');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a medical AI assistant. Provide accurate, helpful medical insights.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API call failed:', error);
    throw error;
  }
}

export async function analyzeMedicalData(
  request: MedicalAnalysisRequest
): Promise<MedicalAnalysisResponse> {
  const language = request.language || 'en';
  
  const patientInfo = formatPatientInfo(request);
  const prompt = `${MEDICAL_ANALYSIS_PROMPT_EN}

Patient Information:
${patientInfo}`;

  try {
    const response = await callOpenAI(prompt);
    
    // Parse JSON response
    interface AnalysisData {
      diagnosis: string;
      severity: 'mild' | 'moderate' | 'severe';
      recommendations: string[] | string;
      warningSign: boolean;
    }
    
    let analysis: AnalysisData;
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      analysis = JSON.parse(jsonMatch[0]) as AnalysisData;
    } else {
      analysis = JSON.parse(response) as AnalysisData;
    }

    return {
      diagnosis: analysis.diagnosis,
      severity: analysis.severity,
      recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [analysis.recommendations],
      warningSign: analysis.warningSign,
      language,
      originalLanguage: language,
    };
  } catch (error) {
    console.error('Medical analysis failed:', error);
    throw new Error('Failed to analyze medical data. Please try again.');
  }
}

/**
 * Analyze with bilingual support (English + Bengali)
 * Single API call returns both languages to reduce latency
 */
export async function analyzeBilingualMedicalData(
  request: MedicalAnalysisRequest
): Promise<MedicalAnalysisResponse> {
  const patientInfo = formatPatientInfo(request);
  const prompt = `${MEDICAL_ANALYSIS_PROMPT_BILINGUAL}

Patient Information:
${patientInfo}`;

  try {
    const response = await callOpenAI(prompt);
    
    interface BilingualAnalysisData {
      diagnosis: BilingualContent;
      severity: 'mild' | 'moderate' | 'severe';
      recommendations: BilingualContent[] | string[];
      warningSign: boolean;
    }
    
    let analysis: BilingualAnalysisData;
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      analysis = JSON.parse(jsonMatch[0]) as BilingualAnalysisData;
    } else {
      analysis = JSON.parse(response) as BilingualAnalysisData;
    }

    return {
      diagnosis: analysis.diagnosis,
      severity: analysis.severity,
      recommendations: Array.isArray(analysis.recommendations) 
        ? analysis.recommendations 
        : [analysis.recommendations as BilingualContent],
      warningSign: analysis.warningSign,
      language: 'bn',
      originalLanguage: 'bn',
    };
  } catch (error) {
    console.error('Bilingual medical analysis failed:', error);
    throw new Error('Failed to analyze medical data. Please try again.');
  }
}

export async function translateText(
  text: string,
  targetLanguage: AnalysisLanguage
): Promise<string> {
  if (targetLanguage === 'en') return text; // No translation needed for English

  const prompt = TRANSLATE_PROMPT(text, targetLanguage);
  
  try {
    const translated = await callOpenAI(prompt);
    return translated.trim();
  } catch (error) {
    console.error('Translation failed:', error);
    return text; // Return original if translation fails
  }
}

export async function analyzeWithTranslation(
  request: MedicalAnalysisRequest,
  targetLanguage: AnalysisLanguage
): Promise<MedicalAnalysisResponse> {
  // Use bilingual API call for Bengali to get both languages in one request
  if (targetLanguage === 'bn') {
    try {
      return await analyzeBilingualMedicalData(request);
    } catch (error) {
      console.warn('Bilingual analysis failed, falling back to separate calls:', error);
      // Fallback: analyze in English and translate
    }
  }

  // English mode: analyze in English only
  const analysis = await analyzeMedicalData({
    ...request,
    language: targetLanguage,
  });

  return analysis;
}

function formatPatientInfo(request: MedicalAnalysisRequest): string {
  let info = '';

  if (request.symptoms && request.symptoms.length > 0) {
    info += `Symptoms: ${request.symptoms.join(', ')}\n`;
  }

  if (request.medicalHistory) {
    info += `Medical History: ${request.medicalHistory}\n`;
  }

  if (request.vitals) {
    const { heartRate, bloodPressure, temperature, oxygenSaturation } = request.vitals;
    if (heartRate) info += `Heart Rate: ${heartRate} bpm\n`;
    if (bloodPressure) info += `Blood Pressure: ${bloodPressure}\n`;
    if (temperature) info += `Temperature: ${temperature}°F\n`;
    if (oxygenSaturation) info += `Oxygen Saturation: ${oxygenSaturation}%\n`;
  }

  if (request.reportDescription) {
    info += `Report Description: ${request.reportDescription}\n`;
  }

  return info || 'No patient information provided.';
}

/**
 * Get medicine information in English
 */
export async function getMedicineInformationEnglish(
  request: MedicineInformationRequest
): Promise<MedicineInformationResponse> {
  const prompt = `${MEDICINE_INFORMATION_PROMPT_EN}

Medicine to lookup: ${request.medicineName}`;

  try {
    const response = await callOpenAI(prompt);
    
    interface MedicineData {
      medicineName: string;
      genericName?: string;
      uses: string[];
      dosage: string;
      sideEffects: string[];
      precautions: string[];
      interactions?: string[];
    }
    
    let medicine: MedicineData;
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      medicine = JSON.parse(jsonMatch[0]) as MedicineData;
    } else {
      medicine = JSON.parse(response) as MedicineData;
    }

    return {
      medicineName: medicine.medicineName,
      genericName: medicine.genericName,
      uses: medicine.uses || [],
      dosage: medicine.dosage,
      sideEffects: medicine.sideEffects || [],
      precautions: medicine.precautions || [],
      interactions: medicine.interactions,
      language: 'en',
    };
  } catch (error) {
    console.error('Medicine information lookup failed:', error);
    throw new Error('Failed to retrieve medicine information. Please try again.');
  }
}

/**
 * Get bilingual medicine information (English + Bengali)
 */
export async function getMedicineBilingualInformation(
  request: MedicineInformationRequest
): Promise<MedicineInformationResponse> {
  const prompt = `${MEDICINE_INFORMATION_PROMPT_BILINGUAL}

Medicine to lookup: ${request.medicineName}`;

  try {
    const response = await callOpenAI(prompt);
    
    interface BilingualMedicineData {
      medicineName: BilingualContent;
      genericName?: BilingualContent;
      uses: BilingualContent[];
      dosage: BilingualContent;
      sideEffects: BilingualContent[];
      precautions: BilingualContent[];
      interactions?: BilingualContent[];
    }
    
    let medicine: BilingualMedicineData;
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      medicine = JSON.parse(jsonMatch[0]) as BilingualMedicineData;
    } else {
      medicine = JSON.parse(response) as BilingualMedicineData;
    }

    return {
      medicineName: medicine.medicineName,
      genericName: medicine.genericName,
      uses: medicine.uses || [],
      dosage: medicine.dosage,
      sideEffects: medicine.sideEffects || [],
      precautions: medicine.precautions || [],
      interactions: medicine.interactions,
      language: 'bn',
    };
  } catch (error) {
    console.error('Bilingual medicine information lookup failed:', error);
    throw new Error('Failed to retrieve medicine information. Please try again.');
  }
}

/**
 * Get medicine information with translation support
 * - English mode: Returns English only
 * - Bengali mode: Returns bilingual (Bengali + English)
 */
export async function getMedicineInformation(
  request: MedicineInformationRequest,
  targetLanguage: AnalysisLanguage
): Promise<MedicineInformationResponse> {
  // Use bilingual API call for Bengali to get both languages in one request
  if (targetLanguage === 'bn') {
    try {
      return await getMedicineBilingualInformation(request);
    } catch (error) {
      console.warn('Bilingual medicine lookup failed, falling back to English:', error);
      // Fallback: get English info
    }
  }

  // English mode: get English only
  return await getMedicineInformationEnglish(request);
}
