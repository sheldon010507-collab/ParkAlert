-- ParkAlert Database Schema
-- Run this SQL in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT,
  reputation INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Warden sightings table
CREATE TABLE IF NOT EXISTS warden_sightings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles NOT NULL,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  warden_type TEXT NOT NULL CHECK (warden_type IN ('council', 'private', 'police')),
  count TEXT NOT NULL CHECK (count IN ('one', 'two', 'multiple')),
  direction TEXT NOT NULL CHECK (direction IN ('N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW')),
  movement TEXT NOT NULL CHECK (movement IN ('walking', 'cycling', 'driving')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parked cars table (one per user)
CREATE TABLE IF NOT EXISTS parked_cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles UNIQUE,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  radius_m INTEGER DEFAULT 150,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE warden_sightings ENABLE ROW LEVEL SECURITY;
ALTER TABLE parked_cars ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Warden sightings policies
CREATE POLICY "Anyone can view active sightings" ON warden_sightings FOR SELECT USING (expires_at > NOW());
CREATE POLICY "Authenticated users can create sightings" ON warden_sightings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete own sightings" ON warden_sightings FOR DELETE USING (auth.uid() = user_id);

-- Parked cars policies
CREATE POLICY "Users can view own parked car" ON parked_cars FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own parked car" ON parked_cars FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_warden_sightings_location ON warden_sightings (lat, lng);
CREATE INDEX IF NOT EXISTS idx_warden_sightings_expires ON warden_sightings (expires_at);
CREATE INDEX IF NOT EXISTS idx_parked_cars_user ON parked_cars (user_id);

-- Enable Realtime for warden_sightings
ALTER PUBLICATION supabase_realtime ADD TABLE warden_sightings;
