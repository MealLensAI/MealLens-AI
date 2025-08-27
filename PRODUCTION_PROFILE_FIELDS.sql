-- Add missing profile fields to the profiles table
-- Run this in your Supabase SQL Editor

-- Add date_of_birth column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS date_of_birth date;

-- Add weight column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS weight numeric(5,2) DEFAULT 0;

-- Add height column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS height numeric(5,2) DEFAULT 0;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('date_of_birth', 'weight', 'height'); 