
-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  gender TEXT,
  blood_type TEXT,
  medical_conditions TEXT[],
  allergies TEXT[],
  emergency_contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create diagnoses table
CREATE TABLE public.diagnoses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  analysis_result JSONB,
  severity TEXT CHECK (severity IN ('low', 'moderate', 'high', 'critical')),
  recommendations TEXT[],
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed', 'error')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own diagnoses" ON public.diagnoses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own diagnoses" ON public.diagnoses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own diagnoses" ON public.diagnoses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own diagnoses" ON public.diagnoses FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_diagnoses_updated_at BEFORE UPDATE ON public.diagnoses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create vital signs table
CREATE TABLE public.vital_signs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  heart_rate INTEGER,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  temperature DECIMAL(4,1),
  oxygen_saturation DECIMAL(4,1),
  respiratory_rate INTEGER,
  notes TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vital_signs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vital signs" ON public.vital_signs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own vital signs" ON public.vital_signs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own vital signs" ON public.vital_signs FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket for medical uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('medical-uploads', 'medical-uploads', false);

CREATE POLICY "Users can upload their own medical files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'medical-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view their own medical files" ON storage.objects FOR SELECT USING (bucket_id = 'medical-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own medical files" ON storage.objects FOR DELETE USING (bucket_id = 'medical-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
