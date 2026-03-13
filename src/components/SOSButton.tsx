import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, X, MapPin, AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SOSButton = () => {
  const [expanded, setExpanded] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const getLocation = () => {
    if (location) return;
    setLocating(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocating(false);
        toast.error("Could not get your location");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleExpand = () => {
    setExpanded(true);
    getLocation();
  };

  const emergencyNumbers = [
    { label: "Ambulance", number: "108", color: "bg-red-600" },
    { label: "Police", number: "100", color: "bg-blue-600" },
    { label: "Fire", number: "101", color: "bg-orange-600" },
    { label: "Emergency", number: "112", color: "bg-red-700" },
  ];

  const shareLocation = () => {
    if (!location) {
      toast.error("Location not available yet");
      return;
    }
    const url = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    if (navigator.share) {
      navigator.share({ title: "My Emergency Location", text: "I need help!", url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Location link copied to clipboard!");
    }
  };

  return (
    <>
      {/* SOS floating button */}
      <AnimatePresence>
        {!expanded && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExpand}
            className="fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full bg-red-600 text-white shadow-lg shadow-red-600/40 flex items-center justify-center hover:bg-red-700 transition-colors"
            aria-label="SOS Emergency"
          >
            <Phone className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded SOS panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-24 right-6 z-50 w-72 rounded-2xl bg-card border border-destructive/30 shadow-2xl shadow-red-900/20 overflow-hidden"
          >
            <div className="bg-red-600 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-white" />
                <span className="text-white font-bold text-sm">SOS EMERGENCY</span>
              </div>
              <button onClick={() => setExpanded(false)} className="text-white/80 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Location */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                {locating ? (
                  <span>Detecting location...</span>
                ) : location ? (
                  <span>{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
                ) : (
                  <span>Location unavailable</span>
                )}
              </div>

              {/* Emergency numbers */}
              <div className="grid grid-cols-2 gap-2">
                {emergencyNumbers.map(({ label, number, color }) => (
                  <a
                    key={number}
                    href={`tel:${number}`}
                    className={`${color} text-white rounded-lg p-2.5 text-center hover:opacity-90 transition-opacity`}
                  >
                    <div className="text-lg font-bold">{number}</div>
                    <div className="text-[10px] opacity-80">{label}</div>
                  </a>
                ))}
              </div>

              {/* Share location */}
              <Button
                onClick={shareLocation}
                variant="outline"
                size="sm"
                className="w-full border-destructive/30 text-foreground hover:bg-destructive/10"
                disabled={!location}
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Share My Location
              </Button>

              {/* Nearby hospitals link */}
              <Button
                onClick={() => { setExpanded(false); window.location.href = "/nearby"; }}
                variant="ghost"
                size="sm"
                className="w-full text-primary text-xs"
              >
                <MapPin className="h-3.5 w-3.5 mr-1.5" />
                Find Nearest Hospital
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SOSButton;
