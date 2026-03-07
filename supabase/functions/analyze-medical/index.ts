import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { image_base64, file_type, description, diagnosis_id } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const isImage = file_type?.startsWith("image/");

    const userMessage: any = {
      role: "user",
      content: isImage
        ? [
            {
              type: "image_url",
              image_url: { url: `data:${file_type};base64,${image_base64}` },
            },
            {
              type: "text",
              text: `Analyze this medical image. ${description ? `Context: ${description}` : ""}
              
Please provide a thorough analysis including:
1. What type of medical image/report this is
2. Key findings and observations
3. Potential diagnoses or conditions detected
4. Severity assessment (low, moderate, high, or critical)
5. Recommended follow-up actions and advice`,
            },
          ]
        : `Analyze this medical document content. ${description ? `Context: ${description}` : ""}
          
Please provide:
1. Key findings
2. Potential diagnoses
3. Severity (low/moderate/high/critical)
4. Recommendations`,
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: `You are an expert medical AI assistant powered by Computer Vision technology. You analyze medical images (X-rays, MRI scans, CT scans, blood reports, pathology slides) and provide detailed diagnostic analysis.

IMPORTANT RULES:
- Always be thorough but clear in your analysis
- Always include a severity assessment: low, moderate, high, or critical
- Always provide actionable recommendations
- Include a disclaimer that this is AI-assisted and not a replacement for professional medical advice
- If the image quality is poor or you cannot determine the type, state that clearly

You must respond with a JSON object in this exact format:
{
  "analysis": "Detailed analysis text here",
  "severity": "low|moderate|high|critical",
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}`,
          },
          userMessage,
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "medical_analysis",
              description: "Return structured medical analysis results",
              parameters: {
                type: "object",
                properties: {
                  analysis: { type: "string", description: "Detailed medical analysis" },
                  severity: { type: "string", enum: ["low", "moderate", "high", "critical"] },
                  recommendations: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of medical recommendations",
                  },
                },
                required: ["analysis", "severity", "recommendations"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "medical_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();

    let result;
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      result = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback: try to parse content as JSON
      const content = data.choices?.[0]?.message?.content || "";
      try {
        result = JSON.parse(content);
      } catch {
        result = {
          analysis: content,
          severity: "moderate",
          recommendations: ["Please consult a healthcare professional for proper diagnosis."],
        };
      }
    }

    return new Response(JSON.stringify(result), {
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
