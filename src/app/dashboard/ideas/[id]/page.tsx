/**
 * @module app/dashboard/ideas/[id]/page
 * @description Detailed research view for a specific idea.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Users,
    ShieldCheck,
    Share2,
    Download,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    XCircle,
    Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { GrowthChart } from '@/components/dashboard/GrowthChart';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import { performResearch } from '@/app/actions/research';
import { Idea } from '@/types';

/**
 * Detailed Research View.
 * 
 * Displays the complete AI-generated research packet including market metrics,
 * competitor analysis, and action plans.
 * 
 * @returns {JSX.Element} The rendered detail page
 */
export default function IdeaDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [idea, setIdea] = useState<Idea | null>(null);
    const [loading, setLoading] = useState(true);
    const [retrying, setRetrying] = useState(false);

    useEffect(() => {
        if (id) fetchIdea();
    }, [id]);


    const fetchIdea = async () => {
        if (!loading) {
            // Don't show full loading state on poll updates
        } else {
            setLoading(true);
        }

        const { data, error } = await supabase
            .from('ideas')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching idea:', error);
        } else if (data) {
            // Explicitly casting data to Idea as Supabase types might not be fully generated/in-sync
            setIdea(data as unknown as Idea);
        }
        setLoading(false);
    };

    const retryResearch = async () => {
        if (!idea) return;

        setRetrying(true);

        // Update status to Analyzing
        await supabase
            .from('ideas')
            .update({ status: 'Analyzing' })
            .eq('id', id);

        setIdea({ ...idea, status: 'Analyzing' });

        try {
            // Get AI config from localStorage
            const savedSettings = localStorage.getItem('vault_ai_settings');
            const aiConfig = savedSettings ? JSON.parse(savedSettings) : {};

            const analysis = await performResearch(idea.title, idea.description, aiConfig);

            await supabase
                .from('ideas')
                .update({
                    status: 'Ready',
                    analysis_result: analysis
                })
                .eq('id', id);

            fetchIdea();
        } catch (error) {
            console.error('Retry failed:', error);
            await supabase
                .from('ideas')
                .update({
                    status: 'Error',
                    analysis_result: { error: String(error) }
                })
                .eq('id', id);
            fetchIdea();
        } finally {
            setRetrying(false);
        }
    };

    if (loading) return <div className="p-8 text-center animate-pulse text-slate-500">Retrieving intelligence...</div>;
    if (!idea) return <div className="p-8 text-center text-slate-500">Concept not found in the vault.</div>;

    const analysis = idea.analysis_result || {};
    const isReady = idea.status === 'Ready';
    const isError = idea.status === 'Error';
    const isAnalyzing = idea.status === 'Analyzing';

    return (
        <div className="animate-in fade-in zoom-in-95 duration-500 space-y-8">
            {/* Detail Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1">
                    <Badge status={idea.status} />
                    <h1 className="text-4xl font-extrabold text-white mt-4 mb-2">{idea.title}</h1>
                    <p className="text-slate-400 max-w-2xl leading-relaxed">{idea.description}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-3 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors">
                        <Share2 size={20} className="text-slate-300" />
                    </button>
                    <button className="p-3 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors">
                        <Download size={20} className="text-slate-300" />
                    </button>
                </div>
            </div>

            {isReady ? (
                <>
                    {/* Grid Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl">
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Readiness Score</p>
                            <div className="text-5xl font-black text-indigo-400">
                                {analysis.readinessScore}<span className="text-xl text-slate-600">/100</span>
                            </div>
                            <div className="w-full h-2 bg-slate-700 rounded-full mt-4 overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: `${analysis.readinessScore}%` }} />
                            </div>
                        </div>
                        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl flex flex-col justify-center">
                            <div className="flex items-center gap-3 text-emerald-400 mb-2">
                                <TrendingUp size={20} />
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">TAM (Market)</span>
                            </div>
                            <div className="text-3xl font-bold text-white">{analysis.marketSize}</div>
                        </div>
                        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl flex flex-col justify-center">
                            <div className="flex items-center gap-3 text-violet-400 mb-2">
                                <Users size={20} />
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Target Audience</span>
                            </div>
                            <div className="text-xl font-bold text-white line-clamp-1">{analysis.targetAudience}</div>
                        </div>
                        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl flex flex-col justify-center">
                            <div className="flex items-center gap-3 text-amber-400 mb-2">
                                <ShieldCheck size={20} />
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Top Competitor</span>
                            </div>
                            <div className="text-xl font-bold text-white truncate">{analysis.topCompetitor}</div>
                        </div>
                    </div>

                    {/* Chart & Insights Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                Market Growth Projection <span className="text-xs font-normal text-slate-500 italic">(Estimated by AI Agent)</span>
                            </h3>
                            <GrowthChart data={analysis.growthMetrics || []} />
                        </div>

                        <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl flex flex-col">
                            <h3 className="text-xl font-bold text-white mb-6">Competitor List</h3>
                            <div className="space-y-6 flex-1">
                                {analysis.competitors?.map((comp, idx) => (
                                    <div key={idx} className="space-y-2 pb-4 border-b border-slate-700 last:border-0">
                                        <div className="text-white font-bold">{comp.name}</div>
                                        <div className="flex items-start gap-2 text-xs">
                                            <CheckCircle2 size={14} className="text-emerald-400 mt-0.5" />
                                            <span className="text-slate-400">
                                                <span className="text-emerald-400 font-bold">PRO:</span> {comp.strength}
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-2 text-xs">
                                            <AlertCircle size={14} className="text-amber-400 mt-0.5" />
                                            <span className="text-slate-400">
                                                <span className="text-amber-400 font-bold">CON:</span> {comp.weakness}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
                                <p className="text-xs text-indigo-400 font-medium leading-relaxed">
                                    💡 Market Trend: {analysis.trend}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Plan */}
                    <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl">
                        <h3 className="text-xl font-bold text-white mb-6">Agent's Recommended Action Plan</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {analysis.actionPlan?.map((step: string, idx: number) => (
                                <div key={idx} className="flex gap-4 items-start bg-slate-900/50 p-5 rounded-2xl border border-slate-700/30">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold text-sm border border-indigo-500/20">
                                        {idx + 1}
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : isError ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-6">
                    <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-full">
                        <XCircle size={48} className="text-rose-400" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-white mb-2">Research Failed</h3>
                        <p className="text-slate-400 max-w-md">
                            The AI agent encountered an issue while analyzing this idea.
                            {analysis.error && (
                                <span className="block mt-2 text-rose-400 text-sm">{analysis.error}</span>
                            )}
                        </p>
                    </div>
                    <button
                        onClick={retryResearch}
                        disabled={retrying}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                    >
                        {retrying ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                        {retrying ? 'Retrying...' : 'Retry Analysis'}
                    </button>
                </div>
            ) : (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                    <p className="text-slate-400 font-medium">Artificial Intelligence is currently synthesizing market data...</p>
                    <p className="text-slate-500 text-sm">This page will update automatically when ready</p>
                    <button
                        onClick={retryResearch}
                        disabled={retrying}
                        className="mt-4 flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {retrying ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                        {retrying ? 'Retrying...' : 'Stuck? Retry Analysis'}
                    </button>
                </div>
            )}
        </div>
    );
}

