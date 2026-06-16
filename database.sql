-- Create tables for the HIIT App

-- Table: public.users
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  age INTEGER,
  current_level INTEGER DEFAULT 1,
  joined_group TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: public.workout_records
CREATE TABLE public.workout_records (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  workout_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  rpe INTEGER DEFAULT 0,
  average_hr INTEGER DEFAULT 0,
  recovery_feeling TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_records ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for this prototype (since we don't have user authentication yet)
-- In a real app, you would use Supabase Auth to secure this.
CREATE POLICY "Allow public read access for users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public insert for users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for users" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Allow public read access for workout_records" ON public.workout_records FOR SELECT USING (true);
CREATE POLICY "Allow public insert for workout_records" ON public.workout_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for workout_records" ON public.workout_records FOR UPDATE USING (true);
