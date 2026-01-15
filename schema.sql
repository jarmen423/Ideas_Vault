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
    -- 'Analyzing', 'Ready', 'Discovery'
    capture_mode TEXT DEFAULT 'quick',
    -- 'quick', 'discovery'
    discovery_session_id UUID,
    analysis_result JSONB,
    -- Stores readinessScore, marketSize, growthMetrics, competitors, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- 2. Create Discovery Sessions Table
CREATE TABLE IF NOT EXISTS public.discovery_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    messages JSONB DEFAULT '[]',
    -- Array of {role: 'user'|'assistant', content: string, timestamp: string}
    current_phase TEXT DEFAULT 'vision',
    -- 'vision', 'gaps', 'founder_fit', 'synthesis', 'complete'
    founder_fit JSONB,
    -- {technicalSkills, domainExpertise, resources, motivation, learningPath, hireRecommendations}
    refined_prompt JSONB,
    -- {tldr: string, fullPrompt: string, evaluationCriteria: string[]}
    status TEXT DEFAULT 'active',
    -- 'active', 'completed', 'skipped'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);
-- 3. Add foreign key constraint for discovery_session_id
ALTER TABLE public.ideas
ADD CONSTRAINT fk_discovery_session FOREIGN KEY (discovery_session_id) REFERENCES public.discovery_sessions(id) ON DELETE
SET NULL;
-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_sessions ENABLE ROW LEVEL SECURITY;
-- 5. Create RLS Policies for Ideas
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
-- 6. Create RLS Policies for Discovery Sessions
CREATE POLICY "Users can view their own discovery sessions" ON public.discovery_sessions FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own discovery sessions" ON public.discovery_sessions FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own discovery sessions" ON public.discovery_sessions FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own discovery sessions" ON public.discovery_sessions FOR DELETE USING (auth.uid() = user_id);
-- 7. Storage Setup (Optional for MVP placeholders)
-- 7. Storage Setup
INSERT INTO storage.buckets (id, name, public) VALUES ('vault-assets', 'vault-assets', false);

-- Enable RLS on objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload their own assets
CREATE POLICY "Users can upload their own assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vault-assets' AND auth.uid() = owner);

-- Policy: Users can view their own assets
CREATE POLICY "Users can view their own assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'vault-assets' AND auth.uid() = owner);

-- Policy: Users can update their own assets
CREATE POLICY "Users can update their own assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vault-assets' AND auth.uid() = owner);

-- Policy: Users can delete their own assets
CREATE POLICY "Users can delete their own assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'vault-assets' AND auth.uid() = owner);