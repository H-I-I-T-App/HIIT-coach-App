-- Run this in the Supabase SQL Editor

create table if not exists public.groups (
  id uuid default gen_random_uuid() primary key,
  token text not null unique,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- We don't need to change the users table because joined_group is already a text column!
-- We will simply store the 6-character token inside joined_group instead of the raw name.
