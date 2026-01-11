/**
 * @module components/layout/Sidebar
 * @description Navigation sidebar for the dashboard.
 */

'use client';

import React from 'react';
import {
    LayoutDashboard,
    History,
    Users,
    Settings,
    LogOut,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
    isOpen: boolean;
    setOpen: (open: boolean) => void;
}

/**
 * Responsive sidebar component.
 * 
 * Collapses into a drawer on mobile and stays pinned on desktop.
 * Highlights the active route using Next.js usePathname.
 * 
 * @param {SidebarProps} props - Component properties
 * @returns {JSX.Element} The rendered sidebar
 */
export const Sidebar = ({ isOpen, setOpen }: SidebarProps) => {
    const pathname = usePathname();

    const menuItems = [
        { label: 'Vault', icon: LayoutDashboard, href: '/dashboard' },
        { label: 'Weekly Digest', icon: History, href: '/dashboard/digest' },
        { label: 'Board', icon: Users, href: '/dashboard/board' },
        { label: 'Settings', icon: Settings, href: '/dashboard/settings' }
    ];

    return (
        <aside className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] border-r border-slate-800 transition-transform lg:translate-x-0",
            isOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
            <div className="h-full flex flex-col p-6">
                <div className="flex items-center gap-3 mb-12">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white italic">IV</div>
                        <span className="text-xl font-bold text-white tracking-tight">Ideas Vault</span>
                    </Link>
                </div>

                <nav className="flex-1 space-y-2">
                    {menuItems.map(item => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                                pathname === item.href
                                    ? 'bg-indigo-600/10 text-indigo-400'
                                    : 'hover:bg-slate-800 text-slate-400'
                            )}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 mt-auto">
                    <LogOut size={20} />
                    <span className="font-medium">Log Out</span>
                </button>
            </div>

            {isOpen && (
                <button
                    onClick={() => setOpen(false)}
                    className="absolute top-4 right-[-3rem] bg-slate-800 p-2 rounded-lg lg:hidden text-white"
                >
                    <X size={20} />
                </button>
            )}
        </aside>
    );
};
