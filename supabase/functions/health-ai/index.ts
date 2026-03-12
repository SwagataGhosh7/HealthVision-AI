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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { mode, messages } = await req.json();

    let systemPrompt = "";

    if (mode === "symptom-checker") {
      systemPrompt = `You are a medical AI assistant specializing in symptom analysis. When a user describes symptoms or a possible disease:
1. Identify the likely condition(s)
2. Suggest possible medicines (generic names) with dosage guidelines
3. Recommend home remedies and lifestyle changes
4. Rate urgency (Low / Moderate / High / Emergency)
5. Always add a disclaimer that this is not a substitute for professional medical advice.
Format your response with clear markdown headings and bullet points.`;
    } else if (mode === "medicine-info") {
      systemPrompt = `You are a pharmaceutical AI assistant. When a user asks about a medicine:
1. Provide the medicine's primary uses and indications
2. List common side effects and rare but serious ones
3. Mention important drug interactions
4. Note contraindications (who should NOT take it)
5. Suggest generic alternatives if applicable
6. Always add a disclaimer to consult a doctor or pharmacist.
Format your response with clear markdown headings and bullet points.`;
    } else if (mode === "chat") {
      systemPrompt = `You are HealthVision AI, a friendly and knowledgeable health assistant chatbot. You help users with:
- General health questions and wellness tips
- Understanding medical terminology
- First aid guidance
- Nutrition and exercise advice
- Mental health support and stress management
- When to see a doctor

Be empathetic, clear, and concise. Always recommend consulting a healthcare professional for serious concerns. Use markdown formatting for readability.`;
    } else {
      throw new Error("Invalid mode. Use 'symptom-checker', 'medicine-info', or 'chat'");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
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
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("health-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
