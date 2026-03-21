import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { image_base64, file_type, description, diagnosis_id } = await req.json();
    
    // Mock response since lovable API is removed
    const mockResult = {
      analysis: "AI analysis service is temporarily unavailable. Please consult a healthcare professional for proper medical analysis of your images and reports.",
      severity: "moderate",
      recommendations: [
        "Consult with a qualified healthcare professional",
        "Bring your medical documents to your next appointment",
        "Follow up with your primary care physician"
      ]
    };

    return new Response(JSON.stringify(mockResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-medical error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
