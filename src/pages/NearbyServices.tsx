import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Activity, MapPin, Phone, Star, Navigation, Loader2,
  Ambulance, Pill, ArrowLeft, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Place {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number | null;
  totalRatings: number;
  isOpen: boolean | null;
  type: "hospital" | "pharmacy";
}

const NearbyServices = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState<"hospital" | "pharmacy">("hospital");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setLocationError(`Location access denied: ${err.message}`),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Load Google Maps script
  useEffect(() => {
    if (document.getElementById("google-maps-script")) {
      setMapLoaded(true);
      return;
    }
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    // We'll load the maps script with the key from a meta tag or just use a basic map
    // Since the API key is server-side, we'll use an iframe approach
    setMapLoaded(true);
  }, []);

  const fetchPlaces = useCallback(async () => {
    if (!location) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("nearby-places", {
        body: { latitude: location.lat, longitude: location.lng, type: activeType },
      });
      if (error) throw error;
      setPlaces(data.places || []);
      if ((data.places || []).length === 0) {
        toast.info("No results found nearby. Try expanding your search area.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch nearby places");
    } finally {
      setLoading(false);
    }
  }, [location, activeType]);

  useEffect(() => {
    if (location) fetchPlaces();
  }, [location, activeType, fetchPlaces]);

  const getDirectionsUrl = (place: Place) =>
    `https://www.google.com/maps/dir/?api=1&origin=${location?.lat},${location?.lng}&destination=${place.latitude},${place.longitude}&travelmode=driving`;

  const getMapEmbedUrl = () => {
    if (!location) return "";
    const q = activeType === "hospital" ? "ambulance+emergency+hospital" : "pharmacy+drugstore";
    return `https://www.google.com/maps/embed/v1/search?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${q}&center=${location.lat},${location.lng}&zoom=14`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="h-9 w-9 rounded-lg bg-gradient-accent flex items-center justify-center glow">
              <Activity className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">
              HealthVision <span className="text-gradient">AI</span>
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Nearby Emergency Services
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            Find the nearest ambulance services and pharmacies in real-time using GPS
          </p>
        </motion.div>

        {/* Type Toggle */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "hospital" as const, icon: Ambulance, label: "Ambulance & Hospitals" },
            { id: "pharmacy" as const, icon: Pill, label: "Pharmacies" },
          ].map(({ id, icon: Icon, label }) => (
            <Button
              key={id}
              variant={activeType === id ? "default" : "outline"}
              onClick={() => setActiveType(id)}
              className={activeType === id
                ? "bg-gradient-accent text-accent-foreground glow"
                : "border-border/60 text-muted-foreground"
              }
            >
              <Icon className="h-4 w-4 mr-2" /> {label}
            </Button>
          ))}
          <Button variant="outline" size="icon" onClick={fetchPlaces} disabled={loading || !location}
            className="border-border/60 text-muted-foreground ml-auto">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {locationError ? (
          <Card className="bg-card border-border/60">
            <CardContent className="py-12 text-center">
              <MapPin className="h-12 w-12 text-destructive mx-auto mb-3" />
              <p className="text-foreground font-medium">Location Access Required</p>
              <p className="text-muted-foreground text-sm mt-1">{locationError}</p>
              <p className="text-muted-foreground text-xs mt-2">
                Please enable location permissions in your browser settings and refresh.
              </p>
            </CardContent>
          </Card>
        ) : !location ? (
          <Card className="bg-card border-border/60">
            <CardContent className="py-12 text-center">
              <Loader2 className="h-12 w-12 text-primary mx-auto mb-3 animate-spin" />
              <p className="text-foreground font-medium">Getting your location...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Map */}
            <motion.div className="lg:col-span-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="bg-card border-border/60 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-foreground text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Live Map — {activeType === "hospital" ? "Ambulance & Hospitals" : "Pharmacies"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <iframe
                    className="w-full h-[450px] border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={getMapEmbedUrl()}
                    allowFullScreen
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* List */}
            <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="bg-card border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-foreground text-sm flex items-center gap-2">
                    {activeType === "hospital" ? (
                      <Ambulance className="h-4 w-4 text-primary" />
                    ) : (
                      <Pill className="h-4 w-4 text-primary" />
                    )}
                    {loading ? "Searching..." : `${places.length} Found Nearby`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[420px] overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 text-primary mx-auto animate-spin" />
                    </div>
                  ) : places.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">
                      No {activeType === "hospital" ? "ambulance services" : "pharmacies"} found nearby.
                    </p>
                  ) : (
                    places.map((place) => (
                      <div
                        key={place.id}
                        className="p-3 rounded-lg bg-secondary/30 border border-border/40 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="text-foreground text-sm font-medium truncate">
                              {place.name}
                            </h4>
                            <p className="text-muted-foreground text-xs mt-0.5 truncate">
                              {place.address}
                            </p>
                          </div>
                          {place.isOpen !== null && (
                            <Badge
                              variant={place.isOpen ? "default" : "secondary"}
                              className={place.isOpen
                                ? "bg-green-500/10 text-green-400 border-green-500/30 shrink-0"
                                : "bg-muted text-muted-foreground shrink-0"
                              }
                            >
                              {place.isOpen ? "Open" : "Closed"}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          {place.rating && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                              {place.rating} ({place.totalRatings})
                            </span>
                          )}
                          <a
                            href={getDirectionsUrl(place)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto"
                          >
                            <Button size="sm" variant="outline" className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10">
                              <Navigation className="h-3 w-3 mr-1" /> Directions
                            </Button>
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyServices;
