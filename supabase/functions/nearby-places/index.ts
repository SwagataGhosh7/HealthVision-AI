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
    const { latitude, longitude, type } = await req.json();

    if (!latitude || !longitude || !type) {
      throw new Error("latitude, longitude, and type are required");
    }

    const validTypes = ["hospital", "pharmacy", "ambulance"];
    if (!validTypes.includes(type)) {
      throw new Error("type must be 'hospital', 'pharmacy', or 'ambulance'");
    }

    // Use Overpass API (OpenStreetMap) - completely free, no API key needed
    const radius = 15000; // 15km for better results
    let query = "";

    if (type === "hospital") {
      query = `[out:json][timeout:60];(node["amenity"="hospital"](around:${radius},${latitude},${longitude});node["amenity"="clinic"](around:${radius},${latitude},${longitude});way["amenity"="hospital"](around:${radius},${latitude},${longitude});way["amenity"="clinic"](around:${radius},${latitude},${longitude}););out center 25;`;
    } else if (type === "pharmacy") {
      query = `[out:json][timeout:60];(node["amenity"="pharmacy"](around:${radius},${latitude},${longitude});node["shop"="chemist"](around:${radius},${latitude},${longitude});way["amenity"="pharmacy"](around:${radius},${latitude},${longitude}););out center 25;`;
    } else {
      query = `[out:json][timeout:60];(node["emergency"="ambulance_station"](around:${radius},${latitude},${longitude});node["amenity"="hospital"]["emergency"="yes"](around:${radius},${latitude},${longitude});way["emergency"="ambulance_station"](around:${radius},${latitude},${longitude});way["amenity"="hospital"]["emergency"="yes"](around:${radius},${latitude},${longitude}););out center 25;`;
    }

    console.log("Querying Overpass API for type:", type);
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Overpass results:", data.elements?.length || 0);

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const places = (data.elements || [])
      .map((el: any) => {
        const lat = el.lat || el.center?.lat;
        const lon = el.lon || el.center?.lon;
        if (!lat || !lon) return null;
        const name = el.tags?.name || el.tags?.["name:en"] || `${type.charAt(0).toUpperCase() + type.slice(1)}`;
        const address = [el.tags?.["addr:street"], el.tags?.["addr:city"], el.tags?.["addr:postcode"]].filter(Boolean).join(", ") || "Address not available";
        const distance = haversine(latitude, longitude, lat, lon);

        return {
          id: String(el.id),
          name,
          address,
          latitude: lat,
          longitude: lon,
          rating: null,
          totalRatings: 0,
          isOpen: null,
          type,
          distance: Math.round(distance * 10) / 10,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.distance - b.distance);

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
