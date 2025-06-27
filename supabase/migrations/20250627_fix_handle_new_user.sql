
-- Drop and recreate the handle_new_user function with proper enum handling
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the handle_new_user function with explicit enum casting
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, phone)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', 'User'),
    CASE 
      WHEN new.email = 'id.arvinstudio@gmail.com' THEN 'admin'::public.user_role
      WHEN new.raw_user_meta_data ->> 'role' = 'mitra' THEN 'mitra'::public.user_role
      ELSE 'user'::public.user_role
    END,
    new.raw_user_meta_data ->> 'phone'
  );
  RETURN new;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
