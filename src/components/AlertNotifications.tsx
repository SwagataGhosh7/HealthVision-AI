import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Bell, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info" | "success";
  title: string;
  message: string;
  timestamp: Date;
}

const AlertNotifications = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Check for high/critical severity diagnoses
    const checkAlerts = async () => {
      const { data } = await supabase
        .from("diagnoses")
        .select("*")
        .eq("user_id", user.id)
        .in("severity", ["high", "critical"])
        .order("created_at", { ascending: false })
        .limit(10);

      if (data && data.length > 0) {
        const newAlerts: Alert[] = data.map((d) => ({
          id: d.id,
          type: d.severity === "critical" ? "critical" : "warning",
          title: d.severity === "critical" ? "Critical Diagnosis Alert" : "High Severity Alert",
          message: `${d.title}: ${typeof d.analysis_result === "string" ? d.analysis_result : "Requires immediate medical attention."}`,
          timestamp: new Date(d.created_at),
        }));
        setAlerts(newAlerts);
        setUnread(newAlerts.length);
      }
    };

    checkAlerts();

    // Check vitals for abnormalities
    const checkVitals = async () => {
      const { data } = await supabase
        .from("vital_signs")
        .select("*")
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        const vitalAlerts: Alert[] = [];
        if (data.heart_rate && (data.heart_rate > 120 || data.heart_rate < 50)) {
          vitalAlerts.push({
            id: `hr-${data.id}`,
            type: "critical",
            title: "Abnormal Heart Rate",
            message: `Heart rate of ${data.heart_rate} BPM detected. ${data.heart_rate > 120 ? "Tachycardia" : "Bradycardia"} — consult a doctor immediately.`,
            timestamp: new Date(data.recorded_at),
          });
        }
        if (data.oxygen_saturation && data.oxygen_saturation < 92) {
          vitalAlerts.push({
            id: `o2-${data.id}`,
            type: "critical",
            title: "Low Oxygen Saturation",
            message: `SpO2 at ${data.oxygen_saturation}%. This is dangerously low. Seek emergency care.`,
            timestamp: new Date(data.recorded_at),
          });
        }
        if (data.blood_pressure_systolic && data.blood_pressure_systolic > 180) {
          vitalAlerts.push({
            id: `bp-${data.id}`,
            type: "warning",
            title: "Hypertensive Crisis",
            message: `Blood pressure ${data.blood_pressure_systolic}/${data.blood_pressure_diastolic} mmHg. Consult a doctor.`,
            timestamp: new Date(data.recorded_at),
          });
        }
        if (vitalAlerts.length > 0) {
          setAlerts((prev) => [...vitalAlerts, ...prev]);
          setUnread((prev) => prev + vitalAlerts.length);
        }
      }
    };

    checkVitals();
  }, [user]);

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    setUnread((prev) => Math.max(0, prev - 1));
  };

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "critical": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info": return <Info className="h-4 w-4 text-primary" />;
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getAlertBorder = (type: Alert["type"]) => {
    switch (type) {
      case "critical": return "border-l-destructive";
      case "warning": return "border-l-yellow-500";
      case "info": return "border-l-primary";
      case "success": return "border-l-green-500";
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Bell icon for navbar - positioned fixed */}
      <motion.button
        onClick={() => { setShowPanel(!showPanel); setUnread(0); }}
        className="fixed top-4 right-20 z-[60] h-10 w-10 rounded-full bg-card border border-border/60 flex items-center justify-center hover:bg-secondary/50 transition-colors"
      >
        <Bell className="h-4 w-4 text-foreground" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </motion.button>

      {/* Notification panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 right-4 z-[60] w-96 max-w-[calc(100vw-2rem)] bg-card border border-border/60 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowPanel(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="py-8 text-center">
                  <CheckCircle className="h-8 w-8 text-primary/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">All clear! No alerts.</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`px-4 py-3 border-b border-border/30 border-l-4 ${getAlertBorder(alert.type)} hover:bg-secondary/20 transition-colors`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{alert.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{alert.message}</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          {alert.timestamp.toLocaleDateString()} {alert.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => dismissAlert(alert.id)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AlertNotifications;
