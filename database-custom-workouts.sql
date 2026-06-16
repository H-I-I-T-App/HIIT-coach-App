-- Run this in the Supabase SQL Editor to add the custom_workouts column

alter table public.users 
add column if not exists custom_workouts jsonb default '[]'::jsonb;
