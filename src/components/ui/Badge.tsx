/**
 * @module components/ui/Badge
 * @description Enhanced Badge component for status display.
 */

import React from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeProps {
    status: 'Ready' | 'Analyzing' | 'Error' | string;
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
    const isError = status === "Error";

    return (
        <div className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all",
            isReady && 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
            isError && 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
            !isReady && !isError && 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse',
            className
        )}>
            {isReady ? (
                <CheckCircle2 size={12} />
            ) : isError ? (
                <XCircle size={12} />
            ) : (
                <Loader2 size={12} className="animate-spin" />
            )}
            {status}
        </div>
    );
};
