/**
 * @module components/dashboard/IdeaCard
 * @description Card component for displaying a summary of an idea.
 */

import React from 'react';
import { Mic, Image as ImageIcon, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface IdeaCardProps {
    idea: {
        id: string;
        title: string;
        description: string;
        inputType: string;
        status: string;
        tags: string[];
    };
    className?: string;
}

/**
 * Displays an individual idea card with metadata and visual icons.
 * 
 * This component serves as a primary navigation element in the dashboard,
 * prompting users to dive deeper into their analyzed concepts.
 * 
 * @param {IdeaCardProps} props - Component properties
 * @returns {JSX.Element} The rendered idea card
 */
export const IdeaCard = ({ idea, className }: IdeaCardProps) => {
    const Icon = idea.inputType === "Voice" ? Mic : idea.inputType === "Image" ? ImageIcon : FileText;

    return (
        <Link
            href={`/dashboard/ideas/${idea.id}`}
            className={cn(
                "group bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl hover:border-indigo-500/50 transition-all cursor-pointer backdrop-blur-sm relative overflow-hidden block",
                className
            )}
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                <Icon size={40} />
            </div>

            <div className="flex justify-between items-start mb-4">
                <Badge status={idea.status} />
                <span className="text-slate-500 text-xs flex items-center gap-1">
                    {idea.inputType}
                </span>
            </div>

            <h3 className="text-white font-bold text-lg mb-2 group-hover:text-indigo-300 transition-colors">
                {idea.title}
            </h3>

            <p className="text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed">
                {idea.description}
            </p>

            <div className="flex flex-wrap gap-2">
                {idea.tags?.map(tag => (
                    <span key={tag} className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                        {tag}
                    </span>
                ))}
            </div>
        </Link>
    );
};
