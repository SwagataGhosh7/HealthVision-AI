import { useState } from "react";
import { motion } from "framer-motion";
import {
  Activity, ArrowLeft, Phone, Calendar, Clock, MapPin, Star,
  Search, CheckCircle, User, Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  hospital: string;
  rating: number;
  experience: string;
  available: boolean;
  fee: string;
  availableSlots: string[];
}

const MOCK_DOCTORS: Doctor[] = [
  { id: "1", name: "Dr. Priya Sharma", specialty: "General Physician", phone: "+91 98765 43210", hospital: "Apollo Hospital, Delhi", rating: 4.8, experience: "15 years", available: true, fee: "₹500", availableSlots: ["10:00 AM", "11:30 AM", "2:00 PM", "4:30 PM"] },
  { id: "2", name: "Dr. Rajesh Kumar", specialty: "Cardiologist", phone: "+91 87654 32109", hospital: "AIIMS, New Delhi", rating: 4.9, experience: "20 years", available: true, fee: "₹1,200", availableSlots: ["9:00 AM", "12:00 PM", "3:00 PM"] },
  { id: "3", name: "Dr. Ananya Patel", specialty: "Dermatologist", phone: "+91 76543 21098", hospital: "Max Hospital, Mumbai", rating: 4.7, experience: "10 years", available: true, fee: "₹800", availableSlots: ["10:30 AM", "1:00 PM", "3:30 PM", "5:00 PM"] },
  { id: "4", name: "Dr. Vikram Singh", specialty: "Orthopedic Surgeon", phone: "+91 65432 10987", hospital: "Fortis Hospital, Bangalore", rating: 4.6, experience: "18 years", available: false, fee: "₹1,500", availableSlots: [] },
  { id: "5", name: "Dr. Meera Nair", specialty: "Pediatrician", phone: "+91 54321 09876", hospital: "Manipal Hospital, Chennai", rating: 4.9, experience: "12 years", available: true, fee: "₹600", availableSlots: ["9:30 AM", "11:00 AM", "2:30 PM"] },
  { id: "6", name: "Dr. Arjun Reddy", specialty: "Neurologist", phone: "+91 43210 98765", hospital: "Narayana Health, Hyderabad", rating: 4.8, experience: "22 years", available: true, fee: "₹1,800", availableSlots: ["10:00 AM", "1:00 PM"] },
  { id: "7", name: "Dr. Sunita Devi", specialty: "Gynecologist", phone: "+91 32109 87654", hospital: "Kokilaben Hospital, Mumbai", rating: 4.7, experience: "14 years", available: true, fee: "₹1,000", availableSlots: ["9:00 AM", "11:30 AM", "3:00 PM", "5:30 PM"] },
  { id: "8", name: "Dr. Anil Kapoor", specialty: "ENT Specialist", phone: "+91 21098 76543", hospital: "Medanta, Gurugram", rating: 4.5, experience: "16 years", available: true, fee: "₹700", availableSlots: ["10:00 AM", "12:30 PM", "4:00 PM"] },
];

const BookDoctor = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  const filteredDoctors = MOCK_DOCTORS.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.hospital.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBook = async () => {
    if (!selectedDoctor || !selectedSlot || !selectedDate || !user) return;
    setBooking(true);
    try {
      // Save appointment as a diagnosis entry for tracking
      await supabase.from("diagnoses").insert({
        user_id: user.id,
        title: `Appointment: ${selectedDoctor.name}`,
        description: `${selectedDoctor.specialty} at ${selectedDoctor.hospital}\nDate: ${selectedDate}, Time: ${selectedSlot}\nPhone: ${selectedDoctor.phone}`,
        status: "scheduled",
        severity: "low",
      });
      setBooked(true);
      toast.success(`Appointment booked with ${selectedDoctor.name}!`);
    } catch (err: any) {
      toast.error("Failed to book appointment");
    } finally {
      setBooking(false);
    }
  };

  const resetBooking = () => {
    setSelectedDoctor(null);
    setSelectedSlot(null);
    setSelectedDate("");
    setBooked(false);
  };

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

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

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground mb-1">Book a Doctor</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Find and book appointments with verified healthcare professionals
          </p>
        </motion.div>

        {booked ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="bg-card border-border/60 max-w-lg mx-auto">
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-bold text-foreground mb-2">Appointment Confirmed!</h2>
                <p className="text-muted-foreground text-sm mb-4">
                  Your appointment with <strong className="text-foreground">{selectedDoctor?.name}</strong> has been booked.
                </p>
                <div className="bg-secondary/30 rounded-lg p-4 text-left space-y-2 mb-6">
                  <p className="text-sm text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" /> {selectedDate}
                  </p>
                  <p className="text-sm text-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" /> {selectedSlot}
                  </p>
                  <p className="text-sm text-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" /> {selectedDoctor?.hospital}
                  </p>
                  <p className="text-sm text-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <a href={`tel:${selectedDoctor?.phone.replace(/\s/g, "")}`} className="text-primary hover:underline">
                      {selectedDoctor?.phone}
                    </a>
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={resetBooking} className="border-border/60">
                    Book Another
                  </Button>
                  <Button onClick={() => navigate("/dashboard")} className="bg-gradient-accent text-accent-foreground glow">
                    Go to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : selectedDoctor ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg mx-auto">
            <Button variant="ghost" size="sm" onClick={resetBooking} className="mb-4 text-muted-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to doctors
            </Button>
            <Card className="bg-card border-border/60">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Book Appointment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-start gap-4 p-4 bg-secondary/30 rounded-lg border border-border/40">
                  <div className="h-12 w-12 rounded-full bg-gradient-accent flex items-center justify-center shrink-0">
                    <User className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{selectedDoctor.name}</h3>
                    <p className="text-sm text-primary">{selectedDoctor.specialty}</p>
                    <p className="text-xs text-muted-foreground mt-1">{selectedDoctor.hospital}</p>
                    <p className="text-xs text-muted-foreground">{selectedDoctor.experience} experience</p>
                    <a href={`tel:${selectedDoctor.phone.replace(/\s/g, "")}`} className="text-xs text-primary flex items-center gap-1 mt-1 hover:underline">
                      <Phone className="h-3 w-3" /> {selectedDoctor.phone}
                    </a>
                  </div>
                  <span className="ml-auto text-lg font-bold text-foreground">{selectedDoctor.fee}</span>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Select Date</label>
                  <Input
                    type="date"
                    min={minDate}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-secondary/30 border-border/60"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Select Time Slot</label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedDoctor.availableSlots.map((slot) => (
                      <Button
                        key={slot}
                        variant={selectedSlot === slot ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedSlot(slot)}
                        className={selectedSlot === slot
                          ? "bg-gradient-accent text-accent-foreground glow"
                          : "border-border/60 text-muted-foreground"
                        }
                      >
                        <Clock className="h-3 w-3 mr-1" /> {slot}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleBook}
                  disabled={!selectedSlot || !selectedDate || booking}
                  className="w-full bg-gradient-accent text-accent-foreground glow hover:opacity-90"
                >
                  {booking ? "Booking..." : "Confirm Appointment"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, specialty, or hospital..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary/30 border-border/60"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {filteredDoctors.map((doctor, i) => (
                <motion.div
                  key={doctor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="bg-card border-border/60 hover:border-primary/30 transition-colors cursor-pointer" onClick={() => doctor.available && setSelectedDoctor(doctor)}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-11 w-11 rounded-full bg-gradient-accent flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-accent-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-foreground text-sm truncate">{doctor.name}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${doctor.available ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                              {doctor.available ? "Available" : "Unavailable"}
                            </span>
                          </div>
                          <p className="text-xs text-primary mt-0.5">{doctor.specialty}</p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {doctor.hospital}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" /> {doctor.rating}
                              </span>
                              <span className="text-xs text-muted-foreground">{doctor.experience}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-foreground">{doctor.fee}</span>
                              <a href={`tel:${doctor.phone.replace(/\s/g, "")}`} onClick={(e) => e.stopPropagation()} className="text-primary hover:text-primary/80">
                                <Phone className="h-4 w-4" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookDoctor;
