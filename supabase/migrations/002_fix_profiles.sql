-- Fix: Auto-create profile when user signs up
-- Run this in Supabase SQL Editor

-- Create function to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, reputation)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    100
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix parked_cars policy (INSERT was not allowed)
DROP POLICY IF EXISTS "Users can manage own parked car" ON parked_cars;
CREATE POLICY "Users can insert own parked car" ON parked_cars FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own parked car" ON parked_cars FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own parked car" ON parked_cars FOR DELETE USING (auth.uid() = user_id);

-- Create profiles for existing users who don't have one
INSERT INTO public.profiles (id, username, reputation)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'username', split_part(u.email, '@', 1)),
  100
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;
