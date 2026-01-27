/**
 * @module components/discovery/DiscoveryChat
 * @description Chat interface for the collaborative discovery process.
 * 
 * Provides a real-time conversation UI between the user and AI agent to
 * refine startup ideas, identify gaps, and assess founder-fit.
 * 
 * @purpose Main UI for Discovery Mode conversations.
 * @dependencies Server actions from discovery.ts, React state management
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    Send,
    Loader2,
    Lightbulb,
    Target,
    User,
    Sparkles,
    SkipForward,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

interface DiscoveryChatProps {
    sessionId: string;
    initialMessages: Message[];
    currentPhase: string;
    onComplete: (synthesisOutput: any) => void;
    onSkip: () => void;
    sendMessage: (sessionId: string, message: string) => Promise<{
        response: string;
        currentPhase: string;
        isComplete: boolean;
        synthesisOutput?: any;
    }>;
}

const PHASE_CONFIG = {
    vision: {
        label: 'Vision',
        icon: Lightbulb,
        color: 'text-amber-400',
        bgColor: 'bg-amber-400/10',
        description: 'Understanding your idea'
    },
    gaps: {
        label: 'Gap Analysis',
        icon: Target,
        color: 'text-rose-400',
        bgColor: 'bg-rose-400/10',
        description: 'Identifying blind spots'
    },
    founder_fit: {
        label: 'Founder Fit',
        icon: User,
        color: 'text-blue-400',
        bgColor: 'bg-blue-400/10',
        description: 'Assessing your strengths'
    },
    synthesis: {
        label: 'Synthesis',
        icon: Sparkles,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-400/10',
        description: 'Generating research prompt'
    },
    complete: {
        label: 'Complete',
        icon: Sparkles,
        color: 'text-indigo-400',
        bgColor: 'bg-indigo-400/10',
        description: 'Discovery finished'
    }
};

/**
 * Interactive chat interface for discovery conversations.
 * 
 * Renders message history, phase indicator, and input controls.
 * Handles real-time message sending and response streaming.
 * 
 * @param props - Component properties including session data and handlers
 * @returns The rendered chat interface
 */
export function DiscoveryChat({
    sessionId,
    initialMessages,
    currentPhase,
    onComplete,
    onSkip,
    sendMessage
}: DiscoveryChatProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [phase, setPhase] = useState(currentPhase);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const result = await sendMessage(sessionId, userMessage.content);

            const aiMessage: Message = {
                role: 'assistant',
                content: result.response,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, aiMessage]);
            setPhase(result.currentPhase);

            if (result.isComplete && result.synthesisOutput) {
                onComplete(result.synthesisOutput);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            // Add error message
            const errorMessage: Message = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const phaseConfig = PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG] || PHASE_CONFIG.vision;
    const PhaseIcon = phaseConfig.icon;

    return (
        <div className="flex flex-col h-[70vh] max-h-[600px] bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
            {/* Phase Progress Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", phaseConfig.bgColor)}>
                        <PhaseIcon size={16} className={phaseConfig.color} />
                    </div>
                    <div>
                        <p className={cn("font-bold text-sm", phaseConfig.color)}>
                            {phaseConfig.label}
                        </p>
                        <p className="text-xs text-slate-500">
                            {phaseConfig.description}
                        </p>
                    </div>
                </div>

                {/* Phase Progress Dots */}
                <div className="flex items-center gap-1.5">
                    {['vision', 'gaps', 'founder_fit', 'synthesis'].map((p, i) => {
                        const phases = ['vision', 'gaps', 'founder_fit', 'synthesis'];
                        const currentIndex = phases.indexOf(phase);
                        const isActive = i <= currentIndex;
                        const isCurrent = p === phase;

                        return (
                            <div
                                key={p}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-all duration-300",
                                    isActive ? phaseConfig.color.replace('text-', 'bg-') : 'bg-slate-600',
                                    isCurrent && 'ring-2 ring-offset-2 ring-offset-slate-800 ring-current scale-125'
                                )}
                            />
                        );
                    })}
                </div>

                <button
                    onClick={onSkip}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                    <SkipForward size={14} />
                    Skip to Research
                </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.timestamp}
                        className={cn(
                            "flex gap-3 animate-in slide-in-from-bottom-2 duration-300",
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                    >
                        {message.role === 'assistant' && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <Sparkles size={14} className="text-white" />
                            </div>
                        )}

                        <div
                            className={cn(
                                "max-w-[80%] rounded-2xl px-4 py-3",
                                message.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-md'
                                    : 'bg-slate-800 text-slate-200 rounded-bl-md border border-slate-700'
                            )}
                        >
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                {message.content}
                            </p>
                        </div>

                        {message.role === 'user' && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                                <User size={14} className="text-slate-300" />
                            </div>
                        )}
                    </div>
                ))}

                {/* Typing Indicator */}
                {isLoading && (
                    phase === 'synthesis' ? (
                        <div className="flex gap-3 animate-in fade-in duration-200 w-full max-w-[85%]">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center animate-pulse">
                                <Sparkles size={14} className="text-white" />
                            </div>
                            <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl rounded-bl-md px-5 py-4 w-full relative overflow-hidden group">
                                {/* Shimmer background overlay */}
                                <div className="absolute inset-0 animate-shimmer pointer-events-none" />

                                {/* Content Skeleton */}
                                <div className="space-y-3 relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles size={14} className="text-emerald-400 animate-pulse" />
                                        <span className="text-sm font-medium text-emerald-400 shimmer-text">Synthesizing research prompt...</span>
                                    </div>
                                    <div className="space-y-2 opacity-50">
                                        <div className="h-2 bg-slate-600/50 rounded w-3/4 animate-pulse" style={{ animationDelay: '100ms' }} />
                                        <div className="h-2 bg-slate-600/50 rounded w-full animate-pulse" style={{ animationDelay: '200ms' }} />
                                        <div className="h-2 bg-slate-600/50 rounded w-5/6 animate-pulse" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-3 animate-in fade-in duration-200">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <Sparkles size={14} className="text-white" />
                            </div>
                            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-md px-4 py-3">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-800/30 border-t border-slate-700">
                <div className="flex items-end gap-3">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Share your thoughts..."
                        rows={1}
                        className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all min-h-[48px] max-h-[120px]"
                        style={{
                            height: 'auto',
                            minHeight: '48px'
                        }}
                        disabled={isLoading || phase === 'complete'}
                    />

                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading || phase === 'complete'}
                        className={cn(
                            "flex-shrink-0 p-3 rounded-xl font-bold transition-all",
                            input.trim() && !isLoading
                                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        )}
                    >
                        {isLoading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <Send size={20} />
                        )}
                    </button>
                </div>

                <p className="text-xs text-slate-500 mt-2 text-center">
                    Press Enter to send • Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}
