
-- Add UPDATE policy for vital_signs
CREATE POLICY "Users can update their own vital signs"
ON public.vital_signs
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add UPDATE policy for medical-uploads storage
CREATE POLICY "Users can update their own medical uploads"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'medical-uploads' AND (auth.uid())::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'medical-uploads' AND (auth.uid())::text = (storage.foldername(name))[1]);
