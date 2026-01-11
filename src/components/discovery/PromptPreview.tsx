/**
 * @module components/discovery/PromptPreview
 * @description Preview modal for the generated research prompt.
 * 
 * Shows both TL;DR summary and full detailed prompt after discovery completion.
 * Allows users to review, edit, and approve before starting research.
 * 
 * @purpose Final review step before research/validation begins.
 * @dependencies React state, discovery synthesis output
 */

'use client';

import React, { useState } from 'react';
import {
    X,
    FileText,
    Zap,
    Check,
    Edit3,
    Copy,
    CheckCheck,
    Target,
    Users,
    TrendingUp,
    AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TldrData {
    refinedIdea: string;
    targetMarket: string;
    keyDifferentiator: string;
    mainRisks: string[];
    founderFitScore: number;
}

interface FullPromptData {
    problemStatement: string;
    targetCustomer: {
        profile: string;
        painPoints: string[];
        currentSolutions: string;
    };
    valueProposition: string;
    hypotheses: string[];
    competitiveResearch: string[];
    marketIndicators: string[];
    evaluationCriteria: string[];
}

interface PromptPreviewProps {
    isOpen: boolean;
    onClose: () => void;
    tldr: TldrData;
    fullPrompt: FullPromptData;
    onApprove: () => void;
    onEdit: () => void;
}

/**
 * Modal component for previewing the generated research prompt.
 * 
 * Features tabbed interface with TL;DR summary and full detailed view.
 * Includes approval and edit actions for user control.
 * 
 * @param props - Component properties with synthesis data and handlers
 * @returns The rendered preview modal
 */
export function PromptPreview({
    isOpen,
    onClose,
    tldr,
    fullPrompt,
    onApprove,
    onEdit
}: PromptPreviewProps) {
    const [activeTab, setActiveTab] = useState<'tldr' | 'full'>('tldr');
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleCopy = async () => {
        const content = activeTab === 'tldr'
            ? formatTldrForCopy(tldr)
            : formatFullPromptForCopy(fullPrompt);

        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getScoreColor = (score: number) => {
        if (score >= 8) return 'text-emerald-400 bg-emerald-400/10';
        if (score >= 6) return 'text-amber-400 bg-amber-400/10';
        return 'text-rose-400 bg-rose-400/10';
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="bg-slate-800 border border-slate-700 w-full max-w-2xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 fade-in duration-300 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
                    <div>
                        <h2 className="text-xl font-bold text-white">Research Prompt Preview</h2>
                        <p className="text-sm text-slate-400">Review before starting research</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-700 rounded-xl transition-colors"
                    >
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-700">
                    <button
                        onClick={() => setActiveTab('tldr')}
                        className={cn(
                            "flex-1 py-3 flex items-center justify-center gap-2 transition-colors font-medium",
                            activeTab === 'tldr'
                                ? 'bg-indigo-600/10 text-indigo-400 border-b-2 border-indigo-500'
                                : 'text-slate-500 hover:text-slate-300'
                        )}
                    >
                        <Zap size={16} />
                        TL;DR Summary
                    </button>
                    <button
                        onClick={() => setActiveTab('full')}
                        className={cn(
                            "flex-1 py-3 flex items-center justify-center gap-2 transition-colors font-medium",
                            activeTab === 'full'
                                ? 'bg-indigo-600/10 text-indigo-400 border-b-2 border-indigo-500'
                                : 'text-slate-500 hover:text-slate-300'
                        )}
                    >
                        <FileText size={16} />
                        Full Prompt
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'tldr' ? (
                        <div className="space-y-6">
                            {/* Founder Fit Score */}
                            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-slate-700">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Founder Fit Score</p>
                                    <p className="text-slate-400 text-sm mt-1">How well-positioned you are for this idea</p>
                                </div>
                                <div className={cn("text-4xl font-black px-4 py-2 rounded-xl", getScoreColor(tldr.founderFitScore))}>
                                    {tldr.founderFitScore}/10
                                </div>
                            </div>

                            {/* Core Idea */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Target size={16} className="text-indigo-400" />
                                    <h3 className="font-bold text-white">Refined Idea</h3>
                                </div>
                                <p className="text-slate-300 bg-slate-900 p-4 rounded-xl border border-slate-700">
                                    {tldr.refinedIdea}
                                </p>
                            </div>

                            {/* Target Market */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Users size={16} className="text-emerald-400" />
                                    <h3 className="font-bold text-white">Target Market</h3>
                                </div>
                                <p className="text-slate-300 bg-slate-900 p-4 rounded-xl border border-slate-700">
                                    {tldr.targetMarket}
                                </p>
                            </div>

                            {/* Key Differentiator */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <TrendingUp size={16} className="text-amber-400" />
                                    <h3 className="font-bold text-white">Key Differentiator</h3>
                                </div>
                                <p className="text-slate-300 bg-slate-900 p-4 rounded-xl border border-slate-700">
                                    {tldr.keyDifferentiator}
                                </p>
                            </div>

                            {/* Main Risks */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle size={16} className="text-rose-400" />
                                    <h3 className="font-bold text-white">Key Risks to Validate</h3>
                                </div>
                                <ul className="space-y-2">
                                    {tldr.mainRisks.map((risk, i) => (
                                        <li key={i} className="flex items-start gap-3 text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-700">
                                            <span className="text-rose-400 font-bold">{i + 1}.</span>
                                            {risk}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Problem Statement */}
                            <Section title="Problem Statement">
                                <p className="text-slate-300">{fullPrompt.problemStatement}</p>
                            </Section>

                            {/* Target Customer */}
                            <Section title="Target Customer">
                                <p className="text-slate-300 mb-3">{fullPrompt.targetCustomer.profile}</p>
                                <div className="space-y-2">
                                    <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Pain Points</p>
                                    <ul className="space-y-1">
                                        {fullPrompt.targetCustomer.painPoints.map((point, i) => (
                                            <li key={i} className="text-slate-400 text-sm flex items-center gap-2">
                                                <span className="w-1 h-1 bg-indigo-400 rounded-full" />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mt-3">Current Solutions</p>
                                    <p className="text-slate-400 text-sm">{fullPrompt.targetCustomer.currentSolutions}</p>
                                </div>
                            </Section>

                            {/* Value Proposition */}
                            <Section title="Value Proposition">
                                <p className="text-slate-300">{fullPrompt.valueProposition}</p>
                            </Section>

                            {/* Hypotheses */}
                            <Section title="Key Hypotheses to Validate">
                                <ul className="space-y-2">
                                    {fullPrompt.hypotheses.map((h, i) => (
                                        <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                                            <Check size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                                            {h}
                                        </li>
                                    ))}
                                </ul>
                            </Section>

                            {/* Competitive Research */}
                            <Section title="Competitive Landscape">
                                <div className="flex flex-wrap gap-2">
                                    {fullPrompt.competitiveResearch.map((item, i) => (
                                        <span key={i} className="px-3 py-1 bg-slate-700 text-slate-300 text-sm rounded-full">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </Section>

                            {/* Market Indicators */}
                            <Section title="Market Indicators to Research">
                                <ul className="space-y-1">
                                    {fullPrompt.marketIndicators.map((m, i) => (
                                        <li key={i} className="text-slate-400 text-sm flex items-center gap-2">
                                            <TrendingUp size={12} className="text-amber-400" />
                                            {m}
                                        </li>
                                    ))}
                                </ul>
                            </Section>

                            {/* Evaluation Criteria */}
                            <Section title="Evaluation Criteria">
                                <ul className="space-y-1">
                                    {fullPrompt.evaluationCriteria.map((c, i) => (
                                        <li key={i} className="text-slate-400 text-sm flex items-center gap-2">
                                            <Target size={12} className="text-indigo-400" />
                                            {c}
                                        </li>
                                    ))}
                                </ul>
                            </Section>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="p-4 bg-slate-800/50 border-t border-slate-700 flex items-center justify-between">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors"
                    >
                        {copied ? <CheckCheck size={16} className="text-emerald-400" /> : <Copy size={16} />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={onEdit}
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
                        >
                            <Edit3 size={16} />
                            Continue Refining
                        </button>
                        <button
                            onClick={onApprove}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
                        >
                            <Check size={16} />
                            Start Research
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Reusable section component for organizing full prompt content.
 */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">{title}</h3>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                {children}
            </div>
        </div>
    );
}

/**
 * Formats TL;DR data for clipboard copy.
 */
function formatTldrForCopy(tldr: TldrData): string {
    return `
REFINED IDEA: ${tldr.refinedIdea}

TARGET MARKET: ${tldr.targetMarket}

KEY DIFFERENTIATOR: ${tldr.keyDifferentiator}

FOUNDER FIT SCORE: ${tldr.founderFitScore}/10

KEY RISKS:
${tldr.mainRisks.map((r, i) => `${i + 1}. ${r}`).join('\n')}
    `.trim();
}

/**
 * Formats full prompt data for clipboard copy.
 */
function formatFullPromptForCopy(prompt: FullPromptData): string {
    return `
PROBLEM STATEMENT:
${prompt.problemStatement}

TARGET CUSTOMER:
${prompt.targetCustomer.profile}

Pain Points:
${prompt.targetCustomer.painPoints.map(p => `- ${p}`).join('\n')}

Current Solutions: ${prompt.targetCustomer.currentSolutions}

VALUE PROPOSITION:
${prompt.valueProposition}

HYPOTHESES TO VALIDATE:
${prompt.hypotheses.map(h => `- ${h}`).join('\n')}

COMPETITIVE LANDSCAPE:
${prompt.competitiveResearch.join(', ')}

MARKET INDICATORS:
${prompt.marketIndicators.map(m => `- ${m}`).join('\n')}

EVALUATION CRITERIA:
${prompt.evaluationCriteria.map(c => `- ${c}`).join('\n')}
    `.trim();
}
