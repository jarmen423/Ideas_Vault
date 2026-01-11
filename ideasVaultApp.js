import React, { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    Search,
    LayoutDashboard,
    Settings,
    LogOut,
    Mic,
    Image as ImageIcon,
    FileText,
    TrendingUp,
    Users,
    ShieldCheck,
    ArrowLeft,
    Share2,
    Download,
    CheckCircle2,
    AlertCircle,
    Menu,
    X,
    History,
    Rocket
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

// --- CONSTANTS & DUMMY DATA ---
const INITIAL_IDEAS = [
    {
        id: '1',
        title: "AI-Powered Urban Farming",
        description: "An automated hydroponics system controlled by computer vision to optimize crop yield in high-rise apartments.",
        tags: ["#SaaS", "#AgTech", "#Green"],
        status: "Ready",
        inputType: "Text",
        readinessScore: 84,
        marketSize: "$4.2B",
        targetAudience: "Urban Professionals",
        topCompetitor: "FarmShelf",
        trend: "Hyper-local sourcing demand (+22% YoY)",
        growthMetrics: [
            { year: '2024', value: 1.2 },
            { year: '2025', value: 2.1 },
            { year: '2026', value: 3.5 },
            { year: '2027', value: 4.2 },
        ],
        competitors: [
            { name: "FarmShelf", strength: "Hardware design", weakness: "High subscription cost" },
            { name: "Click & Grow", strength: "Consumer brand", weakness: "Limited scale" }
        ],
        actionPlan: [
            "Prototype V1 with Raspberry Pi",
            "Survey 500 apartment dwellers",
            "Secure local plant nursery partner"
        ]
    },
    {
        id: '2',
        title: "Micro-SaaS for Ghost Kitchens",
        description: "Operational dashboard to consolidate delivery apps specifically for non-customer-facing restaurant units.",
        tags: ["#FinTech", "#FoodLogistics"],
        status: "Ready",
        inputType: "Voice",
        readinessScore: 71,
        marketSize: "$12.8B",
        targetAudience: "Restaurateurs",
        topCompetitor: "Otter",
        trend: "Post-pandemic delivery stability",
        growthMetrics: [
            { year: '2024', value: 5.0 },
            { year: '2025', value: 7.2 },
            { year: '2026', value: 10.1 },
            { year: '2027', value: 12.8 },
        ],
        competitors: [
            { name: "Otter", strength: "Market share", weakness: "Complexity for small teams" },
            { name: "CloudKitchens", strength: "Vertically integrated", weakness: "Conflict of interest" }
        ],
        actionPlan: [
            "Interview 10 local ghost kitchen owners",
            "Define MVP feature set",
            "Draft technical architecture"
        ]
    }
];

// --- UTILS ---
const generateResearchPacket = (title, desc) => {
    const score = Math.floor(Math.random() * 40) + 55;
    const marketVal = (Math.random() * 20 + 1).toFixed(1);
    return {
        id: Date.now().toString(),
        title,
        description: desc,
        tags: ["#AI-Generated", "#NewVault"],
        status: "Ready",
        inputType: "Text",
        readinessScore: score,
        marketSize: `$${marketVal}B`,
        targetAudience: "Early Adopters / Enterprise",
        topCompetitor: "Stealth Corp",
        trend: "Rapid adoption of automated workflows",
        growthMetrics: [
            { year: '2024', value: marketVal * 0.2 },
            { year: '2025', value: marketVal * 0.5 },
            { year: '2026', value: marketVal * 0.8 },
            { year: '2027', value: marketVal },
        ],
        competitors: [
            { name: "Incumbent X", strength: "Trust", weakness: "Legacy speed" },
            { name: "Startup Y", strength: "Agility", weakness: "Funding" }
        ],
        actionPlan: [
            "Validate problem with landing page",
            "Analyze technical feasibility",
            "Build community of testers"
        ]
    };
};

// --- COMPONENTS ---

const Badge = ({ children, status }) => {
    const isReady = status === "Ready";
    return (
        <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${isReady ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
            }`}>
            {isReady ? <CheckCircle2 size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />}
            {status}
        </div>
    );
};

const IdeaCard = ({ idea, onClick }) => (
    <div
        onClick={() => onClick(idea)}
        className="group bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl hover:border-indigo-500/50 transition-all cursor-pointer backdrop-blur-sm relative overflow-hidden"
    >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
            {idea.inputType === "Voice" ? <Mic size={40} /> : idea.inputType === "Image" ? <ImageIcon size={40} /> : <FileText size={40} />}
        </div>
        <div className="flex justify-between items-start mb-4">
            <Badge status={idea.status} />
            <span className="text-slate-500 text-xs flex items-center gap-1">
                {idea.inputType}
            </span>
        </div>
        <h3 className="text-white font-bold text-lg mb-2 group-hover:text-indigo-300 transition-colors">{idea.title}</h3>
        <p className="text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed">{idea.description}</p>
        <div className="flex flex-wrap gap-2">
            {idea.tags.map(tag => (
                <span key={tag} className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{tag}</span>
            ))}
        </div>
    </div>
);

const App = () => {
    const [view, setView] = useState('landing'); // landing, dashboard, detail
    const [ideas, setIdeas] = useState(INITIAL_IDEAS);
    const [selectedIdea, setSelectedIdea] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Modal State
    const [modalTab, setModalTab] = useState('text');
    const [newIdea, setNewIdea] = useState({ title: '', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const handleAddIdea = () => {
        if (!newIdea.title) return;
        setIsSubmitting(true);

        // Simulate AI Agent processing
        setTimeout(() => {
            const processedIdea = generateResearchPacket(newIdea.title, newIdea.description);
            setIdeas([processedIdea, ...ideas]);
            setIsSubmitting(false);
            setIsModalOpen(false);
            setNewIdea({ title: '', description: '' });
        }, 2000);
    };

    const openDetail = (idea) => {
        setSelectedIdea(idea);
        setView('detail');
    };

    if (view === 'landing') {
        return (
            <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
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
                    <button
                        onClick={() => setView('dashboard')}
                        className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-indigo-500/25 transition-all flex items-center gap-3 mx-auto"
                    >
                        Open Your Vault
                        <div className="group-hover:translate-x-1 transition-transform">→</div>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 flex font-sans">
            {/* Sidebar - Desktop */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] border-r border-slate-800 transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full flex flex-col p-6">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white italic">IV</div>
                        <span className="text-xl font-bold text-white tracking-tight">Ideas Vault</span>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {[
                            { label: 'Vault', icon: LayoutDashboard, active: true },
                            { label: 'Weekly Digest', icon: History, active: false },
                            { label: 'Board', icon: Users, active: false },
                            { label: 'Settings', icon: Settings, active: false }
                        ].map(item => (
                            <button
                                key={item.label}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${item.active ? 'bg-indigo-600/10 text-indigo-400' : 'hover:bg-slate-800 text-slate-400'}`}
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 mt-auto">
                        <LogOut size={20} />
                        <span className="font-medium">Log Out</span>
                    </button>
                </div>
                {sidebarOpen && (
                    <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-[-3rem] bg-slate-800 p-2 rounded-lg lg:hidden">
                        <X size={20} />
                    </button>
                )}
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-64 relative pb-24 lg:pb-0">

                {/* Header */}
                <header className="sticky top-0 z-30 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800 p-4 lg:p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-400"><Menu /></button>
                        {view === 'detail' ? (
                            <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-indigo-400 font-medium hover:text-indigo-300">
                                <ArrowLeft size={20} /> Back to Vault
                            </button>
                        ) : (
                            <h1 className="text-xl font-bold text-white">Your Dashboard</h1>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center bg-slate-800/50 border border-slate-700 px-3 py-2 rounded-xl">
                            <Search size={18} className="text-slate-500 mr-2" />
                            <input type="text" placeholder="Search ideas..." className="bg-transparent border-none focus:outline-none text-sm w-48 text-slate-200" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500" />
                    </div>
                </header>

                {/* Dynamic Content Views */}
                <div className="p-4 lg:p-8 max-w-7xl mx-auto">
                    {view === 'dashboard' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-3xl font-extrabold text-white mb-2">The Vault</h2>
                                    <p className="text-slate-400">Manage and explore your startup concepts.</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 transition-all"
                                >
                                    <Plus size={20} />
                                    New Idea
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {ideas.map(idea => (
                                    <IdeaCard key={idea.id} idea={idea} onClick={openDetail} />
                                ))}
                            </div>
                        </div>
                    )}

                    {view === 'detail' && selectedIdea && (
                        <div className="animate-in fade-in zoom-in-95 duration-500 space-y-8">
                            {/* Detail Header */}
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div className="flex-1">
                                    <Badge status={selectedIdea.status} />
                                    <h1 className="text-4xl font-extrabold text-white mt-4 mb-2">{selectedIdea.title}</h1>
                                    <p className="text-slate-400 max-w-2xl leading-relaxed">{selectedIdea.description}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="p-3 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors">
                                        <Share2 size={20} className="text-slate-300" />
                                    </button>
                                    <button className="p-3 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors">
                                        <Download size={20} className="text-slate-300" />
                                    </button>
                                </div>
                            </div>

                            {/* Grid Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl">
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Readiness Score</p>
                                    <div className="text-5xl font-black text-indigo-400">{selectedIdea.readinessScore}<span className="text-xl text-slate-600">/100</span></div>
                                    <div className="w-full h-2 bg-slate-700 rounded-full mt-4 overflow-hidden">
                                        <div className="h-full bg-indigo-500" style={{ width: `${selectedIdea.readinessScore}%` }} />
                                    </div>
                                </div>
                                <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl flex flex-col justify-center">
                                    <div className="flex items-center gap-3 text-emerald-400 mb-2">
                                        <TrendingUp size={20} />
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">TAM (Market)</span>
                                    </div>
                                    <div className="text-3xl font-bold text-white">{selectedIdea.marketSize}</div>
                                </div>
                                <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl flex flex-col justify-center">
                                    <div className="flex items-center gap-3 text-violet-400 mb-2">
                                        <Users size={20} />
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Target Audience</span>
                                    </div>
                                    <div className="text-xl font-bold text-white line-clamp-1">{selectedIdea.targetAudience}</div>
                                </div>
                                <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl flex flex-col justify-center">
                                    <div className="flex items-center gap-3 text-amber-400 mb-2">
                                        <ShieldCheck size={20} />
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Top Competitor</span>
                                    </div>
                                    <div className="text-xl font-bold text-white truncate">{selectedIdea.topCompetitor}</div>
                                </div>
                            </div>

                            {/* Chart & Insights Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                        Market Growth Projection <span className="text-xs font-normal text-slate-500 italic">(Estimated by AI Agent)</span>
                                    </h3>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={selectedIdea.growthMetrics}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                                <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}B`} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }}
                                                    cursor={{ fill: 'rgba(79, 70, 229, 0.1)' }}
                                                />
                                                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                                    {selectedIdea.growthMetrics.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={index === 3 ? '#6366f1' : '#475569'} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl flex flex-col">
                                    <h3 className="text-xl font-bold text-white mb-6">Competitor List</h3>
                                    <div className="space-y-6 flex-1">
                                        {selectedIdea.competitors.map((comp, idx) => (
                                            <div key={idx} className="space-y-2 pb-4 border-b border-slate-700 last:border-0">
                                                <div className="text-white font-bold">{comp.name}</div>
                                                <div className="flex items-start gap-2 text-xs">
                                                    <CheckCircle2 size={14} className="text-emerald-400 mt-0.5" />
                                                    <span className="text-slate-400"><span className="text-emerald-400 font-bold">PRO:</span> {comp.strength}</span>
                                                </div>
                                                <div className="flex items-start gap-2 text-xs">
                                                    <AlertCircle size={14} className="text-amber-400 mt-0.5" />
                                                    <span className="text-slate-400"><span className="text-amber-400 font-bold">CON:</span> {comp.weakness}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
                                        <p className="text-xs text-indigo-400 font-medium leading-relaxed">
                                            💡 Market Trend: {selectedIdea.trend}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Plan */}
                            <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl">
                                <h3 className="text-xl font-bold text-white mb-6">Agent's Recommended Action Plan</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {selectedIdea.actionPlan.map((step, idx) => (
                                        <div key={idx} className="flex gap-4 items-start bg-slate-900/50 p-5 rounded-2xl border border-slate-700/30">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold text-sm border border-indigo-500/20">
                                                {idx + 1}
                                            </div>
                                            <p className="text-slate-300 text-sm leading-relaxed">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Capture Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)} />
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
                                    onClick={() => setModalTab(tab.id)}
                                    className={`flex-1 py-4 flex items-center justify-center gap-2 transition-colors ${modalTab === tab.id ? 'bg-indigo-600/10 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}
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
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Concept Title</label>
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="e.g. Uber for Private Jets"
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-white transition-all"
                                            value={newIdea.title}
                                            onChange={e => setNewIdea({ ...newIdea, title: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Description</label>
                                        <textarea
                                            rows={4}
                                            placeholder="Explain your vision..."
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-white resize-none transition-all"
                                            value={newIdea.description}
                                            onChange={e => setNewIdea({ ...newIdea, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {modalTab === 'voice' && (
                                <div className="flex flex-col items-center justify-center py-10 space-y-6">
                                    <div className={`p-8 rounded-full relative transition-all duration-500 ${isListening ? 'bg-indigo-600 shadow-[0_0_40px_rgba(79,70,229,0.5)]' : 'bg-slate-700 cursor-pointer'}`} onClick={() => setIsListening(!isListening)}>
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
                                                <div key={i} className="w-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }} />
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
                                disabled={isSubmitting || (!newIdea.title && modalTab === 'text')}
                                onClick={handleAddIdea}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all mt-4"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Agent Researching...
                                    </>
                                ) : (
                                    <>Send to Vault</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Bottom Nav */}
            <nav className="fixed bottom-0 inset-x-0 h-20 bg-slate-900 border-t border-slate-800 lg:hidden flex items-center justify-around px-4 z-40">
                {[
                    { icon: LayoutDashboard, active: true },
                    { icon: History, active: false },
                    { icon: Plus, active: false, primary: true },
                    { icon: Users, active: false },
                    { icon: Settings, active: false }
                ].map((item, idx) => (
                    item.primary ? (
                        <button key={idx} onClick={() => setIsModalOpen(true)} className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white -mt-10 shadow-lg shadow-indigo-600/30">
                            <Plus size={28} />
                        </button>
                    ) : (
                        <button key={idx} className={`p-3 rounded-xl ${item.active ? 'text-indigo-400' : 'text-slate-500'}`}>
                            <item.icon size={22} />
                        </button>
                    )
                ))}
            </nav>
        </div>
    );
};

export default App;