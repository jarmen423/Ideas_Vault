-- 🌟 IDEAS VAULT DATABASE SCHEMA
-- -----------------------------------------------------
-- 1. Create Ideas Table
CREATE TABLE IF NOT EXISTS public.ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    input_type TEXT DEFAULT 'Text',
    -- 'Text', 'Voice', 'Image'
    status TEXT DEFAULT 'Analyzing',
    -- 'Analyzing', 'Ready'
    analysis_result JSONB,
    -- Stores readinessScore, marketSize, growthMetrics, competitors, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
-- 3. Create RLS Policies
-- Users can only see their own ideas
CREATE POLICY "Users can view their own ideas" ON public.ideas FOR
SELECT USING (auth.uid() = user_id);
-- Users can only insert their own ideas
CREATE POLICY "Users can insert their own ideas" ON public.ideas FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Users can only update their own ideas
CREATE POLICY "Users can update their own ideas" ON public.ideas FOR
UPDATE USING (auth.uid() = user_id);
-- Users can only delete their own ideas
CREATE POLICY "Users can delete their own ideas" ON public.ideas FOR DELETE USING (auth.uid() = user_id);
-- 4. Storage Setup (Optional for MVP placeholders)
-- In a real scenario, you'd create buckets for voice and image:
-- insert into storage.buckets (id, name) values ('vault-assets', 'vault-assets');