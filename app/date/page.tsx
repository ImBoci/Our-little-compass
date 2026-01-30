"use client";
import { useState, useEffect } from "react";
import { CalendarHeart, MapPin, Shuffle, ArrowLeft, RotateCcw, ExternalLink, Search } from "lucide-react";
import Link from "next/link";

export default function DatePage() {
  const [activeTab, setActiveTab] = useState<'random' | 'list'>('random');
  const [activities, setActivities] = useState<any[]>([]);
  const [randomActivity, setRandomActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Random Tab State
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Filter State
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/activities").then(res => res.json()).then(data => {
      if (Array.isArray(data)) {
        setActivities(data);
        if (data.length > 0) setRandomActivity(data[Math.floor(Math.random() * data.length)]);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleShuffle = () => {
    if (activities.length > 0) {
      setIsFlipped(false);
      setIsAnimating(true);
      setTimeout(() => {
        let newAct;
        do {
          newAct = activities[Math.floor(Math.random() * activities.length)];
        } while (activities.length > 1 && newAct === randomActivity);
        setRandomActivity(newAct);
        setIsAnimating(false);
      }, 300);
    }
  };

  const types = Array.from(new Set(activities.flatMap(a => a.type ? a.type.split(',').map((t:string) => t.trim()) : []))).sort();

  const filteredActivities = activities.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType ? a.type?.includes(selectedType) : true;
    return matchesSearch && matchesType;
  });

  if (loading) return <div className="flex min-h-screen items-center justify-center text-purple-800 animate-pulse font-serif text-xl">Finding Ideas...</div>;

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-transparent">
      <div className="w-full max-w-4xl relative">
        <Link href="/" className="absolute top-0 left-0 text-slate-600 hover:text-purple-600 transition flex items-center gap-2 font-medium z-10">
            <ArrowLeft size={20} /> Back Home
        </Link>

        <div className="mt-12 mb-8 text-center">
            <h1 className="font-serif text-4xl text-slate-800 font-bold drop-shadow-sm">Date Idea</h1>
        </div>

        {/* TABS */}
        <div className="flex justify-center mb-8">
            <div className="bg-white/40 p-1 rounded-full backdrop-blur-md border border-white/50 shadow-sm flex">
                <button onClick={() => setActiveTab('random')} className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'random' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-white/50'}`}>
                    🎲 Pick for Me
                </button>
                <button onClick={() => setActiveTab('list')} className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'list' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-white/50'}`}>
                    📚 Browse All
                </button>
            </div>
        </div>

        {/* === RANDOM TAB (3D Flip) === */}
        {activeTab === 'random' && (
            <div className="flex flex-col items-center">
                <div className="relative w-full max-w-md h-[450px] perspective-1000">
                    <div className={`relative w-full h-full transition-all duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                        {/* FRONT */}
                        <div className={`absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-white/40 shadow-[0_0_40px_rgba(168,85,247,0.15)] text-center ${!isFlipped ? 'z-10 pointer-events-auto' : 'z-0 pointer-events-none'}`} style={{ background: "rgba(255, 255, 255, 0.35)", backdropFilter: "blur(16px)" }}>
                            {randomActivity ? (
                                <div className={`space-y-6 flex flex-col items-center w-full transition-all duration-300 ease-in-out ${isAnimating ? 'opacity-0 scale-95 blur-md translate-y-4' : 'opacity-100 scale-100 blur-0 translate-y-0'}`}>
                                    <h2 className="font-serif text-4xl font-bold text-slate-900 leading-tight">{randomActivity.name}</h2>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {randomActivity.type && randomActivity.type.split(',').map((t: string, i: number) => (
                                            <span key={i} className="bg-purple-100/80 text-purple-700 px-3 py-1 rounded-full text-sm font-medium border border-purple-200">{t.trim()}</span>
                                        ))}
                                    </div>
                                    {randomActivity.description && <p className="text-lg text-slate-700 font-light italic mt-2">"{randomActivity.description}"</p>}
                                    {randomActivity.location && (
                                        <button onClick={() => setIsFlipped(true)} className="mt-4 flex items-center gap-2 font-medium px-5 py-2.5 rounded-full bg-white/60 text-slate-700 hover:bg-purple-600 hover:text-white transition-all duration-300 shadow-sm border border-purple-100 hover:shadow-purple-300/50 cursor-pointer pointer-events-auto">
                                            <MapPin size={18} /> <span className="truncate max-w-[200px]">{randomActivity.location}</span>
                                        </button>
                                    )}
                                </div>
                            ) : <div className="text-slate-600">No activities found!</div>}
                        </div>
                        {/* BACK */}
                        <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-3xl border-2 border-white/40 shadow-xl overflow-hidden bg-white ${isFlipped ? 'z-10 pointer-events-auto' : 'z-0 pointer-events-none'}`}>
                            {randomActivity?.location && (
                                <>
                                    <iframe width="100%" height="100%" src={`https://maps.google.com/maps?q=${encodeURIComponent(randomActivity.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`} frameBorder="0" scrolling="no" className="w-full h-full block"></iframe>
                                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 pointer-events-none">
                                        <button onClick={() => setIsFlipped(false)} className="pointer-events-auto bg-white/90 text-slate-700 px-4 py-2 rounded-full shadow-lg hover:bg-white flex items-center gap-2 text-sm font-bold backdrop-blur-sm"><RotateCcw size={16} /> Flip Back</button>
                                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(randomActivity.location)}`} target="_blank" rel="noopener noreferrer" className="pointer-events-auto bg-purple-600/90 text-white px-4 py-2 rounded-full shadow-lg hover:bg-purple-600 flex items-center gap-2 text-sm font-bold backdrop-blur-sm"><ExternalLink size={16} /> Open App</a>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <button onClick={handleShuffle} className="mt-12 group relative inline-flex items-center gap-3 bg-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 hover:bg-purple-700 hover:shadow-[0_0_30px_#a855f7]">
                    <Shuffle className="group-hover:rotate-180 transition-transform duration-500" /> Pick Another
                </button>
            </div>
        )}

        {/* === LIST TAB === */}
        {activeTab === 'list' && (
            <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Filters */}
                <div className="bg-white/40 backdrop-blur-md rounded-2xl p-4 mb-6 border border-white/50">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search activities..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white/60 border border-white/60 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-300 text-slate-700 placeholder:text-slate-400"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => setSelectedType(null)} className={`px-3 py-1 rounded-full text-sm border transition-all ${!selectedType ? 'bg-purple-600 text-white border-purple-600' : 'bg-white/50 text-slate-600 border-white hover:bg-white'}`}>All</button>
                        {types.map(t => (
                            <button key={t} onClick={() => setSelectedType(selectedType === t ? null : t)} className={`px-3 py-1 rounded-full text-sm border transition-all ${selectedType === t ? 'bg-purple-600 text-white border-purple-600' : 'bg-white/50 text-slate-600 border-white hover:bg-white'}`}>{t}</button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredActivities.map(act => (
                        <div key={act.id} className="bg-white/60 backdrop-blur-sm border border-white/60 p-6 rounded-2xl hover:shadow-lg transition-all hover:scale-[1.02]">
                            <h3 className="font-bold text-xl text-slate-800 mb-1">{act.name}</h3>
                            {act.location && (
                                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.location)}`} target="_blank" className="inline-flex items-center gap-1 text-sm text-purple-700 hover:underline mb-2">
                                    <MapPin size={14} /> {act.location}
                                </a>
                            )}
                            <div className="flex flex-wrap gap-2 mb-3">
                                {act.type && act.type.split(',').map((t: string, i: number) => (
                                    <span key={i} className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">{t.trim()}</span>
                                ))}
                            </div>
                            <p className="text-slate-600 text-sm">{act.description}</p>
                        </div>
                    ))}
                    {filteredActivities.length === 0 && <div className="col-span-full text-center text-slate-500 py-10">No activities found matching your search.</div>}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
