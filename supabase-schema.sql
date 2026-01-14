-- Deep Life Stack Database Schema for Supabase
-- Run this in your Supabase SQL Editor to set up the database

-- ============================================================================
-- JOURNEYS TABLE
-- Tracks the user's 4-month journey (120 days)
-- ============================================================================
CREATE TABLE journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  current_layer TEXT CHECK (current_layer IN ('discipline', 'values', 'control', 'vision')) DEFAULT 'discipline',
  UNIQUE(user_id)
);

-- Row Level Security for journeys
ALTER TABLE journeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journey"
  ON journeys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journey"
  ON journeys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journey"
  ON journeys FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- HABITS TABLE
-- Keystone habits (max 3 per user)
-- ============================================================================
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT '⭐',
  color TEXT NOT NULL DEFAULT '#06B6D4',
  category TEXT CHECK (category IN ('body', 'mind', 'heart')),
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  archived BOOLEAN DEFAULT FALSE
);

-- Row Level Security for habits
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habits"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits"
  ON habits FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- COMPLETIONS TABLE
-- Daily habit completion tracking
-- ============================================================================
CREATE TABLE completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(habit_id, date)
);

-- Row Level Security for completions
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own completions"
  ON completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own completions"
  ON completions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own completions"
  ON completions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- VALUES TABLE (for future Values Layer)
-- Core personal values
-- ============================================================================
CREATE TABLE values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '💜',
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own values"
  ON values FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- RITUALS TABLE (for future Values Layer)
-- Value-aligned rituals
-- ============================================================================
CREATE TABLE rituals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  value_id UUID REFERENCES values(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly')) DEFAULT 'weekly',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE rituals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own rituals"
  ON rituals FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- PERSONAL_CODE TABLE (for future Values Layer)
-- User's personal code text
-- ============================================================================
CREATE TABLE personal_code (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

ALTER TABLE personal_code ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own personal code"
  ON personal_code FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- QUARTERLY_PLANS TABLE (Control Layer - Multi-Scale Planning)
-- Quarterly objectives that inform weekly planning
-- ============================================================================
CREATE TABLE quarterly_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quarter_start DATE NOT NULL, -- First day of quarter (e.g., 2026-01-01, 2026-04-01)
  objectives TEXT[], -- Array of 3-5 quarterly objectives
  reflection TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, quarter_start)
);

ALTER TABLE quarterly_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own quarterly plans"
  ON quarterly_plans FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- WEEKLY_PLANS TABLE (Control Layer - Multi-Scale Planning)
-- Weekly planning with theme and big rocks
-- ============================================================================
CREATE TABLE weekly_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  theme TEXT,
  big_rocks TEXT[], -- Array of 3-5 priorities
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, week_start)
);

ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own weekly plans"
  ON weekly_plans FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- DAILY_PLANS TABLE (for future Control Layer)
-- Daily time blocking and priorities
-- ============================================================================
CREATE TABLE daily_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  top_priorities TEXT[], -- Top 3 priorities
  time_blocks JSONB, -- Array of {start, end, title, category}
  reflection TEXT,
  shutdown_complete TIMESTAMP WITH TIME ZONE, -- When shutdown ritual was completed
  shutdown_checks JSONB, -- Object tracking which checklist items were checked
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, date)
);

ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own daily plans"
  ON daily_plans FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- REMARKABLE_ASPECTS TABLE (for future Vision Layer)
-- Remarkable life transformation aspects
-- ============================================================================
CREATE TABLE remarkable_aspects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('career', 'family', 'health', 'creativity', 'community', 'lifestyle')),
  scale TEXT CHECK (scale IN ('small', 'large')) DEFAULT 'small',
  status TEXT CHECK (status IN ('planning', 'in_progress', 'completed', 'on_hold')) DEFAULT 'planning',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE remarkable_aspects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own remarkable aspects"
  ON remarkable_aspects FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- MILESTONES TABLE (for future Vision Layer)
-- Sequential milestones for remarkable aspects
-- ============================================================================
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  aspect_id UUID REFERENCES remarkable_aspects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  target_date DATE,
  completed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own milestones"
  ON milestones FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- INDEXES for performance
-- ============================================================================
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_completions_user_id ON completions(user_id);
CREATE INDEX idx_completions_habit_id ON completions(habit_id);
CREATE INDEX idx_completions_date ON completions(date);
CREATE INDEX idx_values_user_id ON values(user_id);
CREATE INDEX idx_rituals_user_id ON rituals(user_id);
CREATE INDEX idx_quarterly_plans_user_id ON quarterly_plans(user_id);
CREATE INDEX idx_weekly_plans_user_id ON weekly_plans(user_id);
CREATE INDEX idx_daily_plans_user_id ON daily_plans(user_id);
CREATE INDEX idx_remarkable_aspects_user_id ON remarkable_aspects(user_id);
CREATE INDEX idx_milestones_user_id ON milestones(user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to automatically create journey on user signup
CREATE OR REPLACE FUNCTION create_journey_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO journeys (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create journey when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_journey_for_new_user();

-- ============================================================================
-- SAMPLE DATA (optional - for testing)
-- ============================================================================

-- Uncomment to insert sample data for testing
-- INSERT INTO habits (user_id, name, description, icon, color, "order")
-- VALUES
--   (auth.uid(), 'Morning Exercise', '30 minutes of movement', '🏃', '#06B6D4', 0),
--   (auth.uid(), 'Reading', 'Read for 20 minutes', '📚', '#8B5CF6', 1),
--   (auth.uid(), 'Meditation', 'Morning meditation practice', '🧘', '#10B981', 2);
