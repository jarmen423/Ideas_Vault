/**
 * @module components/layout/Header
 * @description Application header with search and user profile.
 */

'use client';

import React from 'react';
import { Menu, Search, ArrowLeft } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface HeaderProps {
    onMenuClick: () => void;
}

/**
 * Global header for authenticated routes.
 * 
 * Provides navigation context (e.g., "Back to Vault") when in detail views
 * and a persistent search interface for filtering ideas.
 * 
 * @param {HeaderProps} props - Component properties
 * @returns {JSX.Element} The rendered header
 */
export const Header = ({ onMenuClick }: HeaderProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const isDetailView = pathname.includes('/ideas/');

    return (
        <header className="sticky top-0 z-30 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800 p-4 lg:p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 text-slate-400"
                >
                    <Menu />
                </button>

                {isDetailView ? (
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 text-indigo-400 font-medium hover:text-indigo-300"
                    >
                        <ArrowLeft size={20} /> Back to Vault
                    </button>
                ) : (
                    <h1 className="text-xl font-bold text-white">Your Dashboard</h1>
                )}
            </div>

            <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center bg-slate-800/50 border border-slate-700 px-3 py-2 rounded-xl">
                    <Search size={18} className="text-slate-500 mr-2" />
                    <input
                        type="text"
                        placeholder="Search ideas..."
                        className="bg-transparent border-none focus:outline-none text-sm w-48 text-slate-200"
                    />
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 cursor-pointer hover:opacity-80 transition-opacity" />
            </div>
        </header>
    );
};
