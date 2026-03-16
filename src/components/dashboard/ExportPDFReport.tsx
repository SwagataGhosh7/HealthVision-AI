import { useState } from "react";
import { Download, FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ExportPDFReport = () => {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);

  const generatePDF = async () => {
    if (!user) return;
    setExporting(true);

    try {
      const [{ data: diagnoses }, { data: vitals }, { data: profile }] = await Promise.all([
        supabase
          .from("diagnoses")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("vital_signs")
          .select("*")
          .eq("user_id", user.id)
          .order("recorded_at", { ascending: false })
          .limit(50),
        supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("HealthVision AI", 14, 18);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Medical Records Report", 14, 26);
      doc.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 33);

      let y = 50;

      // Patient Info
      if (profile) {
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Patient Information", 14, y);
        y += 8;

        const patientData = [
          ["Name", profile.full_name || "N/A"],
          ["Date of Birth", profile.date_of_birth || "N/A"],
          ["Gender", profile.gender || "N/A"],
          ["Blood Type", profile.blood_type || "N/A"],
          ["Allergies", profile.allergies?.join(", ") || "None"],
          ["Medical Conditions", profile.medical_conditions?.join(", ") || "None"],
          ["Emergency Contact", profile.emergency_contact || "N/A"],
        ];

        autoTable(doc, {
          startY: y,
          head: [],
          body: patientData,
          theme: "grid",
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: {
            0: { fontStyle: "bold", cellWidth: 45, fillColor: [241, 245, 249] },
            1: { cellWidth: 140 },
          },
        });

        y = (doc as any).lastAutoTable.finalY + 12;
      }

      // Diagnosis History
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Diagnosis History", 14, y);
      y += 4;

      if (diagnoses && diagnoses.length > 0) {
        const diagData = diagnoses.map((d) => [
          new Date(d.created_at).toLocaleDateString(),
          d.title,
          d.severity?.toUpperCase() || "N/A",
          d.status,
          typeof d.analysis_result === "string"
            ? d.analysis_result.substring(0, 80) + "..."
            : d.analysis_result
            ? JSON.stringify(d.analysis_result).substring(0, 80) + "..."
            : "N/A",
        ]);

        autoTable(doc, {
          startY: y,
          head: [["Date", "Report", "Severity", "Status", "Analysis Summary"]],
          body: diagData,
          theme: "striped",
          styles: { fontSize: 8, cellPadding: 2.5 },
          headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
          columnStyles: {
            0: { cellWidth: 22 },
            1: { cellWidth: 30 },
            2: { cellWidth: 20 },
            3: { cellWidth: 20 },
            4: { cellWidth: 90 },
          },
        });

        y = (doc as any).lastAutoTable.finalY + 12;
      } else {
        y += 6;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("No diagnoses recorded.", 14, y);
        y += 12;
      }

      // Vital Signs
      if (y > 240) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Vital Signs History", 14, y);
      y += 4;

      if (vitals && vitals.length > 0) {
        const vitalsData = vitals.map((v) => [
          new Date(v.recorded_at).toLocaleDateString(),
          v.heart_rate ? `${v.heart_rate} bpm` : "-",
          v.blood_pressure_systolic && v.blood_pressure_diastolic
            ? `${v.blood_pressure_systolic}/${v.blood_pressure_diastolic}`
            : "-",
          v.oxygen_saturation ? `${v.oxygen_saturation}%` : "-",
          v.temperature ? `${v.temperature}°C` : "-",
          v.respiratory_rate ? `${v.respiratory_rate}/min` : "-",
        ]);

        autoTable(doc, {
          startY: y,
          head: [["Date", "Heart Rate", "Blood Pressure", "SpO2", "Temp", "Resp Rate"]],
          body: vitalsData,
          theme: "striped",
          styles: { fontSize: 8, cellPadding: 2.5 },
          headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
        });

        y = (doc as any).lastAutoTable.finalY + 12;
      } else {
        y += 6;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("No vital signs recorded.", 14, y);
        y += 12;
      }

      // Recommendations summary
      const recsFromDiagnoses = diagnoses
        ?.filter((d) => d.recommendations?.length)
        .flatMap((d) =>
          (d.recommendations as string[]).map((r) => [
            new Date(d.created_at).toLocaleDateString(),
            d.title,
            r,
          ])
        );

      if (recsFromDiagnoses && recsFromDiagnoses.length > 0) {
        if (y > 240) {
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("All Recommendations", 14, y);
        y += 4;

        autoTable(doc, {
          startY: y,
          head: [["Date", "Report", "Recommendation"]],
          body: recsFromDiagnoses,
          theme: "striped",
          styles: { fontSize: 8, cellPadding: 2.5 },
          headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
          columnStyles: {
            0: { cellWidth: 22 },
            1: { cellWidth: 30 },
            2: { cellWidth: 130 },
          },
        });
      }

      // Footer on each page
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(
          "⚠ This report is AI-generated. Consult a healthcare professional for medical decisions.",
          14,
          doc.internal.pageSize.getHeight() - 10
        );
        doc.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - 30,
          doc.internal.pageSize.getHeight() - 10
        );
      }

      doc.save(`HealthVision_Report_${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("PDF report downloaded!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate PDF");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card className="bg-card border-border/60">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <FileDown className="h-5 w-5 text-primary" />
          Export Medical Records
        </CardTitle>
        <CardDescription>
          Download a comprehensive PDF report of your diagnosis history, vital signs, and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-border/60 p-6 text-center space-y-3">
          <Download className="h-12 w-12 text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">
            Your report will include patient info, all diagnoses with severity levels,
            vital signs history, and AI recommendations.
          </p>
        </div>
        <Button
          onClick={generatePDF}
          disabled={exporting}
          className="w-full bg-gradient-accent text-accent-foreground glow hover:opacity-90"
        >
          {exporting ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating PDF...</>
          ) : (
            <><Download className="h-4 w-4 mr-2" /> Download PDF Report</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExportPDFReport;
