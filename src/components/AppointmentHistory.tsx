import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Phone, User, Stethoscope, ChevronLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Appointment {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  medical_records?: string[];
}

interface AppointmentHistoryProps {
  onClose: () => void;
}

const AppointmentHistory = ({ onClose }: AppointmentHistoryProps) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("diagnoses")
          .select("*")
          .eq("user_id", user.id)
          .like("title", "Appointment:%")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setAppointments(data || []);
      } catch (error: any) {
        toast.error("Failed to fetch appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  const parseAppointmentDetails = (description: string) => {
    const lines = description.split('\n');
    const details: { [key: string]: string } = {};
    
    lines.forEach(line => {
      if (line.includes('Date:')) {
        details.date = line.replace('Date:', '').trim();
      } else if (line.includes('Time:')) {
        details.time = line.replace('Time:', '').trim();
      } else if (line.includes('Phone:')) {
        details.phone = line.replace('Phone:', '').trim();
      } else if (line.includes('at') && !line.includes('Date:')) {
        details.hospital = line.trim();
      }
    });

    return details;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <h1 className="text-lg font-bold text-foreground">Appointment History</h1>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {appointments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Appointments Yet</h2>
            <p className="text-muted-foreground mb-6">
              You haven't booked any appointments yet. Start by booking a doctor!
            </p>
            <Button onClick={onClose} className="bg-gradient-accent text-accent-foreground glow">
              Book a Doctor
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h2 className="text-2xl font-bold text-foreground mb-2">Your Appointments</h2>
              <p className="text-muted-foreground">
                {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} found
              </p>
            </motion.div>

            {appointments.map((appointment, index) => {
              const details = parseAppointmentDetails(appointment.description);
              const doctorName = appointment.title.replace('Appointment: ', '');
              
              return (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-card border-border/60 hover:border-primary/30 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-accent flex items-center justify-center">
                            <Stethoscope className="h-6 w-6 text-accent-foreground" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{doctorName}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(appointment.created_at)}
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          {details.date && (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span className="text-foreground">{details.date}</span>
                            </div>
                          )}
                          {details.time && (
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-primary" />
                              <span className="text-foreground">{details.time}</span>
                            </div>
                          )}
                          {details.hospital && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span className="text-foreground">{details.hospital}</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          {details.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-primary" />
                              <a href={`tel:${details.phone.replace(/\s/g, "")}`} className="text-primary hover:underline">
                                {details.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {appointment.medical_records && appointment.medical_records.length > 0 && (
                        <div className="border-t border-border/30 pt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">
                              Medical Records ({appointment.medical_records.length})
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {appointment.medical_records.map((record, idx) => (
                              <a
                                key={idx}
                                href={record}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs bg-secondary/30 px-2 py-1 rounded border border-border/40 text-primary hover:bg-secondary/50 transition-colors"
                              >
                                View Record {idx + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentHistory;
