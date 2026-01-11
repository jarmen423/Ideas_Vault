/**
 * @module components/discovery/FounderFitCard
 * @description Visual display card for founder-fit assessment results.
 * 
 * Shows the user's skill match, resources, learning path, and
 * hire recommendations in an engaging visual format.
 * 
 * @purpose Helps founders understand their strengths and gaps for execution.
 * @dependencies Discovery synthesis output from founder_fit field
 */

'use client';

import React from 'react';
import {
    User,
    Code,
    Briefcase,
    Clock,
    DollarSign,
    Users,
    Heart,
    GraduationCap,
    UserPlus,
    CheckCircle2,
    XCircle,
    TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FounderFitData {
    technicalSkills: {
        has: string[];
        needs: string[];
    };
    domainExpertise: string;
    resources: {
        time: string;
        capital: string;
        network: string;
    };
    motivation: string;
    learningPath: string[];
    hireRecommendations: string[];
}

interface FounderFitCardProps {
    data: FounderFitData;
    score: number;
    className?: string;
}

/**
 * Visual card component for displaying founder-fit assessment.
 * 
 * Organized into sections covering skills, resources, and recommendations.
 * Uses color coding to highlight strengths vs gaps.
 * 
 * @param props - Component properties with founder-fit data
 * @returns The rendered founder-fit card
 */
export function FounderFitCard({ data, score, className }: FounderFitCardProps) {
    const getScoreGradient = (score: number) => {
        if (score >= 8) return 'from-emerald-500 to-teal-500';
        if (score >= 6) return 'from-amber-500 to-orange-500';
        return 'from-rose-500 to-pink-500';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 8) return 'Excellent Fit';
        if (score >= 6) return 'Good Potential';
        if (score >= 4) return 'Growth Opportunity';
        return 'Significant Gaps';
    };

    return (
        <div className={cn("bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden", className)}>
            {/* Header with Score */}
            <div className={cn("p-6 bg-gradient-to-r", getScoreGradient(score))}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                            <User size={20} />
                            Founder Fit Assessment
                        </h3>
                        <p className="text-white/80 text-sm mt-1">{getScoreLabel(score)}</p>
                    </div>
                    <div className="text-5xl font-black text-white">
                        {score}<span className="text-2xl text-white/60">/10</span>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Technical Skills */}
                <div className="space-y-3">
                    <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                        <Code size={16} className="text-indigo-400" />
                        Technical Skills
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-xs uppercase tracking-wider text-emerald-400 font-bold">You Have</p>
                            {data.technicalSkills.has.length > 0 ? (
                                <ul className="space-y-1">
                                    {data.technicalSkills.has.map((skill, i) => (
                                        <li key={i} className="text-sm text-slate-300 flex items-center gap-2">
                                            <CheckCircle2 size={12} className="text-emerald-400" />
                                            {skill}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-slate-500 italic">None identified</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs uppercase tracking-wider text-rose-400 font-bold">You Need</p>
                            {data.technicalSkills.needs.length > 0 ? (
                                <ul className="space-y-1">
                                    {data.technicalSkills.needs.map((skill, i) => (
                                        <li key={i} className="text-sm text-slate-300 flex items-center gap-2">
                                            <XCircle size={12} className="text-rose-400" />
                                            {skill}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-emerald-400">All covered! 🎉</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Domain Expertise */}
                <div className="space-y-2">
                    <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                        <Briefcase size={16} className="text-amber-400" />
                        Domain Expertise
                    </h4>
                    <p className="text-slate-300 text-sm bg-slate-900 p-3 rounded-xl">
                        {data.domainExpertise}
                    </p>
                </div>

                {/* Resources */}
                <div className="space-y-3">
                    <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                        <TrendingUp size={16} className="text-purple-400" />
                        Resources
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                        <ResourceCard
                            icon={Clock}
                            label="Time"
                            value={data.resources.time}
                            color="text-blue-400"
                        />
                        <ResourceCard
                            icon={DollarSign}
                            label="Capital"
                            value={data.resources.capital}
                            color="text-emerald-400"
                        />
                        <ResourceCard
                            icon={Users}
                            label="Network"
                            value={data.resources.network}
                            color="text-amber-400"
                        />
                    </div>
                </div>

                {/* Motivation */}
                <div className="space-y-2">
                    <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                        <Heart size={16} className="text-rose-400" />
                        Motivation Assessment
                    </h4>
                    <p className="text-slate-300 text-sm bg-slate-900 p-3 rounded-xl">
                        {data.motivation}
                    </p>
                </div>

                {/* Learning Path */}
                {data.learningPath.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                            <GraduationCap size={16} className="text-cyan-400" />
                            Recommended Learning Path
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {data.learningPath.map((item, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1.5 bg-cyan-400/10 text-cyan-400 text-xs rounded-full font-medium"
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Hire Recommendations */}
                {data.hireRecommendations.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                            <UserPlus size={16} className="text-violet-400" />
                            Consider Hiring
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {data.hireRecommendations.map((role, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1.5 bg-violet-400/10 text-violet-400 text-xs rounded-full font-medium"
                                >
                                    {role}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Small card for displaying resource metrics.
 */
function ResourceCard({
    icon: Icon,
    label,
    value,
    color
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    color: string;
}) {
    return (
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className={color} />
                <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">{label}</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">{value}</p>
        </div>
    );
}
