import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Activity, MapPin, Navigation, Loader2,
  Ambulance, Pill, ArrowLeft, RefreshCw, Hospital, LocateFixed,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  type: "hospital" | "pharmacy" | "ambulance";
  distance?: number;
}

type ServiceType = "hospital" | "pharmacy" | "ambulance";

const NearbyServices = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeType, setActiveType] = useState<ServiceType>("hospital");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [manualAddress, setManualAddress] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);

  const fetchPlaces = useCallback(async (lat: number, lng: number, type: ServiceType) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("nearby-places", {
        body: { latitude: lat, longitude: lng, type },
      });
      if (error) throw error;
      setPlaces(data.places || []);
      if ((data.places || []).length === 0) {
        toast.info(t('nearbyServices.noResultsNearby'));
      }
    } catch (err: any) {
      console.error("Fetch places error:", err);
      toast.error(t('nearbyServices.failedToFetchPlaces'));
    } finally {
      setLoading(false);
    }
  }, []);

  const getGPSLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(t('nearbyServices.geolocationNotSupported'));
      toast.error(t('nearbyServices.geolocationNotSupported'));
      return;
    }
    setGettingLocation(true);
    setLocationError(null);
    
    // Try high accuracy first (mobile GPS)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
        setGettingLocation(false);
        toast.success(`Location detected! (${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)})`);
        fetchPlaces(loc.lat, loc.lng, activeType);
      },
      (err) => {
        console.error("GPS error:", err);
        
        // Try fallback with lower accuracy
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setLocation(loc);
            setGettingLocation(false);
            toast.success(t('nearbyServices.locationDetected', { lat: loc.lat.toFixed(4), lng: loc.lng.toFixed(4) }));
            fetchPlaces(loc.lat, loc.lng, activeType);
          },
          (fallbackErr) => {
            let errorMsg = t('nearbyServices.locationAccessDenied');
            switch (err.code) {
              case err.PERMISSION_DENIED:
                errorMsg = t('nearbyServices.locationPermissionDenied');
                break;
              case err.POSITION_UNAVAILABLE:
                errorMsg = t('nearbyServices.locationUnavailable');
                break;
              case err.TIMEOUT:
                errorMsg = t('nearbyServices.locationTimeout');
                break;
              default:
                errorMsg = t('nearbyServices.locationError', { message: err.message });
            }
            setLocationError(errorMsg);
            setGettingLocation(false);
            toast.error(errorMsg);
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 } // 5 min cache
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 } // 1 min cache for high accuracy
    );
  };

  const handleManualSearch = async () => {
    if (!manualAddress.trim()) {
      toast.error(t('nearbyServices.enterLocation'));
      return;
    }
    setLoading(true);
    setLocationError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualAddress)}&limit=1`
      );
      const results = await res.json();
      if (!results.length) {
        toast.error(t('nearbyServices.locationNotFound'));
        setLoading(false);
        return;
      }
      const loc = { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
      setLocation(loc);
      toast.success(t('nearbyServices.found', { location: results[0].display_name.split(",").slice(0, 2).join(",") }));
      fetchPlaces(loc.lat, loc.lng, activeType);
    } catch {
      toast.error(t('nearbyServices.failedToGeocode'));
      setLoading(false);
    }
  };

  const handleTypeChange = (type: ServiceType) => {
    setActiveType(type);
    if (location) fetchPlaces(location.lat, location.lng, type);
  };

  const getDirectionsUrl = (place: Place) =>
    `https://www.google.com/maps/dir/?api=1&origin=${location?.lat},${location?.lng}&destination=${place.latitude},${place.longitude}&travelmode=driving`;

  const getOSMMapUrl = () => {
    if (!location) return "";
    return `https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.08},${location.lat - 0.06},${location.lng + 0.08},${location.lat + 0.06}&layer=mapnik&marker=${location.lat},${location.lng}`;
  };

  const serviceOptions = [
    { id: "hospital" as const, icon: Hospital, label: t('nearbyServices.hospitals') },
    { id: "ambulance" as const, icon: Ambulance, label: t('nearbyServices.ambulance') },
    { id: "pharmacy" as const, icon: Pill, label: t('nearbyServices.pharmacies') },
  ];

  return (
    <div className="min-h-screen bg-background">
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
            <ArrowLeft className="h-4 w-4 mr-1" /> {t('nearbyServices.backToDashboard')}
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground mb-1">{t('nearbyServices.title')}</h1>
          <p className="text-muted-foreground text-sm mb-6">
            {t('nearbyServices.description')}
          </p>
        </motion.div>

        <Card className="bg-card border-border/60 mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={getGPSLocation} 
                disabled={gettingLocation || loading} 
                className="bg-gradient-accent text-accent-foreground glow hover:opacity-90"
                title={t('nearbyServices.useCurrentLocation')}
              >
                {gettingLocation ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('nearbyServices.gettingLocation')}
                  </>
                ) : (
                  <>
                    <LocateFixed className="h-4 w-4 mr-2" />
                    {t('nearbyServices.useCurrentLocation')}
                  </>
                )}
              </Button>
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder={t('nearbyServices.locationPlaceholder')}
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                  className="bg-secondary/30 border-border/60"
                />
                <Button variant="outline" onClick={handleManualSearch} disabled={loading} className="border-border/60" title="Search for this address">
                  <MapPin className="h-4 w-4 mr-1" /> {t('nearbyServices.search')}
                </Button>
              </div>
            </div>
            {locationError && <p className="text-destructive text-xs mt-2">{locationError}</p>}
            {location && (
              <p className="text-primary text-xs mt-2">
                {t('nearbyServices.locationSet', { lat: location.lat.toFixed(4), lng: location.lng.toFixed(4) })}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-2 mb-6">
          {serviceOptions.map(({ id, icon: Icon, label }) => (
            <Button
              key={id}
              variant={activeType === id ? "default" : "outline"}
              onClick={() => handleTypeChange(id)}
              className={activeType === id
                ? "bg-gradient-accent text-accent-foreground glow"
                : "border-border/60 text-muted-foreground"
              }
            >
              <Icon className="h-4 w-4 mr-2" /> {label}
            </Button>
          ))}
          <Button
            variant="outline" size="icon"
            onClick={() => location && fetchPlaces(location.lat, location.lng, activeType)}
            disabled={loading || !location}
            className="border-border/60 text-muted-foreground ml-auto"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {!location ? (
          <Card className="bg-card border-border/60">
            <CardContent className="py-12 text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground font-medium">{t('nearbyServices.setYourLocation')}</p>
              <p className="text-muted-foreground text-sm mt-1">
                {t('nearbyServices.setLocationDescription')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-5 gap-6">
            <motion.div className="lg:col-span-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="bg-card border-border/60 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-foreground text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {t('nearbyServices.liveMap')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <iframe
                    className="w-full h-[450px] border-0"
                    loading="lazy"
                    src={getOSMMapUrl()}
                    allowFullScreen
                    title="Interactive map showing nearby medical services"
                  />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="bg-card border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-foreground text-sm flex items-center gap-2">
                    {serviceOptions.find(s => s.id === activeType) &&
                      (() => { const S = serviceOptions.find(s => s.id === activeType)!; return <S.icon className="h-4 w-4 text-primary" />; })()
                    }
                    {loading ? t('nearbyServices.searching') : `${places.length} ${t('nearbyServices.foundNearby')}`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[420px] overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 text-primary mx-auto animate-spin" />
                    </div>
                  ) : places.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">
                      {t('nearbyServices.noResults')}
                    </p>
                  ) : (
                    places.map((place) => (
                      <div
                        key={place.id}
                        className="p-3 rounded-lg bg-secondary/30 border border-border/40 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="text-foreground text-sm font-medium truncate">{place.name}</h4>
                            <p className="text-muted-foreground text-xs mt-0.5 truncate">{place.address}</p>
                          </div>
                          {place.distance != null && (
                            <span className="text-xs text-primary shrink-0 font-medium">
                              {place.distance} km
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <a href={getDirectionsUrl(place)} target="_blank" rel="noopener noreferrer" className="ml-auto">
                            <Button size="sm" variant="outline" className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10">
                              <Navigation className="h-3 w-3 mr-1" /> {t('nearbyServices.directions')}
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
