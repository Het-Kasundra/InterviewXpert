-- ================================================
-- MIGRATION: Add Missing Columns to Projects Table
-- ================================================
-- Run this in Supabase SQL Editor if you already created the projects table
-- This adds the missing columns that the Portfolio feature needs

-- Add missing columns to projects table
ALTER TABLE projects 
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Tech',
  ADD COLUMN IF NOT EXISTS role TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'in_progress',
  ADD COLUMN IF NOT EXISTS achievements TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS links JSONB DEFAULT '{"github": "", "site": "", "pdf": ""}',
  ADD COLUMN IF NOT EXISTS xp_value INTEGER DEFAULT 100;

-- Add check constraint for status
ALTER TABLE projects 
  DROP CONSTRAINT IF EXISTS projects_status_check;

ALTER TABLE projects 
  ADD CONSTRAINT projects_status_check 
  CHECK (status IN ('in_progress', 'completed', 'upcoming'));

-- Make sure tech_stack has a default
ALTER TABLE projects 
  ALTER COLUMN tech_stack SET DEFAULT '{}';

-- ================================================
-- DONE!
-- ================================================
-- Your projects table now has all required columns:
-- - category (Tech/Design/etc)
-- - role (Your role in the project)
-- - status (in_progress/completed/upcoming)
-- - achievements (array of achievement strings)
-- - links (JSON with github/site/pdf URLs)
-- - xp_value (XP earned for this project)
-- ================================================
