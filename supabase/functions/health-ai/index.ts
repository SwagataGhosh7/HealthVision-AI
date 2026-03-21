import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, messages } = await req.json();

    // Mock response since lovable API is removed
    let mockResponse = "";
    
    if (mode === "symptom-checker") {
      mockResponse = `**Symptom Analysis Service Unavailable**

The AI symptom checker is temporarily unavailable. Please:

• Consult with a healthcare professional for accurate diagnosis
• Visit your nearest clinic for medical evaluation
• Call emergency services for severe symptoms

*This is not a substitute for professional medical advice.*`;
    } else if (mode === "medicine-info") {
      mockResponse = `**Medicine Information Service Unavailable**

The medicine information service is temporarily unavailable. Please:

• Consult your pharmacist or doctor for medication information
• Read the medication leaflet carefully
• Contact your healthcare provider for questions about prescriptions

*Always consult healthcare professionals before taking any medication.*`;
    } else if (mode === "chat") {
      mockResponse = `**HealthVision AI Chat - Service Unavailable**

I'm sorry, but the AI chat service is temporarily unavailable. For health assistance:

• Contact your primary care physician
• Visit your local clinic
• Call emergency services for urgent medical issues
• Use reliable health information sources like WHO or CDC websites

Your health is important - please seek professional medical advice when needed.`;
    } else {
      mockResponse = "Service temporarily unavailable. Please consult a healthcare professional.";
    }

    return new Response(mockResponse, {
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  } catch (e) {
    console.error("health-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
