import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HeartPulse, Thermometer, Wind, Droplets, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const VitalSignsPanel = () => {
  const { user } = useAuth();
  const [vitals, setVitals] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    heart_rate: "",
    blood_pressure_systolic: "",
    blood_pressure_diastolic: "",
    temperature: "",
    oxygen_saturation: "",
    respiratory_rate: "",
  });

  useEffect(() => {
    if (user) fetchVitals();
  }, [user]);

  const fetchVitals = async () => {
    const { data } = await supabase
      .from("vital_signs")
      .select("*")
      .eq("user_id", user!.id)
      .order("recorded_at", { ascending: true })
      .limit(50);
    if (data) setVitals(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase.from("vital_signs").insert({
      user_id: user.id,
      heart_rate: form.heart_rate ? parseInt(form.heart_rate) : null,
      blood_pressure_systolic: form.blood_pressure_systolic ? parseInt(form.blood_pressure_systolic) : null,
      blood_pressure_diastolic: form.blood_pressure_diastolic ? parseInt(form.blood_pressure_diastolic) : null,
      temperature: form.temperature ? parseFloat(form.temperature) : null,
      oxygen_saturation: form.oxygen_saturation ? parseFloat(form.oxygen_saturation) : null,
      respiratory_rate: form.respiratory_rate ? parseInt(form.respiratory_rate) : null,
    });

    if (error) {
      toast.error("Failed to save vital signs");
      return;
    }

    toast.success("Vital signs recorded!");
    setShowForm(false);
    setForm({ heart_rate: "", blood_pressure_systolic: "", blood_pressure_diastolic: "", temperature: "", oxygen_saturation: "", respiratory_rate: "" });
    fetchVitals();
  };

  const latestVitals = vitals.length > 0 ? vitals[vitals.length - 1] : null;

  const getHeartRateStatus = (hr: number) => {
    if (hr < 60) return { label: "Bradycardia", color: "text-yellow-400" };
    if (hr > 100) return { label: "Tachycardia", color: "text-red-400" };
    return { label: "Normal", color: "text-green-400" };
  };

  const getBPStatus = (sys: number, dia: number) => {
    if (sys >= 180 || dia >= 120) return { label: "Hypertensive Crisis", color: "text-red-400" };
    if (sys >= 140 || dia >= 90) return { label: "Hypertension", color: "text-orange-400" };
    if (sys < 90 || dia < 60) return { label: "Hypotension", color: "text-yellow-400" };
    return { label: "Normal", color: "text-green-400" };
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Vital Signs Monitor</h2>
        <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-accent text-accent-foreground glow">
          <Plus className="h-4 w-4 mr-2" /> Record Vitals
        </Button>
      </div>

      {showForm && (
        <Card className="bg-card border-border/60">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label className="text-foreground text-sm">Heart Rate (bpm)</Label>
                <Input type="number" placeholder="72" value={form.heart_rate} onChange={(e) => setForm({ ...form, heart_rate: e.target.value })} className="bg-secondary/30 border-border/60" />
              </div>
              <div>
                <Label className="text-foreground text-sm">Systolic BP (mmHg)</Label>
                <Input type="number" placeholder="120" value={form.blood_pressure_systolic} onChange={(e) => setForm({ ...form, blood_pressure_systolic: e.target.value })} className="bg-secondary/30 border-border/60" />
              </div>
              <div>
                <Label className="text-foreground text-sm">Diastolic BP (mmHg)</Label>
                <Input type="number" placeholder="80" value={form.blood_pressure_diastolic} onChange={(e) => setForm({ ...form, blood_pressure_diastolic: e.target.value })} className="bg-secondary/30 border-border/60" />
              </div>
              <div>
                <Label className="text-foreground text-sm">Temperature (°F)</Label>
                <Input type="number" step="0.1" placeholder="98.6" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} className="bg-secondary/30 border-border/60" />
              </div>
              <div>
                <Label className="text-foreground text-sm">SpO₂ (%)</Label>
                <Input type="number" step="0.1" placeholder="98" value={form.oxygen_saturation} onChange={(e) => setForm({ ...form, oxygen_saturation: e.target.value })} className="bg-secondary/30 border-border/60" />
              </div>
              <div>
                <Label className="text-foreground text-sm">Respiratory Rate</Label>
                <Input type="number" placeholder="16" value={form.respiratory_rate} onChange={(e) => setForm({ ...form, respiratory_rate: e.target.value })} className="bg-secondary/30 border-border/60" />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <Button type="submit" className="bg-gradient-accent text-accent-foreground glow">Save Vital Signs</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Current Vitals Cards */}
      {latestVitals && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {latestVitals.heart_rate && (
            <Card className="bg-card border-border/60">
              <CardContent className="pt-6 text-center">
                <HeartPulse className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-foreground">{latestVitals.heart_rate}</p>
                <p className="text-xs text-muted-foreground">BPM</p>
                <p className={`text-xs mt-1 font-medium ${getHeartRateStatus(latestVitals.heart_rate).color}`}>
                  {getHeartRateStatus(latestVitals.heart_rate).label}
                </p>
              </CardContent>
            </Card>
          )}
          {latestVitals.blood_pressure_systolic && (
            <Card className="bg-card border-border/60">
              <CardContent className="pt-6 text-center">
                <Droplets className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-foreground">
                  {latestVitals.blood_pressure_systolic}/{latestVitals.blood_pressure_diastolic}
                </p>
                <p className="text-xs text-muted-foreground">mmHg</p>
                <p className={`text-xs mt-1 font-medium ${getBPStatus(latestVitals.blood_pressure_systolic, latestVitals.blood_pressure_diastolic).color}`}>
                  {getBPStatus(latestVitals.blood_pressure_systolic, latestVitals.blood_pressure_diastolic).label}
                </p>
              </CardContent>
            </Card>
          )}
          {latestVitals.temperature && (
            <Card className="bg-card border-border/60">
              <CardContent className="pt-6 text-center">
                <Thermometer className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-foreground">{latestVitals.temperature}°F</p>
                <p className="text-xs text-muted-foreground">Temperature</p>
              </CardContent>
            </Card>
          )}
          {latestVitals.oxygen_saturation && (
            <Card className="bg-card border-border/60">
              <CardContent className="pt-6 text-center">
                <Wind className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-foreground">{latestVitals.oxygen_saturation}%</p>
                <p className="text-xs text-muted-foreground">SpO₂</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Heart Rate Chart */}
      {vitals.length > 0 && (() => {
        const heartRateData = vitals.filter(v => v.heart_rate);
        return heartRateData.length > 1 ? (
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle className="text-foreground text-lg">Heart Rate Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={heartRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 18%)" />
                  <XAxis
                    dataKey="recorded_at"
                    tickFormatter={(v) => new Date(v).toLocaleDateString()}
                    stroke="hsl(215 15% 55%)"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(215 15% 55%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: "hsl(220 25% 10%)", border: "1px solid hsl(220 20% 18%)", borderRadius: "8px" }}
                    labelStyle={{ color: "hsl(195 100% 95%)" }}
                  />
                  <Line type="monotone" dataKey="heart_rate" stroke="hsl(180 70% 45%)" strokeWidth={2} dot={{ fill: "hsl(180 70% 45%)" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card border-border/60">
            <CardContent className="py-8 text-center">
              <HeartPulse className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Record at least 2 heart rate readings to see the trend chart</p>
            </CardContent>
          </Card>
        );
      })()}
    </motion.div>
  );
};

export default VitalSignsPanel;
