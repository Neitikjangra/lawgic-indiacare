
-- Update the handle_new_user function to properly extract role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role, phone, location)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'startup')::public.user_role,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'location'
  );
  RETURN NEW;
END;
$$;
