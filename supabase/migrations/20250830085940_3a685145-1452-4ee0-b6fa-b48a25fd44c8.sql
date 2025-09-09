-- Create table for map configuration settings
CREATE TABLE IF NOT EXISTS public.map_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'openstreetmap' CHECK (provider IN ('openstreetmap', 'google', 'mapbox')),
  api_key TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on map_settings table
ALTER TABLE public.map_settings ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage map settings
CREATE POLICY "Allow admins to manage map settings" ON public.map_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Allow all authenticated users to read map settings
CREATE POLICY "Allow users to read map settings" ON public.map_settings
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Create trigger for updating timestamps
CREATE TRIGGER update_map_settings_updated_at
  BEFORE UPDATE ON public.map_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default map settings with OpenChargeMap API key
INSERT INTO public.map_settings (provider, api_key, is_active) 
VALUES ('openstreetmap', '24238d0e-f194-446c-8178-b9888dd34f7f', true)
ON CONFLICT DO NOTHING;