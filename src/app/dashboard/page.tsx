/**
 * @module app/dashboard/page
 * @description Main vault view listing all user startup ideas.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Settings, HelpCircle, Sparkles } from 'lucide-react';
import { IdeaCard } from '@/components/dashboard/IdeaCard';
import { CaptureModal } from '@/components/modals/CaptureModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { AboutModal } from '@/components/modals/AboutModal';
import { DiscoveryModal } from '@/components/modals/DiscoveryModal';
import { supabase } from '@/lib/supabase';
import { performResearch } from '@/app/actions/research';

interface Idea {
    id: string;
    title: string;
    description: string;
    input_type: string;
    status: string;
    capture_mode?: string;
    analysis_result: any;
    created_at: string;
}

interface AIConfig {
    apiKey?: string;
    baseURL?: string;
    model?: string;
    discoveryModeEnabled?: boolean;
}

/**
 * Dashboard View.
 * 
 * Fetches ideas from Supabase and allows users to trigger new AI research.
 * Supports both Quick Capture and Discovery Mode for new ideas.
 * Uses real server actions for processing and optimism where applicable.
 * 
 * @returns {JSX.Element} The rendered dashboard
 */
export default function DashboardPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAboutOpen, setIsAboutOpen] = useState(false);
    const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [loading, setLoading] = useState(true);
    const [aiConfig, setAiConfig] = useState<AIConfig>({});
    const [userId, setUserId] = useState<string | null>(null);
    const [pendingIdeaData, setPendingIdeaData] = useState<{ title: string; description: string } | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                window.location.href = '/login';
                return;
            }
            setUserId(user.id);
            fetchIdeas();
        };

        const savedSettings = localStorage.getItem('vault_ai_settings');
        if (savedSettings) {
            setAiConfig(JSON.parse(savedSettings));
        }

        checkAuth();
    }, []);

    const fetchIdeas = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('ideas')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching ideas:', error);
        } else {
            setIdeas(data || []);
        }
        setLoading(false);
    };

    /**
     * Handles the "New Idea" button click.
     * Opens Discovery Modal if discovery mode is enabled, otherwise opens Capture Modal.
     */
    const handleNewIdeaClick = () => {
        if (aiConfig.discoveryModeEnabled) {
            setPendingIdeaData(null);
            setIsDiscoveryOpen(true);
        } else {
            setIsModalOpen(true);
        }
    };

    /**
     * Handles quick capture submission (non-discovery mode).
     * Creates idea record and triggers AI research immediately.
     */
    const handleAddIdea = async (data: { title: string; description: string; type: string }) => {
        // 1. Insert placeholder/initial record
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;

        const { data: newRecord, error } = await supabase
            .from('ideas')
            .insert([{
                title: data.title,
                description: data.description,
                input_type: data.type.charAt(0).toUpperCase() + data.type.slice(1),
                status: 'Analyzing',
                capture_mode: 'quick',
                user_id: userId
            }])
            .select()
            .single();

        if (error) throw error;

        // Optimistically update UI
        setIdeas(prev => [newRecord, ...prev]);

        // 2. Trigger AI Research
        try {
            const analysis = await performResearch(data.title, data.description, aiConfig);

            // 3. Update record with results
            await supabase
                .from('ideas')
                .update({
                    status: 'Ready',
                    analysis_result: analysis
                })
                .eq('id', newRecord.id);

            // Refresh list
            fetchIdeas();
        } catch (researchError) {
            console.error("Research failed:", researchError);
            // Update status to show error
            await supabase
                .from('ideas')
                .update({
                    status: 'Error',
                    analysis_result: { error: String(researchError) }
                })
                .eq('id', newRecord.id);
            fetchIdeas();
        }
    };

    /**
     * Handles completion of Discovery Mode.
     * Uses the refined prompt from discovery to trigger research.
     */
    const handleDiscoveryComplete = async (synthesisOutput: any) => {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;

        // Extract title and description from synthesis
        const title = synthesisOutput.tldr?.refinedIdea || pendingIdeaData?.title || 'Untitled Idea';
        const description = synthesisOutput.fullPrompt?.problemStatement || pendingIdeaData?.description || '';

        // Create idea with discovery data
        const { data: newRecord, error } = await supabase
            .from('ideas')
            .insert([{
                title,
                description,
                input_type: 'Text',
                status: 'Analyzing',
                capture_mode: 'discovery',
                user_id: userId
            }])
            .select()
            .single();

        if (error) {
            console.error("Failed to create idea:", error);
            return;
        }

        // Optimistically update UI
        setIdeas(prev => [newRecord, ...prev]);

        // Trigger research with the refined prompt context
        try {
            // Build enhanced prompt from discovery output
            const enhancedDescription = `
Problem: ${synthesisOutput.fullPrompt?.problemStatement || description}
Target Customer: ${synthesisOutput.fullPrompt?.targetCustomer?.profile || 'Not specified'}
Value Proposition: ${synthesisOutput.fullPrompt?.valueProposition || 'Not specified'}
Key Hypotheses: ${synthesisOutput.fullPrompt?.hypotheses?.join(', ') || 'None'}
            `.trim();

            const analysis = await performResearch(title, enhancedDescription, aiConfig);

            // Merge discovery founder-fit with research results
            const enrichedAnalysis = {
                ...analysis,
                founderFit: synthesisOutput.founderFit,
                discoveryTldr: synthesisOutput.tldr,
                evaluationCriteria: synthesisOutput.fullPrompt?.evaluationCriteria
            };

            await supabase
                .from('ideas')
                .update({
                    status: 'Ready',
                    analysis_result: enrichedAnalysis
                })
                .eq('id', newRecord.id);

            fetchIdeas();
        } catch (researchError) {
            console.error("Research failed:", researchError);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-white mb-2">The Vault</h2>
                    <p className="text-slate-400">Manage and explore your startup concepts.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsAboutOpen(true)}
                        className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-2xl transition-colors border border-slate-700"
                        title="About Ideas Vault"
                    >
                        <HelpCircle size={20} />
                    </button>
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-2xl transition-colors border border-slate-700"
                        title="Settings"
                    >
                        <Settings size={20} />
                    </button>
                    <button
                        onClick={handleNewIdeaClick}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 transition-all"
                    >
                        {aiConfig.discoveryModeEnabled ? (
                            <>
                                <Sparkles size={20} />
                                Discover Idea
                            </>
                        ) : (
                            <>
                                <Plus size={20} />
                                New Idea
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Discovery Mode Indicator */}
            {aiConfig.discoveryModeEnabled && (
                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl w-fit">
                    <Sparkles size={14} className="text-indigo-400" />
                    <span className="text-sm text-indigo-300">Discovery Mode Active</span>
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50">
                    {[Array(3)].map((_, i) => (
                        <div key={i} className="h-48 bg-slate-800/20 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ideas.map(idea => (
                        <IdeaCard
                            key={idea.id}
                            idea={{
                                id: idea.id,
                                title: idea.title,
                                description: idea.description,
                                inputType: idea.input_type || 'Text',
                                status: idea.status,
                                tags: idea.analysis_result?.tags || ["#Processing"]
                            }}
                        />
                    ))}

                    {ideas.length === 0 && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                            <p className="text-slate-500">Your vault is empty. Capture your first idea to begin!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Quick Capture Modal */}
            <CaptureModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddIdea}
            />

            {/* Discovery Modal */}
            {userId && (
                <DiscoveryModal
                    isOpen={isDiscoveryOpen}
                    onClose={() => {
                        setIsDiscoveryOpen(false);
                        setPendingIdeaData(null);
                    }}
                    onComplete={handleDiscoveryComplete}
                    userId={userId}
                    existingIdeaData={pendingIdeaData || undefined}
                />
            )}

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onSave={setAiConfig}
            />

            <AboutModal
                isOpen={isAboutOpen}
                onClose={() => setIsAboutOpen(false)}
            />
        </div>
    );
}

