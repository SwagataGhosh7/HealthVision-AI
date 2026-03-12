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
    const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error("GOOGLE_MAPS_API_KEY is not configured");
    }

    const { latitude, longitude, type } = await req.json();

    if (!latitude || !longitude || !type) {
      throw new Error("latitude, longitude, and type are required");
    }

    const validTypes = ["hospital", "pharmacy", "ambulance"];
    if (!validTypes.includes(type)) {
      throw new Error("type must be 'hospital', 'pharmacy', or 'ambulance'");
    }

    const placeType = type === "ambulance" ? "hospital" : type;
    const keyword = type === "ambulance" ? "ambulance emergency" : type === "hospital" ? "hospital clinic" : "pharmacy drugstore chemist";
    const radius = 10000;

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${placeType}&keyword=${encodeURIComponent(keyword)}&key=${GOOGLE_MAPS_API_KEY}`;

    console.log("Fetching places from Google API for type:", type);
    const response = await fetch(url);
    const data = await response.json();

    console.log("Google Places API status:", data.status, "Results:", data.results?.length || 0);

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Google Places API error:", JSON.stringify(data));
      throw new Error(`Google Places API error: ${data.status} - ${data.error_message || "Unknown error"}`);
    }

    const places = (data.results || []).map((place: any) => ({
      id: place.place_id,
      name: place.name,
      address: place.vicinity || place.formatted_address || "Address unavailable",
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      rating: place.rating || null,
      totalRatings: place.user_ratings_total || 0,
      isOpen: place.opening_hours?.open_now ?? null,
      type,
    }));

    return new Response(JSON.stringify({ places }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("nearby-places error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
