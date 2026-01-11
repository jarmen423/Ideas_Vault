/**
 * @module components/modals/AboutModal
 * @description Modal displaying the application's purpose and "How it works".
 */

'use client';

import React from 'react';
import { X, Rocket, Lightbulb, ShieldCheck, Cpu } from 'lucide-react';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AboutModal = ({ isOpen, onClose }: AboutModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="bg-slate-800 border border-slate-700 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 custom-scrollbar">

                {/* Header */}
                <div className="p-6 border-b border-slate-700 flex justify-between items-start sticky top-0 bg-slate-800 z-20">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-500/20 rounded-xl">
                                <Rocket className="text-indigo-400" size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-white">The Ideas Vault</h2>
                        </div>
                        <p className="text-slate-400 text-sm">Your AI Startup Incubator</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8 text-slate-300">

                    {/* The Pitch */}
                    <div className="text-lg leading-relaxed text-indigo-100/90 font-medium">
                        "Ideas Vault" isn't just a notepad—it <b>validates</b> your thoughts. It acts like a 24/7 VC analyst in your pocket, instantly researching the market potential of your ideas.
                    </div>

                    {/* How it Works */}
                    <section>
                        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                            <Lightbulb size={20} className="text-yellow-400" />
                            How it Works
                        </h3>
                        <div className="space-y-4 border-l-2 border-slate-700 pl-4">
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-600"></div>
                                <h4 className="text-white font-semibold">1. Capture</h4>
                                <p className="text-slate-400 text-sm mt-1">You have a flash of inspiration. You log it in the vault.</p>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></div>
                                <h4 className="text-white font-semibold">2. The "Magic" (AI Research)</h4>
                                <p className="text-slate-400 text-sm mt-1">Instead of just saving text, our AI Agent researches the concept in real-time.</p>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-green-500"></div>
                                <h4 className="text-white font-semibold">3. The Result</h4>
                                <p className="text-slate-400 text-sm mt-1">Seconds later, you get a <b>Readiness Score</b>, <b>Market Size</b> estimates, and a concrete <b>Action Plan</b>.</p>
                            </div>
                        </div>
                    </section>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                            <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                                <ShieldCheck size={18} className="text-emerald-400" /> Why We Made It
                            </h4>
                            <p className="text-sm text-slate-400">Most ideas die because market research is boring. We automated the boring part so you can focus on building.</p>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                            <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                                <Cpu size={18} className="text-blue-400" /> Key Features
                            </h4>
                            <ul className="text-sm text-slate-400 list-disc list-inside space-y-1">
                                <li><b>Bring Your Own Key</b> (BYOK)</li>
                                <li>Secure Postgres Storage</li>
                                <li>Multi-provider AI Support</li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
