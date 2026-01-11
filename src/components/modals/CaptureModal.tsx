/**
 * @module components/modals/CaptureModal
 * @description Modal for capturing new ideas (Text, Voice, or Image).
 */

'use client';

import React, { useState } from 'react';
import {
    X,
    FileText,
    Mic,
    Image as ImageIcon,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { title: string; description: string; type: string }) => Promise<void>;
}

/**
 * A multi-tab modal for capturing startup inspiration.
 * 
 * Supports text entry, simulated voice recording, and image drag-and-drop placeholders.
 * Integrates with a server action to process the idea via AI.
 * 
 * @param {CaptureModalProps} props - Component properties
 * @returns {JSX.Element | null} The rendered modal or null if closed
 */
export const CaptureModal = ({ isOpen, onClose, onSubmit }: CaptureModalProps) => {
    const [modalTab, setModalTab] = useState<'text' | 'voice' | 'image'>('text');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isListening, setIsListening] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!title && modalTab === 'text') return;
        setIsSubmitting(true);
        try {
            await onSubmit({ title, description, type: modalTab });
            setTitle('');
            setDescription('');
            onClose();
        } catch (error) {
            console.error("Failed to add idea:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                onClick={() => !isSubmitting && onClose()}
            />

            <div className="bg-slate-800 border border-slate-700 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 fade-in duration-300">
                {/* Tabs */}
                <div className="flex border-b border-slate-700">
                    {[
                        { id: 'text', icon: FileText, label: 'Text' },
                        { id: 'voice', icon: Mic, label: 'Voice Note' },
                        { id: 'image', icon: ImageIcon, label: 'Snapshot' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            //@ts-ignore
                            onClick={() => setModalTab(tab.id)}
                            className={cn(
                                "flex-1 py-4 flex items-center justify-center gap-2 transition-colors",
                                modalTab === tab.id
                                    ? 'bg-indigo-600/10 text-indigo-400 border-b-2 border-indigo-500'
                                    : 'text-slate-500 hover:text-slate-300'
                            )}
                        >
                            <tab.icon size={18} />
                            <span className="font-bold text-sm">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="p-6 space-y-4">
                    {modalTab === 'text' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                    Concept Title
                                </label>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="e.g. Uber for Private Jets"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-white transition-all"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                    Description
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Explain your vision..."
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-white resize-none transition-all"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {modalTab === 'voice' && (
                        <div className="flex flex-col items-center justify-center py-10 space-y-6">
                            <div
                                className={cn(
                                    "p-8 rounded-full relative transition-all duration-500",
                                    isListening ? 'bg-indigo-600 shadow-[0_0_40px_rgba(79,70,229,0.5)]' : 'bg-slate-700 cursor-pointer'
                                )}
                                onClick={() => setIsListening(!isListening)}
                            >
                                <Mic size={48} className="text-white" />
                                {isListening && <div className="absolute inset-0 rounded-full border-4 border-white animate-ping" />}
                            </div>
                            <div className="text-center">
                                <p className="text-white font-bold">{isListening ? 'Listening...' : 'Tap to Record'}</p>
                                <p className="text-slate-500 text-xs mt-2">Speak clearly about your concept.</p>
                            </div>
                            {isListening && (
                                <div className="w-full max-w-xs h-8 flex items-center justify-center gap-1">
                                    {[...Array(12)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-1.5 bg-indigo-400 rounded-full animate-bounce"
                                            style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {modalTab === 'image' && (
                        <div className="border-2 border-dashed border-slate-700 rounded-3xl p-10 flex flex-col items-center justify-center space-y-4 hover:border-indigo-500/50 transition-colors cursor-pointer group">
                            <div className="p-4 bg-slate-700 rounded-2xl group-hover:bg-indigo-600/20 transition-colors">
                                <ImageIcon size={32} className="text-slate-400 group-hover:text-indigo-400" />
                            </div>
                            <div className="text-center">
                                <p className="text-white font-bold">Drop Image or Sketch</p>
                                <p className="text-slate-500 text-xs mt-2">Upload visual references of your idea.</p>
                            </div>
                        </div>
                    )}

                    <button
                        disabled={isSubmitting || (!title && modalTab === 'text')}
                        onClick={handleSubmit}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all mt-4"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Agent Researching...
                            </>
                        ) : (
                            <>Send to Vault</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
