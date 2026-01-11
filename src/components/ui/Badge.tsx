/**
 * @module components/ui/Badge
 * @description Enhanced Badge component for status display.
 */

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeProps {
    status: 'Ready' | 'Analyzing' | string;
    className?: string;
}

/**
 * A stylized badge component to indicate the state of an idea.
 * 
 * Uses smooth transitions and pulsing animations for the "Analyzing" state
 * to provide visual feedback while AI is processing.
 * 
 * @param {BadgeProps} props - Component properties
 * @returns {JSX.Element} The rendered badge
 */
export const Badge = ({ status, className }: BadgeProps) => {
    const isReady = status === "Ready";

    return (
        <div className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all",
            isReady
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse',
            className
        )}>
            {isReady ? (
                <CheckCircle2 size={12} />
            ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            )}
            {status}
        </div>
    );
};
