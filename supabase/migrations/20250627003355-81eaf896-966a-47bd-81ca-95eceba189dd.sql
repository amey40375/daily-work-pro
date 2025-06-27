
-- Drop ALL existing policies more comprehensively
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    -- Drop all policies from orders table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'orders' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.orders';
    END LOOP;
    
    -- Drop all policies from profiles table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.profiles';
    END LOOP;
    
    -- Drop all policies from mitra_applications table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'mitra_applications' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.mitra_applications';
    END LOOP;
    
    -- Drop all policies from services table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'services' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.services';
    END LOOP;
    
    -- Drop all policies from reviews table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'reviews' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.reviews';
    END LOOP;
    
    -- Drop all policies from chat_messages table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'chat_messages' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.chat_messages';
    END LOOP;
END $$;

-- Disable RLS temporarily
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mitra_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages DISABLE ROW LEVEL SECURITY;

-- Create enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'mitra', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE mitra_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'in_progress', 'working', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update column types
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE user_role USING role::user_role;

ALTER TABLE public.mitra_applications 
ALTER COLUMN status TYPE mitra_status USING status::mitra_status;

ALTER TABLE public.orders 
ALTER COLUMN status TYPE order_status USING status::order_status;

-- Create security definer function
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mitra_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id OR public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can view own applications" 
  ON public.mitra_applications 
  FOR SELECT 
  USING (auth.uid() = user_id OR public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can create applications" 
  ON public.mitra_applications 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update applications" 
  ON public.mitra_applications 
  FOR UPDATE 
  USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can view related orders" 
  ON public.orders 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    auth.uid() = mitra_id OR 
    public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Users can create orders" 
  ON public.orders 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" 
  ON public.orders 
  FOR UPDATE 
  USING (
    auth.uid() = user_id OR 
    auth.uid() = mitra_id OR 
    public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Anyone can view services" 
  ON public.services 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Admins can manage services" 
  ON public.services 
  FOR ALL 
  USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can view reviews" 
  ON public.reviews 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can create reviews" 
  ON public.reviews 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own messages" 
  ON public.chat_messages 
  FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" 
  ON public.chat_messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own messages" 
  ON public.chat_messages 
  FOR UPDATE 
  USING (auth.uid() = receiver_id);
