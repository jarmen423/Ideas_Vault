export interface AnalysisResult {
  readinessScore?: number;
  marketSize?: string;
  targetAudience?: string;
  topCompetitor?: string;
  trend?: string;
  growthMetrics?: Array<{
    year: string;
    value: number;
  }>;
  competitors?: Array<{
    name: string;
    strength: string;
    weakness: string;
  }>;
  actionPlan?: string[];
  error?: string;
}

export type IdeaStatus = 'Analyzing' | 'Ready' | 'Discovery' | 'Error';

export type IdeaInputType = 'Text' | 'Voice' | 'Image';

export type IdeaCaptureMode = 'quick' | 'discovery';

export interface Idea {
  id: string;
  user_id: string;
  title: string;
  description: string;
  input_type: IdeaInputType;
  status: IdeaStatus;
  capture_mode: IdeaCaptureMode;
  discovery_session_id: string | null;
  analysis_result: AnalysisResult | null;
  created_at: string;
  updated_at: string;
}
