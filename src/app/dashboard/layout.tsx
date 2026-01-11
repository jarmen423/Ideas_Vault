/**
 * @module app/dashboard/layout
 * @description Layout wrapper for the authenticated dashboard area.
 */

'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

/**
 * Authenticated Layout.
 * 
 * Manages the state for the responsive sidebar and provides the core 
 * layout structure for all dashboard views.
 * 
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Sub-pages
 * @returns {JSX.Element} The layout wrapper
 */
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 flex font-sans">
            <Sidebar isOpen={sidebarOpen} setOpen={setSidebarOpen} />

            <main className="flex-1 lg:ml-64 relative pb-24 lg:pb-0 min-h-screen flex flex-col">
                <Header onMenuClick={() => setSidebarOpen(true)} />

                <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}
