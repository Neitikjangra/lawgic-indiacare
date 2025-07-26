-- Create user role enum
CREATE TYPE public.user_role AS ENUM ('startup', 'small_business', 'freelancer', 'ca', 'lawyer');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role user_role NOT NULL,
  phone TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create professional profiles table for CAs and Lawyers
CREATE TABLE public.professional_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  practice_area TEXT,
  experience_years INTEGER,
  certification_number TEXT,
  bio TEXT,
  hourly_rate INTEGER DEFAULT 500,
  is_verified BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  available_slots JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for professional profiles
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for professional profiles
CREATE POLICY "Professionals can manage their own profile" 
ON public.professional_profiles 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Published profiles are viewable by everyone" 
ON public.professional_profiles 
FOR SELECT 
USING (is_published = true);

-- Create deadlines table
CREATE TABLE public.deadlines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  category TEXT DEFAULT 'custom',
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  is_completed BOOLEAN DEFAULT false,
  reminder_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for deadlines
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;

-- Policies for deadlines
CREATE POLICY "Users can manage their own deadlines" 
ON public.deadlines 
FOR ALL 
USING (auth.uid() = user_id);

-- Create consultations table
CREATE TABLE public.consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_profile_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 15,
  status TEXT DEFAULT 'pending',
  amount INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for consultations
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Policies for consultations
CREATE POLICY "Users can view their own consultations as client" 
ON public.consultations 
FOR SELECT 
USING (auth.uid() = client_id);

CREATE POLICY "Professionals can view their own consultations" 
ON public.consultations 
FOR SELECT 
USING (auth.uid() = professional_id);

CREATE POLICY "Users can create consultations as client" 
ON public.consultations 
FOR INSERT 
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Professionals can update their consultations" 
ON public.consultations 
FOR UPDATE 
USING (auth.uid() = professional_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_professional_profiles_updated_at
  BEFORE UPDATE ON public.professional_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deadlines_updated_at
  BEFORE UPDATE ON public.deadlines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON public.consultations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();