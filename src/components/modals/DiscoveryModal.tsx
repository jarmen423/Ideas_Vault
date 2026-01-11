/**
 * @module components/modals/DiscoveryModal
 * @description Main modal orchestrator for the Discovery Mode flow.
 * 
 * Manages the full discovery experience including chat, prompt preview,
 * and founder-fit display. Can be triggered for new ideas or existing ones.
 * 
 * @purpose Central entry point for Discovery Mode UI.
 * @dependencies DiscoveryChat, PromptPreview, FounderFitCard, discovery actions
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { DiscoveryChat } from '@/components/discovery/DiscoveryChat';
import { PromptPreview } from '@/components/discovery/PromptPreview';
import { FounderFitCard } from '@/components/discovery/FounderFitCard';
import {
    startDiscoverySession,
    sendDiscoveryMessage,
    getDiscoverySession,
    skipDiscovery
} from '@/app/actions/discovery';

interface DiscoveryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (synthesisOutput: any) => void;
    userId: string;
    existingIdeaId?: string;
    existingIdeaData?: { title: string; description: string };
}

type DiscoveryStage = 'loading' | 'chat' | 'preview' | 'complete';

/**
 * Main modal for the Discovery Mode collaborative process.
 * 
 * Orchestrates the flow from initial conversation through prompt preview
 * to research initiation. Handles session creation and state management.
 * 
 * @param props - Component properties including user and idea data
 * @returns The rendered discovery modal
 */
export function DiscoveryModal({
    isOpen,
    onClose,
    onComplete,
    userId,
    existingIdeaId,
    existingIdeaData
}: DiscoveryModalProps) {
    const [stage, setStage] = useState<DiscoveryStage>('loading');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [currentPhase, setCurrentPhase] = useState('vision');
    const [synthesisOutput, setSynthesisOutput] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Initialize session when modal opens
    useEffect(() => {
        if (isOpen && !sessionId) {
            initializeSession();
        }
    }, [isOpen]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSessionId(null);
            setMessages([]);
            setCurrentPhase('vision');
            setSynthesisOutput(null);
            setStage('loading');
            setError(null);
        }
    }, [isOpen]);

    const initializeSession = async () => {
        try {
            setStage('loading');
            const result = await startDiscoverySession(
                userId,
                existingIdeaId,
                existingIdeaData
            );

            setSessionId(result.session.id);
            setMessages(result.session.messages || []);
            setCurrentPhase(result.session.current_phase);
            setStage('chat');
        } catch (err) {
            console.error('Failed to initialize discovery session:', err);
            setError('Failed to start discovery session. Please try again.');
            setStage('loading');
        }
    };

    const handleSendMessage = async (sessionId: string, message: string) => {
        // Load AI config from localStorage
        const savedSettings = localStorage.getItem('vault_ai_settings');
        const aiConfig = savedSettings ? JSON.parse(savedSettings) : {};

        const result = await sendDiscoveryMessage(sessionId, message, aiConfig);

        setCurrentPhase(result.currentPhase);

        if (result.isComplete && result.synthesisOutput) {
            setSynthesisOutput(result.synthesisOutput);
        }

        return result;
    };

    const handleDiscoveryComplete = (output: any) => {
        setSynthesisOutput(output);
        setStage('preview');
    };

    const handleSkip = async () => {
        if (sessionId) {
            await skipDiscovery(sessionId);
        }
        onClose();
    };

    const handleApprovePrompt = () => {
        setStage('complete');
        onComplete(synthesisOutput);
        onClose();
    };

    const handleEditPrompt = () => {
        // Go back to chat to continue refining
        setStage('chat');
        setCurrentPhase('vision'); // Reset phase to allow more conversation
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                onClick={() => stage !== 'loading' && onClose()}
            />

            <div className="bg-slate-800 border border-slate-700 w-full max-w-3xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 fade-in duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Discovery Mode</h2>
                            <p className="text-sm text-white/70">
                                {stage === 'loading' && 'Starting session...'}
                                {stage === 'chat' && 'Refining your idea together'}
                                {stage === 'preview' && 'Review your research prompt'}
                                {stage === 'complete' && 'Ready for research!'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={stage === 'loading'}
                        className="p-2 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-50"
                    >
                        <X size={20} className="text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {stage === 'loading' && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 size={48} className="text-indigo-400 animate-spin mb-4" />
                            <p className="text-slate-400">Preparing your discovery session...</p>
                            {error && (
                                <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                                    <p className="text-rose-400 text-sm">{error}</p>
                                    <button
                                        onClick={initializeSession}
                                        className="mt-2 text-rose-300 underline text-sm"
                                    >
                                        Try again
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {stage === 'chat' && sessionId && (
                        <DiscoveryChat
                            sessionId={sessionId}
                            initialMessages={messages}
                            currentPhase={currentPhase}
                            onComplete={handleDiscoveryComplete}
                            onSkip={handleSkip}
                            sendMessage={handleSendMessage}
                        />
                    )}

                    {stage === 'preview' && synthesisOutput && (
                        <div className="space-y-6">
                            <PromptPreview
                                isOpen={true}
                                onClose={() => setStage('chat')}
                                tldr={synthesisOutput.tldr}
                                fullPrompt={synthesisOutput.fullPrompt}
                                onApprove={handleApprovePrompt}
                                onEdit={handleEditPrompt}
                            />

                            {synthesisOutput.founderFit && (
                                <FounderFitCard
                                    data={synthesisOutput.founderFit}
                                    score={synthesisOutput.tldr?.founderFitScore || 5}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
