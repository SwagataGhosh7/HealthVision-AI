import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are HealthVision AI, a medical image and report analysis assistant. Analyze the provided medical image or document and return a JSON response with exactly this structure:
{
  "analysis": "A detailed analysis of the medical image/report findings",
  "severity": "low" | "moderate" | "high" | "critical",
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}

Guidelines:
- For X-rays, MRIs, CT scans: describe visible structures, any abnormalities, and potential findings
- For lab reports/documents: summarize key values, flag abnormal results
- Be thorough but clear in your analysis
- Severity should reflect the urgency: low (normal/minor), moderate (needs follow-up), high (needs prompt attention), critical (needs immediate care)
- Provide 3-5 actionable recommendations
- Always include a recommendation to consult a healthcare professional
- IMPORTANT: Return ONLY valid JSON, no markdown formatting or code blocks

Disclaimer: This is an AI-assisted preliminary analysis and should not replace professional medical diagnosis.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !data?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { image_base64, file_type, description } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build message content with image if available
    const userContent: any[] = [];
    
    if (description) {
      userContent.push({ type: "text", text: `Additional context from user: ${description}` });
    }

    if (image_base64 && file_type?.startsWith("image/")) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: `data:${file_type};base64,${image_base64}`,
        },
      });
      userContent.push({ type: "text", text: "Please analyze this medical image." });
    } else if (image_base64) {
      // For PDFs or non-image files, send as text context
      userContent.push({ 
        type: "text", 
        text: `A medical document (${file_type}) has been uploaded. Please provide a general medical analysis based on the file type and any context provided. Analyze what you can and provide recommendations.` 
      });
    } else {
      userContent.push({ type: "text", text: "Please provide a general health analysis based on the context provided." });
    }

    // Use Gemini 2.5 Flash for vision capability
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        temperature: 0.3,
        max_tokens: 2048,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI analysis service temporarily unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Parse JSON from AI response
    let result;
    try {
      // Try to extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      result = JSON.parse(jsonMatch[1].trim());
    } catch {
      // Fallback if JSON parsing fails
      result = {
        analysis: content,
        severity: "moderate",
        recommendations: [
          "Consult with a qualified healthcare professional for proper diagnosis",
          "Bring this report to your next medical appointment",
          "Follow up with your primary care physician"
        ],
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-medical error:", e);
    return new Response(
      JSON.stringify({ error: "An internal error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
