-- ================================================
-- SUPABASE DATABASE SETUP SCRIPT
-- Interview Expert Application
-- ================================================
-- This script creates all necessary tables and policies
-- Run this in your Supabase SQL Editor
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- 1. PROFILES TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ================================================
-- 2. INTERVIEWS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT,
  company TEXT,
  skills TEXT[],
  mode TEXT CHECK (mode IN ('voice', 'text', 'video')),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  overall_score INTEGER,
  transcript JSONB,
  media_urls JSONB DEFAULT '{}',
  source TEXT DEFAULT 'static',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for interviews
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interviews" ON interviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interviews" ON interviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interviews" ON interviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own interviews" ON interviews
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================
-- 3. SCHEDULED INTERVIEWS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS scheduled_interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  company TEXT,
  role TEXT NOT NULL,
  interview_type TEXT CHECK (interview_type IN ('technical', 'behavioral', 'mixed')),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration INTEGER DEFAULT 30,
  notes TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for scheduled_interviews
ALTER TABLE scheduled_interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scheduled interviews" ON scheduled_interviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scheduled interviews" ON scheduled_interviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled interviews" ON scheduled_interviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled interviews" ON scheduled_interviews
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================
-- 4. ADDITIONAL SKILLS SESSIONS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS additional_skills_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  skill_type TEXT NOT NULL,
  assessment_type TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  overall_score INTEGER,
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for additional_skills_sessions
ALTER TABLE additional_skills_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own skill sessions" ON additional_skills_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skill sessions" ON additional_skills_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skill sessions" ON additional_skills_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- ================================================
-- 5. USER GAMIFICATION TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS user_gamification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  interviews_completed INTEGER DEFAULT 0,
  skills_mastered INTEGER DEFAULT 0,
  challenges_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for user_gamification
ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gamification" ON user_gamification
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gamification" ON user_gamification
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gamification" ON user_gamification
  FOR UPDATE USING (auth.uid() = user_id);

-- ================================================
-- 6. DAILY GOALS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS daily_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_type TEXT NOT NULL,
  target INTEGER NOT NULL,
  current INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, goal_type, date)
);

-- RLS Policies for daily_goals
ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals" ON daily_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON daily_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON daily_goals
  FOR UPDATE USING (auth.uid() = user_id);

-- ================================================
-- 7. USER BADGES TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  badge_icon TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- RLS Policies for user_badges
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges" ON user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own badges" ON user_badges
  FOR UPDATE USING (auth.uid() = user_id);

-- ================================================
-- 8. WEEKLY CHALLENGES TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS weekly_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_name TEXT NOT NULL,
  challenge_description TEXT,
  challenge_type TEXT NOT NULL,
  target INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for weekly_challenges
ALTER TABLE weekly_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active challenges" ON weekly_challenges
  FOR SELECT USING (is_active = TRUE);

-- ================================================
-- 9. RESUME ANALYSES TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS resume_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT,
  file_url TEXT,
  analysis_results JSONB,
  overall_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for resume_analyses
ALTER TABLE resume_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own resume analyses" ON resume_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resume analyses" ON resume_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resume analyses" ON resume_analyses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resume analyses" ON resume_analyses
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================
-- 10. USER PORTFOLIO TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS user_portfolio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  bio TEXT,
  skills TEXT[],
  experience JSONB,
  education JSONB,
  certifications JSONB,
  social_links JSONB,
  is_public BOOLEAN DEFAULT FALSE,
  custom_url TEXT UNIQUE,
  theme TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for user_portfolio
ALTER TABLE user_portfolio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own portfolio" ON user_portfolio
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public portfolios" ON user_portfolio
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can insert own portfolio" ON user_portfolio
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio" ON user_portfolio
  FOR UPDATE USING (auth.uid() = user_id);

-- ================================================
-- 11. PROJECTS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Tech',
  role TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  image_url TEXT,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'upcoming')),
  achievements TEXT[] DEFAULT '{}',
  links JSONB DEFAULT '{"github": "", "site": "", "pdf": ""}',
  xp_value INTEGER DEFAULT 100,
  start_date DATE,
  end_date DATE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view projects of public portfolios" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_portfolio 
      WHERE user_portfolio.user_id = projects.user_id 
      AND user_portfolio.is_public = TRUE
    )
  );

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================
-- RPC FUNCTIONS
-- ================================================

-- Function to create initial daily goals
CREATE OR REPLACE FUNCTION create_initial_daily_goals(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO daily_goals (user_id, goal_type, target, current, date)
  VALUES 
    (target_user_id, 'interviews', 3, 0, CURRENT_DATE),
    (target_user_id, 'practice_time', 30, 0, CURRENT_DATE),
    (target_user_id, 'skills_learned', 2, 0, CURRENT_DATE)
  ON CONFLICT (user_id, goal_type, date) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create initial badges
CREATE OR REPLACE FUNCTION create_initial_badges(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_badges (user_id, badge_id, badge_name, badge_description, badge_icon, progress)
  VALUES 
    (target_user_id, 'first_interview', 'First Interview', 'Complete your first interview', 'ri-award-line', 0),
    (target_user_id, 'streak_3', '3-Day Streak', 'Practice for 3 days in a row', 'ri-fire-line', 0),
    (target_user_id, 'perfect_score', 'Perfect Score', 'Get 100% on an interview', 'ri-star-line', 0)
  ON CONFLICT (user_id, badge_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================
CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_created_at ON interviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scheduled_interviews_user_id ON scheduled_interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_additional_skills_user_id ON additional_skills_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_gamification_user_id ON user_gamification(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_goals_user_date ON daily_goals(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_user_id ON resume_analyses(user_id);

-- ================================================
-- TRIGGERS FOR UPDATED_AT
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_interviews_updated_at BEFORE UPDATE ON scheduled_interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_gamification_updated_at BEFORE UPDATE ON user_gamification
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_goals_updated_at BEFORE UPDATE ON daily_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_portfolio_updated_at BEFORE UPDATE ON user_portfolio
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resume_analyses_updated_at BEFORE UPDATE ON resume_analyses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- SETUP COMPLETE!
-- ================================================
-- All tables, policies, functions, and indexes have been created.
-- Your Interview Expert database is ready to use!
-- ================================================
