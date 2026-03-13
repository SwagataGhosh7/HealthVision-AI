import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowLeft, Save, User, Heart, ShieldAlert, Droplets, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const ProfileSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "",
    blood_type: "",
    emergency_contact: "",
    allergies: "",
    medical_conditions: "",
  });

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (data) {
      setForm({
        full_name: data.full_name || "",
        date_of_birth: data.date_of_birth || "",
        gender: data.gender || "",
        blood_type: data.blood_type || "",
        emergency_contact: data.emergency_contact || "",
        allergies: (data.allergies || []).join(", "),
        medical_conditions: (data.medical_conditions || []).join(", "),
      });
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const payload = {
      user_id: user.id,
      full_name: form.full_name || null,
      date_of_birth: form.date_of_birth || null,
      gender: form.gender || null,
      blood_type: form.blood_type || null,
      emergency_contact: form.emergency_contact || null,
      allergies: form.allergies ? form.allergies.split(",").map(s => s.trim()).filter(Boolean) : null,
      medical_conditions: form.medical_conditions ? form.medical_conditions.split(",").map(s => s.trim()).filter(Boolean) : null,
    };

    // Check if profile exists
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    let error;
    if (existing) {
      ({ error } = await supabase.from("profiles").update(payload).eq("user_id", user.id));
    } else {
      ({ error } = await supabase.from("profiles").insert(payload));
    }

    if (error) {
      toast.error("Failed to save profile");
      console.error(error);
    } else {
      toast.success("Profile updated successfully!");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

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
            <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground mb-1">Profile Settings</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Manage your personal and medical information
          </p>
        </motion.div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Personal Info */}
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" /> Personal Information
              </CardTitle>
              <CardDescription>Your basic personal details</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground text-sm">Full Name</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="John Doe" className="mt-1 bg-secondary/30 border-border/60" />
              </div>
              <div>
                <Label className="text-foreground text-sm">Date of Birth</Label>
                <Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} className="mt-1 bg-secondary/30 border-border/60" />
              </div>
              <div>
                <Label className="text-foreground text-sm">Gender</Label>
                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                  <SelectTrigger className="mt-1 bg-secondary/30 border-border/60">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-foreground text-sm">Email</Label>
                <Input value={user?.email || ""} disabled className="mt-1 bg-secondary/30 border-border/60 opacity-60" />
              </div>
            </CardContent>
          </Card>

          {/* Medical Info */}
          <Card className="bg-card border-border/60">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2 text-lg">
                <Heart className="h-5 w-5 text-primary" /> Medical Information
              </CardTitle>
              <CardDescription>Important health details for better diagnostics</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground text-sm flex items-center gap-1">
                  <Droplets className="h-3 w-3" /> Blood Type
                </Label>
                <Select value={form.blood_type} onValueChange={(v) => setForm({ ...form, blood_type: v })}>
                  <SelectTrigger className="mt-1 bg-secondary/30 border-border/60">
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodTypes.map(bt => (
                      <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-foreground text-sm flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3" /> Emergency Contact
                </Label>
                <Input value={form.emergency_contact} onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })} placeholder="+91 9876543210" className="mt-1 bg-secondary/30 border-border/60" />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-foreground text-sm">Allergies (comma-separated)</Label>
                <Input value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder="Penicillin, Peanuts, Dust" className="mt-1 bg-secondary/30 border-border/60" />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-foreground text-sm">Medical Conditions (comma-separated)</Label>
                <Input value={form.medical_conditions} onChange={(e) => setForm({ ...form, medical_conditions: e.target.value })} placeholder="Diabetes, Asthma, Hypertension" className="mt-1 bg-secondary/30 border-border/60" />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={saving} className="w-full bg-gradient-accent text-accent-foreground glow hover:opacity-90">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
