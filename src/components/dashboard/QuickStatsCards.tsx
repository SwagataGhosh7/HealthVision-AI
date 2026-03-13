import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, HeartPulse, Activity, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface QuickStats {
  totalDiagnoses: number;
  lastHeartRate: number | null;
  lastBP: string | null;
  healthScore: number;
}

const QuickStatsCards = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<QuickStats>({
    totalDiagnoses: 0,
    lastHeartRate: null,
    lastBP: null,
    healthScore: 0,
  });

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      const [diagRes, vitalRes] = await Promise.all([
        supabase.from("diagnoses").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("vital_signs").select("*").eq("user_id", user.id).order("recorded_at", { ascending: false }).limit(1),
      ]);

      const totalDiagnoses = diagRes.count || 0;
      const lastVital = vitalRes.data?.[0];
      const lastHeartRate = lastVital?.heart_rate ?? null;
      const lastBP = lastVital?.blood_pressure_systolic && lastVital?.blood_pressure_diastolic
        ? `${lastVital.blood_pressure_systolic}/${lastVital.blood_pressure_diastolic}`
        : null;

      // Simple health score based on vitals
      let score = 75; // base
      if (lastHeartRate && lastHeartRate >= 60 && lastHeartRate <= 100) score += 10;
      if (lastVital?.oxygen_saturation && lastVital.oxygen_saturation >= 95) score += 10;
      if (lastVital?.blood_pressure_systolic && lastVital.blood_pressure_systolic < 140) score += 5;
      score = Math.min(score, 100);

      setStats({ totalDiagnoses, lastHeartRate, lastBP, healthScore: lastVital ? score : 0 });
    };

    fetchStats();
  }, [user]);

  const cards = [
    {
      icon: Brain,
      label: "Total Diagnoses",
      value: String(stats.totalDiagnoses),
      sub: "AI analyses completed",
      color: "text-primary",
    },
    {
      icon: HeartPulse,
      label: "Heart Rate",
      value: stats.lastHeartRate ? `${stats.lastHeartRate} bpm` : "—",
      sub: "Last recorded",
      color: "text-red-400",
    },
    {
      icon: Activity,
      label: "Blood Pressure",
      value: stats.lastBP || "—",
      sub: "Systolic / Diastolic",
      color: "text-blue-400",
    },
    {
      icon: Shield,
      label: "Health Score",
      value: stats.healthScore > 0 ? `${stats.healthScore}%` : "—",
      sub: "Based on vitals",
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-card border border-border/60 rounded-xl p-4 hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <card.icon className={`h-4 w-4 ${card.color}`} />
            <span className="text-xs text-muted-foreground">{card.label}</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{card.value}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{card.sub}</div>
        </motion.div>
      ))}
    </div>
  );
};

export default QuickStatsCards;
