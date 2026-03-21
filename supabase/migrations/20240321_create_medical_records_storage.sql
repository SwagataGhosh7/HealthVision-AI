-- Create storage bucket for medical records
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'medical-records',
  'medical-records',
  true,
  5242880, -- 5MB in bytes
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'text/plain']
) ON CONFLICT (id) DO NOTHING;

-- Set up Row Level Security (RLS) for medical records
CREATE POLICY "Users can upload their own medical records" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'medical-records' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()
);

CREATE POLICY "Users can view their own medical records" ON storage.objects
FOR SELECT USING (
  bucket_id = 'medical-records' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()
);

CREATE POLICY "Users can update their own medical records" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'medical-records' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()
);

CREATE POLICY "Users can delete their own medical records" ON storage.objects
FOR DELETE USING (
  bucket_id = 'medical-records' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()
);

-- Add medical_records column to diagnoses table if it doesn't exist
ALTER TABLE diagnoses 
ADD COLUMN IF NOT EXISTS medical_records TEXT[] DEFAULT '{}';
