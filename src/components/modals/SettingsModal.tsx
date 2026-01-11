/**
 * @module components/modals/SettingsModal
 * @description Modal for configuring custom AI provider settings.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Settings, Key, Server, Cpu } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: { apiKey: string; baseURL: string; model: string }) => void;
}

/**
 * Settings Modal.
 * 
 * Allows users to input their own API keys and endpoints for the AI agent.
 * Settings are persisted to LocalStorage by the parent component.
 * 
 * @param {SettingsModalProps} props - Component properties
 */
export const SettingsModal = ({ isOpen, onClose, onSave }: SettingsModalProps) => {
    const [apiKey, setApiKey] = useState('');
    const [baseURL, setBaseURL] = useState('');
    const [model, setModel] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Load from localStorage when opening
            const savedSettings = localStorage.getItem('vault_ai_settings');
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                setApiKey(parsed.apiKey || '');
                setBaseURL(parsed.baseURL || '');
                setModel(parsed.model || '');
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        const newSettings = { apiKey, baseURL, model };
        localStorage.setItem('vault_ai_settings', JSON.stringify(newSettings));
        onSave(newSettings);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 fade-in duration-300">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-xl">
                            <Settings className="text-indigo-400" size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-white">AI Configuration</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <Server size={14} /> Base URL
                        </label>
                        <input
                            type="text"
                            placeholder="https://api.openai.com/v1"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm"
                            value={baseURL}
                            onChange={e => setBaseURL(e.target.value)}
                        />
                        <p className="text-xs text-slate-500">
                            Leave empty for default OpenAI, or use <code>https://openrouter.ai/api/v1</code> etc.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <Key size={14} /> API Key
                        </label>
                        <input
                            type="password"
                            placeholder="sk-..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm"
                            value={apiKey}
                            onChange={e => setApiKey(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <Cpu size={14} /> Model Name
                        </label>
                        <input
                            type="text"
                            placeholder="gpt-4o"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm"
                            value={model}
                            onChange={e => setModel(e.target.value)}
                        />
                        <p className="text-xs text-slate-500">
                            e.g. <code>gpt-4o</code>, <code>anthropic/claude-3-5-sonnet</code>
                        </p>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleSave}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all"
                        >
                            Save Configuration
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
