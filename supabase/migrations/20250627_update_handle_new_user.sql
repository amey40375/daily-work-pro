
-- Update the handle_new_user function to work with enum types
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
      WHEN new.email = 'id.arvinstudio@gmail.com' THEN 'admin'::user_role
      WHEN new.raw_user_meta_data ->> 'role' = 'mitra' THEN 'mitra'::user_role
      ELSE 'user'::user_role
    END,
    new.raw_user_meta_data ->> 'phone'
  );
  RETURN new;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
