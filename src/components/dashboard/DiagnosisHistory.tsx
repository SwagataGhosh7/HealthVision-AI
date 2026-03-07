import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, AlertTriangle, CheckCircle, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DiagnosisHistory = () => {
  const { user } = useAuth();
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchDiagnoses();
  }, [user]);

  const fetchDiagnoses = async () => {
    const { data } = await supabase
      .from("diagnoses")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    if (data) setDiagnoses(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("diagnoses").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
      return;
    }
    setDiagnoses((prev) => prev.filter((d) => d.id !== id));
    toast.success("Diagnosis deleted");
  };

  const severityColors: Record<string, string> = {
    low: "text-green-400 bg-green-400/10",
    moderate: "text-yellow-400 bg-yellow-400/10",
    high: "text-orange-400 bg-orange-400/10",
    critical: "text-red-400 bg-red-400/10",
  };

  const statusIcons: Record<string, any> = {
    pending: <Clock className="h-4 w-4 text-muted-foreground" />,
    analyzing: <Clock className="h-4 w-4 text-primary animate-pulse" />,
    completed: <CheckCircle className="h-4 w-4 text-green-400" />,
    error: <AlertTriangle className="h-4 w-4 text-red-400" />,
  };

  if (loading) return <p className="text-muted-foreground text-center py-12">Loading...</p>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Diagnosis History</h2>

      {diagnoses.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No diagnoses yet. Upload a medical report to get started.</p>
        </div>
      ) : (
        diagnoses.map((d) => (
          <Card key={d.id} className="bg-card border-border/60">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {statusIcons[d.status]}
                    <h3 className="text-foreground font-medium">{d.title}</h3>
                    {d.severity && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityColors[d.severity]}`}>
                        {d.severity.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {new Date(d.created_at).toLocaleDateString()} at {new Date(d.created_at).toLocaleTimeString()}
                  </p>
                  {d.analysis_result && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {typeof d.analysis_result === "string" ? d.analysis_result : JSON.stringify(d.analysis_result)}
                    </p>
                  )}
                  {d.recommendations?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-primary font-medium">Recommendations:</p>
                      <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                        {d.recommendations.slice(0, 3).map((r: string, i: number) => (
                          <li key={i}>• {r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)} className="text-muted-foreground hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </motion.div>
  );
};

export default DiagnosisHistory;
