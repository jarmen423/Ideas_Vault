/**
 * @module app/page
 * @description Marketing landing page for Ideas Vault.
 */

import React from 'react';
import { Rocket } from 'lucide-react';
import Link from 'next/link';

/**
 * Public landing page.
 * 
 * Features a high-contrast dark theme with premium gradients and 
 * clear call-to-action to maximize conversion.
 * 
 * @returns {JSX.Element} The rendered landing page
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/20 blur-[120px] rounded-full" />

      <div className="z-10 text-center max-w-2xl">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 shadow-xl shadow-indigo-500/5">
            <Rocket className="text-indigo-400" size={48} />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
          Your startup ideas, researched on <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">autopilot.</span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl mb-10 leading-relaxed">
          Stop letting inspiration fade away. Secure your thoughts in the Vault and let our AI agents validate markets, analyze competitors, and score your readiness.
        </p>

        <Link
          href="/login"
          className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-indigo-500/25 transition-all flex items-center gap-3 mx-auto w-fit"
        >
          Open Your Vault
          <div className="group-hover:translate-x-1 transition-transform">→</div>
        </Link>
      </div>
    </div>
  );
}
